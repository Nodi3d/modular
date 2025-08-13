import type {
  GeometryIdentifier,
  NodeInterop,
  MeshInterop,
  NodePropertyInterop,
} from 'nodi-modular';
import type { ModularWorkerClient, ModularWorkerMessage, ModularWorkerResponse } from './types';

export class ModularWorkerClientImpl implements ModularWorkerClient {
  initialized = false;
  port: MessagePort | null = null;
  private worker: SharedWorker | null = null;
  private messageHandlers = new Map<string, (data: any) => void>();
  private messageId = 0;

  async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        // SharedWorkerを作成
        this.worker = new SharedWorker(new URL('./modular.worker.ts', import.meta.url), {
          type: 'module',
          name: 'modular-worker',
        });

        this.port = this.worker.port;

        // エラーハンドリング
        this.worker.onerror = (error) => {
          console.error('SharedWorker error:', error);
          reject(error);
        };

        // メッセージハンドリング
        this.port.onmessage = (event: MessageEvent<ModularWorkerResponse>) => {
          const { type, payload } = event.data;
          // console.log('type:', type);

          if (type === 'connected') {
            this.initialized = payload.initialized;
            // すでに初期化済みの場合はすぐに解決
            if (payload.initialized) {
              this.initialized = true;
              resolve();
            }
          } else if (type === 'initialized') {
            this.initialized = true;
            resolve();
          } else if (type === 'error') {
            console.error('Worker error:', payload.error);
            reject(new Error(payload.error));
            // エラーハンドラーを呼び出す
            this.messageHandlers.forEach((handler) => {
              handler({ error: payload.error });
            });
          } else {
            // 対応するハンドラーを呼び出す
            this.messageHandlers.forEach((handler) => {
              handler(event.data);
            });
          }
        };

        // ポートを開始
        this.port.start();

        // 初期化メッセージを送信
        this.sendMessage({ type: 'init', payload: {} });
      } catch (error) {
        reject(error);
      }
    });
  }

  disconnect(): void {
    if (this.port) {
      this.port.close();
      this.port = null;
    }
    if (this.worker) {
      this.worker = null;
    }
    this.initialized = false;
    this.messageHandlers.clear();
  }

  private sendMessage(message: ModularWorkerMessage): void {
    if (!this.port) {
      throw new Error('Worker not connected');
    }
    this.port.postMessage(message);
  }

  private sendMessageWithResponse<T>(
    message: ModularWorkerMessage,
    responseType: string,
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      const id = `${responseType}_${this.messageId++}`;

      const handler = (data: ModularWorkerResponse) => {
        if (data.type === responseType) {
          this.messageHandlers.delete(id);
          resolve(data.payload as T);
        } else if (data.type === 'error') {
          this.messageHandlers.delete(id);
          reject(new Error(data.payload.error));
        }
      };

      this.messageHandlers.set(id, handler);
      this.sendMessage(message);

      // タイムアウト設定（30秒）
      setTimeout(() => {
        if (this.messageHandlers.has(id)) {
          this.messageHandlers.delete(id);
          reject(new Error('Request timeout'));
        }
      }, 30000);
    });
  }

  async loadGraph(graphData: string): Promise<NodeInterop[]> {
    const response = await this.sendMessageWithResponse<{ nodes: NodeInterop[] }>(
      { type: 'loadGraph', payload: { graphData } },
      'graphLoaded',
    );
    return response.nodes;
  }

  async evaluate(): Promise<
    Array<{
      id: GeometryIdentifier;
      interop: MeshInterop | null;
      transform: GeometryIdentifier['transform'];
    }>
  > {
    const response = await this.sendMessageWithResponse<{
      geometries: Array<{
        id: GeometryIdentifier;
        interop: MeshInterop | null;
        transform: GeometryIdentifier['transform'];
      }>;
    }>({ type: 'evaluate', payload: {} }, 'evaluated');
    return response.geometries;
  }

  async updateNodeProperties(
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
  }> {
    const response = await this.sendMessageWithResponse<{
      geometries: Array<{
        id: GeometryIdentifier;
        interop: MeshInterop | null;
        transform: GeometryIdentifier['transform'];
      }>;
      nodes: NodeInterop[];
    }>({ type: 'updateNodeProperties', payload: properties }, 'nodeUpdated');
    return response;
  }

  async getNodes(): Promise<NodeInterop[]> {
    const response = await this.sendMessageWithResponse<{ nodes: NodeInterop[] }>(
      { type: 'getNodes', payload: {} },
      'nodes',
    );
    return response.nodes;
  }
}

// シングルトンインスタンス
let clientInstance: ModularWorkerClientImpl | null = null;

export function getModularWorkerClient(): ModularWorkerClientImpl {
  if (!clientInstance) {
    clientInstance = new ModularWorkerClientImpl();
  }
  return clientInstance;
}