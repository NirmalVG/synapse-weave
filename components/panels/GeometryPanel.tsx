"use client"

import { useSynapseStore } from "@/store/useSynapseStore"
import { PanelWrapper } from "@/components/ui/PanelWrapper"
import { ControlSlider } from "@/components/ui/ControlSlider"

export function GeometryPanel() {
  const {
    threadThickness,
    setThreadThickness,
    nodeScale,
    setNodeScale,
    bindingProtocol,
    setBindingProtocol,
  } = useSynapseStore()
  const protocols = ["FINGERTIPS", "FULL SKELETON", "PALMS"] as const

  return (
    <PanelWrapper title="Geometry Controls" id="#GM-002">
      <ControlSlider
        label="THREAD THICKNESS"
        value={threadThickness}
        min={0.1}
        max={3}
        step={0.1}
        unit="PT"
        onChange={setThreadThickness}
      />
      <ControlSlider
        label="NODE SCALE"
        value={nodeScale}
        min={0.1}
        max={3}
        step={0.1}
        unit="X"
        onChange={setNodeScale}
      />

      <div className="mb-4">
        <label className="block text-zinc-500 text-[8px] sm:text-[10px] tracking-widest mb-2 sm:mb-3">
          BINDING PROTOCOL
        </label>
        <div className="grid grid-cols-3 gap-2">
          {protocols.map((p) => (
            <button
              key={p}
              onClick={() => setBindingProtocol(p)}
              className={`py-1.5 sm:py-2 text-[8px] sm:text-[10px] tracking-wider transition-all duration-300 border ${
                bindingProtocol === p
                  ? "bg-synapse-cyan text-black border-synapse-cyan font-bold shadow-[0_0_10px_rgba(0,212,255,0.3)]"
                  : "bg-transparent text-zinc-500 border-zinc-800 hover:text-zinc-300 hover:border-zinc-600"
              }`}
            >
              {p.substring(0, 3)}
            </button>
          ))}
        </div>
      </div>
    </PanelWrapper>
  )
}
