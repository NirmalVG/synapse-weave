"use client"

import { useEffect, useState } from "react"
import { Hexagon } from "lucide-react"

const LOADING_TEXTS = [
  "INITIALIZING NEURAL MESH...",
  "ALLOCATING VRAM...",
  "CALIBRATING OPTICAL SENSORS...",
  "LOADING TENSORFLOW MODELS...",
  "ESTABLISHING HANDSHAKE...",
  "AWAITING VIDEO STREAM...",
]

interface LoadingScreenProps {
  isReady: boolean
}

export function LoadingScreen({ isReady }: LoadingScreenProps) {
  const [progress, setProgress] = useState(0)
  const [textIndex, setTextIndex] = useState(0)
  const [shouldRender, setShouldRender] = useState(true)

  useEffect(() => {
    // If MediaPipe fires the ready flag, push to 100% and initiate fade out
    if (isReady) {
      const timeout = setTimeout(() => setShouldRender(false), 800)
      return () => clearTimeout(timeout)
    }

    // Fake progress simulation while we wait for camera permissions
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev > 85) return prev // Hold at 85% until actually ready
        return prev + Math.random() * 15
      })
    }, 500)

    // Cycle through tech jargon
    const textInterval = setInterval(() => {
      setTextIndex((i) => (i + 1) % LOADING_TEXTS.length)
    }, 1200)

    return () => {
      clearInterval(progressInterval)
      clearInterval(textInterval)
    }
  }, [isReady])

  if (!shouldRender) return null

  const displayProgress = isReady ? 100 : progress

  return (
    <div
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#050505] transition-opacity duration-700 ease-in-out ${
        isReady ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      <div className="flex flex-col items-center max-w-md w-full px-6">
        {/* Animated Logo */}
        <div className="relative mb-8">
          <Hexagon className="w-16 h-16 text-synapse-cyan animate-[spin_4s_linear_infinite] opacity-80" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-2 h-2 bg-synapse-cyan rounded-full animate-ping" />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-synapse-cyan font-bold text-xl sm:text-2xl tracking-[0.3em] drop-shadow-[0_0_10px_rgba(0,212,255,0.5)] mb-2">
          SYNAPSE WEAVE
        </h1>
        <div className="h-px w-full bg-linear-to-r from-transparent via-synapse-cyan/50 to-transparent mb-8" />

        {/* Progress Bar */}
        <div className="w-full h-1 bg-zinc-900 rounded-full mb-4 overflow-hidden relative">
          <div
            className="absolute top-0 left-0 h-full bg-synapse-cyan shadow-[0_0_10px_rgba(0,212,255,0.8)] transition-all duration-300 ease-out"
            style={{ width: `${Math.min(displayProgress, 100)}%` }}
          />
        </div>

        {/* Telemetry Status */}
        <div className="flex justify-between w-full font-mono text-[9px] sm:text-xs">
          <span className="text-zinc-500 tracking-widest uppercase">
            {isReady ? "SYSTEM ONLINE" : LOADING_TEXTS[textIndex]}
          </span>
          <span className="text-synapse-cyan drop-shadow-[0_0_5px_rgba(0,212,255,0.8)]">
            {Math.floor(Math.min(displayProgress, 100))}%
          </span>
        </div>
      </div>
    </div>
  )
}
