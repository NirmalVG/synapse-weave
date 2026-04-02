import withSerwistInit from "@serwist/next";

const isDev = process.env.NODE_ENV === "development";

const withSerwist = withSerwistInit({
  swSrc: "app/sw.ts",
  swDest: "public/sw.js",
  disable: isDev,
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // This explicitly silences the Turbopack vs Webpack conflict during Vercel builds
  turbopack: {},
};

// Use standard config for local dev (fast), use Serwist for production build
export default isDev ? nextConfig : withSerwist(nextConfig);