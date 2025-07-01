import { create } from 'zustand';

interface DialogState {
  isOpen: boolean;
  type: '' | 'setting' | 'feedback' | 'ad';
}
interface DrawerState {
  isOpen: boolean;
  type: '' | 'update';
}

export interface Toast  {
  isOpen: boolean;
  content: string;
  type: "default" | "error" | "warn";
  persistent?: boolean;
};
export interface FillamentState {
  series:string;
  color:Color;
}
export interface PropertyHoverState {
  length:boolean;
  outerSize:boolean;
  tipInnerSize:boolean;
  tipOuterSize:boolean;
  needleLength:boolean;
}
export interface Color {
  name:string;
  sampleImage:string;
  hex:string;
  threeHEX:string;
  metalness:number;
  roughness:number;
  url:string;
  ogImage:string;
}



interface SettingsState {
  unit: number;
  setUnit: (unit: number) => void;
  isInputFocused: boolean;
  setIsInputFocused: (isInputFocus: boolean) => void;
  isIgnoreKey: boolean;
  setIsIgnoreKey: (isIgnoreKey: boolean) => void;
  cameraMode: 'top'|'front'|'side'|'perspective';
  setCameraMode: (cameraMode: 'top'|'front'|'side'|'perspective') => void;
  gridSize: number;
  setGridSize: (gridSize: number) => void;
  dialog: DialogState;
  openDialog: (type: DialogState['type']) => void;
  closeDialog: () => void;
  isGAInitialized: boolean;
  setIsGAInitialized: (isGAInitialized: boolean) => void;
  toast: Toast[];
  setToast: (toast: Toast[]) => void;
  drawer: DrawerState;
  openDrawer: (type: DrawerState['type']) => void;
  closeDrawer: () => void;
  isSettingsOpen: boolean;
  setIsSettingsOpen: (isSettingsOpen: boolean) => void;
  isDragging: boolean;
  setIsDragging: (isDragging: boolean) => void;
  activeAxis: 'width' | 'depth' | 'height' | 'holeSize' | 'nozzleSize' | '';
  setActiveAxis: (activeAxis: 'width' | 'depth' | 'height' | 'holeSize' | 'nozzleSize' | '') => void;
  bom:number
  setBom: (bom: number) => void;
  isPreviewLoad: boolean;
  setIsPreviewLoad: (isPreviewLoad: boolean) => void;
  currentFillament:FillamentState;
  setFillament: (fillament:FillamentState) => void;
  propertyHover:PropertyHoverState;
  setPropertyHover: (propertyHover:PropertyHoverState) => void;
  isRulerOn:boolean;
  setIsRulerOn: (isRulerOn: boolean) => void;
}

export const useSettingsStore = create<SettingsState>()((set) => ({
  unit: 1, // デフォルト値
  setUnit: (unit: number) => set({ unit }),
  isInputFocused: false,
  setIsInputFocused: (isInputFocused: boolean) => set({ isInputFocused }),
  isIgnoreKey: false,
  setIsIgnoreKey: (isIgnoreKey: boolean) => set({ isIgnoreKey }),
  cameraMode: 'perspective',
  setCameraMode: (cameraMode: 'top'|'front'|'side'|'perspective') => set({ cameraMode }),
  gridSize: 10,
  setGridSize: (gridSize: number) => set({ gridSize }),
  dialog: { isOpen: false, type: '' },
  openDialog: (type: DialogState['type']) => set({ dialog: { isOpen: true, type } }),
  closeDialog: () => set({ dialog: { isOpen: false, type: '' } }),
  
  isGAInitialized: false,
  setIsGAInitialized: (isGAInitialized: boolean) => set({ isGAInitialized }),
  toast: [],
  setToast: (toast: Toast[]) => {
    set((state) => {
      const newToast = [...state.toast, ...toast];
      if (!toast[toast.length - 1].persistent) {
        setTimeout(() => {
          set((state) => ({
            toast: state.toast.filter((_, i) => i !== state.toast.length - 1),
          }));
        }, 5000);
      }
      return { toast: newToast };
    });
  },
  drawer:{isOpen:false, type:''},
  openDrawer: (type: DrawerState['type']) => set({ drawer: { isOpen: true, type } }),
  closeDrawer: () => set({ drawer: { isOpen: false, type: '' } }),
  isSettingsOpen: false,
  setIsSettingsOpen: (isSettingsOpen: boolean) => set({ isSettingsOpen }),
  isDragging: false,
  setIsDragging: (isDragging: boolean) => set({ isDragging }),
  activeAxis: '',
  setActiveAxis: (activeAxis: 'width' | 'depth' | 'height' | 'holeSize' | 'nozzleSize' | '') => set({ activeAxis }),
  bom: 0,
  setBom: (bom: number) => set({ bom }),
  isPreviewLoad: false,
  setIsPreviewLoad: (isPreviewLoad: boolean) => set({ isPreviewLoad }),
  currentFillament:{
    series:'Polymaker Panchroma',
    color:{
      name:'CottonWhite',
      sampleImage:'/images/samples/cotton-white.png',
      hex:'#DDE0DC',
      threeHEX:'#DDE0DC',
      metalness:0,
      roughness:0.5,
      url:'https://www.matterhackers.com/store/l/polymaker-panchroma-matte-pla-filament-175mm-1kg/sk/M1W5HVYP?aff=7670',
      ogImage:'/images/ogps/cotton-white.png'
    }
  },
  setFillament: (fillament:FillamentState) => set({ currentFillament:fillament }),
  propertyHover:{
    length:false,
    outerSize:false,
    tipInnerSize:false,
    tipOuterSize:false,
    needleLength:false,
  },
  setPropertyHover: (propertyHover:PropertyHoverState) => set({ propertyHover }),
  isRulerOn:true,
  setIsRulerOn: (isRulerOn: boolean) => set({ isRulerOn }),
}));

