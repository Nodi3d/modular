import { create } from 'zustand'

export type Material = 'gold' | 'silver' | 'platinum'

export type BraidParameters = {
  innerDiameter: number
  waveCount: number
  waveSize: number
  width: number
  thickness: number
  ringCount: number
}

export type BypassParameters = {
  innerDiameter: number
  startWidth: number
  endWidth: number
  length: number
  gap: number
  thickness: number
}

export type TwistParameters = {
  innerDiameter: number
  ticknessBottom: number
  ticknessTop: number
  twist: number
  polygon: number
}

interface RingStore {
  material: Material
  sizeLabel: string
  size: number
  braidParameters: BraidParameters
  bypassParameters: BypassParameters
  twistParameters: TwistParameters
  setMaterial: (material: Material) => void
  setBraidParameters: (params: BraidParameters) => void
  setBypassParameters: (params: BypassParameters) => void
  setTwistParameters: (params: TwistParameters) => void
}

// Zustand ストアを作成
export const useRingStore = create<RingStore>(set => ({
  //   // 初期状態
  material: 'gold',
  sizeLabel: '6号',
  size: 14.7,
  braidParameters: {
    innerDiameter: 8,
    waveCount: 4,
    waveSize: 1.3,
    width: 1.2,
    thickness: 0.8,
    ringCount: 2,
  },
  bypassParameters: {
    innerDiameter: 8,
    thickness: 0.8,
    startWidth: 2,
    endWidth: 6,
    length: 2.3,
    gap: 0.5,
  },
  twistParameters: {
    innerDiameter: 8,
    ticknessBottom: 1.69,
    ticknessTop: 2.58,
    twist: 1,
    polygon: 9,
  },
  setMaterial: material => set({ material }),
  setBraidParameters: params => set({ braidParameters: params }),
  setBypassParameters: params => set({ bypassParameters: params }),
  setTwistParameters: params => set({ twistParameters: params }),
}))
