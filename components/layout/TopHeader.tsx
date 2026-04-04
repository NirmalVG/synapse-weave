"use client"

import { Hexagon, Activity } from "lucide-react"
import { useSynapseStore } from "@/store/useSynapseStore"

export function TopHeader() {
  const systemEnabled = useSynapseStore((state) => state.systemEnabled)

  return (
    <div className="fixed top-0 left-0 right-0 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0 p-3 sm:p-6 pointer-events-auto z-50 bg-linear-to-b from-black/60 to-transparent">
      <div className="flex items-center gap-2 sm:gap-4">
        <Hexagon className="text-synapse-cyan w-4 sm:w-6 h-4 sm:h-6 animate-spin drop-shadow-[0_0_8px_rgba(0,212,255,0.8)] shrink-0" />
        <h1 className="text-synapse-cyan font-bold text-sm sm:text-xl tracking-[0.2em] drop-shadow-[0_0_8px_rgba(0,212,255,0.5)] truncate">
          SYNAPSE WEAVE
        </h1>
        <div className="hidden sm:block w-px h-6 bg-zinc-800"></div>
        <span className="hidden sm:inline text-zinc-500 font-mono text-xs tracking-widest">
          V2.0.4-STABLE
        </span>
      </div>

      <div
        className={`flex items-center gap-2 font-mono text-[10px] sm:text-xs tracking-wider ${
          systemEnabled ? "text-synapse-cyan" : "text-red-500"
        }`}
      >
        <div
          className={`w-1.5 sm:w-2 h-1.5 sm:h-2 rounded-full shrink-0 ${
            systemEnabled
              ? "bg-synapse-cyan animate-pulse drop-shadow-[0_0_5px_rgba(0,212,255,1)]"
              : "bg-red-500 drop-shadow-[0_0_5px_rgba(239,68,68,0.9)]"
          }`}
        ></div>
        <span className="hidden sm:inline">
          {systemEnabled ? "SYS.ONLINE // TRACKING: ACTIVE" : "SYS.OFFLINE // TRACKING: PAUSED"}
        </span>
        <span className="sm:hidden">{systemEnabled ? "ONLINE" : "OFFLINE"}</span>
        <Activity size={12} className="ml-1 sm:ml-2 shrink-0" />
      </div>
    </div>
  )
}
