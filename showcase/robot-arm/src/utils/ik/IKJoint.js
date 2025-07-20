import { Group, Vector3 } from 'three';

import AXIS_NAMES from '../constants/axisNames';

class IKJoint extends Group {
  constructor(urdfJoint = null, externalLimits = null) {
    super();
    this.position.set(0, 0, 0);
    this.axis = new Vector3(0, 0, 1);
    this.isRootJoint = true;
    this.isHinge = false;
    this.isFixed = false;
    this.isIkJoint = true;
    this.limit = { lower: 0, upper: 0 };
    this.originalUrdfLimit = null; // URDF元の制限値を保存
    this.externalLimit = null; // 外部制限値を保存
    this.jointName = null; // Joint名を保存

    if (urdfJoint) {
      this.position.copy(urdfJoint.position);
      this.rotation.copy(urdfJoint.rotation);
      this.isRootJoint = false;
      this.isHinge = urdfJoint.jointType === 'revolute';
      this.isFixed = urdfJoint.jointType === 'fixed';
      this.axis.copy(urdfJoint.axis);
      this.jointName = urdfJoint.name; // Joint名を保存
      
      // URDF元の制限値を保存
      this.originalUrdfLimit = {
        ...urdfJoint.limit,
      };
      
      // 外部制限値を設定
      this.externalLimit = externalLimits;
      
      // 制限値を統合（より厳しい制限を適用）
      this.limit = this.mergeJointLimits(this.originalUrdfLimit, externalLimits);
    }
  }

  /**
   * URDFの制限値と外部制限値を統合し、より厳しい制限を適用
   */
  mergeJointLimits(urdfLimit, externalLimit) {
    if (!externalLimit) {
      return { ...urdfLimit };
    }
    
    // より厳しい制限（範囲が狭い）を適用
    const lower = Math.max(urdfLimit.lower, externalLimit.min.position);
    const upper = Math.min(urdfLimit.upper, externalLimit.max.position);
    
    
    
    return { 
      lower, 
      upper,
      effort: externalLimit.max.effort || urdfLimit.effort,
      velocity: externalLimit.max.velocity || urdfLimit.velocity
    };
  }

  /**
   * 外部制限値を更新
   */
  updateExternalLimits(externalLimits) {
    this.externalLimit = externalLimits;
    this.limit = this.mergeJointLimits(this.originalUrdfLimit, externalLimits);
  }

  /**
   * 現在の角度が制限範囲内かチェック
   */
  isAngleWithinLimits(angle) {
    return angle >= this.limit.lower && angle <= this.limit.upper;
  }

  /**
   * 角度を制限範囲内にクランプ
   */
  clampAngleToLimits(angle) {
    return Math.max(this.limit.lower, Math.min(this.limit.upper, angle));
  }

  get axisArray() {
    return this.axis.toArray();
  }

  get axisIdx() {
    return this.axisArray.findIndex((value) => value !== 0);
  }

  get axisName() {
    switch (this.axisIdx) {
      case 0:
        return AXIS_NAMES.X;
      case 1:
        return AXIS_NAMES.Y;
      case 2:
        return AXIS_NAMES.Z;
      default:
        return '';
    }
  }

  get axisIsNegative() {
    return this.axisArray[this.axisIdx] < 0;
  }
}

export default IKJoint;
