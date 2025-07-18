import { useRef } from 'react';
import { Group } from 'three';
import { useFrame } from '@react-three/fiber';
import {  Line } from '@react-three/drei';
import { useRobotAnimationStore } from '../stores/useRobotAnimationStore';

interface KukaArmProps {}

export function KukaArm({}: KukaArmProps) {
  const { 
    isAnimating,
    currentPosition,
    progressiveCurvePoints,
    updateAnimationState
  } = useRobotAnimationStore();
  
  const armRef = useRef<Group>(null);
  const endEffectorRef = useRef<Group>(null);

  useFrame((_, delta) => {
    if (isAnimating) {
      updateAnimationState(delta);
      endEffectorRef.current?.position.copy(currentPosition);
    }
  });
  

  return (
    <group ref={armRef}>
      {/* Progressive curve visualization */}
      {progressiveCurvePoints.length > 1 && (
        <Line
          points={progressiveCurvePoints}
          color="#ff6b35"
          lineWidth={2}
        />
      )}
      
    </group>
  );
}

// TODO: Replace with actual KUKA GLTF model loader
// import { useGLTF } from '@react-three/drei';
// 
// export function KukaArmGLTF({ targetPosition, isAnimating = false }: KukaArmProps) {
//   const { scene } = useGLTF('/models/kuka-kr16.gltf');
//   
//   return (
//     <primitive 
//       object={scene.clone()} 
//       position={[0, 0, 0]}
//       scale={[1, 1, 1]}
//     />
//   );
// }