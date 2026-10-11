# Hangyudon Photobooth (はんぎょどん ぷりくら)

An interactive Japanese Purikura-style photobooth web application themed around Sanrio's Hangyudon and Sayuri.

## Features

- **Live Camera Integration**: Accesses webcams via WebRTC with selfie mirror mode and device switching.
- **Interactive Background**:
  - Live video remains fully visible through a semi-transparent aquatic atmosphere.
  - Floating glassy bubbles drift across the screen carrying miniature ramen bowls, pearls, stars, and cute mascots.
  - Clicking or tapping any bubble pops it with particle burst effects and synthesized pop audio.
  - Clicking on the water canvas generates expanding ripples and spawns new bubbles.
- **Configurable Countdown Timer**:
  - Adjustable countdown intervals (3s, 5s, 10s) with animated audio beeps and visual ring counters.
  - Shot modes: Classic 4-Cut Photobooth Strip (4 sequential snapshots with intervals) or Single Snap.
  - Screen flash animation and camera shutter audio synthesis on capture.
- **Cute Stickers & Props Drawer**:
  - Draggable, resizable, and rotatable props: Hangyudon face, wearable fish fin headband, Sayuri octopus, steaming ramen bowl, clam pearl, sparkles, and Japanese kawaii badges.
- **Photo Strip Compositor & Download**:
  - Multi-theme customizable photobooth frame (Hangyudon Mint, Sayuri Coral, Deep Ocean Navy, Ramen Yellow, Dreamy Lavender).
  - Multiple layout presets (Vertical 4-Cut Strip, 2x2 Grid, Single Polaroid).
  - High-resolution PNG image download with custom date stamp.
- **Web Audio Synthesis**:
  - Zero external sound asset dependencies. Built with Web Audio API for offline reliability.

## Getting Started

### Prerequisites

- Node.js (v18+)
- npm (v9+)

### Installation

```bash
npm install
```

### Development Server

Run the development server:

```bash
npm run dev
```

Then open `http://localhost:5173` in your browser.

### Running Tests

Execute test suite with Vitest:

```bash
npm test
```

### Production Build

```bash
npm run build
```
