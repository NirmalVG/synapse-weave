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

// Additional index maps for the different Binding Protocols
const PALM_INDICES = [0, 5, 9, 13, 17] // Wrist and base of each finger
const ALL_INDICES = Array.from({ length: 21 }, (_, i) => i) // 0 through 20

interface SynapseWebProps {
  leftHandRef: React.MutableRefObject<HandLandmarks | null>
  rightHandRef: React.MutableRefObject<HandLandmarks | null>
}

// Maximum distance between hands before the digital web snaps
const CONNECT_THRESHOLD = 3.35
const DISCONNECT_THRESHOLD = 3.8
const WEB_HOLD_MS = 180

export function SynapseWeb({ leftHandRef, rightHandRef }: SynapseWebProps) {
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
    const liveLeft = leftHandRef.current
    const liveRight = rightHandRef.current
    const now = performance.now()

    if (liveLeft && liveRight) {
      lastVisiblePairRef.current = {
        left: liveLeft,
        right: liveRight,
      }
      lastSeenAtRef.current = now
    }

    const shouldHoldPreviousPair =
      (!liveLeft || !liveRight) &&
      now - lastSeenAtRef.current <= WEB_HOLD_MS &&
      lastVisiblePairRef.current
    const left = liveLeft ?? lastVisiblePairRef.current?.left ?? null
    const right = liveRight ?? lastVisiblePairRef.current?.right ?? null

    // If we don't have both hands, hide the web and exit early
    if (
      !left ||
      !right ||
      !linesRef.current ||
      (!liveLeft && !liveRight && !shouldHoldPreviousPair)
    ) {
      lastVisiblePairRef.current = null
      webActiveRef.current = false
      if (linesRef.current) linesRef.current.visible = false
      return
    }

    // Determine which points to connect based on UI Selection
    let activeIndices: number[] = []
    if (bindingProtocol === "FINGERTIPS") activeIndices = FINGERTIP_INDICES
    else if (bindingProtocol === "PALMS") activeIndices = PALM_INDICES
    else if (bindingProtocol === "FULL SKELETON") activeIndices = ALL_INDICES

    const positions = linesRef.current.geometry.attributes.position
      .array as Float32Array
    let lineCount = 0
    let arrayIdx = 0

    // Check distance between selected points on left vs right hand
    activeIndices.forEach((lIdx) => {
      activeIndices.forEach((rIdx) => {
        const lPoint = left[lIdx]
        const rPoint = right[rIdx]

        // Ensure points exist (sometimes MediaPipe skips a frame on specific nodes)
        if (!lPoint || !rPoint) return

        // Map MediaPipe normalized coords (0 to 1) into 3D Viewport space
        const lVector = new THREE.Vector3(
          (lPoint.x - 0.5) * viewport.width * -1, // Flip X to match mirrored camera
          -(lPoint.y - 0.5) * viewport.height,
          -lPoint.z * 10,
        )
        const rVector = new THREE.Vector3(
          (rPoint.x - 0.5) * viewport.width * -1,
          -(rPoint.y - 0.5) * viewport.height,
          -rPoint.z * 10,
        )

        const distance = lVector.distanceTo(rVector)
        const threshold = webActiveRef.current
          ? DISCONNECT_THRESHOLD
          : CONNECT_THRESHOLD

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
        color={systemChroma}
        transparent
        opacity={0.7}
        linewidth={threadThickness} // Note: WebGL standard lines ignore thickness > 1 on Windows/Chrome.
        toneMapped={false} // Crucial for Bloom post-processing to glow correctly
      />
    </lineSegments>
  )
}
