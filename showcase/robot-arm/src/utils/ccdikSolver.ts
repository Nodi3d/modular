import { Object3D, Vector3, Quaternion, MathUtils } from 'three';
import { Robot, RobotJoint } from './robotBuilder';

export interface IKChain {
  joints: RobotJoint[];
  endEffector: Object3D;
  target: Object3D;
}

export class CCDIKSolver {
  private maxIterations: number;
  private tolerance: number;

  constructor(maxIterations = 10, tolerance = 0.01) {
    this.maxIterations = maxIterations;
    this.tolerance = tolerance;
  }

  solve(robot: Robot, targetPosition: Vector3): boolean {
    // Get the kinematic chain from base to end effector
    const chain = this.buildIKChain(robot);
    if (chain.joints.length === 0) return false;

    // Update world matrices
    robot.rootGroup.updateMatrixWorld(true);

    for (let iteration = 0; iteration < this.maxIterations; iteration++) {
      let converged = true;

      // Work backwards from end effector to base
      for (let i = chain.joints.length - 1; i >= 0; i--) {
        const joint = chain.joints[i];
        
        // Get current positions in world space
        const endEffectorPos = new Vector3();
        chain.endEffector.getWorldPosition(endEffectorPos);
        
        const jointPos = new Vector3();
        joint.object3D.getWorldPosition(jointPos);

        // Calculate vectors from joint to end effector and target
        const toEndEffector = endEffectorPos.clone().sub(jointPos);
        const toTarget = targetPosition.clone().sub(jointPos);

        // Check if we're close enough
        const distance = endEffectorPos.distanceTo(targetPosition);
        if (distance < this.tolerance) {
          return true;
        }

        // Skip if vectors are too small
        if (toEndEffector.length() < 0.001 || toTarget.length() < 0.001) {
          continue;
        }

        // Calculate angle between vectors
        toEndEffector.normalize();
        toTarget.normalize();
        
        let angle = Math.acos(MathUtils.clamp(toEndEffector.dot(toTarget), -1, 1));
        
        if (angle < 0.001) continue; // No rotation needed

        // Determine rotation direction using cross product
        const cross = new Vector3().crossVectors(toEndEffector, toTarget);
        
        // Convert cross product to joint local space
        const jointWorldToLocal = new Quaternion().setFromRotationMatrix(joint.object3D.matrixWorld).invert();
        cross.applyQuaternion(jointWorldToLocal);

        // Project onto joint axis to get rotation component
        const axisProjection = cross.dot(joint.axis);
        if (Math.abs(axisProjection) < 0.001) continue;

        // Apply rotation with proper direction
        const rotationAngle = Math.sign(axisProjection) * angle;
        const newAngle = joint.currentAngle + rotationAngle;

        // Apply joint limits
        let clampedAngle = newAngle;
        if (joint.limits) {
          clampedAngle = MathUtils.clamp(newAngle, joint.limits.lower, joint.limits.upper);
        }

        // Update joint angle
        joint.currentAngle = clampedAngle;
        const quaternion = new Quaternion().setFromAxisAngle(joint.axis, clampedAngle);
        joint.object3D.quaternion.copy(quaternion);

        // Update world matrices for next iteration
        robot.rootGroup.updateMatrixWorld(true);

        if (Math.abs(clampedAngle - joint.currentAngle) > 0.001) {
          converged = false;
        }
      }

      // Check final distance
      const finalEndEffectorPos = new Vector3();
      chain.endEffector.getWorldPosition(finalEndEffectorPos);
      const finalDistance = finalEndEffectorPos.distanceTo(targetPosition);
      
      if (finalDistance < this.tolerance) {
        return true;
      }

      if (converged) break;
    }

    return false;
  }

  private buildIKChain(robot: Robot): IKChain {
    const joints: RobotJoint[] = [];
    
    // Get joints in order from base to end effector
    robot.jointOrder.forEach(jointName => {
      const joint = robot.joints.get(jointName);
      if (joint) {
        joints.push(joint);
      }
    });

    return {
      joints,
      endEffector: robot.endEffector,
      target: new Object3D() // Will be set externally
    };
  }

  setMaxIterations(maxIterations: number): void {
    this.maxIterations = maxIterations;
  }

  setTolerance(tolerance: number): void {
    this.tolerance = tolerance;
  }
}