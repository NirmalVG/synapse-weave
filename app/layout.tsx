import type { Metadata, Viewport } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { PWAProvider } from "@/components/PWAProvider"
import "./globals.css"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

/**
 * Comprehensive SEO Metadata for SynapseWeave
 *
 * SynapseWeave: Real-time 3D hand gesture tracking visualization
 * powered by MediaPipe Hands and React Three Fiber
 *
 * @seo-strategy
 * - Primary Keywords: hand gesture tracking, 3D visualization, real-time hand detection
 * - Secondary Keywords: webcam tracking, hand skeleton, gesture recognition
 * - Content Type: Interactive WebGL Application (SPA)
 * - Target Audience: Developers, ML enthusiasts, interactive media creators
 */
export const metadata: Metadata = {
  // Core SEO Meta Tags
  title: "SynapseWeave - Real-time 3D Hand Gesture Visualization & Tracking",
  description:
    "Experience cutting-edge hand gesture tracking powered by MediaPipe. Real-time 3D visualization of hand movements with glowing synapse connections, skeleton detection, and interactive controls.",

  // Keywords for Search Engines
  keywords: [
    "hand gesture tracking",
    "hand detection",
    "3D hand visualization",
    "MediaPipe Hands",
    "gesture recognition",
    "real-time hand tracking",
    "webcam hand detection",
    "3D hand skeleton",
    "interactive visualization",
    "Three.js hand tracking",
    "web-based gesture recognition",
    "hand pose estimation",
  ],

  // Author & Creator Information
  authors: [
    {
      name: "SynapseWeave Team",
      url: "https://synapse-weave.com",
    },
  ],

  // Creator for backward compatibility
  creator: "SynapseWeave Contributors",

  // Publisher Information (if applicable)
  publisher: "SynapseWeave",

  // URL & Category Metadata
  category: "Technology",
  classification: "Interactive Web Application",

  // Open Graph Metadata (for social sharing)
  openGraph: {
    type: "website",
    url: "https://synapse-weave.com",
    title: "SynapseWeave - Real-time 3D Hand Gesture Visualization",
    description:
      "Real-time 3D hand gesture tracking with MediaPipe. Visualize hand movements with glowing synapse connections and interactive controls.",
    siteName: "SynapseWeave",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "SynapseWeave - Hand gesture tracking visualization",
        type: "image/png",
      },
      {
        url: "/og-image-square.png",
        width: 800,
        height: 800,
        alt: "SynapseWeave Logo",
        type: "image/png",
      },
    ],
    locale: "en_US",
  },

  // Twitter Card Metadata
  twitter: {
    card: "summary_large_image",
    title: "SynapseWeave - Real-time 3D Hand Gesture Tracking",
    description:
      "Experience real-time hand gesture tracking and 3D visualization powered by MediaPipe.",
    images: ["/twitter-image.png"],
    creator: "@SynapseWeave",
    site: "@SynapseWeave",
  },

  // Robots & Indexing Directives
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  // Alternate Language Versions & Canonical URL
  alternates: {
    canonical: "https://synapse-weave.com",
    languages: {
      "en-US": "https://synapse-weave.com/en-US",
      "en-GB": "https://synapse-weave.com/en-GB",
    },
  },

  // Icon Metadata (Favicons, App Icons)
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "32x32", type: "image/x-icon" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [
      {
        url: "/apple-touch-icon-180x180.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  },

  // App Manifest
  manifest: "/manifest.json",

  // Theme Color (for browser chrome on mobile)
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#050505" },
  ],

  // Format Detection
  formatDetection: {
    telephone: false,
    email: false,
    address: false,
  },

  // Apple Specific
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "SynapseWeave",
  },
}

/**
 * Viewport Configuration for Responsive Design
 *
 * Optimized for mobile and desktop viewing with:
 * - Proper scaling on all devices
 * - User zoom controls enabled
 * - Color scheme support for dark mode
 */
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  colorScheme: "dark",
  themeColor: "#00d4ff",
}

/**
 * RootLayout Component - HTML Document Structure
 *
 * Serves as the root layout for the SynapseWeave application.
 *
 * @component
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Page content
 * @returns {JSX.Element} HTML document structure
 *
 * @seo-features
 * - Semantic HTML5 structure
 * - Language attribute for multilingual SEO
 * - Antialiasing font rendering
 * - Custom font variables (Geist Sans & Mono)
 * - Dark mode optimized (#050505 background)
 *
 * @accessibility
 * - Proper html lang="en" for screen readers
 * - Full page height (min-h-full) for proper layout
 * - Semantic body structure
 *
 * @performance
 * - Google Fonts subsetting to Latin (minimal download)
 * - CSS variables for dynamic theming
 * - Antialiased text rendering for crisp fonts
 *
 * @related
 * - metadata: Comprehensive SEO & Open Graph tags
 * - viewport: Mobile & responsive settings
 * - globals.css: Tailwind CSS & custom theme
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    // Root HTML element with language and font variables
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      {/* Document head is automatically populated by Next.js with metadata */}
      <head>
        {/* SEO: Explicit charset declaration */}
        <meta charSet="utf-8" />

        {/* Performance: Preconnect to essential domains */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />

        {/* OpenSearch plugin for browser search suggestions */}
        <link
          rel="search"
          type="application/opensearchdescription+xml"
          title="SynapseWeave"
          href="/opensearch.xml"
        />
      </head>

      {/* Body with semantic structure */}
      <body className="min-h-full flex flex-col bg-[#050505] text-zinc-100">
        <PWAProvider />

        {/* Main application content */}
        {children}

        {/* Optional: NoScript fallback for users without JavaScript */}
        <noscript>
          <div className="fixed inset-0 flex items-center justify-center bg-black z-50">
            <div className="text-center px-4">
              <h1 className="text-2xl font-bold text-synapse-cyan mb-4">
                SynapseWeave Requires JavaScript
              </h1>
              <p className="text-zinc-400">
                Please enable JavaScript to experience real-time hand gesture
                tracking.
              </p>
            </div>
          </div>
        </noscript>
      </body>
    </html>
  )
}
