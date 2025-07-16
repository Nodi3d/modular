import { create } from 'zustand';
import { Modular, NodeInterop } from 'nodi-modular';
import { BufferGeometry } from 'three';
import { ParsedGcode } from '../utils/gcodeParser';

interface ModularStore {
  // Core Modular state
  modular: Modular | null;
  nodes: NodeInterop[];
  meshGeometries: BufferGeometry[];
  curveGeometries: BufferGeometry[];
  
  // G-code related
  gcodeData: ParsedGcode | null;
  gcodeText: string;
  
  // Actions
  setModular: (modular: Modular | null) => void;
  setNodes: (nodes: NodeInterop[]) => void;
  setGeometries: (meshes: BufferGeometry[], curves: BufferGeometry[]) => void;
  setGcodeData: (data: ParsedGcode | null) => void;
  setGcodeText: (text: string) => void;
  clearGeometries: () => void;
}

export const useModularStore = create<ModularStore>((set) => ({
  // Initial state
  modular: null,
  nodes: [],
  meshGeometries: [],
  curveGeometries: [],
  gcodeData: null,
  gcodeText: '',
  
  // Actions
  setModular: (modular) => set({ modular }),
  setNodes: (nodes) => set({ nodes }),
  setGeometries: (meshes, curves) => set({ 
    meshGeometries: meshes, 
    curveGeometries: curves 
  }),
  setGcodeData: (data) => set({ gcodeData: data }),
  setGcodeText: (text) => set({ gcodeText: text }),
  clearGeometries: () => set({ 
    meshGeometries: [], 
    curveGeometries: [] 
  }),
}));