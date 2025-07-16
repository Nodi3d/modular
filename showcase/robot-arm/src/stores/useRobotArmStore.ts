import { create } from 'zustand';
import { Vector3 } from 'three';

interface RobotArmStore {
  // Robot state
  targetPosition: Vector3;
  currentPosition: Vector3;
  allPositions: Vector3[];
  
  // Actions
  setTargetPosition: (position: Vector3) => void;
  setCurrentPosition: (position: Vector3) => void;
  setAllPositions: (positions: Vector3[]) => void;
  updateCurrentPosition: (deltaTime: number, lerpFactor?: number) => void;
}

export const useRobotArmStore = create<RobotArmStore>((set, get) => ({
  // Initial state
  targetPosition: new Vector3(0, 0, 0),
  currentPosition: new Vector3(0, 0, 0),
  allPositions: [],
  
  // Actions
  setTargetPosition: (position) => set({ targetPosition: position }),
  setCurrentPosition: (position) => set({ currentPosition: position }),
  setAllPositions: (positions) => set({ allPositions: positions }),
  updateCurrentPosition: (deltaTime, lerpFactor = 5) => {
    const { currentPosition, targetPosition } = get();
    const distance = currentPosition.distanceTo(targetPosition);
    
    if (distance < 0.1) {
      currentPosition.copy(targetPosition);
    } else {
      const factor = deltaTime * lerpFactor;
      currentPosition.lerp(targetPosition, factor);
    }
    
    set({ currentPosition: currentPosition.clone() });
  },
}));