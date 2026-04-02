<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

# AI Agent Instructions for SynapseWeave

## Project Context

You are assisting with "SynapseWeave", a highly visual, real-time interactive 3D web application. The app uses webcam tracking to map user hand movements into a 3D space, generating dynamic, glowing web geometries between fingertips.

Performance (maintaining 60 FPS) and modern architectural patterns are the highest priorities.

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **React:** React 19
- **Styling:** Tailwind CSS v4
- **Language:** TypeScript
- **3D & Vision:** Three.js, React Three Fiber (@react-three/fiber), React Three Drei (@react-three/drei), MediaPipe Hands.

---

## 🚨 CRITICAL FRAMEWORK RULES 🚨

### 1. Next.js 16 (App Router) Paradigms

Next.js 16 introduced breaking changes from Next.js 14. You MUST adhere to these updated rules:

- **Async Route Params:** `params` and `searchParams` in Pages, Layouts, and Route Handlers are now **Promises**. You MUST `await` them before use.
  ```tsx
  // GOOD (Next.js 16+)
  export default async function Page({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
  }
  <!-- END:nextjs-agent-rules -->
  ```
