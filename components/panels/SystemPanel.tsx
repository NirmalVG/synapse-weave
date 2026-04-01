"use client"

import { useSynapseStore } from "@/store/useSynapseStore"
import { PanelWrapper } from "@/components/ui/PanelWrapper"

export function SystemPanel() {
  const { debugMode, setDebugMode } = useSynapseStore()

  return (
    <PanelWrapper title="System Operations" id="#SYS-004">
      <div className="flex items-center justify-between mb-6 sm:mb-8 p-2 sm:p-3 border border-zinc-800 hover:border-zinc-600 transition-colors gap-2">
        <div className="flex-1 min-w-0">
          <div className="text-zinc-300 text-[8px] sm:text-xs truncate">
            CAMERA DEBUG
          </div>
          <div className="text-zinc-600 text-[7px] sm:text-[10px] mt-0.5 sm:mt-1 hidden sm:block">
            Overlay raw video feed for calibration
          </div>
        </div>
        <button
          onClick={() => setDebugMode(!debugMode)}
          className={`w-10 sm:w-12 h-5 sm:h-6 border rounded-full relative transition-colors shrink-0 ${
            debugMode
              ? "border-synapse-cyan bg-synapse-cyan/20"
              : "border-zinc-700 bg-transparent"
          }`}
          aria-label="Toggle camera debug"
        >
          <div
            className={`w-3.5 sm:w-4 h-3.5 sm:h-4 bg-current rounded-full absolute top-0.75 transition-all ${
              debugMode
                ? "left-5 sm:left-6.5 text-synapse-cyan shadow-[0_0_8px_currentColor]"
                : "left-0.5 sm:left-1 text-zinc-600"
            }`}
          />
        </button>
      </div>

      <div className="pt-3 sm:pt-4 border-t border-zinc-800/50">
        <button className="w-full py-2 sm:py-4 border border-synapse-cyan/50 text-synapse-cyan text-[8px] sm:text-xs tracking-[0.3em] hover:bg-synapse-cyan/10 hover:border-synapse-cyan hover:shadow-[0_0_15px_rgba(0,212,255,0.2)] transition-all duration-300 truncate">
          [ EXPORT ]
        </button>
      </div>
    </PanelWrapper>
  )
}
