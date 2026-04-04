"use client"

import { useRef, useMemo } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"
import { HAND_CONNECTIONS } from "@/utils/hand-geometry"
import { useSynapseStore } from "@/store/useSynapseStore"

type HandLandmark = {
  x: number
  y: number
  z: number
}

type HandLandmarks = HandLandmark[]
const TRACKING_HOLD_MS = 160

interface HandSkeletonProps {
  landmarksRef: React.MutableRefObject<HandLandmarks | null>
  color: string
}

// A single reusable 3D object to calculate matrix transformations
// for the 21 instanced spheres without memory overhead
const dummy = new THREE.Object3D()

export function HandSkeleton({ landmarksRef, color }: HandSkeletonProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null)
  const linesRef = useRef<THREE.LineSegments>(null)
  const lastVisibleLandmarksRef = useRef<HandLandmarks | null>(null)
  const lastSeenAtRef = useRef(0)
  const lineColor = useMemo(
    () => new THREE.Color(color).multiplyScalar(2.4),
    [color],
  )

  // Pre-allocate geometry for the skeleton bones
  // 21 connections * 2 points per connection * 3 coordinates (x,y,z)
  const lineGeometry = useMemo(() => {
    const geo = new THREE.BufferGeometry()
    const positions = new Float32Array(HAND_CONNECTIONS.length * 6)
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3))
    return geo
  }, [])

  useFrame(({ viewport }) => {
    const systemEnabled = useSynapseStore.getState().systemEnabled
    const liveLandmarks = landmarksRef.current
    const now = performance.now()

    if (!systemEnabled) {
      lastVisibleLandmarksRef.current = null
      lastSeenAtRef.current = 0
      if (meshRef.current) {
        meshRef.current.count = 0
        meshRef.current.visible = false
      }
      if (linesRef.current) {
        linesRef.current.visible = false
      }
      return
    }

    if (liveLandmarks) {
      lastVisibleLandmarksRef.current = liveLandmarks
      lastSeenAtRef.current = now
    }

    const shouldHoldPreviousFrame =
      !liveLandmarks &&
      now - lastSeenAtRef.current <= TRACKING_HOLD_MS &&
      lastVisibleLandmarksRef.current
    const landmarks = liveLandmarks ?? lastVisibleLandmarksRef.current

    // If tracking is lost, hide the geometry
    if (
      !landmarks ||
      !meshRef.current ||
      !linesRef.current ||
      (!liveLandmarks && !shouldHoldPreviousFrame)
    ) {
      lastVisibleLandmarksRef.current = null
      if (meshRef.current) {
        meshRef.current.count = 0
        meshRef.current.visible = false
      }
      if (linesRef.current) linesRef.current.visible = false
      return
    }

    // Pull UI state directly inside the frame loop to bypass React renders
    const currentScale = useSynapseStore.getState().nodeScale
    const baseNodeSize = 0.05
    const finalScale = baseNodeSize * currentScale

    // Map the 21 normalized 2D points to the 3D viewport
    const mappedPoints = landmarks.map((lm) => {
      return new THREE.Vector3(
        (lm.x - 0.5) * viewport.width * -1, // Multiply by -1 to act as a mirror
        -(lm.y - 0.5) * viewport.height,
        -lm.z * 10, // Extrapolate Z-depth
      )
    })

    // 1. Update the Spheres (Nodes)
    meshRef.current.count = 21
    mappedPoints.forEach((pos, i) => {
      dummy.position.copy(pos)
      dummy.scale.setScalar(finalScale)
      dummy.updateMatrix()
      meshRef.current!.setMatrixAt(i, dummy.matrix)
    })
    meshRef.current.instanceMatrix.needsUpdate = true
    meshRef.current.visible = true

    // 2. Update the Lines (Bones)
    linesRef.current.visible = true
    const positions = linesRef.current.geometry.attributes.position
      .array as Float32Array
    let idx = 0

    HAND_CONNECTIONS.forEach(([start, end]) => {
      const p1 = mappedPoints[start]
      const p2 = mappedPoints[end]

      positions[idx++] = p1.x
      positions[idx++] = p1.y
      positions[idx++] = p1.z

      positions[idx++] = p2.x
      positions[idx++] = p2.y
      positions[idx++] = p2.z
    })

    linesRef.current.geometry.attributes.position.needsUpdate = true
  })

  return (
    <group>
      {/* The 21 Tracking Nodes */}
      <instancedMesh
        ref={meshRef}
        args={[undefined, undefined, 21]}
        frustumCulled={false}
      >
        <sphereGeometry args={[1, 16, 16]} />
        {/* toneMapped={false} allows the color to exceed standard ranges, making the Bloom effect glow properly */}
        <meshBasicMaterial color={color} toneMapped={false} />
      </instancedMesh>

      {/* The Internal Skeleton Lines */}
      <lineSegments
        ref={linesRef}
        geometry={lineGeometry}
        frustumCulled={false}
      >
        <lineBasicMaterial
          color={lineColor}
          transparent
          opacity={0.95}
          toneMapped={false}
        />
      </lineSegments>
    </group>
  )
}
