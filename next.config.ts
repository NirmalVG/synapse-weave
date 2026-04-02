import withSerwistInit from "@serwist/next"

const isDev = process.env.NODE_ENV === "development"

const withSerwist = withSerwistInit({
  swSrc: "app/sw.ts",
  swDest: "public/sw.js",
  disable: isDev,
})

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
}

// THE FIX:
// If we are coding locally (dev), use the standard config so Turbopack works.
// If we are deploying (build), wrap it with Serwist to generate the PWA.
export default isDev ? nextConfig : withSerwist(nextConfig)
