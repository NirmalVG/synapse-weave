"use client"

export function SpatialCoordinates() {
  return (
    <div className="hidden sm:flex absolute top-20 right-6 flex-col items-end gap-1 font-mono text-[9px] text-zinc-700 pointer-events-none z-40">
      <div>
        COORD_X: <span className="text-zinc-500">122.903</span>
      </div>
      <div>
        COORD_Y: <span className="text-zinc-500">004.112</span>
      </div>
      <div>
        COORD_Z: <span className="text-zinc-500">998.441</span>
      </div>
    </div>
  )
}
