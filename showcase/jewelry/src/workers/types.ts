import type {
  GeometryIdentifier,
  NodeInterop,
  MeshInterop,
  GeometryInterop,
  NodePropertyInterop,
} from 'nodi-modular';

// Worker への送信メッセージ型
export type ModularWorkerMessage =
  | { type: 'init'; payload: Record<string, never> }
  | { type: 'loadGraph'; payload: { graphData: string } }
  | { type: 'evaluate'; payload: Record<string, never> }
  | {
      type: 'updateNodeProperties';
      payload: {
        nodeId: string;
        property: NodePropertyInterop;
      }[];
    }
  | { type: 'getNodes'; payload: Record<string, never> };

// Worker からの返信メッセージ型
export type ModularWorkerResponse =
  | { type: 'connected'; payload: { initialized: boolean } }
  | { type: 'initialized'; payload: { success: boolean } }
  | { type: 'graphLoaded'; payload: { nodes: NodeInterop[] } }
  | {
      type: 'evaluated';
      payload: {
        geometries: Array<{
          id: GeometryIdentifier;
          interop: GeometryInterop | null;
          transform: GeometryIdentifier['transform'];
        }>;
      };
    }
  | {
      type: 'nodeUpdated';
      payload: {
        geometries: Array<{
          id: GeometryIdentifier;
          interop: GeometryInterop | null;
          transform: GeometryIdentifier['transform'];
        }>;
        nodes: NodeInterop[];
      };
    }
  | { type: 'nodes'; payload: { nodes: NodeInterop[] } }
  | { type: 'error'; payload: { error: string } };

// SharedWorker クライアントのインターフェース
export interface ModularWorkerClient {
  initialized: boolean;
  port: MessagePort | null;
  connect(): Promise<void>;
  disconnect(): void;
  loadGraph(graphData: string): Promise<NodeInterop[]>;
  evaluate(): Promise<
    Array<{
      id: GeometryIdentifier;
      interop: MeshInterop | null;
      transform: GeometryIdentifier['transform'];
    }>
  >;
  updateNodeProperties(
    properties: {
      nodeId: string;
      property: NodePropertyInterop;
    }[],
  ): Promise<{
    geometries: Array<{
      id: GeometryIdentifier;
      interop: MeshInterop | null;
      transform: GeometryIdentifier['transform'];
    }>;
    nodes: NodeInterop[];
  }>;
  getNodes(): Promise<NodeInterop[]>;
}