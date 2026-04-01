"use client"

import { useSynapseStore } from "@/store/useSynapseStore"
import { PanelWrapper } from "@/components/ui/PanelWrapper"
import { ControlSlider } from "@/components/ui/ControlSlider"

export function VisualsPanel() {
  const { systemChroma, setSystemChroma, glowIntensity, setGlowIntensity } =
    useSynapseStore()
  const colors = ["#00d4ff", "#ff00ff", "#ffffff", "#ffaa00"]

  return (
    <PanelWrapper title="Visuals Protocol" id="#VS-001">
      <div className="mb-6 sm:mb-8">
        <label className="block text-zinc-500 text-[8px] sm:text-[10px] tracking-widest mb-2 sm:mb-3">
          SYSTEM CHROMA
        </label>
        <div className="flex gap-2 sm:gap-3">
          {colors.map((c) => (
            <button
              key={c}
              onClick={() => setSystemChroma(c)}
              className={`w-5 h-5 sm:w-6 sm:h-6 transition-all duration-300 shrink-0 ${
                systemChroma === c
                  ? "scale-110 ring-1 ring-offset-2 ring-offset-black shadow-[0_0_10px_currentColor]"
                  : "opacity-50 hover:opacity-100"
              }`}
              style={{ backgroundColor: c, color: c }}
              aria-label={`Color ${c}`}
            />
          ))}
        </div>
      </div>
      <ControlSlider
        label="GLOW INTENSITY"
        value={glowIntensity}
        min={0}
        max={5}
        step={0.1}
        unit="X"
        onChange={setGlowIntensity}
      />
    </PanelWrapper>
  )
}
