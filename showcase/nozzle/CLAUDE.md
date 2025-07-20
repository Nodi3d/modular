# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Build and Development
- `npm run dev` - Start development server with hot module replacement
- `npm run build` - Build for production (TypeScript compilation + Vite build)
- `npm run lint` - Run ESLint code quality checks
- `npm run preview` - Preview production build locally

### Package Management
- This project uses **Yarn 4.4.1** as the package manager
- Use `yarn` instead of `npm` for dependency management

## Project Architecture

### Application Type
React 19 + TypeScript 3D web application for parametric modeling of custom 3D printable objects (currently nozzles). Built with Vite 6 and uses Three.js for 3D rendering.

### Core Technology Stack
- **Frontend**: React 19 with TypeScript
- **3D Graphics**: Three.js + React Three Fiber + React Three Drei
- **Parametric Modeling**: nodi-modular (custom node-based system)
- **3D Processing**: manifold-3d for boolean operations
- **State Management**: Zustand with domain-specific stores
- **Styling**: Tailwind CSS v4
- **Build**: Vite 6 with WebAssembly support

### Key Architectural Patterns

#### State Management Structure
- **modular.ts**: Core 3D modeling, graph evaluation, and geometry management
- **nozzle.ts**: Product-specific parameters (material, dimensions)
- **navigation.ts**: UI navigation state
- **settings.ts**: Application settings

#### Routing and Pages
- Dynamic routing with `/:slug` pattern (e.g., `/nozzle`)
- Lazy-loaded page components via dynamic imports
- Pages are located in `src/pages/{slug}/index.tsx`

#### 3D Modeling Pipeline
1. **Graph Loading**: JSON-based parametric models from `src/assets/graph/`
2. **Parameter Control**: UI components update node properties in real-time
3. **Graph Evaluation**: nodi-modular evaluates the parametric graph
4. **Geometry Generation**: Manifold-3d processes 3D operations
5. **Rendering**: Three.js displays results with interactive controls

#### Component Organization
```
src/components/{product}/
├── 3d/           # 3D viewport and rendering components
├── ui/           # Parameter controls and UI components
└── elements/     # Reusable 3D helper components
```

### Important Implementation Details

#### WebAssembly Integration
- Uses `vite-plugin-wasm` for performance-critical 3D operations
- Excludes 'nodi-modular' and 'manifold-3d' from Vite optimization

#### Asset Management
- **3D Models**: JSON graphs in `src/assets/graph/`
- **Materials**: PBR textures in `public/materials/`
- **Icons**: SVG components via vite-plugin-svgr
- **Fonts**: Custom fonts in `src/assets/fonts/`

#### Path Aliases
- Use `@/` for imports from `src/` directory
- Example: `import { useModularStore } from "@/stores/modular"`

### Development Workflow

#### Adding New Products
1. Create parametric graph JSON in `src/assets/graph/{product}.json`
2. Add page component at `src/pages/{product}/index.tsx`
3. Update `pageComponents` mapping in `src/App.tsx`
4. Create product-specific store in `src/stores/{product}.ts`
5. Add UI components in `src/components/{product}/`

#### Working with 3D Models
- Parametric models are defined as JSON node graphs
- Use `updateNodeProperty()` to modify parameters
- Geometry updates trigger automatic re-evaluation
- Access geometries via `modularStore.geometries` or `modularStore.manifoldGeometries`

#### State Management Best Practices
- Use Zustand stores for different domains (modular, product-specific, UI)
- Initialize modular system with `initializeModular()` before graph operations
- Load graphs with `loadGraph(slug)` method
- Evaluate graphs with `evaluateGraph()` after parameter changes

### Critical Dependencies
- **nodi-modular**: Core parametric modeling engine
- **manifold-3d**: 3D boolean operations and mesh processing
- **React Three Fiber**: React integration for Three.js
- **Zustand**: Lightweight state management
- **Tailwind CSS v4**: Utility-first styling

### Performance Considerations
- 3D operations run in WebAssembly for optimal performance
- Lazy loading for page components
- Geometry processing is asynchronous
- Use `useMemo` and `useCallback` for expensive 3D operations