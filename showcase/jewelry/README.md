# Nodi Modular Sample - Jewelry Configurator

A parametric jewelry design configurator built with the nodi-modular library, featuring real-time 3D visualization and customizable ring designs for personalized jewelry creation.

## Features

![demo](/demo.mp4)

- **Parametric Ring Design**: Interactive customization of various ring styles including braid, bypass, and twist patterns
- **Real-time 3D Visualization**: Instant preview of design changes with material selection (gold, silver, platinum)
- **Multiple Ring Types**: Choose from different parametric ring designs with unique characteristics
- **Material Options**: Select between different precious metals with realistic rendering
- **Export Capability**: Download your custom designs for 3D printing or manufacturing

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

## Ring Types

- **Braid**: Interwoven band design with customizable thickness and pattern ([Nodi project](https://app.nodi3d.com/4d5b3099-f023-44e4-80a8-c68171c1b8f5))
- **Bypass**: Overlapping band style with adjustable gap and curve([Nodi project](https://app.nodi3d.com/c99a349a-b045-4078-b1fa-f545e2c8e638))
- **Twist**: Spiraling band with configurable twist count and tension([Nodi project](https://app.nodi3d.com/3f3fd82e-812b-4c85-97a8-8cbf96239a7c))

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Tech Stack

- **Frontend**: React 19 + TypeScript
- **3D Rendering**: Three.js with @react-three/fiber and @react-three/drei
- **Build Tool**: Vite with WASM and top-level await plugins
- **UI Controls**: Custom property panel for precise parameter adjustment
- **WebAssembly**: nodi-modular (v0.0.20) for computational geometry
- **State Management**: Zustand for application state
- **Routing**: React Router for different ring type navigation
