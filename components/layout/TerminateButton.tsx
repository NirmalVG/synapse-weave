"use client"

import { Power } from "lucide-react"

export function TerminateButton() {
  return (
    <div className="hidden sm:flex absolute left-6 bottom-6 pointer-events-auto z-40">
      <button className="flex flex-col items-center gap-2 group">
        <Power
          size={20}
          className="text-zinc-600 group-hover:text-red-500 transition-colors duration-300"
        />
        <span className="font-mono text-[10px] tracking-widest text-zinc-600 group-hover:text-red-500 transition-colors duration-300">
          TERMINATE
        </span>
      </button>
    </div>
  )
}
