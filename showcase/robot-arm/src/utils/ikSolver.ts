import { Vector3, Matrix4, Object3D } from 'three';

export interface JointInfo {
  joint: Object3D;
  axis: Vector3;
  limits: { min: number; max: number };
  currentAngle: number;
}

export interface IKSolverOptions {
  maxIterations?: number;
  threshold?: number;
  dampingFactor?: number;
}

export class CCDIKSolver {
  private joints: JointInfo[] = [];
  private endEffector: Object3D | null = null;
  private options: Required<IKSolverOptions>;

  constructor(options: IKSolverOptions = {}) {
    this.options = {
      maxIterations: options.maxIterations || 20,
      threshold: options.threshold || 0.01,
      dampingFactor: options.dampingFactor || 0.8,
    };
  }

  /**
   * ジョイントチェーンを設定
   */
  setJointChain(joints: JointInfo[], endEffector: Object3D) {
    this.joints = joints;
    this.endEffector = endEffector;
  }

  /**
   * URDF情報からジョイントチェーンを構築
   */
  buildFromURDF(robot: Object3D): boolean {
    try {
      // URDFから関節情報を抽出
      const joints: JointInfo[] = [];
      
      // URDF構造を解析してジョイントを検索
      const findJoints = (obj: Object3D) => {
        if (obj.name && obj.name.includes('joint')) {
          // ジョイント制限を設定（URDFファイルの情報に基づく）
          const limits = this.getJointLimits(obj.name);
          const axis = this.getJointAxis(obj.name);
          
          joints.push({
            joint: obj,
            axis,
            limits,
            currentAngle: 0,
          });
        }
        
        obj.children.forEach(child => findJoints(child));
      };
      
      findJoints(robot);
      
      // エンドエフェクターを検索
      const endEffector = this.findEndEffector(robot);
      
      if (joints.length > 0 && endEffector) {
        this.setJointChain(joints, endEffector);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Failed to build joint chain from URDF:', error);
      return false;
    }
  }

  /**
   * IK計算を実行
   */
  solve(targetPosition: Vector3): boolean {
    if (!this.endEffector || this.joints.length === 0) {
      console.warn('IK Solver not properly initialized');
      return false;
    }

    for (let iteration = 0; iteration < this.options.maxIterations; iteration++) {
      // エンドエフェクターの現在位置を取得
      const currentEndPos = new Vector3();
      this.endEffector.getWorldPosition(currentEndPos);
      
      // ターゲットまでの距離を計算
      const distance = currentEndPos.distanceTo(targetPosition);
      
      // 閾値以下なら成功
      if (distance < this.options.threshold) {
        return true;
      }
      
      // 各ジョイントに対してCCDアルゴリズムを適用
      for (let i = this.joints.length - 1; i >= 0; i--) {
        const joint = this.joints[i];
        
        // ジョイント位置を取得
        const jointPos = new Vector3();
        joint.joint.getWorldPosition(jointPos);
        
        // 現在のエンドエフェクター位置を更新
        this.endEffector.getWorldPosition(currentEndPos);
        
        // ベクトルを計算
        const toEnd = currentEndPos.clone().sub(jointPos).normalize();
        const toTarget = targetPosition.clone().sub(jointPos).normalize();
        
        // 回転角度を計算
        const angle = toEnd.angleTo(toTarget);
        
        if (angle > 0.001) { // 微小角度は無視
          // 回転軸を計算
          const rotationAxis = toEnd.clone().cross(toTarget).normalize();
          
          // ジョイントの軸と一致するように調整
          const alignedAngle = angle * rotationAxis.dot(joint.axis) * this.options.dampingFactor;
          
          // 関節制限を適用
          const newAngle = this.clampAngle(joint.currentAngle + alignedAngle, joint.limits);
          const deltaAngle = newAngle - joint.currentAngle;
          
          if (Math.abs(deltaAngle) > 0.001) {
            // ジョイントを回転
            this.rotateJoint(joint, deltaAngle);
            joint.currentAngle = newAngle;
          }
        }
      }
    }
    
    console.warn('IK Solver did not converge within max iterations');
    return false;
  }

  /**
   * ジョイントを回転させる
   */
  private rotateJoint(joint: JointInfo, angle: number) {
    const rotationMatrix = new Matrix4();
    rotationMatrix.makeRotationAxis(joint.axis, angle);
    joint.joint.applyMatrix4(rotationMatrix);
  }

  /**
   * 角度を制限内にクランプ
   */
  private clampAngle(angle: number, limits: { min: number; max: number }): number {
    return Math.max(limits.min, Math.min(limits.max, angle));
  }

  /**
   * ジョイント制限を取得（URDFファイルの情報に基づく）
   */
  private getJointLimits(jointName: string): { min: number; max: number } {
    const limits = {
      'kuka-arm-004_link_joint': { min: -1.0, max: 1.0 },
      'kuka-arm-003_link_joint': { min: -0.33, max: 0.49 },
      'kuka-arm-002_link_joint': { min: -0.33, max: 0.49 },
      'kuka-arm-001_link_joint': { min: -0.33, max: 0.49 },
      'kuka-arm-000_link_joint': { min: -1.0, max: 1.0 },
    };
    
    return limits[jointName as keyof typeof limits] || { min: -Math.PI, max: Math.PI };
  }

  /**
   * ジョイント軸を取得（URDFファイルの情報に基づく）
   */
  private getJointAxis(jointName: string): Vector3 {
    const axes = {
      'kuka-arm-004_link_joint': new Vector3(0, 0, 1), // Z軸回転
      'kuka-arm-003_link_joint': new Vector3(0, 1, 0), // Y軸回転
      'kuka-arm-002_link_joint': new Vector3(0, 1, 0), // Y軸回転
      'kuka-arm-001_link_joint': new Vector3(0, 1, 0), // Y軸回転
      'kuka-arm-000_link_joint': new Vector3(1, 0, 0), // X軸回転
    };
    
    return axes[jointName as keyof typeof axes] || new Vector3(0, 0, 1);
  }

  /**
   * エンドエフェクターを検索
   */
  private findEndEffector(robot: Object3D): Object3D | null {
    let endEffector: Object3D | null = null;
    
    const findEndEffectorRecursive = (obj: Object3D) => {
      // 'kuka-arm-000' が最終エフェクター
      if (obj.name && obj.name.includes('kuka-arm-000')) {
        endEffector = obj;
        return;
      }
      
      obj.children.forEach(child => findEndEffectorRecursive(child));
    };
    
    findEndEffectorRecursive(robot);
    return endEffector;
  }

  /**
   * 現在のジョイント角度を取得
   */
  getJointAngles(): number[] {
    return this.joints.map(joint => joint.currentAngle);
  }

  /**
   * ジョイント角度を設定
   */
  setJointAngles(angles: number[]) {
    for (let i = 0; i < Math.min(angles.length, this.joints.length); i++) {
      const joint = this.joints[i];
      const newAngle = this.clampAngle(angles[i], joint.limits);
      const deltaAngle = newAngle - joint.currentAngle;
      
      if (Math.abs(deltaAngle) > 0.001) {
        this.rotateJoint(joint, deltaAngle);
        joint.currentAngle = newAngle;
      }
    }
  }
}