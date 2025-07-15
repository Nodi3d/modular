import { Vector3 } from 'three';
import { CCDIKSolver, createKukaLWRChain } from './ccdik';

// Simple test function to verify IK solver functionality
export function testIKSolver() {
  console.log('Testing CCDIK Solver...');
  
  // Create the kinematic chain
  const chain = createKukaLWRChain();
  const solver = new CCDIKSolver(chain, 10, 0.05);
  
  // Test with a simple target position
  const targetPosition = new Vector3(0.5, 0.5, 0.5);
  const initialAngles = [0, 0, 0, 0, 0, 0, 0];
  
  console.log('Target position:', targetPosition);
  console.log('Initial joint angles:', initialAngles);
  
  // Solve IK
  const solvedAngles = solver.solve(targetPosition, initialAngles);
  
  console.log('Solved joint angles:', solvedAngles);
  
  // Verify the solution with forward kinematics
  solver.forwardKinematics(solvedAngles);
  const resultPosition = solver.getEndEffectorPosition();
  
  console.log('Result position:', resultPosition);
  console.log('Distance to target:', resultPosition.distanceTo(targetPosition));
  
  // Test if the solution is within tolerance
  const tolerance = 0.05;
  const isWithinTolerance = resultPosition.distanceTo(targetPosition) < tolerance;
  
  console.log('Solution within tolerance:', isWithinTolerance);
  
  return {
    targetPosition,
    resultPosition,
    solvedAngles,
    error: resultPosition.distanceTo(targetPosition),
    withinTolerance: isWithinTolerance
  };
}

// Performance test
export function testIKPerformance() {
  console.log('Testing IK Performance...');
  
  const chain = createKukaLWRChain();
  const solver = new CCDIKSolver(chain, 15, 0.01);
  
  const testPositions = [
    new Vector3(0.3, 0.3, 0.3),
    new Vector3(0.5, 0.2, 0.4),
    new Vector3(0.4, 0.6, 0.2),
    new Vector3(0.2, 0.4, 0.6),
    new Vector3(0.6, 0.1, 0.3)
  ];
  
  let totalTime = 0;
  let successCount = 0;
  const results = [];
  
  for (const targetPos of testPositions) {
    const startTime = performance.now();
    const initialAngles = [0, 0, 0, 0, 0, 0, 0];
    
    const solvedAngles = solver.solve(targetPos, initialAngles);
    solver.forwardKinematics(solvedAngles);
    const resultPos = solver.getEndEffectorPosition();
    
    const endTime = performance.now();
    const solveTime = endTime - startTime;
    const error = resultPos.distanceTo(targetPos);
    
    totalTime += solveTime;
    if (error < 0.05) successCount++;
    
    results.push({
      target: targetPos,
      result: resultPos,
      angles: solvedAngles,
      error,
      solveTime,
      success: error < 0.05
    });
  }
  
  console.log(`Average solve time: ${totalTime / testPositions.length}ms`);
  console.log(`Success rate: ${successCount}/${testPositions.length} (${(successCount / testPositions.length * 100).toFixed(1)}%)`);
  
  return {
    averageSolveTime: totalTime / testPositions.length,
    successRate: successCount / testPositions.length,
    results
  };
}