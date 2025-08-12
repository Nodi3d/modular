/// <reference lib="webworker" />
import { Modular } from 'nodi-modular';
import init from 'nodi-modular';
import type { ModularWorkerMessage, ModularWorkerResponse } from './types';

// SharedWorkerContextのグローバル変数
const workerSelf = self as unknown as SharedWorkerGlobalScope;

let modular: Modular | null = null;
let initialized = false;
const ports: MessagePort[] = [];

// 初期化処理
async function initializeModular() {
  if (!initialized) {
    await init();
    modular = Modular.new();
    modular.updateTessellationOptions({
      enabled: true,
      normTolerance: 0.01,
      minDivsU: 1,
      minDivsV: 1,
      minDepth: 1,
      maxDepth: 3,
    });
    initialized = true;
  }
}

// メッセージハンドラー
async function handleMessage(event: MessageEvent<ModularWorkerMessage>, port: MessagePort) {
  const { type, payload } = event.data;

  try {
    switch (type) {
      case 'init': {
        await initializeModular();
        port.postMessage({
          type: 'initialized',
          payload: { success: true },
        } as ModularWorkerResponse);
        break;
      }

      case 'loadGraph': {
        console.log('loadGraph in worker');
        if (!modular) {
          throw new Error('Modular not initialized');
        }
        const { graphData } = payload;
        modular.loadGraph(graphData);
        const nodes = modular.getNodes();

        port.postMessage({
          type: 'graphLoaded',
          payload: { nodes },
        } as ModularWorkerResponse);
        break;
      }

      case 'evaluate': {
        console.log('evaluate in worker');
        if (!modular) {
          throw new Error('Modular not initialized');
        }

        const result = await modular.evaluate();
        const { geometryIdentifiers } = result;

        // ジオメトリデータを収集
        const geometries =
          geometryIdentifiers?.map((id) => {
            const interop = modular!.findGeometryInteropById(id);
            return {
              id,
              interop,
              transform: id.transform,
            };
          }) || [];

        port.postMessage({
          type: 'evaluated',
          payload: { geometries },
        } as ModularWorkerResponse);
        break;
      }

      case 'updateNodeProperty': {
        console.log('updateNodeProperty in worker');
        if (!modular) {
          throw new Error('Modular not initialized');
        }

        const { nodeId, property } = payload;
        modular.changeNodeProperty(nodeId, property);

        // 更新されたノード情報を取得
        const nodes = modular.getNodes();

        // 自動的に評価を実行
        const result = await modular.evaluate();
        const { geometryIdentifiers } = result;

        const geometries =
          geometryIdentifiers?.map((id) => {
            const interop = modular!.findGeometryInteropById(id);
            return {
              id,
              interop,
              transform: id.transform,
            };
          }) || [];

        port.postMessage({
          type: 'nodeUpdated',
          payload: { geometries, nodes },
        } as ModularWorkerResponse);
        break;
      }

      case 'getNodes': {
        console.log('getNodes in worker');
        if (!modular) {
          throw new Error('Modular not initialized');
        }

        const nodes = modular.getNodes();
        port.postMessage({
          type: 'nodes',
          payload: { nodes },
        } as ModularWorkerResponse);
        break;
      }

      default:
        throw new Error(`Unknown message type: ${type}`);
    }
  } catch (error) {
    port.postMessage({
      type: 'error',
      payload: {
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      },
    } as ModularWorkerResponse);
  }
}

// SharedWorker接続ハンドラー
workerSelf.onconnect = (event: MessageEvent) => {
  const port = event.ports[0];
  ports.push(port);

  port.onmessage = (e: MessageEvent<ModularWorkerMessage>) => {
    handleMessage(e, port);
  };

  // ポートが閉じられたら削除
  port.onmessageerror = () => {
    const index = ports.indexOf(port);
    if (index > -1) {
      ports.splice(index, 1);
    }
  };

  // 接続を確認
  port.postMessage({
    type: 'connected',
    payload: { initialized },
  } as ModularWorkerResponse);
};