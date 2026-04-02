"use client"

import { SerwistProvider } from "@serwist/next/react"

export function PWAProvider() {
  if (process.env.NODE_ENV !== "production") {
    return null
  }

  return (
    <SerwistProvider
      swUrl="/sw.js"
      register
      cacheOnNavigation
      reloadOnOnline
    />
  )
}
