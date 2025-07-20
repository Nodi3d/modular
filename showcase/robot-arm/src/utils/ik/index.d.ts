declare module '../utils/ik' {
  export class IKJoint {
    constructor(urdfJoint?: any);
    add(child: any): void;
    worldToLocal(vector: any): any;
    getWorldPosition(vector: any): any;
    updateMatrixWorld(): void;
    quaternion: any;
    axis: any;
    rotation: any;
    isFixed: boolean;
    isHinge: boolean;
    isRootJoint: boolean;
    limit: any;
    axisName: string;
  }

  export class IKChain {
    constructor();
    createFromURDFRobot(urdfRobot: any, rootJointParent: any): IKChain;
    addJoint(parent: any, ikJoint: IKJoint): void;
    ikJoints: IKJoint[];
    urdfJoints: any[];
    rootJoint: IKJoint;
    endEffector: IKJoint;
  }

  export class IKSolver {
    constructor(config?: {
      isHybrid?: boolean;
      tolerance?: number;
      maxNumOfIterations?: number;
      shouldUpdateURDFRobot?: boolean;
    });
    ikChain: IKChain | null;
    target: any;
    tolerance: number;
    maxNumOfIterations: number;
    shouldUpdateURDFRobot: boolean;
    isHybrid: boolean;
    setConfig(config: any): void;
    solve(): void;
  }

  export class IKHelper {
    // Helper methods if needed
  }
}