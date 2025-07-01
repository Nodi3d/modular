# Nodi Modular Sample - Nozzle Configurator

A 3D printer nozzle configurator built with the nodi-modular library, featuring interactive 3D visualization and parametric design capabilities for custom nozzle manufacturing.


## Features
![gif](/nozzle.gif)

- **Parametric Design**: Adjust nozzle dimensions including length, outer size, tip sizes, and needle length in real-time


## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser and navigate to `http://localhost:5173`

* Modeling part is done with following projects.
(https://app.nodi3d.com/d7a4f0c8-4cf6-4b2c-bf17-f2756057f2a6)[https://app.nodi3d.com/d7a4f0c8-4cf6-4b2c-bf17-f2756057f2a6]

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Tech Stack

- **Frontend**: React 19 + TypeScript
- **3D Rendering**: Three.js with @react-three/fiber and @react-three/drei
- **Build Tool**: Vite with WASM and top-level await plugins
- **UI Controls**: Custom sliders for precise parameter adjustment
- **WebAssembly**: nodi-modular (v0.0.20) for computational geometry
- **State Management**: Zustand for application state

