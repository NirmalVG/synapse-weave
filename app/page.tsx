"use client"

import UIOverlay from "@/components/UIOverlay"
import CanvasScene from "@/components/CanvasScene"

export default function Page() {
  return (
    <main className="relative w-screen h-screen overflow-hidden">
      <CanvasScene />
      <UIOverlay />
    </main>
  )
}
