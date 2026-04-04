"use client"

import { useRef, useMemo } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"
import { useSynapseStore } from "@/store/useSynapseStore"
import { FINGERTIP_INDICES } from "@/utils/hand-geometry"

type HandLandmark = {
  x: number
  y: number
  z: number
}

type HandLandmarks = HandLandmark[]
type LiveHandState = [boolean, boolean]

// Additional index maps for the different Binding Protocols
const PALM_INDICES = [0, 5, 9, 13, 17] // Wrist and base of each finger
const ALL_INDICES = Array.from({ length: 21 }, (_, i) => i) // 0 through 20

interface SynapseWebProps {
  leftHandRef: React.MutableRefObject<HandLandmarks | null>
  rightHandRef: React.MutableRefObject<HandLandmarks | null>
  liveStateRef: React.MutableRefObject<LiveHandState>
}

// Maximum distance between hands before the digital web snaps
const CONNECT_THRESHOLD = 3.35
const DISCONNECT_THRESHOLD = 3.8
const PALM_CONNECT_THRESHOLD = 4.1
const PALM_DISCONNECT_THRESHOLD = 4.5
const WEB_HOLD_MS = 180

const mapLandmarkToVector = (
  point: HandLandmark,
  viewport: { width: number; height: number },
) =>
  new THREE.Vector3(
    (point.x - 0.5) * viewport.width * -1,
    -(point.y - 0.5) * viewport.height,
    -point.z * 10,
  )

const getPalmVectors = (
  hand: HandLandmarks,
  viewport: { width: number; height: number },
) => {
  const palmPoints = PALM_INDICES.map((index) => hand[index]).filter(Boolean)

  if (!palmPoints.length) {
    return []
  }

  const palmCenter = palmPoints.reduce(
    (acc, point) => ({
      x: acc.x + point.x,
      y: acc.y + point.y,
      z: acc.z + point.z,
    }),
    { x: 0, y: 0, z: 0 },
  )

  const averagedCenter = {
    x: palmCenter.x / palmPoints.length,
    y: palmCenter.y / palmPoints.length,
    z: palmCenter.z / palmPoints.length,
  }

  return [
    mapLandmarkToVector(averagedCenter, viewport),
    ...palmPoints.map((point) => mapLandmarkToVector(point, viewport)),
  ]
}

export function SynapseWeb({
  leftHandRef,
  rightHandRef,
  liveStateRef,
}: SynapseWebProps) {
  const linesRef = useRef<THREE.LineSegments>(null)
  const lastVisiblePairRef = useRef<{
    left: HandLandmarks
    right: HandLandmarks
  } | null>(null)
  const lastSeenAtRef = useRef(0)
  const webActiveRef = useRef(false)

  // Subscribing to UI State
  const systemChroma = useSynapseStore((state) => state.systemChroma)
  const threadThickness = useSynapseStore((state) => state.threadThickness)
  const bindingProtocol = useSynapseStore((state) => state.bindingProtocol)
  const webColor = useMemo(
    () => new THREE.Color(systemChroma).multiplyScalar(2.8),
    [systemChroma],
  )

  // Pre-allocate maximum possible lines (Full Skeleton: 21 * 21 = 441 lines)
  // 441 lines * 2 vertices per line * 3 coordinates (x,y,z) = 2646 float values
  const maxLines = 441

  const webGeometry = useMemo(() => {
    const geo = new THREE.BufferGeometry()
    const positions = new Float32Array(maxLines * 6)
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3))
    return geo
  }, [])

  useFrame(({ viewport }) => {
    const systemEnabled = useSynapseStore.getState().systemEnabled
    const liveLeft = leftHandRef.current
    const liveRight = rightHandRef.current
    const [isRightLive, isLeftLive] = liveStateRef.current
    const now = performance.now()

    if (!systemEnabled) {
      lastVisiblePairRef.current = null
      lastSeenAtRef.current = 0
      webActiveRef.current = false
      if (linesRef.current) {
        linesRef.current.visible = false
        linesRef.current.geometry.setDrawRange(0, 0)
      }
      return
    }

    if (liveLeft && liveRight && isLeftLive && isRightLive) {
      lastVisiblePairRef.current = {
        left: liveLeft,
        right: liveRight,
      }
      lastSeenAtRef.current = now
    }

    const shouldHoldPreviousPair =
      !isLeftLive &&
      !isRightLive &&
      now - lastSeenAtRef.current <= WEB_HOLD_MS &&
      lastVisiblePairRef.current
    const left = shouldHoldPreviousPair
      ? lastVisiblePairRef.current?.left ?? null
      : isLeftLive
        ? liveLeft
        : null
    const right = shouldHoldPreviousPair
      ? lastVisiblePairRef.current?.right ?? null
      : isRightLive
        ? liveRight
        : null

    // If we don't have both hands, hide the web and exit early
    if (
      !left ||
      !right ||
      !linesRef.current ||
      ((!isLeftLive || !isRightLive) && !shouldHoldPreviousPair)
    ) {
      lastVisiblePairRef.current = null
      webActiveRef.current = false
      if (linesRef.current) linesRef.current.visible = false
      return
    }

    const leftVectors =
      bindingProtocol === "PALMS"
        ? getPalmVectors(left, viewport)
        : (bindingProtocol === "FINGERTIPS"
            ? FINGERTIP_INDICES
            : ALL_INDICES
          )
            .map((index) => left[index])
            .filter(Boolean)
            .map((point) => mapLandmarkToVector(point, viewport))

    const rightVectors =
      bindingProtocol === "PALMS"
        ? getPalmVectors(right, viewport)
        : (bindingProtocol === "FINGERTIPS"
            ? FINGERTIP_INDICES
            : ALL_INDICES
          )
            .map((index) => right[index])
            .filter(Boolean)
            .map((point) => mapLandmarkToVector(point, viewport))

    if (!leftVectors.length || !rightVectors.length) {
      webActiveRef.current = false
      linesRef.current.visible = false
      return
    }

    const positions = linesRef.current.geometry.attributes.position
      .array as Float32Array
    let lineCount = 0
    let arrayIdx = 0

    // Check distance between selected points on left vs right hand
    const connectThreshold =
      bindingProtocol === "PALMS" ? PALM_CONNECT_THRESHOLD : CONNECT_THRESHOLD
    const disconnectThreshold =
      bindingProtocol === "PALMS"
        ? PALM_DISCONNECT_THRESHOLD
        : DISCONNECT_THRESHOLD

    leftVectors.forEach((lVector) => {
      rightVectors.forEach((rVector) => {

        const distance = lVector.distanceTo(rVector)
        const threshold = webActiveRef.current
          ? disconnectThreshold
          : connectThreshold

        // Hysteresis prevents the web from chattering when distance sits near the edge.
        if (distance < threshold) {
          // Add Left Point (x, y, z)
          positions[arrayIdx++] = lVector.x
          positions[arrayIdx++] = lVector.y
          positions[arrayIdx++] = lVector.z

          // Add Right Point (x, y, z)
          positions[arrayIdx++] = rVector.x
          positions[arrayIdx++] = rVector.y
          positions[arrayIdx++] = rVector.z

          lineCount++
        }
      })
    })

    // Zero out the remaining unused buffer space to prevent visual artifacts
    for (let i = arrayIdx; i < maxLines * 6; i++) {
      positions[i] = 0
    }

    // Update the geometry
    webActiveRef.current = lineCount > 0
    linesRef.current.visible = webActiveRef.current

    // Crucial: Only tell the GPU to draw the number of lines currently active
    linesRef.current.geometry.setDrawRange(0, lineCount * 2)

    // Flag the buffer for a GPU update
    linesRef.current.geometry.attributes.position.needsUpdate = true
  })

  return (
    <lineSegments ref={linesRef} geometry={webGeometry} frustumCulled={false}>
      <lineBasicMaterial
        color={webColor}
        transparent
        opacity={0.92}
        linewidth={threadThickness} // Note: WebGL standard lines ignore thickness > 1 on Windows/Chrome.
        toneMapped={false} // Crucial for Bloom post-processing to glow correctly
      />
    </lineSegments>
  )
}
