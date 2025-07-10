import { useRef, useEffect } from 'react';
import { Group, Vector3 } from 'three';
import { useFrame } from '@react-three/fiber';
import { Box } from '@react-three/drei';

interface KukaArmProps {
  targetPosition?: Vector3;
  isAnimating?: boolean;
}

export function KukaArm({ targetPosition, isAnimating = false }: KukaArmProps) {
  const armRef = useRef<Group>(null);
  const endEffectorRef = useRef<Group>(null);

  // For now, create a simple placeholder robot arm structure
  // This will be replaced with the actual KUKA GLTF model
  
  useFrame((state, delta) => {
    if (isAnimating && targetPosition && endEffectorRef.current) {
      // Simple linear interpolation to target position
      const currentPos = endEffectorRef.current.position;
      const lerpFactor = delta * 2; // Adjust animation speed
      
      // Debug: Log positions before interpolation (only log occasionally to reduce noise)
      if (Math.random() < 0.05) { // Log 5% of frames
        const worldPos = new Vector3();
        endEffectorRef.current.getWorldPosition(worldPos);
        console.log('[KukaArm Debug]');
        console.log('  End Effector World Position:', worldPos);
        console.log('  Target Position (local):', targetPosition);
        console.log('  Current Local Position:', currentPos.clone());
        console.log('  Distance to target:', currentPos.distanceTo(targetPosition));
      }
      
      currentPos.lerp(targetPosition, lerpFactor);
    }
  });

  return (
    <group ref={armRef} position={[-5, 0, 0]} >
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