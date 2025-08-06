import { create } from 'zustand';
import type { NodeInterop, NodePropertyInterop } from 'nodi-modular';
import { convertGeometryInterop } from '@/utils/geometryUtils';
import { getModularWorkerClient } from '@/workers/ModularWorkerClient';
import type { GeometryWithId, ManifoldGeometriesWithInfo } from './modular';
import braid from '@/assets/graph/braid.json';

// Zustandストアの型定義
interface ModularWorkerState {
  nodes: NodeInterop[];
  geometries: GeometryWithId[];
  isConnected: boolean;
  isLoading: boolean;
  inputNodeId: string;
  manifoldGeometries: ManifoldGeometriesWithInfo[];

  nodeIds: {
    length: string;
    
  };

  // アクション
  setNodes: (nodes: NodeInterop[]) => void;
  setGeometries: (geometries: GeometryWithId[]) => void;
  setNodeIds: (nodeIds: ModularWorkerState['nodeIds']) => void;
  setInputNodeId: (inputNodeId: string) => void;
  setManifoldGeometries: (manifoldGeometries: ManifoldGeometriesWithInfo[]) => void;

  // 複雑な操作
  connect: () => Promise<void>;
  disconnect: () => void;
  loadGraph: (slug?: string) => Promise<void>;
  evaluateGraph: () => Promise<void>;
  updateNodeProperty: (id: string, value: number | string) => Promise<void>;
  getNodeProperty: (label: string) => { id: string; outputs: unknown } | null;
}

// 必要に応じてグラフを動的にインポートする関数
const importGraph = async (slug: string) => {
  try {
    return await import(`../assets/graph/${slug}.json`);
  } catch (error) {
    console.error(`Graph for ${slug} not found:`, error);
    return braid;
  }
};

// Zustandストアの作成
export const useModularWorkerStore = create<ModularWorkerState>((set, get) => ({
  nodes: [],
  geometries: [],
  isConnected: false,
  isLoading: false,
  inputNodeId: '',
  manifoldGeometries: [],
  nodeIds: {
    length: '',
    
  },

  setNodes: (nodes) => set({ nodes }),
  setGeometries: (geometries) => set({ geometries }),
  setNodeIds: (nodeIds) => set({ nodeIds }),
  setInputNodeId: (inputNodeId) => set({ inputNodeId }),
  setManifoldGeometries: (manifoldGeometries) => set({ manifoldGeometries }),

  connect: async () => {
    const client = getModularWorkerClient();
    try {
      set({ isLoading: true });
      await client.connect();
      set({ isConnected: true });
    } catch (error) {
      console.error('Failed to connect to worker:', error);
      set({ isConnected: false });
    } finally {
      set({ isLoading: false });
    }
  },

  disconnect: () => {
    const client = getModularWorkerClient();
    client.disconnect();
    set({ isConnected: false, nodes: [], geometries: [] });
  },

  loadGraph: async (slug = 'braid') => {
    const { isConnected, setNodes, setInputNodeId, setNodeIds } = get();
    if (!isConnected) {
      console.warn('Worker not connected');
      return;
    }

    const client = getModularWorkerClient();
    try {
      set({ isLoading: true });

      // slugに基づいてグラフを動的に読み込む
      const imported = await importGraph(slug);
      const graphData = imported.default;

      const nodes = await client.loadGraph(JSON.stringify(graphData.graph));
      setNodes(nodes);
      console.log('nodes:', nodes);

      // "input" ラベルを持つノードを検索
      const inputNode = nodes.find((node) => node.label === 'input');
      if (inputNode) {
        setInputNodeId(inputNode.id);
      }

      // 各ラベルを持つノードを検索
      const lengthNode = nodes.find((node) => node.label === 'length');
      

      if (lengthNode) {
        setNodeIds({
          length: lengthNode.id
        });
      }

      // 初期評価を実行
      await get().evaluateGraph();
    } catch (error) {
      console.error(`Error loading graph for ${slug}:`, error);
    } finally {
      set({ isLoading: false });
    }
  },

  evaluateGraph: async () => {
    const { isConnected, setGeometries, nodes } = get();
    if (!isConnected) {
      console.warn('Worker not connected');
      return;
    }

    const client = getModularWorkerClient();
    try {
      const geometries = await client.evaluate();

      const gs = geometries
        .map((g) => {
          const { id, interop, transform } = g;
          const geometry = interop ? convertGeometryInterop(interop, transform) : null;
          const node = nodes.find((n) => n.id === id.graphNodeSet?.nodeId);
          const label = node?.label || '';
          return geometry ? { id, geometry, label } : null;
        })
        .filter((g): g is GeometryWithId => g !== null);

      setGeometries(gs);
    } catch (error) {
      console.error('Error evaluating graph:', error);
      setGeometries([]);
    }
  },

  updateNodeProperty: async (id, value) => {
    const { isConnected, nodes, setGeometries, setNodes } = get();
    if (!isConnected) {
      console.warn('Worker not connected');
      return;
    }

    const client = getModularWorkerClient();
    
    // ローディング開始
    set({ isLoading: true });
    
    try {
      // ノードの存在を確認
      const targetNode = nodes.find((node) => node.id === id);
      if (!targetNode) {
        console.error(`Node with ID ${id} not found`);
        set({ isLoading: false });
        return;
      }

      const property: NodePropertyInterop =
        typeof value === 'string'
          ? {
              name: 'content',
              value: {
                type: 'String' as const,
                content: value,
              },
            }
          : {
              name: 'value',
              value: {
                type: 'Number' as const,
                content: value as number,
              },
            };

      console.log(`Updating node ${id} with property:`, property);

      // SharedWorkerが自動的に評価を実行してジオメトリとノードを返す
      const response = await client.updateNodeProperty(id, property);
      const { geometries, nodes: updatedNodes } = response;

      // 更新されたノード情報を保存
      setNodes(updatedNodes);

      const gs = geometries
        .map((g) => {
          const { id, interop, transform } = g;
          const geometry = interop ? convertGeometryInterop(interop, transform) : null;
          const node = updatedNodes.find((n) => n.id === id.graphNodeSet?.nodeId);
          const label = node?.label || '';
          return geometry ? { id, geometry, label } : null;
        })
        .filter((g): g is GeometryWithId => g !== null);

      setGeometries(gs);
    } catch (error) {
      console.error(`Error in updateNodeProperty for node ${id}:`, error);
    } finally {
      // ローディング終了
      set({ isLoading: false });
    }
  },

  getNodeProperty: (label) => {
    const { nodes } = get();
    const targetNode = nodes.find((node) => node.label === label);

    if (!targetNode) {
      return null;
    }

    return {
      id: targetNode.id,
      outputs: targetNode.outputs,
    };
  },
}));