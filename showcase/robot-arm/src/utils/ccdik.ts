import { Matrix4, Vector3, Quaternion, Euler } from 'three';

export interface Joint {
  id: string;
  name: string;
  type: 'revolute' | 'prismatic' | 'fixed';
  axis: Vector3;
  limits: {
    lower: number;
    upper: number;
    velocity: number;
    effort: number;
  };
  origin: {
    xyz: Vector3;
    rpy: Euler;
  };
  parent?: string;
  child?: string;
  angle: number; // Current joint angle
}

export interface KinematicChain {
  joints: Joint[];
  endEffectorIndex: number;
  baseIndex: number;
}

export class CCDIKSolver {
  private chain: KinematicChain;
  private maxIterations: number;
  private tolerance: number;
  private jointPositions: Vector3[] = [];
  private jointOrientations: Quaternion[] = [];

  constructor(chain: KinematicChain, maxIterations: number = 10, tolerance: number = 0.01) {
    this.chain = chain;
    this.maxIterations = maxIterations;
    this.tolerance = tolerance;
    this.initializeJointTransforms();
  }

  private initializeJointTransforms(): void {
    this.jointPositions = [];
    this.jointOrientations = [];
    
    // Initialize with identity transforms
    for (let i = 0; i < this.chain.joints.length; i++) {
      this.jointPositions.push(new Vector3());
      this.jointOrientations.push(new Quaternion());
    }
  }

  // Forward kinematics: Calculate joint positions from angles
  public forwardKinematics(jointAngles: number[]): { positions: Vector3[], orientations: Quaternion[] } {
    const positions: Vector3[] = [];
    const orientations: Quaternion[] = [];
    
    // Base position (first joint is at origin + first joint offset)
    let cumulativeTransform = new Matrix4();
    cumulativeTransform.makeTranslation(0, 0, 0);
    
    for (let i = 0; i < this.chain.joints.length; i++) {
      const joint = this.chain.joints[i];
      
      // Apply joint origin translation
      const originTransform = new Matrix4();
      originTransform.makeTranslation(joint.origin.xyz.x, joint.origin.xyz.y, joint.origin.xyz.z);
      cumulativeTransform.multiply(originTransform);
      
      // Apply joint rotation
      if (joint.type === 'revolute') {
        const angle = jointAngles[i] || joint.angle;
        const rotationAxis = joint.axis.clone().normalize();
        const jointRotation = new Matrix4();
        jointRotation.makeRotationAxis(rotationAxis, angle);
        cumulativeTransform.multiply(jointRotation);
      }
      
      // Extract position and orientation
      const position = new Vector3();
      const quaternion = new Quaternion();
      const scale = new Vector3();
      
      cumulativeTransform.decompose(position, quaternion, scale);
      
      positions.push(position);
      orientations.push(quaternion);
    }
    
    this.jointPositions = positions;
    this.jointOrientations = orientations;
    
    return { positions, orientations };
  }

  // Get end effector position
  public getEndEffectorPosition(): Vector3 {
    if (this.jointPositions.length === 0) {
      return new Vector3();
    }
    return this.jointPositions[this.chain.endEffectorIndex].clone();
  }

  // CCDIK solver main function
  public solve(targetPosition: Vector3, currentAngles: number[]): number[] {
    const newAngles = [...currentAngles];
    
    for (let iteration = 0; iteration < this.maxIterations; iteration++) {
      // Update forward kinematics
      this.forwardKinematics(newAngles);
      
      const currentEndEffectorPos = this.getEndEffectorPosition();
      const distance = currentEndEffectorPos.distanceTo(targetPosition);
      
      // Check convergence
      if (distance < this.tolerance) {
        break;
      }
      
      // Early termination if distance is not improving (adjusted for larger scale)
      if (iteration > 3 && distance > 8.0) {
        break;
      }
      
      // Additional stability check - if distance is increasing, reduce step size
      if (iteration > 0 && distance > this.tolerance * 5) {
        // Reduce the impact of this iteration
        for (let i = 0; i < newAngles.length; i++) {
          const diff = newAngles[i] - currentAngles[i];
          newAngles[i] = currentAngles[i] + diff * 0.5; // Reduce step size
        }
      }
      
      // Iterate through joints in reverse order (from end effector to base)
      for (let i = this.chain.joints.length - 1; i >= 0; i--) {
        const joint = this.chain.joints[i];
        
        // Skip fixed joints
        if (joint.type !== 'revolute') {
          continue;
        }
        
        // Get current joint position
        const jointPos = this.jointPositions[i];
        
        // Calculate vectors
        const toEndEffector = currentEndEffectorPos.clone().sub(jointPos);
        const toTarget = targetPosition.clone().sub(jointPos);
        
        // Skip if vectors are too small (adjusted for larger scale)
        if (toEndEffector.length() < 0.1 || toTarget.length() < 0.1) {
          continue;
        }
        
        // Normalize vectors
        toEndEffector.normalize();
        toTarget.normalize();
        
        // Calculate rotation axis and angle
        const rotationAxis = new Vector3().crossVectors(toEndEffector, toTarget);
        const rotationAngle = Math.acos(Math.max(-1, Math.min(1, toEndEffector.dot(toTarget))));
        
        // Skip if rotation is too small (adjusted for larger scale)
        if (rotationAngle < 0.01) {
          continue;
        }
        
        // Project rotation onto joint axis
        const jointAxis = joint.axis.clone().normalize();
        const projectedAxis = rotationAxis.clone().projectOnVector(jointAxis);
        
        // Calculate joint angle change
        const angleChange = rotationAngle * Math.sign(projectedAxis.dot(jointAxis));
        
        // Apply joint limits
        const newAngle = newAngles[i] + angleChange;
        newAngles[i] = Math.max(joint.limits.lower, Math.min(joint.limits.upper, newAngle));
        
        // Update forward kinematics for this change
        this.forwardKinematics(newAngles);
      }
    }
    
    return newAngles;
  }


  // Get joint positions for visualization
  public getJointPositions(): Vector3[] {
    return this.jointPositions.map(pos => pos.clone());
  }

  // Get joint orientations for visualization
  public getJointOrientations(): Quaternion[] {
    return this.jointOrientations.map(quat => quat.clone());
  }

  // Update solver parameters
  public updateParameters(maxIterations?: number, tolerance?: number): void {
    if (maxIterations !== undefined) {
      this.maxIterations = maxIterations;
    }
    if (tolerance !== undefined) {
      this.tolerance = tolerance;
    }
  }
}

// Create KUKA LWR kinematic chain from URDF data with scaled coordinates
export function createKukaLWRChain(): KinematicChain {
  // Scale factor to make the robot arm more visible (10x scale)
  const SCALE_FACTOR = 10;
  
  const joints: Joint[] = [
    {
      id: 'kuka_arm_0_joint',
      name: 'base_joint',
      type: 'revolute',
      axis: new Vector3(0, 0, 1),
      limits: {
        lower: -2.96705972839,
        upper: 2.96705972839,
        velocity: 1.91986217719,
        effort: 204
      },
      origin: {
        xyz: new Vector3(0, 0, 0.11 * SCALE_FACTOR),
        rpy: new Euler(0, 0, 0)
      },
      angle: 0
    },
    {
      id: 'kuka_arm_1_joint',
      name: 'shoulder_joint',
      type: 'revolute',
      axis: new Vector3(0, -1, 0),
      limits: {
        lower: -1.57079632679,
        upper: 1.57079632679,
        velocity: 1.91986217719,
        effort: 306
      },
      origin: {
        xyz: new Vector3(0, 0, 0.20 * SCALE_FACTOR),
        rpy: new Euler(0, 0, 0)
      },
      angle: 0
    },
    {
      id: 'kuka_arm_2_joint',
      name: 'elbow_joint',
      type: 'revolute',
      axis: new Vector3(0, 0, 1),
      limits: {
        lower: -2.96705972839,
        upper: 2.96705972839,
        velocity: 2.26892802759,
        effort: 204
      },
      origin: {
        xyz: new Vector3(0, 0, 0.20 * SCALE_FACTOR),
        rpy: new Euler(0, 0, 0)
      },
      angle: 0
    },
    {
      id: 'kuka_arm_3_joint',
      name: 'wrist_1_joint',
      type: 'revolute',
      axis: new Vector3(0, 1, 0),
      limits: {
        lower: -2.09439510239,
        upper: 2.09439510239,
        velocity: 2.26892802759,
        effort: 306
      },
      origin: {
        xyz: new Vector3(0, 0, 0.20 * SCALE_FACTOR),
        rpy: new Euler(0, 0, 0)
      },
      angle: 0
    },
    {
      id: 'kuka_arm_4_joint',
      name: 'wrist_2_joint',
      type: 'revolute',
      axis: new Vector3(0, 0, 1),
      limits: {
        lower: -2.96705972839,
        upper: 2.96705972839,
        velocity: 2.26892802759,
        effort: 204
      },
      origin: {
        xyz: new Vector3(0, 0, 0.20 * SCALE_FACTOR),
        rpy: new Euler(0, 0, 0)
      },
      angle: 0
    },
    {
      id: 'kuka_arm_5_joint',
      name: 'wrist_3_joint',
      type: 'revolute',
      axis: new Vector3(0, -1, 0),
      limits: {
        lower: -2.09439510239,
        upper: 2.09439510239,
        velocity: 3.14159265359,
        effort: 306
      },
      origin: {
        xyz: new Vector3(0, 0, 0.19 * SCALE_FACTOR),
        rpy: new Euler(0, 0, 0)
      },
      angle: 0
    },
    {
      id: 'kuka_arm_6_joint',
      name: 'end_effector_joint',
      type: 'revolute',
      axis: new Vector3(0, 0, 1),
      limits: {
        lower: -2.96705972839,
        upper: 2.96705972839,
        velocity: 3.14159265359,
        effort: 204
      },
      origin: {
        xyz: new Vector3(0, 0, 0.078 * SCALE_FACTOR),
        rpy: new Euler(0, 0, 0)
      },
      angle: 0
    }
  ];

  return {
    joints,
    endEffectorIndex: 6,
    baseIndex: 0
  };
}