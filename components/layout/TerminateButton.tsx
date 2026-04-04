"use client"

import { Power } from "lucide-react"
import { useSynapseStore } from "@/store/useSynapseStore"

export function TerminateButton() {
  const systemEnabled = useSynapseStore((state) => state.systemEnabled)
  const toggleSystemEnabled = useSynapseStore(
    (state) => state.toggleSystemEnabled,
  )

  return (
    <div className="hidden sm:flex absolute left-6 bottom-6 pointer-events-auto z-40">
      <button
        onClick={toggleSystemEnabled}
        className="flex flex-col items-center gap-2 group"
        aria-pressed={!systemEnabled}
        aria-label={systemEnabled ? "Pause tracking system" : "Resume tracking system"}
      >
        <Power
          size={20}
          className={`transition-colors duration-300 ${
            systemEnabled
              ? "text-zinc-600 group-hover:text-red-500"
              : "text-red-500 drop-shadow-[0_0_10px_rgba(239,68,68,0.45)] group-hover:text-synapse-cyan"
          }`}
        />
        <span
          className={`font-mono text-[10px] tracking-widest transition-colors duration-300 ${
            systemEnabled
              ? "text-zinc-600 group-hover:text-red-500"
              : "text-red-500 group-hover:text-synapse-cyan"
          }`}
        >
          {systemEnabled ? "TERMINATE" : "RESTART"}
        </span>
      </button>
    </div>
  )
}
