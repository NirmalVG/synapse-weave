"use client"

import { useRef } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { EffectComposer, Bloom } from "@react-three/postprocessing"

// Hooks & Store
import { useHandTracker } from "@/hooks/useHandTracker"
import { useSynapseStore } from "@/store/useSynapseStore"

// 3D Components & UI
import { HandSkeleton } from "@/components/HandSkeleton"
import { SynapseWeb } from "@/components/SynapseWeb"
import { LoadingScreen } from "@/components/ui/LoadingScreen"
import { AmbientDust } from "@/components/AmbientDust"

// --- INVISIBLE OPTIMIZATION COMPONENT ---
function HandDataDistributor({
  sourceRef,
  leftRef,
  rightRef,
}: {
  sourceRef: React.MutableRefObject<any[]>
  leftRef: React.MutableRefObject<any>
  rightRef: React.MutableRefObject<any>
}) {
  useFrame(() => {
    if (sourceRef.current.length > 0) {
      rightRef.current = sourceRef.current[0]
      leftRef.current =
        sourceRef.current.length > 1 ? sourceRef.current[1] : null
    } else {
      rightRef.current = null
      leftRef.current = null
    }
  })
  return null
}

// --- MAIN CANVAS COMPONENT ---

export default function CanvasScene() {
  const { videoRef, smoothedLandmarksRef, isReady } = useHandTracker()

  const leftHandRef = useRef<any[] | null>(null)
  const rightHandRef = useRef<any[] | null>(null)

  const systemChroma = useSynapseStore((state) => state.systemChroma)
  const glowIntensity = useSynapseStore((state) => state.glowIntensity)
  const debugMode = useSynapseStore((state) => state.debugMode)

  return (
    <>
      <LoadingScreen isReady={isReady} />

      <video
        ref={videoRef}
        className={`object-cover ${
          debugMode
            ? "absolute top-24 sm:top-32 left-6 w-48 sm:w-64 h-36 sm:h-48 opacity-60 z-50 pointer-events-none border border-synapse-cyan rounded-sm shadow-[0_0_15px_rgba(0,212,255,0.2)] transition-opacity duration-300"
            : "hidden"
        }`}
        autoPlay
        playsInline
        muted
      />

      <div className="absolute inset-0 w-full h-full z-0">
        {/* alpha={true} ensures the WebGL canvas is perfectly transparent */}
        <Canvas camera={{ position: [0, 0, 5], fov: 50 }} gl={{ alpha: true }}>
          <HandDataDistributor
            sourceRef={smoothedLandmarksRef}
            leftRef={leftHandRef}
            rightRef={rightHandRef}
          />

          <AmbientDust />

          <HandSkeleton
            landmarksRef={rightHandRef}
            color={systemChroma}
            isLeft={false}
          />
          <HandSkeleton
            landmarksRef={leftHandRef}
            color={systemChroma}
            isLeft={true}
          />

          <SynapseWeb leftHandRef={leftHandRef} rightHandRef={rightHandRef} />

          <EffectComposer enableNormalPass={false}>
            <Bloom
              luminanceThreshold={0.1}
              mipmapBlur
              intensity={glowIntensity}
            />
          </EffectComposer>
        </Canvas>
      </div>
    </>
  )
}
