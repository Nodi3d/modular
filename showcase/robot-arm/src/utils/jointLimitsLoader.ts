// import { Vector3 } from 'three';

export interface JointLimit {
  min: {
    position: number;
    effort?: number;
    velocity?: number;
  };
  max: {
    position: number;
    effort?: number;
    velocity?: number;
  };
}

export interface JointLimitsData {
  limits: {
    names: string[];
    elements: Array<{
      min: {
        position: number;
        effort?: number;
        velocity?: number;
      };
      max: {
        position: number;
        effort?: number;
        velocity?: number;
      };
    }>;
  };
}

export interface JointLimitsMap {
  [jointName: string]: JointLimit;
}

/**
 * joint_limits.ymlファイルを読み込み、パースしてJointLimitsMapを返す
 */
export async function loadJointLimits(limitsFilePath: string): Promise<JointLimitsMap> {
  try {
    const response = await fetch(limitsFilePath);
    if (!response.ok) {
      throw new Error(`Failed to fetch joint limits: ${response.status} ${response.statusText}`);
    }
    
    const limitsData: JointLimitsData = await response.json();
    
    if (!limitsData.limits || !limitsData.limits.names || !limitsData.limits.elements) {
      throw new Error('Invalid joint limits file format: missing required fields');
    }
    
    const { names, elements } = limitsData.limits;
    
    if (names.length !== elements.length) {
      throw new Error(`Joint limits mismatch: ${names.length} names but ${elements.length} elements`);
    }
    
    const limitsMap: JointLimitsMap = {};
    
    for (let i = 0; i < names.length; i++) {
      const jointName = names[i];
      const element = elements[i];
      
      limitsMap[jointName] = {
        min: {
          position: element.min.position,
          effort: element.min.effort,
          velocity: element.min.velocity
        },
        max: {
          position: element.max.position,
          effort: element.max.effort,
          velocity: element.max.velocity
        }
      };
    }
    
    console.log('Joint limits loaded successfully:', limitsMap);
    return limitsMap;
    
  } catch (error) {
    console.error('Error loading joint limits:', error);
    throw error;
  }
}

/**
 * URDFの制限値と外部制限値を比較し、より厳しい制限を適用
 */
export function mergeJointLimits(
  urdfLimit: { lower: number; upper: number },
  externalLimit?: JointLimit
): { lower: number; upper: number } {
  if (!externalLimit) {
    return urdfLimit;
  }
  
  // より厳しい制限（範囲が狭い）を適用
  const lower = Math.max(urdfLimit.lower, externalLimit.min.position);
  const upper = Math.min(urdfLimit.upper, externalLimit.max.position);
  
  console.log(`Merged limits: URDF(${urdfLimit.lower.toFixed(3)}, ${urdfLimit.upper.toFixed(3)}) + External(${externalLimit.min.position.toFixed(3)}, ${externalLimit.max.position.toFixed(3)}) = Final(${lower.toFixed(3)}, ${upper.toFixed(3)})`);
  
  return { lower, upper };
}

/**
 * 指定された角度が制限範囲内かチェック
 */
export function isAngleWithinLimits(angle: number, limits: { lower: number; upper: number }): boolean {
  return angle >= limits.lower && angle <= limits.upper;
}

/**
 * 角度を制限範囲内にクランプ
 */
export function clampAngleToLimits(angle: number, limits: { lower: number; upper: number }): number {
  return Math.max(limits.lower, Math.min(limits.upper, angle));
}

/**
 * デバッグ用: ジョイント制限の詳細情報を出力
 */
export function debugJointLimits(jointName: string, urdfLimit: { lower: number; upper: number }, externalLimit?: JointLimit) {
  console.log(`=== Joint Limits Debug: ${jointName} ===`);
  console.log('URDF limits:', urdfLimit);
  if (externalLimit) {
    console.log('External limits:', externalLimit);
    const merged = mergeJointLimits(urdfLimit, externalLimit);
    console.log('Merged limits:', merged);
  } else {
    console.log('No external limits found');
  }
  console.log('================================');
}