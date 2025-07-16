import { create } from 'zustand';
import { Vector3 } from 'three';
import { useModularStore } from './useModularStore';

interface RobotAnimationStore {
  // Animation state
  isAnimating: boolean;
  animationProgress: number;
  animationSpeed: number;
  currentMoveIndex: number;
  animationFrameId: number | null;
  
  // Robot state  
  currentPosition: Vector3;
  allPositions: Vector3[];
  progressiveCurvePoints: [number, number, number][];
  
  // Actions
  setAllPositions: (positions: Vector3[]) => void;
  startAnimation: () => void;
  pauseAnimation: () => void;
  resetAnimation: () => void;
  setAnimationSpeed: (speed: number) => void;
  setAnimationProgress: (progress: number) => void;
  setCurrentMoveIndex: (index: number) => void;
  updateProgress: () => void;
  updateAnimationState: (deltaTime: number) => void;
  stopAnimationFrame: () => void;
}

export const useRobotAnimationStore = create<RobotAnimationStore>((set, get) => ({
  // Initial state
  isAnimating: false,
  animationProgress: 0,
  animationSpeed: 1.0,
  currentMoveIndex: 0,
  animationFrameId: null,
  currentPosition: new Vector3(0, 0, 0),
  allPositions: [],
  progressiveCurvePoints: [],
  
  // Actions
  setAllPositions: (positions) => set({ allPositions: positions }),
  
  startAnimation: () => {
    const { gcodeData } = useModularStore.getState();
    if (gcodeData) {
      set({ isAnimating: true });
      get().updateProgress();
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
    const { gcodeData } = useModularStore.getState();
    if (gcodeData) {
      const progress = index / (gcodeData.totalMoves - 1);
      set({ currentMoveIndex: index, animationProgress: progress });
    } else {
      set({ currentMoveIndex: index });
    }
  },
  
  
  updateProgress: () => {
    const animate = () => {
      const state = get();
      const { animationSpeed, animationProgress, isAnimating } = state;
      const { gcodeData } = useModularStore.getState();
      
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
  
  updateAnimationState: (deltaTime) => {
    const state = get();
    const { allPositions, animationProgress, currentPosition } = state;
    
    if (!allPositions.length) return;
    
    // Calculate target position
    const totalPoints = allPositions.length;
    const currentIndex = Math.floor(animationProgress * (totalPoints - 1));
    const nextIndex = Math.min(currentIndex + 1, totalPoints - 1);
    const localProgress = (animationProgress * (totalPoints - 1)) - currentIndex;
    
    let targetPosition = currentPosition;
    if (currentIndex < totalPoints - 1) {
      const currentPoint = allPositions[currentIndex];
      const nextPoint = allPositions[nextIndex];
      targetPosition = currentPoint.clone().lerp(nextPoint, localProgress);
    }
    
    // Update position with smooth interpolation
    const distance = currentPosition.distanceTo(targetPosition);
    const lerpFactor = 8;
    
    if (distance < 0.1) {
      currentPosition.copy(targetPosition);
    } else {
      const factor = deltaTime * lerpFactor;
      currentPosition.lerp(targetPosition, factor);
    }
    
    // Update progressive curve points
    const progressiveCurvePoints: [number, number, number][] = [];
    if (state.isAnimating && allPositions.length > 1) {
      // Use animation progress directly to ensure all points are included
      const progressIndex = Math.floor(animationProgress * (totalPoints - 1));
      
      // Add all points up to the current progress
      for (let i = 0; i <= progressIndex; i++) {
        const pos = allPositions[i];
        progressiveCurvePoints.push([pos.x, pos.y, pos.z]);
      }
      
      // Add interpolated position between current and next point
      if (progressIndex < totalPoints - 1) {
        progressiveCurvePoints.push([targetPosition.x, targetPosition.y, targetPosition.z]);
      }
      
      // Add current robot position as the last point for smooth trailing
      if (currentPosition.distanceTo(targetPosition) > 0.1) {
        progressiveCurvePoints.push([currentPosition.x, currentPosition.y, currentPosition.z]);
      }
    }
    
    set({ 
      currentPosition: currentPosition.clone(),
      progressiveCurvePoints 
    });
  },
  
  stopAnimationFrame: () => {
    const { animationFrameId } = get();
    if (animationFrameId !== null) {
      cancelAnimationFrame(animationFrameId);
      set({ animationFrameId: null });
    }
  },
}));