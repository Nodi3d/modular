import { create } from 'zustand';
import { Modular, NodeInterop } from 'nodi-modular';
import { BufferGeometry } from 'three';

interface ModularStore {
  // Core Modular state
  modular: Modular | null;
  nodes: NodeInterop[];
  meshGeometries: BufferGeometry[];
  curveGeometries: BufferGeometry[];
  
  // Actions
  setModular: (modular: Modular | null) => void;
  setNodes: (nodes: NodeInterop[]) => void;
  setGeometries: (meshes: BufferGeometry[], curves: BufferGeometry[]) => void;
  clearGeometries: () => void;
}

export const useModularStore = create<ModularStore>((set) => ({
  // Initial state
  modular: null,
  nodes: [],
  meshGeometries: [],
  curveGeometries: [],
  
  // Actions
  setModular: (modular) => set({ modular }),
  setNodes: (nodes) => set({ nodes }),
  setGeometries: (meshes, curves) => set({ 
    meshGeometries: meshes, 
    curveGeometries: curves 
  }),
  clearGeometries: () => set({ 
    meshGeometries: [], 
    curveGeometries: [] 
  }),
}));