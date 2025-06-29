# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is `nodi-modular`, a WebAssembly-based JavaScript/TypeScript library for 3D geometric modeling using node graphs. The core computational engine is written in Rust and compiled to WebAssembly, with JavaScript bindings for web and Node.js environments.

**Key Components:**
- Core library: Pre-built WebAssembly module with JS/TS bindings
- Examples: React app, Vite example, and Deno script demonstrating usage
- Showcases: Advanced React applications (frange and foldingbox) with complex node graph visualization and DXF export

## Development Commands

### React Example (`examples/react/`)
```bash
cd examples/react
npm install
npm start          # Development server on http://localhost:3000
npm run build      # Production build
npm test           # Run Jest tests
```

### Vite Example (`examples/vite/`)
```bash
cd examples/vite
npm install
npm run dev       # Vite dev server on http://localhost:5173
npm run build     # TypeScript compile + Vite build
npm run lint      # ESLint linting
npm run preview   # Preview production build
```

### Frange Showcase (`showcase/frange/`)
```bash
cd showcase/frange
npm install       # Note: Uses npm, similar to vite example
npm run dev       # Vite dev server on http://localhost:5173
npm run build     # TypeScript compile + Vite build
npm run lint      # ESLint linting
npm run preview   # Preview production build
```

### Foldingbox Showcase (`showcase/foldingbox/`)
```bash
cd showcase/foldingbox
npm install       # Note: Uses npm, includes dxf-writer for export
npm run dev       # Vite dev server on http://localhost:5173
npm run build     # TypeScript compile + Vite build
npm run lint      # ESLint linting
npm run preview   # Preview production build
```

### Deno Example (`examples/deno/`)
```bash
cd examples/deno
deno --allow-read main.ts
# or use the provided script:
./run.sh
```

## Architecture

### Core Library Structure
- **`index.js`**: Main JavaScript bindings and WebAssembly glue code
- **`index_bg.wasm`**: WebAssembly binary containing Rust computational core
- **`index.d.ts`**: TypeScript definitions for the entire API

### Key Classes and APIs
- **`Modular`**: Main class for loading, evaluating, and manipulating node graphs
- **Node System**: Comprehensive node-based workflow with properties, connections, and evaluation
- **Geometry Types**: Support for meshes, curves, surfaces, planes, and groups
- **Transform System**: 3D transformations and matrix operations

### Example Usage Pattern
```javascript
import init, { Modular } from "nodi-modular";

// Always initialize WebAssembly first
await init();

// Create instance, load graph, evaluate
const modular = Modular.new();
modular.loadGraph(JSON.stringify(nodeGraphData));
const result = modular.evaluate();

// Access geometries
const { geometryIdentifiers } = result;
geometryIdentifiers.forEach(id => {
  const geometry = modular.findGeometryById(id);
  const interop = modular.findGeometryInteropById(id);
});
```

### Technology Stack
- **Core**: Rust → WebAssembly
- **Frontend Examples**: React, TypeScript
- **Build Tools**: 
  - React example: Create React App
  - Vite example: Modern Vite with WASM and top-level await plugins
  - Showcases: Vite with React, WASM, and specialized node graph features
- **3D Rendering**: Three.js via `@react-three/fiber` and `@react-three/drei`
- **Interactive Controls**: Leva for parameter manipulation
- **Export Formats**: DXF export functionality in showcase applications (via dxf-writer)
- **Styling**: Basic CSS (examples), Tailwind CSS (potential in showcases)

## Important Notes

- This is a published npm package; the main project contains only pre-built artifacts
- WebAssembly initialization (`await init()`) is required before using any functionality
- The library works in browsers, Node.js, and Deno environments
- Geometry data can be accessed both as structured objects and as renderable interop data for 3D visualization
- Node properties can be dynamically changed and graphs re-evaluated for parametric modeling workflows

## Development Setup Notes

- **Vite Projects**: Both `examples/vite/` and both showcase applications use Vite with WebAssembly plugins
- **Graph Files**: Examples include `shell.json` and `brick-wall.json` for basic demos, `frange.json` and `foldingbox.json` for advanced showcases
- **WebAssembly Requirements**: Vite projects require `vite-plugin-wasm` and `vite-plugin-top-level-await` for proper WASM support
- **Directory Structure**: Showcases are in `showcase/frange/` and `showcase/foldingbox/` (singular), not `showcases/` (plural)
- **Package Management**: React example uses yarn, all other projects use npm
- **Geometry Support**: Showcases support both mesh and curve geometry visualization and export