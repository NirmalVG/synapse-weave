"use client"

interface PanelWrapperProps {
  title: string
  id: string
  children: React.ReactNode
}

export function PanelWrapper({ title, id, children }: PanelWrapperProps) {
  return (
    <div className="fixed sm:absolute w-full sm:w-100 left-0 sm:left-32 bottom-20 sm:bottom-6 right-0 sm:right-auto mx-3 sm:mx-0 bg-black/70 sm:bg-black/60 backdrop-blur-md border border-zinc-800/80 p-4 sm:p-6 pointer-events-auto rounded-sm shadow-2xl max-h-[60vh] sm:max-h-none overflow-y-auto z-30">
      <div className="flex justify-between items-center mb-4 sm:mb-8 border-b border-zinc-800/50 pb-3 sm:pb-4 gap-2">
        <h2 className="text-zinc-300 font-mono tracking-[0.2em] text-xs sm:text-sm uppercase flex-1 truncate">
          {title}
        </h2>
        <span className="text-synapse-cyan font-mono text-[8px] sm:text-xs whitespace-nowrap shrink-0">
          {id}
        </span>
      </div>
      <div className="font-mono text-xs sm:text-sm">{children}</div>
    </div>
  )
}
