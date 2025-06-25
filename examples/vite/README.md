# Nodi Modular - Vite Example

A Vite-based example demonstrating the usage of nodi-modular with React, Three.js, and interactive controls.

## Features

- **Vite**: Fast build tool and development server
- **React Three Fiber**: React renderer for Three.js
- **Leva**: GUI controls for interactive parameter manipulation
- **WebAssembly**: High-performance geometric computations via nodi-modular
- **TypeScript**: Full type support

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

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Key Differences from React Example

This Vite example provides:
- Faster development server and hot module replacement
- Better TypeScript integration
- Modern build pipeline with optimized bundling
- Native WebAssembly support through Vite plugins

## How It Works

1. **WebAssembly Initialization**: The app initializes the nodi-modular WASM module
2. **Graph Loading**: Loads a predefined node graph (shell.json)
3. **Interactive Controls**: Uses Leva to create GUI controls for node parameters
4. **Real-time Updates**: Changes to parameters trigger graph re-evaluation
5. **3D Visualization**: Renders resulting geometries using Three.js