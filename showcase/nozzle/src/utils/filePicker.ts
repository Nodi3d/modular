// filepath: /Users/shintaro/dev/bento3d-next/src/utils/filePicker.ts
/**
 * ファイルの保存ダイアログを表示する関数
 * File System Access APIがサポートされていない場合（Safari等）は、
 * 代替手段としてダウンロードリンクを使用
 */

// ファイルの保存用オプションの型定義
interface SaveFileOptions {
  suggestedName?: string;
  types?: {
    description: string;
    accept: Record<string, string[]>;
  }[];
  generator: () => Promise<ArrayBuffer | DataView | Blob | string | null>;
}

async function showSaveFilePicker(props: SaveFileOptions): Promise<void> {
  const { suggestedName, types, generator } = props;
  
  try {
    // 1. File System Access APIがサポートされているかチェック
    if ('showSaveFilePicker' in window) {
      // Modern browsers with File System Access API (Chrome, Edge)
      
      // TypeScriptの型チェックを回避するために型アサーションを使用
      const windowWithFilePicker = window as unknown as {
        showSaveFilePicker: (options: {
          suggestedName?: string;
          types?: { 
            description: string;
            accept: Record<string, string[]>;
          }[];
        }) => Promise<{
          createWritable: () => Promise<{
            write: (data: unknown) => Promise<void>;
            close: () => Promise<void>;
          }>;
        }>;
      };
      
      // ファイル保存ダイアログを表示
      const fileHandle = await windowWithFilePicker.showSaveFilePicker({
        suggestedName,
        types,
      });

      // ファイルの内容を生成
      const fileContent = await generator();
      
      // 書き込み可能なストリームを作成
      const writable = await fileHandle.createWritable();
      
      // データを書き込み
      await writable.write(fileContent);
      
      // ストリームを閉じる
      await writable.close();
      
      return;
    }
    
    // 2. File System Access APIがサポートされていない場合（Safari等）
    const fileContent = await generator();
    let blob: Blob;
    
    if (fileContent instanceof Blob) {
      blob = fileContent;
    } else if (fileContent instanceof ArrayBuffer || fileContent instanceof DataView) {
      blob = new Blob([fileContent]);
    } else if (typeof fileContent === 'string') {
      blob = new Blob([fileContent]);
    } else if (fileContent === null) {
      throw new Error('無効なファイル内容です');
    } else {
      throw new Error('サポートされていないデータ型です');
    }
    
    // ダウンロードリンクを作成
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = suggestedName || 'download';
    link.style.display = 'none';
    document.body.appendChild(link);
    
    // クリック処理でダウンロード
    link.click();
    
    // クリーンアップ処理
    setTimeout(() => {
      URL.revokeObjectURL(url);
      document.body.removeChild(link);
    }, 100);
  } catch (error) {
    console.error('ファイルの保存に失敗しました:', error);
    throw error;
  }
}

export { showSaveFilePicker };
