"use client"

import { Palette, Box, Hand, Settings } from "lucide-react"
import { useSynapseStore, TabState } from "@/store/useSynapseStore"

export function Sidebar() {
  const { activeTab, setActiveTab } = useSynapseStore()

  const navItems: { icon: any; label: TabState }[] = [
    { icon: Palette, label: "VISUALS" },
    { icon: Box, label: "GEOMETRY" },
    { icon: Hand, label: "INPUTS" },
    { icon: Settings, label: "SYSTEM" },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 sm:bottom-auto sm:right-auto sm:absolute sm:left-6 sm:top-1/2 sm:-translate-y-1/2 flex sm:flex-col gap-0 sm:gap-10 pointer-events-auto z-40 bg-black/80 sm:bg-transparent border-t sm:border-t-0 border-zinc-800 w-full sm:w-auto">
      <div className="flex sm:flex-col gap-0 sm:gap-8 w-full sm:w-auto">
        {navItems.map((item, i) => {
          const isActive = activeTab === item.label
          return (
            <button
              key={i}
              onClick={() => setActiveTab(item.label)}
              className="flex-1 sm:flex-none flex sm:flex-col items-center justify-center sm:justify-start gap-1 sm:gap-2 group relative p-3 sm:p-0 transition-colors duration-300 hover:bg-zinc-900/50 sm:hover:bg-transparent border-r sm:border-r-0 border-zinc-800 last:border-r-0"
            >
              {isActive && (
                <>
                  <div className="absolute bottom-0 sm:bottom-auto sm:top-0 sm:-left-6 left-0 right-0 h-0.5 sm:h-auto sm:w-0.5 sm:bottom-0 bg-synapse-cyan drop-shadow-[0_0_5px_rgba(0,212,255,0.8)]"></div>
                </>
              )}
              <item.icon
                size={16}
                className={`transition-colors duration-300 shrink-0 ${isActive ? "text-synapse-cyan" : "text-zinc-500 group-hover:text-zinc-300"}`}
              />
              <span
                className={`font-mono text-[9px] sm:text-[10px] tracking-widest ${isActive ? "text-synapse-cyan" : "text-zinc-600"} hidden sm:inline`}
              >
                {item.label}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
