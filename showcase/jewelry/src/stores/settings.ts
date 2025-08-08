// import { create } from 'zustand';

// export interface PropertyHoverState {
//   length: boolean;
//   outerSize: boolean;
//   tipInnerSize: boolean;
//   tipOuterSize: boolean;
//   needleLength: boolean;
// }

// interface SettingsState {
//   isGAInitialized: boolean;
//   setIsGAInitialized: (isGAInitialized: boolean) => void;
//   propertyHover: PropertyHoverState;
//   setPropertyHover: (propertyHover: PropertyHoverState) => void;
//   isRulerOn: boolean;
//   setIsRulerOn: (isRulerOn: boolean) => void;
// }

// export const useSettingsStore = create<SettingsState>()((set) => ({
//   isGAInitialized: false,
//   setIsGAInitialized: (isGAInitialized: boolean) => set({ isGAInitialized }),
//   propertyHover: {
//     length: false,
//     outerSize: false,
//     tipInnerSize: false,
//     tipOuterSize: false,
//     needleLength: false,
//   },
//   setPropertyHover: (propertyHover: PropertyHoverState) => set({ propertyHover }),
//   isRulerOn: true,
//   setIsRulerOn: (isRulerOn: boolean) => set({ isRulerOn }),
// }));