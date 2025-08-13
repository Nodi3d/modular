import { create } from 'zustand';
import type { GeometryIdentifier, NodeInterop, NodePropertyInterop } from 'nodi-modular';
import { convertGeometryInterop } from '@/utils/geometryUtils';
import { getModularWorkerClient } from '@/workers/ModularWorkerClient';
import { BufferGeometry } from 'three';
import braid from '@/assets/graph/braid.json';


// // ジオメトリ情報の型を定義
export interface GeometryWithId {
  id: GeometryIdentifier;  // stringではなくGeometryIdentifier型に修正
  geometry: BufferGeometry;
  label: string;
}
export interface ManifoldGeometriesWithInfo {
  label: string
  id: string
  geometry: BufferGeometry
}

export type RingType = "braid" | "bypass" | "twist";

// Zustandストアの型定義
interface ModularWorkerState {
  nodes: NodeInterop[];
  geometries: GeometryWithId[];
  isConnected: boolean;
  isLoading: boolean;
  inputNodeId: string;
  manifoldGeometries: ManifoldGeometriesWithInfo[];

  nodeIds: {
    innerDiameter: string;
  };
  currentType: RingType;

  // アクション
  setNodes: (nodes: NodeInterop[]) => void;
  setGeometries: (geometries: GeometryWithId[]) => void;
  setNodeIds: (nodeIds: ModularWorkerState['nodeIds']) => void;
  setInputNodeId: (inputNodeId: string) => void;
  setManifoldGeometries: (manifoldGeometries: ManifoldGeometriesWithInfo[]) => void;
  setCurrentType: (currentType:RingType) => void;
  // 複雑な操作
  connect: () => Promise<void>;
  disconnect: () => void;
  loadGraph: (slug?: string) => Promise<void>;
  evaluateGraph: () => Promise<void>;
  updateNodeProperty: (props: {id: string, value: number | string}[]) => Promise<void>;
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
    innerDiameter: '',
  },
  currentType: 'braid',

  setNodes: (nodes) => set({ nodes }),
  setGeometries: (geometries) => set({ geometries }),
  setNodeIds: (nodeIds) => set({ nodeIds }),
  setInputNodeId: (inputNodeId) => set({ inputNodeId }),
  setManifoldGeometries: (manifoldGeometries) => set({ manifoldGeometries }),
  setCurrentType: (currentType:RingType) => set({ currentType }),
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

  loadGraph: async (slug) => {
    const { isConnected, setNodes, setInputNodeId, setNodeIds } = get();
    // console.log('Loading graph:', slug);
    if (!isConnected) {
      console.warn('Worker not connected');
      return;
    }

    const client = getModularWorkerClient();
    try {
      set({ isLoading: true });

      // slugに基づいてグラフを動的に読み込む
      const imported = await importGraph(slug? slug : 'braid');
      const graphData = imported.default;
      // console.log('nodes:', nodes);

      // 初期評価を実行
      await get().evaluateGraph();

      const nodes = await client.loadGraph(JSON.stringify(graphData.graph));
      setNodes(nodes);

      // "input" ラベルを持つノードを検索
      const inputNode = nodes.find((node) => node.label === 'input');
      if (inputNode !== undefined) {
        setInputNodeId(inputNode.id);
      }

      // 各ラベルを持つノードを検索
      const innerDiameterNode = nodes.find((node) => node.label === 'innerDiameter');
      if (innerDiameterNode !== undefined) {
        setNodeIds({
          innerDiameter: innerDiameterNode.id
        });
        //console.log('innerDiameterNode is Set:', innerDiameterNode);
      }
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
      // console.log('geometries:', gs);
    } catch (error) {
      console.error('Error evaluating graph:', error);
      setGeometries([]);
    }
  },

  updateNodeProperty: async (props) => {
    const { isConnected, nodes, setGeometries, isLoading } = get();
    if (!isConnected) {
      console.warn('Worker not connected');
      return;
    }

    if (isLoading) {
      console.warn('Graph is already loading');
      return;
    }

    const client = getModularWorkerClient();
    
    // ローディング開始
    set({ isLoading: true });
    
    try {
      const payload = props.map(({ id, value }) => {
        const targetNode = nodes.find((node) => node.id === id);
        if (targetNode !== undefined) {
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
            return { nodeId: id, property };
        }
        return undefined;
      }).filter((p): p is { nodeId: string; property: NodePropertyInterop } => p !== undefined);

      // SharedWorkerが自動的に評価を実行してジオメトリとノードを返す
      const response = await client.updateNodeProperties(payload);
      const { geometries } = response;

      // 更新されたノード情報を保存
      // setNodes(updatedNodes);

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
      console.error(`Error in updateNodeProperty:`, error);
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