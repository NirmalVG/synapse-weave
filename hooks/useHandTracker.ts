"use client"

import { useEffect, useRef, useState } from "react"
import { useSynapseStore } from "@/store/useSynapseStore"

type HandLandmark = {
  x: number
  y: number
  z: number
}

type HandLandmarks = HandLandmark[]

interface HandsResults {
  multiHandLandmarks?: HandLandmarks[]
}

// Math utility to smoothly transition from current position to target position
const lerp = (start: number, end: number, factor: number) => {
  return start + (end - start) * factor
}

export function useHandTracker() {
  const [isReady, setIsReady] = useState(false)
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const readyRef = useRef(false)

  // We use Refs instead of State to prevent React from re-rendering 60 times a second
  const rawLandmarksRef = useRef<HandLandmarks[]>([])
  const smoothedLandmarksRef = useRef<HandLandmarks[]>([])

  useEffect(() => {
    if (typeof window === "undefined" || !videoRef.current) return

    // Dynamically load Hands from MediaPipe
    const loadAndSetupHands = async () => {
      const isMobileViewport = window.matchMedia("(max-width: 768px)").matches
      const { Hands } = await import("@mediapipe/hands")

      const hands = new Hands({
        locateFile: (file) =>
          `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
      })

      // Setup initial tracking configuration
      hands.setOptions({
        maxNumHands: 2,
        modelComplexity: 1,
        minDetectionConfidence: 0.7,
        minTrackingConfidence: 0.5,
      })

      // Callback when MediaPipe processes a frame
      hands.onResults((results: HandsResults) => {
        if (!readyRef.current) {
          readyRef.current = true
          setIsReady(true)
        }

        if (
          results.multiHandLandmarks &&
          results.multiHandLandmarks.length > 0
        ) {
          rawLandmarksRef.current = results.multiHandLandmarks

          // If hand count changes (e.g. 0 to 1 hand, or 1 to 2), initialize the smoothed array instantly
          if (
            smoothedLandmarksRef.current.length !==
            results.multiHandLandmarks.length
          ) {
            smoothedLandmarksRef.current = JSON.parse(
              JSON.stringify(results.multiHandLandmarks),
            )
          }
        } else {
          rawLandmarksRef.current = []
        }
      })

      // Setup webcam using getUserMedia
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: "user",
            width: { ideal: isMobileViewport ? 480 : 640 },
            height: { ideal: isMobileViewport ? 360 : 480 },
            frameRate: { ideal: 30, max: 30 },
          },
        })
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          videoRef.current.onloadedmetadata = () => {
            videoRef.current!.play()
          }
        }
      } catch (error) {
        console.error("Failed to access camera:", error)
        return
      }

      // --- THE ANTI-JITTER LOOP ---
      let animationFrameId: number
      let processFrameId: number
      let isProcessingFrame = false
      let lastProcessTime = 0
      const targetFrameInterval = isMobileViewport ? 1000 / 24 : 1000 / 30

      const smoothData = () => {
        const raw = rawLandmarksRef.current
        const smoothed = smoothedLandmarksRef.current

        // Dynamically pull the smoothing factor from the Zustand UI store
        // This allows the user to adjust the tracking "weight" in real-time
        const LERP_FACTOR = useSynapseStore.getState().smoothingFactor

        // Only calculate if we have matching arrays
        if (raw.length > 0 && smoothed.length === raw.length) {
          for (let i = 0; i < raw.length; i++) {
            for (let j = 0; j < raw[i].length; j++) {
              smoothed[i][j].x = lerp(
                smoothed[i][j].x,
                raw[i][j].x,
                LERP_FACTOR,
              )
              smoothed[i][j].y = lerp(
                smoothed[i][j].y,
                raw[i][j].y,
                LERP_FACTOR,
              )
              smoothed[i][j].z = lerp(
                smoothed[i][j].z,
                raw[i][j].z,
                LERP_FACTOR,
              )
            }
          }
        } else if (raw.length === 0) {
          smoothedLandmarksRef.current = []
        }

        // Loop on every monitor frame
        animationFrameId = requestAnimationFrame(smoothData)
      }

      // Process video frames
      const processFrame = async (timestamp: number) => {
        if (
          videoRef.current &&
          videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA &&
          !videoRef.current.paused &&
          !videoRef.current.ended &&
          !document.hidden &&
          !isProcessingFrame &&
          timestamp - lastProcessTime >= targetFrameInterval
        ) {
          isProcessingFrame = true
          lastProcessTime = timestamp

          try {
            await hands.send({ image: videoRef.current })
          } finally {
            isProcessingFrame = false
          }
        }
        processFrameId = requestAnimationFrame(processFrame)
      }

      // Start both loops
      smoothData()
      processFrameId = requestAnimationFrame(processFrame)

      // Return cleanup function
      return () => {
        cancelAnimationFrame(animationFrameId)
        cancelAnimationFrame(processFrameId)
        hands.close()
        if (videoRef.current && videoRef.current.srcObject) {
          const tracks = (videoRef.current.srcObject as MediaStream).getTracks()
          tracks.forEach((track) => track.stop())
        }
      }
    }

    let cleanup: (() => void) | null = null

    loadAndSetupHands()
      .then((cleanupFn) => {
        if (cleanupFn) cleanup = cleanupFn
      })
      .catch((error) => {
        console.error("Failed to load MediaPipe Hands:", error)
      })

    return () => {
      if (cleanup) cleanup()
    }
  }, [])

  return { videoRef, smoothedLandmarksRef, isReady }
}
