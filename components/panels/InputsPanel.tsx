"use client"

import { useSynapseStore } from "@/store/useSynapseStore"
import { PanelWrapper } from "@/components/ui/PanelWrapper"
import { ControlSlider } from "@/components/ui/ControlSlider"

export function InputsPanel() {
  const {
    smoothingFactor,
    setSmoothingFactor,
    trackingConfidence,
    setTrackingConfidence,
  } = useSynapseStore()

  return (
    <PanelWrapper title="Input Calibration" id="#IN-003">
      <ControlSlider
        label="MOTION SMOOTHING (LERP)"
        value={smoothingFactor}
        min={0.05}
        max={1}
        step={0.05}
        unit="F"
        onChange={setSmoothingFactor}
      />
      <ControlSlider
        label="MIN TRACKING CONFIDENCE"
        value={trackingConfidence}
        min={0.1}
        max={1}
        step={0.1}
        unit="%"
        onChange={setTrackingConfidence}
      />

      <div className="mt-4 sm:mt-6 p-2 sm:p-3 border border-zinc-800 bg-black/50 text-[8px] sm:text-[10px] text-zinc-500 leading-relaxed">
        <span className="text-synapse-cyan">INFO:</span>{" "}
        <span className="hidden sm:inline">
          Lowering motion smoothing increases responsiveness but may introduce
          jitter. Adjust confidence based on ambient lighting.
        </span>
        <span className="sm:hidden">Adjust smoothing for responsiveness</span>
      </div>
    </PanelWrapper>
  )
}
