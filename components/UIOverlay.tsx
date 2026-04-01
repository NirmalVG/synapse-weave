"use client"

import { useSynapseStore } from "@/store/useSynapseStore"

// Layout Imports
import { TopHeader } from "@/components/layout/TopHeader"
import { Sidebar } from "@/components/layout/Sidebar"
import { TerminateButton } from "@/components/layout/TerminateButton"
import { TelemetryReadout } from "@/components/layout/TelemetryReadout"
import { SpatialCoordinates } from "@/components/layout/SpatialCoordinates"

// Panel Imports
import { VisualsPanel } from "@/components/panels/VisualsPanel"
import { GeometryPanel } from "@/components/panels/GeometryPanel"
import { InputsPanel } from "@/components/panels/InputsPanel"
import { SystemPanel } from "@/components/panels/SystemPanel"

export default function UIOverlay() {
  const activeTab = useSynapseStore((state) => state.activeTab)

  return (
    <div className="fixed inset-0 w-full h-full pointer-events-none z-10 flex flex-col selection:bg-synapse-cyan selection:text-black overflow-hidden">
      <TopHeader />
      <SpatialCoordinates />
      <Sidebar />
      <TerminateButton />

      {/* Dynamic Panel Routing based on Zustand State */}
      {activeTab === "VISUALS" && <VisualsPanel />}
      {activeTab === "GEOMETRY" && <GeometryPanel />}
      {activeTab === "INPUTS" && <InputsPanel />}
      {activeTab === "SYSTEM" && <SystemPanel />}

      <TelemetryReadout />
    </div>
  )
}
