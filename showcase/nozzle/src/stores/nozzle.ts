import { create } from 'zustand';


export type Material = "bronze"|"high-wear-steel";

interface NozzleStore {
  // 状態
  material:Material,
  length:number,
  outerSize:number,
  tipInnerSize:number,
  tipOuterSize:number,
  needleLength:number,
  updateNozzle: (params: { material?: Material, length?: number, outerSize?: number, tipInnerSize?: number, tipOuterSize?: number, needleLength?: number }) => void;
  
}






// Zustand ストアを作成
export const useNozzleStore = create<NozzleStore>((set) => ({
  // 初期状態
  material:'bronze',
  length:12.5,
  outerSize:8,
  tipInnerSize:0.2,
  tipOuterSize:0.5,
  needleLength:0.0,
  updateNozzle: (params) => set(params),
}));