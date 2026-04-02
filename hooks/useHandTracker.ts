"use client"

import { useEffect, useRef, useState } from "react"
import type {
  Handedness,
  NormalizedLandmarkList,
  Results as HandsResults,
} from "@mediapipe/hands"
import { useSynapseStore } from "@/store/useSynapseStore"

type HandLandmarks = NormalizedLandmarkList
type TrackedHands = [HandLandmarks | null, HandLandmarks | null]

const TARGET_FRAME_MS = 1000 / 60
const HAND_LOSS_GRACE_MS = 120
const MICRO_MOTION_THRESHOLD = 0.008
const DEPTH_JITTER_THRESHOLD = 0.012
const HAND_SLOT_BY_LABEL: Record<Handedness["label"], 0 | 1> = {
  Right: 0,
  Left: 1,
}

// Math utility to smoothly transition from current position to target position
const lerp = (start: number, end: number, factor: number) => {
  return start + (end - start) * factor
}

const clamp = (value: number, min: number, max: number) => {
  return Math.min(Math.max(value, min), max)
}

const getAdaptiveLerpFactor = (
  baseFactor: number,
  dx: number,
  dy: number,
  dz: number,
) => {
  const movement = Math.hypot(dx, dy, dz * 1.35)

  if (movement < MICRO_MOTION_THRESHOLD) {
    return clamp(baseFactor * 0.22, 0.015, 0.12)
  }

  if (movement < MICRO_MOTION_THRESHOLD * 2.5) {
    return clamp(baseFactor * 0.45, 0.04, 0.2)
  }

  return clamp(baseFactor * 1.1, 0.08, 0.75)
}

const createEmptyHands = (): TrackedHands => [null, null]

const cloneLandmarks = (landmarks: HandLandmarks): HandLandmarks =>
  landmarks.map((point) => ({
    x: point.x,
    y: point.y,
    z: point.z,
  }))

const sameLandmarkShape = (
  current: HandLandmarks | null,
  next: HandLandmarks | null,
) => {
  if (!current || !next) return current === next
  return current.length === next.length
}

const mapResultsToHands = (results: HandsResults): TrackedHands => {
  const nextHands = createEmptyHands()
  const { multiHandLandmarks, multiHandedness } = results

  if (!multiHandLandmarks?.length) {
    return nextHands
  }

  if (multiHandedness?.length) {
    multiHandedness.forEach(({ index, label }) => {
      const landmarks = multiHandLandmarks[index]
      if (!landmarks) return
      nextHands[HAND_SLOT_BY_LABEL[label]] = landmarks
    })

    return nextHands
  }

  nextHands[0] = multiHandLandmarks[0] ?? null
  nextHands[1] = multiHandLandmarks[1] ?? null
  return nextHands
}

export function useHandTracker() {
  const [isReady, setIsReady] = useState(false)
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const readyRef = useRef(false)

  // We use Refs instead of State to prevent React from re-rendering 60 times a second
  const rawLandmarksRef = useRef<TrackedHands>(createEmptyHands())
  const smoothedLandmarksRef = useRef<TrackedHands>(createEmptyHands())
  const lastSeenAtRef = useRef<[number, number]>([0, 0])

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
      const initialTrackingConfidence =
        useSynapseStore.getState().trackingConfidence

      hands.setOptions({
        maxNumHands: 2,
        modelComplexity: 1,
        minDetectionConfidence: initialTrackingConfidence,
        minTrackingConfidence: initialTrackingConfidence,
      })

      // Callback when MediaPipe processes a frame
      hands.onResults((results: HandsResults) => {
        if (!readyRef.current) {
          readyRef.current = true
          setIsReady(true)
        }

        const mappedHands = mapResultsToHands(results)
        rawLandmarksRef.current = mappedHands

        mappedHands.forEach((hand, index) => {
          if (hand) {
            lastSeenAtRef.current[index] = performance.now()

            if (
              !sameLandmarkShape(smoothedLandmarksRef.current[index], hand)
            ) {
              smoothedLandmarksRef.current[index] = cloneLandmarks(hand)
            }
          }
        })
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
      let lastSmoothTime = performance.now()
      const targetFrameInterval = isMobileViewport ? 1000 / 24 : 1000 / 30
      let currentTrackingConfidence = initialTrackingConfidence
      const unsubscribeTrackingConfidence = useSynapseStore.subscribe(
        (state) => {
          if (state.trackingConfidence === currentTrackingConfidence) return

          currentTrackingConfidence = state.trackingConfidence
          hands.setOptions({
            minDetectionConfidence: currentTrackingConfidence,
            minTrackingConfidence: currentTrackingConfidence,
          })
        },
      )

      const smoothData = () => {
        const now = performance.now()
        const deltaFrames = Math.min((now - lastSmoothTime) / TARGET_FRAME_MS, 3)
        lastSmoothTime = now

        const raw = rawLandmarksRef.current
        const smoothed = smoothedLandmarksRef.current

        // Dynamically pull the smoothing factor from the Zustand UI store
        // This allows the user to adjust the tracking "weight" in real-time
        const smoothingFactor = useSynapseStore.getState().smoothingFactor
        const lerpFactor = 1 - (1 - smoothingFactor) ** deltaFrames

        for (let i = 0; i < raw.length; i++) {
          const rawHand = raw[i]
          const smoothedHand = smoothed[i]

          if (!rawHand) {
            if (now - lastSeenAtRef.current[i] > HAND_LOSS_GRACE_MS) {
              smoothed[i] = null
            }
            continue
          }

          if (!sameLandmarkShape(smoothedHand, rawHand)) {
            smoothed[i] = cloneLandmarks(rawHand)
            continue
          }

          if (!smoothedHand) {
            smoothed[i] = cloneLandmarks(rawHand)
            continue
          }

          for (let j = 0; j < rawHand.length; j++) {
            const dx = rawHand[j].x - smoothedHand[j].x
            const dy = rawHand[j].y - smoothedHand[j].y
            const dz = rawHand[j].z - smoothedHand[j].z
            const adaptiveLerpFactor = getAdaptiveLerpFactor(
              lerpFactor,
              dx,
              dy,
              dz,
            )
            const zLerpFactor =
              Math.abs(dz) < DEPTH_JITTER_THRESHOLD
                ? adaptiveLerpFactor * 0.55
                : adaptiveLerpFactor * 0.8

            smoothedHand[j].x = lerp(
              smoothedHand[j].x,
              rawHand[j].x,
              adaptiveLerpFactor,
            )
            smoothedHand[j].y = lerp(
              smoothedHand[j].y,
              rawHand[j].y,
              adaptiveLerpFactor,
            )
            smoothedHand[j].z = lerp(
              smoothedHand[j].z,
              rawHand[j].z,
              clamp(zLerpFactor, 0.01, 0.6),
            )
          }
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
        unsubscribeTrackingConfidence()
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
