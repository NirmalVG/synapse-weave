"use client"

interface ControlSliderProps {
  label: string
  value: number
  min: number
  max: number
  step: number
  unit: string
  onChange: (value: number) => void
}

export function ControlSlider({
  label,
  value,
  min,
  max,
  step,
  unit,
  onChange,
}: ControlSliderProps) {
  return (
    <div className="mb-4 sm:mb-6">
      <div className="flex justify-between items-center mb-2 gap-2">
        <label className="text-zinc-500 text-[8px] sm:text-[10px] tracking-widest flex-1 truncate">
          {label}
        </label>
        <span className="text-synapse-cyan text-[8px] sm:text-xs whitespace-nowrap shrink-0">
          {value.toFixed(2)}
          {unit}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-0.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-synapse-cyan"
      />
    </div>
  )
}
