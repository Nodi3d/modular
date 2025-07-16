import { useRef } from 'react';
import { Group } from 'three';
import { useFrame } from '@react-three/fiber';
import { Box, Line } from '@react-three/drei';
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
      {/* Placeholder robot arm structure */}
      {/* Base */}
      <Box position={[0, 0.5, 0]} args={[2, 1, 2]}>
        <meshStandardMaterial color="#2c3e50" />
      </Box>
      
      {/* Joint 1 - Base rotation */}
      <group position={[0, 1, 0]}>
        <Box position={[0, 0.5, 0]} args={[0.5, 1, 0.5]}>
          <meshStandardMaterial color="#34495e" />
        </Box>
        
        {/* Arm Link 1 */}
        <group position={[0, 1, 0]}>
          <Box position={[1, 0, 0]} args={[2, 0.3, 0.3]}>
            <meshStandardMaterial color="#e74c3c" />
          </Box>
          
          {/* Joint 2 */}
          <group position={[2, 0, 0]}>
            <Box position={[0, 0, 0]} args={[0.3, 0.5, 0.3]}>
              <meshStandardMaterial color="#34495e" />
            </Box>
            
            {/* Arm Link 2 */}
            <group position={[0, 0, 0]}>
              <Box position={[0.75, 0, 0]} args={[1.5, 0.25, 0.25]}>
                <meshStandardMaterial color="#f39c12" />
              </Box>
              
              {/* End Effector */}
              <group ref={endEffectorRef} position={[1.5, 0, 0]}>
                <Box position={[0.25, 0, 0]} args={[0.5, 0.2, 0.2]}>
                  <meshStandardMaterial color="#27ae60" />
                </Box>
                
                {/* 3D Print Nozzle */}
                <Box position={[0.5, -0.2, 0]} args={[0.1, 0.4, 0.1]}>
                  <meshStandardMaterial color="#e67e22" />
                </Box>
                
                {/* Current End Effector Position Marker */}
                <Box position={[0, 0, 0]} args={[2, 2, 2]}>
                  <meshStandardMaterial color="#ff0000" emissive="#ff0000" emissiveIntensity={0.5} />
                </Box>
              </group>
            </group>
          </group>
        </group>
      </group>
      
      {/* Debug: Large visibility marker */}
      <Box position={[0, 3, 0]} args={[1, 1, 1]}>
        <meshStandardMaterial color="#ff00ff" emissive="#ff00ff" emissiveIntensity={0.3} />
      </Box>
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