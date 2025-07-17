import { useEffect, useRef, useState } from 'react';
import { Group, Object3D, Vector3 } from 'three';
import { useFrame } from '@react-three/fiber';
import URDFLoader from 'urdf-loader';
import { useRobotAnimationStore } from '../stores/useRobotAnimationStore';
// @ts-ignore
import { IKSolver, IKChain, IKHelper } from '../utils/ik';

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
          // 'kuka': '/kuka'
          'kuka': '/kuka_lwr'
        };
        
        // URDFファイルを読み込み
        // const urdfPath = '/kuka/urdf/unnamed.urdf';
        const urdfPath = '/kuka_lwr/urdf/kuka_lwr.URDF';
        
        
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
        // robotModel.position.set(0, 0, 0);
        // robotModel.scale.set(10, 10, 10);
        
        // ロボット用のグループを作成（参考実装に合わせる）
        const robotGroup = new Group();
        robotGroup.add(robotModel);
        
        // Y軸が上向きになるよう調整（参考実装と同じ）
        robotGroup.rotateZ(-Math.PI/2);
        robotGroup.scale.set(5, 5, 5); // スケールを調整
        robotGroup.position.set(0, 1, 0);
        
        setRobot(robotGroup);
        setIsLoaded(true);
        console.log('Robot loaded and configured with group');
        
        // ターゲットマーカーを作成
        const target = new Object3D();
        setTargetMarker(target);
        
        // IKChainを作成（参考実装に合わせて親Groupを分離）
        const chain = new IKChain();
        chain.createFromURDFRobot(robotModel, robotGroup);
        
        // IKChainの詳細構造をデバッグ出力
        console.log('=== IKChain Debug Info ===');
        console.log('Chain length:', chain.ikJoints.length);
        console.log('Chain joints:', chain.ikJoints.map((j: any) => ({
          name: j.name,
          position: j.position,
          rotation: j.rotation,
          isFixed: j.isFixed,
          isHinge: j.isHinge
        })));
        console.log('End effector:', chain.endEffector);
        console.log('Root joint:', chain.rootJoint);
        
        // URDFロボットの構造を調査
        console.log('=== URDF Robot Structure ===');
        console.log('Robot model:', robotModel);
        console.log('Robot children:', robotModel.children);
        
        // End effector linkを探す
        const findEndEffectorLink = (obj: any, path = ''): any => {
          if (obj.name && obj.name.includes('end_effector')) {
            console.log('Found end effector link:', obj.name, 'at path:', path);
            return obj;
          }
          for (const child of obj.children || []) {
            const result = findEndEffectorLink(child, path + '/' + (child.name || 'unnamed'));
            if (result) return result;
          }
          return null;
        };
        
        const endEffectorLink = findEndEffectorLink(robotModel);
        console.log('End effector link found:', endEffectorLink);
        
        // URDFモデル全体の構造を調査
        const logURDFStructure = (obj: any, depth = 0) => {
          const indent = '  '.repeat(depth);
          console.log(`${indent}${obj.name || 'unnamed'} (${obj.constructor.name})`);
          if (obj.isURDFJoint) {
            console.log(`${indent}  - Joint ID: ${obj.id}`);
            console.log(`${indent}  - Joint Type: ${obj.jointType}`);
          }
          if (obj.isURDFLink) {
            console.log(`${indent}  - Link ID: ${obj.id}`);
          }
          for (const child of obj.children || []) {
            logURDFStructure(child, depth + 1);
          }
        };
        
        console.log('=== Full URDF Structure ===');
        logURDFStructure(robotModel);
        
        // ロボットモデルの子要素を調査
        console.log('=== Robot Model Children ===');
        console.log('Robot model children count:', robotModel.children.length);
        robotModel.children.forEach((child: any, index: number) => {
          console.log(`Child ${index}:`, child.name, child.constructor.name);
        });
        
        // IKソルバーを初期化
        const solver = new IKSolver({
          tolerance: 0.01,
          maxNumOfIterations: 20,
          shouldUpdateURDFRobot: true
        });
        
        solver.ikChain = chain;
        solver.target = target;

        // IKChainの視覚化を設定
        const ikHelper = new IKHelper(chain, {
          linkWidth: 0.04,      // リンクの太さ
          jointRadius: 0.06,    // ジョイントの半径
          jointHeight: 0.02,    // ジョイントの高さ
          linkColor: 0x00ff00,  // 緑色で視覚化
          JointColor: 0x0000ff  // 青色でジョイントを視覚化
        });
        ikHelper.visualizeIKChain();
        
        // ターゲット位置をend effectorの現在位置に初期化（参考実装と同じ）
        const endEffectorWorldPos = new Vector3();
        chain.endEffector.getWorldPosition(endEffectorWorldPos);
        target.position.copy(endEffectorWorldPos);
        console.log('Target initialized to end effector position:', endEffectorWorldPos);
        
        // 注意: rootJointは明示的に追加しない（robotGroup内に含まれるため）
        
        // IKChainの各ジョイントの位置をデバッグ出力
        console.log('=== IKChain Joint Positions ===');
        chain.ikJoints.forEach((joint: any, index: number) => {
          const worldPos = new Vector3();
          joint.getWorldPosition(worldPos);
          console.log(`Joint ${index} (${joint.name || 'unnamed'}):`, worldPos);
        });
        
        setIkSolver(solver);
        console.log('IK Solver initialized successfully');
        console.log('Target position:', target.position);
        
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
      //ただし、y座標 -> currentPositionのZを採用
      // z座標 -> currentPositionのYを採用としたい
      targetMarker.position.copy(currentPosition);
      targetMarker.position.z = -currentPosition.y;
      targetMarker.position.y = currentPosition.z;

      // ターゲット位置の座標系を確認・調整
      if (Math.random() < 0.01) {
        console.log('=== Target Position Debug ===');
        console.log('Current position (store):', currentPosition);
        console.log('Target marker position:', targetMarker.position);
        console.log('Robot position:', robot.position);
        console.log('Robot scale:', robot.scale);
      }
      
      // IKChainの視覚要素を手動更新
      if (ikSolver.ikChain) {
        ikSolver.ikChain.ikJoints.forEach((joint: any) => {
          joint.updateMatrixWorld(true);
        });
      }
      
      // IKソルバーでcurrentPositionから関節角度を計算
      try {
        const solveResult = ikSolver.solve();
        
        // 実際のend effector位置を計算
        if (ikSolver.ikChain && ikSolver.ikChain.endEffector) {
          const endEffector = ikSolver.ikChain.endEffector;
          const worldPos = new Vector3();
          endEffector.getWorldPosition(worldPos);
          
          
          
          
          
          // 実際のURDFモデルからend effector位置を取得
          const findURDFEndEffector = (obj: any): any => {
            if (obj.name && obj.name.includes('end_effector_link')) {
              return obj;
            }
            for (const child of obj.children || []) {
              const result = findURDFEndEffector(child);
              if (result) return result;
            }
            return null;
          };
          
          
          
          // デバッグ情報を定期的に更新
          if (Math.random() < 0.02) { // 2%の確率で出力
            const debugData = {
              targetPosition: currentPosition,
              endEffectorWorldPos: worldPos,
              solveResult: solveResult,
              jointAngles: ikSolver.ikChain.ikJoints.map((j: any) => {
                const jointWorldPos = new Vector3();
                j.getWorldPosition(jointWorldPos);
                return {
                  name: j.name,
                  angle: j.angle || 0,
                  localPosition: j.position,
                  worldPosition: jointWorldPos,
                  parentName: j.parent?.name || 'no parent'
                };
              }),
              distance: worldPos.distanceTo(new Vector3(currentPosition.x, currentPosition.y, currentPosition.z))
            };
            
            console.log('=== IK Solver Debug ===');
            console.log('Target:', currentPosition);
            console.log('IK Chain end effector pos:', worldPos);
            
            console.log('Distance from target:', debugData.distance);
            console.log('Joint details:', debugData.jointAngles);
            
            // IKChainとURDFモデルの関連性を確認
            console.log('=== IKChain vs URDF Sync Check ===');
            console.log('IKChain root joint parent:', ikSolver.ikChain.rootJoint.parent?.name);
            console.log('Robot model children:', robot.children.map((c: any) => c.name));
          }
        }
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
      
      {/* Current position marker (target) */}
      <mesh position={currentPosition}>
        <sphereGeometry args={[0.1, 16, 16]} />
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