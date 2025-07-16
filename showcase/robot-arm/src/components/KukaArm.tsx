import { useRef, useEffect, useState } from 'react';
import { Group, Vector3 } from 'three';
import { useFrame } from '@react-three/fiber';
import { Line } from '@react-three/drei';
import { URDFParser } from '../utils/urdfParser';
import { RobotBuilder, Robot } from '../utils/robotBuilder';
import { CCDIKSolver } from '../utils/ccdikSolver';

interface KukaArmProps {
  targetPosition?: Vector3;
  isAnimating?: boolean;
  allPositions?: Vector3[];
  animationProgress?: number; // 0-1 progress through entire path
}

export function KukaArm({ targetPosition, isAnimating = false, allPositions, animationProgress = 0 }: KukaArmProps) {
  const armRef = useRef<Group>(null);
  // endEffectorRef is managed internally by the robot model
  const [robot, setRobot] = useState<Robot | null>(null);
  const [ikSolver] = useState(() => new CCDIKSolver(10, 0.1));
  const [isRobotLoaded, setIsRobotLoaded] = useState(false);

  // Load KUKA robot from URDF
  useEffect(() => {
    const loadRobot = async () => {
      try {
        const response = await fetch('/kuka/urdf/unnamed.urdf');
        const urdfContent = await response.text();
        
        const robotDescription = URDFParser.parseURDF(urdfContent);
        const robotBuilder = new RobotBuilder();
        const builtRobot = await robotBuilder.buildRobot(robotDescription);
        
        setRobot(builtRobot);
        setIsRobotLoaded(true);
        
        // Add robot to scene
        if (armRef.current) {
          armRef.current.add(builtRobot.rootGroup);
        }
      } catch (error) {
        console.error('Failed to load KUKA robot:', error);
        // Show more detailed error information
        if (error instanceof Error) {
          console.error('Error details:', error.message);
          console.error('Stack trace:', error.stack);
        }
      }
    };

    loadRobot();
  }, []);
  
  // Robot end effector is managed internally by the robot model
  useEffect(() => {
    // Robot end effector is managed internally in the robot model
  }, [robot]);

  useFrame(() => {
    if (isAnimating && robot && isRobotLoaded) {
      let targetPos: Vector3 | null = null;
      
      if (allPositions && allPositions.length > 1) {
        // Calculate target position based on animation progress
        const totalPoints = allPositions.length;
        const currentIndex = Math.floor(animationProgress * (totalPoints - 1));
        const nextIndex = Math.min(currentIndex + 1, totalPoints - 1);
        const localProgress = (animationProgress * (totalPoints - 1)) - currentIndex;
        
        if (currentIndex < totalPoints - 1) {
          const currentPoint = allPositions[currentIndex];
          const nextPoint = allPositions[nextIndex];
          targetPos = currentPoint.clone().lerp(nextPoint, localProgress);
        } else {
          targetPos = allPositions[totalPoints - 1];
        }
      } else if (targetPosition) {
        targetPos = targetPosition;
      }
      
      // Use inverse kinematics to solve for target position
      if (targetPos) {
        ikSolver.solve(robot, targetPos);
      }
    }
  });
  
  // Render progressive curve when animating
  const renderProgressiveCurve = () => {
    if (isAnimating && allPositions && allPositions.length > 1 && robot && robot.endEffector) {
      const totalPoints = allPositions.length;
      
      // Get approximate progress to limit search range
      const approximateIndex = Math.floor(animationProgress * (totalPoints - 1));
      
      // Find the most advanced passed point within the progress range
      const findLastPassedPoint = (robotPos: Vector3, positions: Vector3[], maxIndex: number) => {
        const threshold = 5.0; // Distance threshold to consider a point as "passed"
        
        // Search backwards from maxIndex to find the most advanced passed point
        for (let i = Math.min(maxIndex, positions.length - 1); i >= 0; i--) {
          const distance = robotPos.distanceTo(positions[i]);
          if (distance < threshold) {
            return i; // Return the most advanced point that's within threshold
          }
        }
        
        // Fallback: return the approximate index if no points are within threshold
        return Math.max(0, Math.min(maxIndex, positions.length - 1));
      };
      
      const currentPos = new Vector3();
      robot.endEffector.getWorldPosition(currentPos);
      const lastPassedIndex = findLastPassedPoint(currentPos, allPositions, approximateIndex);
      
      const visiblePoints: [number, number, number][] = [];
      
      // Add all points up to lastPassedIndex
      for (let i = 0; i <= lastPassedIndex; i++) {
        const pos = allPositions[i];
        visiblePoints.push([pos.x, pos.y, pos.z]);
      }
      
      // Add current robot position as the last point
      visiblePoints.push([currentPos.x, currentPos.y, currentPos.z]);
      
      if (visiblePoints.length > 1) {
        return (
          <Line
            points={visiblePoints}
            color="#ff6b35" // Orange color for progress visualization
            lineWidth={2}
          />
        );
      }
    }
    return null;
  };

  return (
    <group ref={armRef}>
      {/* Progressive curve visualization */}
      {renderProgressiveCurve()}
      
      {/* Loading indicator */}
      {!isRobotLoaded && (
        <group>
          <mesh>
            <boxGeometry args={[1, 0.1, 1]} />
            <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.3} />
          </mesh>
        </group>
      )}
      
      {/* Debug: End effector position marker */}
      {robot && robot.endEffector && (
        <group>
          <mesh position={[robot.endEffector.position.x, robot.endEffector.position.y, robot.endEffector.position.z]}>
            <sphereGeometry args={[0.05]} />
            <meshStandardMaterial color="#ff0000" emissive="#ff0000" emissiveIntensity={0.8} />
          </mesh>
        </group>
      )}
    </group>
  );
}

