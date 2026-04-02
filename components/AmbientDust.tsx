"use client"

import { Sparkles } from "@react-three/drei"
import { useSynapseStore } from "@/store/useSynapseStore"

interface AmbientDustProps {
  reducedMotion?: boolean
}

export function AmbientDust({ reducedMotion = false }: AmbientDustProps) {
  const systemChroma = useSynapseStore((state) => state.systemChroma)

  return (
    <group>
      {/* Front layer: Faster, larger particles */}
      <Sparkles
        count={reducedMotion ? 90 : 200}
        scale={10}
        size={reducedMotion ? 1.4 : 2}
        speed={reducedMotion ? 0.2 : 0.4}
        color={systemChroma}
        opacity={0.4}
        noise={reducedMotion ? 0.2 : 0.5}
      />
      {/* Back layer: Slower, smaller particles for parallax depth */}
      <Sparkles
        count={reducedMotion ? 160 : 400}
        scale={20}
        size={1}
        speed={reducedMotion ? 0.05 : 0.1}
        color="#ffffff"
        opacity={0.1}
        noise={reducedMotion ? 0.35 : 1}
        position={[0, 0, -5]}
      />
    </group>
  )
}
