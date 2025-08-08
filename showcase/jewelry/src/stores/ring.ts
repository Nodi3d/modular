import { create } from 'zustand';


export type Material = "bronze"|"high-wear-steel";

interface RingStore {
  material:Material,
  sizeLabel:string,
  size:number,
}






// Zustand ストアを作成
export const useRingStore = create<RingStore>((set) => ({
//   // 初期状態
  material:'bronze',
  sizeLabel:'6号',
  size:14.7,
}));