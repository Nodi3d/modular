import { useEffect, useRef, useState } from 'react';
import { Group, Object3D, Vector3 } from 'three';
import { useFrame } from '@react-three/fiber';
import URDFLoader from 'urdf-loader';
import { useRobotAnimationStore } from '../stores/useRobotAnimationStore';
// @ts-ignore
import { IKSolver, IKChain, IKHelper } from '../utils/ik';
// import { loadJointLimits, type JointLimitsMap } from '../utils/jointLimitsLoader';

interface URDFRobotArmProps {}

export function URDFRobotArm({}: URDFRobotArmProps) {
  const groupRef = useRef<Group>(null);
  const [robot, setRobot] = useState<Object3D | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ikSolver, setIkSolver] = useState<any>(null);
  const [targetMarker, setTargetMarker] = useState<Object3D | null>(null);

  const { 
    currentPosition,
    progressiveCurvePoints,
    isAnimating,
    updateAnimationState
  } = useRobotAnimationStore();

  useEffect(() => {
    const loadURDF = async () => {
      try {
        let limitsMap: any = null;
        try {
          const { loadJointLimits } = await import('../utils/jointLimitsLoader');
          limitsMap = await loadJointLimits('/kuka/joint_limits.yml');
        } catch (limitsError) {
        }

        const loader = new URDFLoader();
        
        loader.packages = {
          'kuka': '/kuka'
        };
        
        const urdfPath = '/kuka/urdf/unnamed.urdf';
        
        
        const robotModel = await new Promise<Object3D>((resolve, reject) => {
          loader.load(
            urdfPath,
            (robot: any) => {
              resolve(robot);
            },
            (progress: any) => {},
            (error: any) => {
              reject(error);
            }
          );
        });

        const robotGroup = new Group();
        robotGroup.add(robotModel);
        
        robotGroup.rotateZ(-Math.PI/2);
        robotGroup.scale.set(20, 20, 20);
        robotGroup.position.set(0, 800, -200);
        
        setRobot(robotGroup);
        setIsLoaded(true);
        
        const target = new Object3D();
        setTargetMarker(target);
        const chain = new IKChain();
        chain.createFromURDFRobot(robotModel, robotGroup, limitsMap);
        const solver = new IKSolver({
          tolerance: 0.01,
          maxNumOfIterations: 20,
          shouldUpdateURDFRobot: true
        });
        
        solver.ikChain = chain;
        solver.target = target;

        const ikHelper = new IKHelper(chain, {
          linkWidth: 0.1,
          jointRadius: 0.6,
          jointHeight: 0.2,
          linkColor: 0x00ff00,
          JointColor: 0x0000ff
        });
        ikHelper.visualizeIKChain();
        const endEffectorWorldPos = new Vector3();
        chain.endEffector.getWorldPosition(endEffectorWorldPos);
        target.position.copy(endEffectorWorldPos);
        setIkSolver(solver);

      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
      }
    };
    
    loadURDF();
  }, []);

  useFrame((_, delta) => {
    if (robot && ikSolver && targetMarker) {
      if (isAnimating) {
        updateAnimationState(delta);
      }
      targetMarker.position.copy(currentPosition);
      targetMarker.position.z = -currentPosition.y;
      targetMarker.position.y = currentPosition.z;

      if (ikSolver.ikChain) {
        ikSolver.ikChain.ikJoints.forEach((joint: any) => {
          joint.updateMatrixWorld(true);
        });
      }
      try {
        const solveResult = ikSolver.solve();
        if (ikSolver.ikChain && ikSolver.ikChain.endEffector) {
          const endEffector = ikSolver.ikChain.endEffector;
          const worldPos = new Vector3();
          endEffector.getWorldPosition(worldPos);
          
        }
      } catch (error) {
      }
    }
  });

  if (error) {
    return (
      <group>
        <mesh>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color="red" />
        </mesh>
        <mesh position={[0, 2, 0]}>
          <boxGeometry args={[0.1, 0.1, 0.1]} />
          <meshStandardMaterial color="white" />
        </mesh>
      </group>
    );
  }

  if (!isLoaded) {
    return (
      <group>
        <mesh>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color="yellow" />
        </mesh>
      </group>
    );
  }

  return (
    <group ref={groupRef}>
      {/* Progressive curve visualization */}
      {progressiveCurvePoints.length > 1 && (
        <line>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={progressiveCurvePoints.length}
              array={new Float32Array(progressiveCurvePoints.flat())}
              itemSize={3}
            />
          </bufferGeometry>
          <lineBasicMaterial color="#ff6b35" />
        </line>
      )}
      
      {robot && <primitive object={robot}/>}

      <mesh position={currentPosition}>
        <sphereGeometry args={[5, 16, 16]} />
        <meshStandardMaterial 
          color="#ff0000" 
          emissive="#ff0000" 
          emissiveIntensity={0.5}
          transparent
          opacity={0.6}
        />
      </mesh>
      
    </group>
  );
}