import { useRef } from 'react';
import { Vector3 } from 'three';
import { useFrame } from '@react-three/fiber';

interface RobotPositionControllerProps {
  targetPosition: Vector3;
  isAnimating: boolean;
  onPositionUpdate: (position: Vector3) => void;
}

export function RobotPositionController({ 
  targetPosition, 
  isAnimating, 
  onPositionUpdate 
}: RobotPositionControllerProps) {
  const currentPosRef = useRef<Vector3>(new Vector3(0, 0, 0));
  
  useFrame((_, delta) => {
    if (isAnimating && targetPosition) {
      const currentPos = currentPosRef.current;
      const lerpFactor = delta * 5; // Same as KukaArm
      
      // Calculate new position with lerp
      const distance = currentPos.distanceTo(targetPosition);
      
      if (distance > 0.1) {
        currentPos.lerp(targetPosition, lerpFactor);
      } else {
        currentPos.copy(targetPosition);
      }
      
      // Update parent component
      onPositionUpdate(currentPos.clone());
    }
  });
  
  return null; // This component doesn't render anything
}