"use client"

export function TelemetryReadout() {
  return (
    <div className="fixed right-3 sm:right-6 bottom-20 sm:bottom-6 flex flex-col items-end gap-0.5 sm:gap-1 font-mono text-[8px] sm:text-xs pointer-events-auto z-40 text-right">
      <div className="flex gap-2 sm:gap-4">
        <span className="text-zinc-600">FPS:</span>
        <span className="text-zinc-300 w-8 sm:w-10">60.0</span>
      </div>
      <div className="flex gap-2 sm:gap-4">
        <span className="text-zinc-600">L:</span>
        <span className="text-zinc-300 w-8 sm:w-10">21</span>
      </div>
      <div className="flex gap-2 sm:gap-4">
        <span className="text-zinc-600">R:</span>
        <span className="text-zinc-300 w-8 sm:w-10">21</span>
      </div>
      <div className="flex gap-2 sm:gap-4">
        <span className="text-zinc-600">LAT:</span>
        <span className="text-synapse-cyan w-8 sm:w-10">12ms</span>
      </div>

      <div className="hidden sm:block mt-6 text-[9px] text-zinc-800 tracking-widest">
        DATA_STREAM_AUTH_X88
      </div>
    </div>
  )
}
