import { useEffect, useRef, useState } from 'react';
import { Group, Object3D } from 'three';
import { useFrame } from '@react-three/fiber';
import URDFLoader from 'urdf-loader';
import { useRobotAnimationStore } from '../stores/useRobotAnimationStore';
// @ts-ignore
import { IKSolver, IKChain } from '../utils/ik';

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
        const loader = new URDFLoader();
        
        // パッケージのパスを設定
        loader.packages = {
          'kuka': '/kuka'
        };
        
        // URDFファイルを読み込み
        const urdfPath = '/kuka/urdf/unnamed.urdf';
        console.log('Loading URDF from:', urdfPath);
        
        const robotModel = await new Promise<Object3D>((resolve, reject) => {
          loader.load(
            urdfPath,
            (robot: any) => {
              console.log('URDF loaded successfully:', robot);
              resolve(robot);
            },
            (progress: any) => {
              console.log('Loading progress:', progress);
            },
            (error: any) => {
              console.error('URDF loading error:', error);
              reject(error);
            }
          );
        });
        
        // ロボットモデルの設定
        robotModel.position.set(0, 0, 0);
        robotModel.scale.set(1, 1, 1);
        
        setRobot(robotModel);
        setIsLoaded(true);
        console.log('Robot loaded and configured');
        
        // ターゲットマーカーを作成
        const target = new Object3D();
        target.position.copy(currentPosition);
        setTargetMarker(target);
        
        // IKChainを作成
        const chain = new IKChain();
        chain.createFromURDFRobot(robotModel, robotModel);
        
        // IKソルバーを初期化
        const solver = new IKSolver({
          tolerance: 0.01,
          maxNumOfIterations: 20,
          shouldUpdateURDFRobot: true
        });
        
        solver.ikChain = chain;
        solver.target = target;
        
        setIkSolver(solver);
        console.log('IK Solver initialized successfully');
        
      } catch (err) {
        console.error('Failed to load URDF:', err);
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
      
      // ターゲット位置を更新
      targetMarker.position.copy(currentPosition);
      
      // IKソルバーでcurrentPositionから関節角度を計算
      try {
        ikSolver.solve();
      } catch (error) {
        console.error('IK solver error:', error);
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
      
      {/* URDFロボットモデル */}
      {robot && <primitive object={robot} />}
      
      {/* Current position marker */}
      <mesh position={currentPosition}>
        <sphereGeometry args={[2, 16, 16]} />
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