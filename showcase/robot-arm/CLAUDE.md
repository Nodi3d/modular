# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is the **robot-arm showcase**, a sophisticated 3D robot arm simulator and G-code visualizer built with React, Three.js, and WebAssembly. It demonstrates real-time 3D visualization, parametric geometric modeling using node graphs, and robot path animation for robotics and 3D printing workflows.

**Key Capabilities:**
- KUKA-style robotic arm simulation with kinematic visualization
- G-code parsing and toolpath animation
- Parametric modeling via nodi-modular WebAssembly engine
- Real-time geometry generation from node graphs
- DXF export for CAD integration

## Development Commands

```bash
npm install          # Install dependencies
npm run dev         # Start development server on http://localhost:5173
npm run build       # TypeScript compile + Vite production build
npm run preview     # Preview production build locally
npm run lint        # ESLint code checking
```

## Architecture

### Core Components

**`src/App.tsx`** - Main application orchestrating:
- WebAssembly initialization for nodi-modular
- Robot animation state management and G-code data processing
- 3D scene setup with Three.js canvas, lighting, and shadows
- Real-time geometry evaluation with debounced parameter updates (150ms)

**`src/components/KukaArm.tsx`** - Robot arm 3D model:
- Kinematic chain: Base → Joints → Links → End Effector
- Linear interpolation for smooth path following
- Placeholder geometry (currently boxes, prepared for GLTF models)

**`src/components/AnimationControls.tsx`** - Interactive control panel:
- Playback controls (play/pause/reset) with speed adjustment
- Progress slider for manual G-code move scrubbing
- Real-time position display and move counter

**`src/utils/gcodeParser.ts`** - G-code processing:
- Parses G1 linear movement commands (X/Y/Z/E/F parameters)
- Calculates toolpath bounding boxes
- Async file loading and coordinate extraction

### Key Data Files

- **`public/polygonstool.gcode`** - Sample 3D printing toolpath
- **`src/polygonstool.json`** - Complex node graph defining parametric polygon tool geometry
- **`src/mochi.json`** - Additional node graph example

### Technology Integration

**WebAssembly Performance**: Uses nodi-modular (Rust → WASM) for high-speed geometric computations that enable real-time parametric modeling.

**3D Rendering**: Sophisticated Three.js pipeline with @react-three/fiber and @react-three/drei for realistic lighting, shadows, and material properties.

**Animation System**: Frame-based G-code move processing with configurable playback speed and smooth interpolation for detailed toolpath analysis.

**Interactive Parameters**: Leva-based GUI dynamically generated from node graph metadata, allowing real-time geometry manipulation with immediate visual feedback.

## Build Configuration

**Vite Setup** (`vite.config.ts`):
- React plugin with WebAssembly support via `vite-plugin-wasm`
- Top-level await support for async initialization
- Optimized dependency handling for nodi-modular exclusions

**Package Management**: Originally npm-based project. If yarn conflicts occur, remove yarn.lock and .pnp files, use npm exclusively.

## Development Notes

- Always initialize WebAssembly (`await init()`) before using nodi-modular
- Geometry evaluation is debounced to prevent excessive recalculation
- Robot arm currently uses placeholder geometry - GLTF model integration is prepared but commented out
- G-code parser focuses on G1 commands; extend for G0, G2/G3 arc support as needed
- Three.js scene uses proper disposal patterns to prevent memory leaks during geometry updates

### Project Logging
* Use vibelogger library for all logging needs
* vibelogger instruction: https://github.com/fladdict/vibe-logger/blob/main/README.md
* Check ./logs/<project_name>/ folder for debugging data when issues occur