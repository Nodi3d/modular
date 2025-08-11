import { create } from 'zustand'
import sizesData from '../assets/jsons/size.json'

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
  thicknessBottom: number
  thicknessTop: number
  twist: number
  polygon: number
}

export type Size = {
  value: number
  locale: string
  label: string
}

interface RingStore {
  material: Material
  size: Size
  braidParameters: BraidParameters
  bypassParameters: BypassParameters
  twistParameters: TwistParameters
  setMaterial: (material: Material) => void
  setBraidParameters: (params: BraidParameters) => void
  setBypassParameters: (params: BypassParameters) => void
  setTwistParameters: (params: TwistParameters) => void
  setSize: (value: number, locale: string) => void
}

// Zustand ストアを作成
export const useRingStore = create<RingStore>(set => ({
  //   // 初期状態
  material: 'gold',

  size: {
    value: 15.6,
    locale: 'jp',
    label: '9号',
  },
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
    thicknessBottom: 1.69,
    thicknessTop: 2.58,
    twist: 1,
    polygon: 9,
  },
  setMaterial: material => set({ material }),
  setBraidParameters: params => set({ braidParameters: params }),
  setBypassParameters: params => set({ bypassParameters: params }),
  setTwistParameters: params => set({ twistParameters: params }),
  setSize: (value: number, locale: string) => {
    console.log('setSize called')
    set({
      size: {
        value,
        locale,
        label: sizesData.sizes.find(s => s.value === value)?.[locale as 'jp' | 'us' | 'eu'] || '',
      },
    })
  },
}))
