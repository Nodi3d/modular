import { Vector3, Quaternion } from 'three';

const endEffectorWorldPosition = new Vector3();
const endEffectorWorldToLocalPosition = new Vector3();
const targetWorldToLocalPosition = new Vector3();
const fromToQuaternion = new Quaternion();
const inverseQuaternion = new Quaternion();
const jointAxisAfterRotation = new Vector3();

function ccdIKSolver(ikChain, targetPosition, tolerance, maxNumOfIterations) {
  const { ikJoints, endEffector } = ikChain;

  let endEffectorTargetDistance = endEffector
    .worldToLocal(targetWorldToLocalPosition.copy(targetPosition))
    .length();
  let numOfIterations = 0;

  while (
    endEffectorTargetDistance > tolerance &&
    numOfIterations <= maxNumOfIterations
  ) {
    for (let idx = ikJoints.length - 2; idx >= 0; idx--) {
      const ikJoint = ikJoints[idx];
      if (ikJoint.isFixed) {
        ikJoint.updateMatrixWorld();
        continue;
      }
      
      // 関節が完全に固定されている場合もスキップ
      if (ikJoint.limit && ikJoint.limit.lower === 0 && ikJoint.limit.upper === 0) {
        ikJoint.quaternion.setFromAxisAngle(ikJoint.axis, 0);
        ikJoint.updateMatrixWorld();
        if (Math.random() < 0.05) { // 5%の確率でログ出力
          console.log(`Joint ${ikJoint.jointName || 'unknown'} (${ikJoint.name || 'no-name'}) is locked at 0 degrees - skipping IK`);
        }
        continue;
      }

      endEffector.getWorldPosition(endEffectorWorldPosition);

      // Rotate the joint from end effector to goal, so that the end-effector
      // can meet the target.
      // https://sites.google.com/site/auraliusproject/ccd-algorithm

      // Get the direction from current joint to end effector:
      // direction = endEffector.position - joint.position.
      // Since the position of end effector we get is a world position,
      // we can either get current joint's world position to compute the
      // direction, or transform end effector's world position
      // to current joint's local space and then compute the direction.
      // Since later we need to use the direction to compute the quaternion
      // that will apply to current joint and it is easier to apply local
      // quaternion, we choose the latter method.
      const directionToEndEffector = ikJoint
        .worldToLocal(
          endEffectorWorldToLocalPosition.copy(endEffectorWorldPosition)
        )
        .normalize();

      // Get the direction from current joint to target.
      const directionToTarget = ikJoint
        .worldToLocal(targetWorldToLocalPosition.copy(targetPosition))
        .normalize();

      fromToQuaternion.setFromUnitVectors(
        directionToEndEffector,
        directionToTarget
      );
      ikJoint.quaternion.multiply(fromToQuaternion);

      // Constrain the joint rotation to its hinge axis.
      // Let `axis[i]` denote the current hinge axis. Since the current joint
      // has been rotated in the previous step, we apply same rotation to `axis[i]`,
      // which gives us the new axis `axis[i]'`. To constrain the rotation to the
      // specified axis, we can rotate back the current joint by the rotation defined
      // between `axis[i]` and `axis[i]'`.

      // We can compute the amount that we need to rotate back the current joint
      // without inverting the rotation that has been applied to that joint, but
      // that will end up with awkward rotation of the joint before the final rotation
      // is found.
      if (ikJoint.isHinge || ikJoint.isRootJoint) {
        inverseQuaternion.copy(ikJoint.quaternion).invert();
        jointAxisAfterRotation
          .copy(ikJoint.axis)
          .applyQuaternion(inverseQuaternion);

        fromToQuaternion.setFromUnitVectors(
          ikJoint.axis,
          jointAxisAfterRotation
        );
        ikJoint.quaternion.multiply(fromToQuaternion);
      }

      // Apply hinge limits.

      if (ikJoint.limit) {
        // 関節が完全に固定されている場合（lower == upper == 0）
        if (ikJoint.limit.lower === 0 && ikJoint.limit.upper === 0) {
          // 回転を完全にリセット
          const currentAngle = getIKJointRotationAngle(ikJoint);
          if (Math.abs(currentAngle) > 0.001) { // 現在の角度が0でない場合のみログ
            console.log(`Joint ${ikJoint.jointName || 'unknown'} was at ${currentAngle.toFixed(3)} rad, resetting to 0 (fixed joint)`);
          }
          ikJoint.quaternion.setFromAxisAngle(ikJoint.axis, 0);
        } else {
          const ikJointRotationAngle = getIKJointRotationAngle(ikJoint);
          const [clampedIKJointRotationAngle, isClamped] =
            clampIKJointRotationAngle(ikJointRotationAngle, ikJoint.limit);

          if (isClamped) {
            // 制限違反のログ出力（デバッグ用）
            console.log(`Joint ${ikJoint.jointName || 'unknown'} clamped: ${ikJointRotationAngle.toFixed(3)} -> ${clampedIKJointRotationAngle.toFixed(3)} (limits: ${ikJoint.limit.lower.toFixed(3)} to ${ikJoint.limit.upper.toFixed(3)})`);
            
            ikJoint.quaternion.setFromAxisAngle(
              ikJoint.axis,
              clampedIKJointRotationAngle
            );
          }
        }
      }

      ikJoint.updateMatrixWorld();
    }

    endEffectorTargetDistance = endEffector
      .worldToLocal(targetWorldToLocalPosition.copy(targetPosition))
      .length();
    numOfIterations++;
  }
}

function getIKJointRotationAngle(ikJoint) {
  const { axisName, axis } = ikJoint;
  // Given an axis [a_x, a_y, a_z] and angle theta,
  // Quaternion = [a_x * sin(theta / 2), a_y * sin(theta / 2), a_z * sin(theta / 2), cos(theta / 2)]
  return Math.asin(ikJoint.quaternion[axisName] / axis[axisName]) * 2;
}

function clampIKJointRotationAngle(ikJointRotationAngle, limit) {
  const { lower, upper } = limit;
  let isClamped = false;
  if (ikJointRotationAngle < lower) {
    isClamped = true;
    return [lower, isClamped];
  }

  if (ikJointRotationAngle > upper) {
    isClamped = true;
    return [upper, isClamped];
  }

  return [ikJointRotationAngle, isClamped];
}

export default ccdIKSolver;
