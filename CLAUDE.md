# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Nodi Modular is a WebAssembly-based module for importing and evaluating node graphs created in Nodi (parametric 3D modeling tool). The project consists of a core WebAssembly package and multiple showcase applications demonstrating its capabilities.

## Key Commands

### Showcase Applications (in `/showcase/[app-name]/`)
```bash
# Development server
npm run dev

# Production build
npm run build

# Lint code
npm run lint

# Preview production build
npm run preview

# Run specific tests (when available)
npm test -- [test-name]
```

## Architecture

### Core Package Structure
- **WebAssembly Core**: Compiled from Rust, distributed as `index_bg.wasm`
- **JavaScript Bindings**: `index.js` provides the interface
- **TypeScript Definitions**: Comprehensive types in `index.d.ts`

### Typical Usage Pattern
```javascript
// 1. Initialize WebAssembly
await init();

// 2. Create Modular instance
const modular = Modular.new();

// 3. Load parametric graph
modular.loadGraph(graphJSON);

// 4. Evaluate geometry
await modular.evaluate();

// 5. Access geometries
const geometry = modular.findGeometryById(id);

// 6. Update parameters
modular.changeNodeProperty(nodeId, key, value);
```

### Showcase App Architecture
Each showcase app follows this pattern:
- **State Management**: Zustand stores in `/src/stores/`
  - `useModularStore` - Core Modular instance and geometry
  - `use[Product]Store` - Product-specific state
  - `useUIStore` - UI state management
- **Components**: React components with Three.js integration
- **Utils**: Helper functions for geometry conversion and processing

### Key Technical Considerations

1. **WebAssembly Initialization**: Always await `init()` before using Modular
2. **Vite Configuration**: Exclude WASM modules from optimization:
   ```javascript
   optimizeDeps: {
     exclude: ['nodi-modular', 'manifold-3d']
   }
   ```
3. **Performance**: Debounce parameter updates to avoid excessive evaluations
4. **Three.js Integration**: Properly dispose geometries when updating to prevent memory leaks
5. **Path Aliases**: Use `@/` for src directory imports in showcase apps

### Geometry Types
The system supports various geometry types:
- Curves: Line, Arc, Circle, Ellipse, NURBS, Polyline
- Surfaces: Plane, Triangle, NURBS, Trimmed
- Meshes: With vertices, normals, UV coordinates
- Groups and Transformations

### Development Workflow
1. For showcase apps, always run from the specific app directory
2. Use TypeScript - comprehensive type definitions are available
3. State updates should go through Zustand stores
4. Geometry evaluation is async - handle accordingly
5. Check existing showcase implementations for patterns before creating new features