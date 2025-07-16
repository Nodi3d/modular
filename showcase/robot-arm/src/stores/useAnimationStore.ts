import { create } from 'zustand';
import { ParsedGcode } from '../utils/gcodeParser';

interface AnimationStore {
  // Animation state
  gcodeData: ParsedGcode | null;
  isAnimating: boolean;
  currentMoveIndex: number;
  animationSpeed: number;
  animationProgress: number;
  gcodeText: string;
  animationFrameId: number | null;
  
  // Actions
  setGcodeData: (data: ParsedGcode | null) => void;
  setGcodeText: (text: string) => void;
  startAnimation: () => void;
  pauseAnimation: () => void;
  resetAnimation: () => void;
  setAnimationSpeed: (speed: number) => void;
  setAnimationProgress: (progress: number) => void;
  setCurrentMoveIndex: (index: number) => void;
  toggleAnimation: () => void;
  updateProgress: () => void;
  stopAnimationFrame: () => void;
}

export const useAnimationStore = create<AnimationStore>((set, get) => ({
  // Initial state
  gcodeData: null,
  isAnimating: false,
  currentMoveIndex: 0,
  animationSpeed: 1.0,
  animationProgress: 0,
  gcodeText: '',
  animationFrameId: null,
  
  // Actions
  setGcodeData: (data) => set({ gcodeData: data }),
  setGcodeText: (text) => set({ gcodeText: text }),
  
  startAnimation: () => {
    const state = get();
    if (state.gcodeData) {
      set({ isAnimating: true });
      state.updateProgress();
    }
  },
  
  pauseAnimation: () => {
    const state = get();
    state.stopAnimationFrame();
    set({ isAnimating: false });
  },
  
  resetAnimation: () => {
    const state = get();
    state.stopAnimationFrame();
    set({ 
      isAnimating: false, 
      currentMoveIndex: 0, 
      animationProgress: 0 
    });
  },
  
  setAnimationSpeed: (speed) => set({ animationSpeed: speed }),
  setAnimationProgress: (progress) => set({ animationProgress: progress }),
  
  setCurrentMoveIndex: (index) => {
    const { gcodeData } = get();
    if (gcodeData) {
      const progress = index / (gcodeData.totalMoves - 1);
      set({ currentMoveIndex: index, animationProgress: progress });
    } else {
      set({ currentMoveIndex: index });
    }
  },
  
  toggleAnimation: () => {
    const { isAnimating } = get();
    if (isAnimating) {
      get().pauseAnimation();
    } else {
      get().startAnimation();
    }
  },
  
  updateProgress: () => {
    const animate = () => {
      const state = get();
      const { gcodeData, animationSpeed, animationProgress, isAnimating } = state;
      
      if (!isAnimating || !gcodeData) {
        return;
      }
      
      const totalMoves = gcodeData.totalMoves;
      const progressIncrement = animationSpeed / (totalMoves * 60); // 60fps assumed
      const newProgress = animationProgress + progressIncrement;
      
      if (newProgress >= 1) {
        set({ 
          animationProgress: 1,
          currentMoveIndex: totalMoves - 1,
          isAnimating: false,
          animationFrameId: null
        });
      } else {
        const newIndex = Math.floor(newProgress * (totalMoves - 1));
        set({ 
          animationProgress: newProgress,
          currentMoveIndex: newIndex
        });
        
        const frameId = requestAnimationFrame(animate);
        set({ animationFrameId: frameId });
      }
    };
    
    animate();
  },
  
  stopAnimationFrame: () => {
    const { animationFrameId } = get();
    if (animationFrameId !== null) {
      cancelAnimationFrame(animationFrameId);
      set({ animationFrameId: null });
    }
  },
}));