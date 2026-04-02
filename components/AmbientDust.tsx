"use client"

import { Sparkles } from "@react-three/drei"
import { useSynapseStore } from "@/store/useSynapseStore"

export function AmbientDust() {
  const systemChroma = useSynapseStore((state) => state.systemChroma)

  return (
    <group>
      {/* Front layer: Faster, larger particles */}
      <Sparkles
        count={200}
        scale={10}
        size={2}
        speed={0.4}
        color={systemChroma}
        opacity={0.4}
        noise={0.5}
      />
      {/* Back layer: Slower, smaller particles for parallax depth */}
      <Sparkles
        count={400}
        scale={20}
        size={1}
        speed={0.1}
        color="#ffffff"
        opacity={0.1}
        noise={1}
        position={[0, 0, -5]}
      />
    </group>
  )
}
