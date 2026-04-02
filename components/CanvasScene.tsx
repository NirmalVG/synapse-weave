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
// This runs purely inside the WebGL render loop (60 FPS).
// It takes the smoothed data from MediaPipe and silently distributes it
// to the left and right hand references without triggering React to re-render.
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
      // Assuming first hand detected is right, second is left
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
  // 1. Initialize the Tracking Engine
  const { videoRef, smoothedLandmarksRef, isReady } = useHandTracker()

  // 2. Create isolated memory references for the 3D objects
  const leftHandRef = useRef<any[] | null>(null)
  const rightHandRef = useRef<any[] | null>(null)

  // 3. Subscribe to the UI Control Panel
  const systemChroma = useSynapseStore((state) => state.systemChroma)
  const glowIntensity = useSynapseStore((state) => state.glowIntensity)
  const debugMode = useSynapseStore((state) => state.debugMode)

  return (
    <>
      {/* Cinematic Boot Sequence */}
      <LoadingScreen isReady={isReady} />

      {/* Raw Webcam Feed (Hidden unless System Debug Mode is active) */}
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

      {/* The 3D Void */}
      <div className="absolute inset-0 w-full h-full z-0">
        {/* HARDWARE OPTIMIZATIONS:
          - powerPreference tells the mobile device to use the dedicated GPU.
          - antialias MUST be false when using EffectComposer on mobile to prevent flickering.
          - dpr caps the resolution scaling (1.5 allows for crispness without frying the mobile GPU).
        */}
        <Canvas
          camera={{ position: [0, 0, 5], fov: 50 }}
          gl={{
            alpha: true,
            powerPreference: "high-performance",
            antialias: false,
          }}
          dpr={[1, 1.5]}
        >
          {/* Data Router */}
          <HandDataDistributor
            sourceRef={smoothedLandmarksRef}
            leftRef={leftHandRef}
            rightRef={rightHandRef}
          />

          {/* Ambient Particles in the background */}
          <AmbientDust />

          {/* The Physical Nodes & Bones */}
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

          {/* The Inter-hand Connection Logic */}
          <SynapseWeb leftHandRef={leftHandRef} rightHandRef={rightHandRef} />

          {/* Post-Processing Pipeline 
              multisampling={0} is critical for transparent backgrounds on iOS/Mobile Safari */}
          <EffectComposer enableNormalPass={false} multisampling={0}>
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
