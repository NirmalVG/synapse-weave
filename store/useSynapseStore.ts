import { create } from "zustand"

export type TabState = "VISUALS" | "GEOMETRY" | "INPUTS" | "SYSTEM"
export type BindingProtocol = "FINGERTIPS" | "FULL SKELETON" | "PALMS"

interface SynapseState {
  // Navigation
  activeTab: TabState
  setActiveTab: (tab: TabState) => void

  // Visuals
  systemChroma: string
  setSystemChroma: (color: string) => void
  glowIntensity: number
  setGlowIntensity: (intensity: number) => void

  // Geometry
  threadThickness: number
  setThreadThickness: (thickness: number) => void
  bindingProtocol: BindingProtocol
  setBindingProtocol: (protocol: BindingProtocol) => void
  nodeScale: number
  setNodeScale: (scale: number) => void

  // Inputs
  smoothingFactor: number
  setSmoothingFactor: (factor: number) => void
  trackingConfidence: number
  setTrackingConfidence: (confidence: number) => void

  // System
  systemEnabled: boolean
  setSystemEnabled: (enabled: boolean) => void
  toggleSystemEnabled: () => void
  debugMode: boolean
  setDebugMode: (debug: boolean) => void
}

export const useSynapseStore = create<SynapseState>((set) => ({
  activeTab: "VISUALS",
  setActiveTab: (tab) => set({ activeTab: tab }),

  systemChroma: "#00d4ff",
  setSystemChroma: (color) => set({ systemChroma: color }),

  glowIntensity: 2.4,
  setGlowIntensity: (intensity) => set({ glowIntensity: intensity }),

  threadThickness: 0.8,
  setThreadThickness: (thickness) => set({ threadThickness: thickness }),

  bindingProtocol: "FINGERTIPS",
  setBindingProtocol: (protocol) => set({ bindingProtocol: protocol }),

  nodeScale: 1.0,
  setNodeScale: (scale) => set({ nodeScale: scale }),

  smoothingFactor: 0.18,
  setSmoothingFactor: (factor) => set({ smoothingFactor: factor }),

  trackingConfidence: 0.7,
  setTrackingConfidence: (confidence) =>
    set({ trackingConfidence: confidence }),

  systemEnabled: true,
  setSystemEnabled: (enabled) => set({ systemEnabled: enabled }),
  toggleSystemEnabled: () =>
    set((state) => ({ systemEnabled: !state.systemEnabled })),

  debugMode: false,
  setDebugMode: (debug) => set({ debugMode: debug }),
}))
