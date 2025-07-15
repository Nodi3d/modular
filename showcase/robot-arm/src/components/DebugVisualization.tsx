// import React from 'react'; // Not needed in this component
import { Vector3 } from 'three';
import { Box, Line, Text } from '@react-three/drei';

interface DebugVisualizationProps {
  targetPosition?: Vector3;
  endEffectorPosition?: Vector3;
  jointPositions?: Vector3[];
  jointAngles?: number[];
  showInfo?: boolean;
}

export function DebugVisualization({
  targetPosition,
  endEffectorPosition,
  jointPositions = [],
  jointAngles = [],
  showInfo = false
}: DebugVisualizationProps) {
  
  if (!showInfo) return null;
  
  return (
    <group>
      {/* Target position marker */}
      {targetPosition && (
        <Box args={[0.1, 0.1, 0.1]} position={targetPosition}>
          <meshBasicMaterial color="#00ff00" transparent opacity={0.7} />
        </Box>
      )}
      
      {/* End effector position marker */}
      {endEffectorPosition && (
        <Box args={[0.08, 0.08, 0.08]} position={endEffectorPosition}>
          <meshBasicMaterial color="#ff0000" transparent opacity={0.7} />
        </Box>
      )}
      
      {/* Joint position markers */}
      {jointPositions.map((pos, index) => (
        <Box key={index} args={[0.05, 0.05, 0.05]} position={pos}>
          <meshBasicMaterial color="#0000ff" transparent opacity={0.5} />
        </Box>
      ))}
      
      {/* Connection lines between joints */}
      {jointPositions.length > 1 && (
        <Line
          points={jointPositions.map(p => [p.x, p.y, p.z])}
          color="#ffffff"
          lineWidth={2}
        />
      )}
      
      {/* Target to end effector line */}
      {targetPosition && endEffectorPosition && (
        <Line
          points={[
            [targetPosition.x, targetPosition.y, targetPosition.z],
            [endEffectorPosition.x, endEffectorPosition.y, endEffectorPosition.z]
          ]}
          color="#ffff00"
          lineWidth={1}
          dashed
        />
      )}
      
      {/* Joint angle info */}
      {jointAngles.length > 0 && (
        <group position={[0, 2, 0]}>
          {jointAngles.map((angle, index) => (
            <Text
              key={index}
              position={[0, -index * 0.2, 0]}
              fontSize={0.1}
              color="white"
              anchorX="left"
              anchorY="middle"
            >
              {`Joint ${index + 1}: ${(angle * 180 / Math.PI).toFixed(1)}°`}
            </Text>
          ))}
        </group>
      )}
    </group>
  );
}

// Component to show IK solver performance stats
export function IKPerformanceStats({
  solveTime,
  iterations,
  convergenceAchieved,
  error
}: {
  solveTime: number;
  iterations: number;
  convergenceAchieved: boolean;
  error: number;
}) {
  
  return (
    <group position={[0, 3, 0]}>
      <Text
        position={[0, 0, 0]}
        fontSize={0.1}
        color="white"
        anchorX="left"
        anchorY="middle"
      >
        {`Solve Time: ${solveTime.toFixed(2)}ms`}
      </Text>
      <Text
        position={[0, -0.2, 0]}
        fontSize={0.1}
        color="white"
        anchorX="left"
        anchorY="middle"
      >
        {`Iterations: ${iterations}`}
      </Text>
      <Text
        position={[0, -0.4, 0]}
        fontSize={0.1}
        color={convergenceAchieved ? "green" : "red"}
        anchorX="left"
        anchorY="middle"
      >
        {`Converged: ${convergenceAchieved ? "Yes" : "No"}`}
      </Text>
      <Text
        position={[0, -0.6, 0]}
        fontSize={0.1}
        color="white"
        anchorX="left"
        anchorY="middle"
      >
        {`Error: ${error.toFixed(4)}m`}
      </Text>
    </group>
  );
}