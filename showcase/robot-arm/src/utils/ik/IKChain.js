import IKJoint from './IKJoint';

class IKChain {
  constructor() {
    this._ikJoints = [];
    this._urdfJoints = [];
    this._rootJoint = null;
    this._urdfBaseJointId = '';
    this._endEffector = null;
    this._externalLimitsMap = null; // 外部制限値のマップ
  }

  addJoint(parent, ikJoint) {
    parent.add(ikJoint);
    this._ikJoints.push(ikJoint);
  }

  get ikJoints() {
    return this._ikJoints;
  }

  get rootJoint() {
    return this._rootJoint;
  }

  get endEffector() {
    return this._endEffector;
  }

  get urdfJoints() {
    return this._urdfJoints;
  }

  createFromURDFRobot(urdfRobot, rootJointParent, externalLimitsMap = null) {
    this._externalLimitsMap = externalLimitsMap;
    this._rootJoint = new IKJoint();
    this.addJoint(rootJointParent, this._rootJoint);

    const urdfRobotBaseJoint = this._findURDFBaseJoint(urdfRobot);
    this._urdfBaseJointId = urdfRobotBaseJoint.name;

    this._traverseURDFJoints(this._rootJoint, urdfRobotBaseJoint);

    return this;
  }

  _findURDFBaseJoint({ children }) {
    let baseJoint = null;
    for (const child of children) {
      if (!child.isURDFJoint) continue;

      const [urdfLink] = child.children;
      const hasNextURDFJoint = urdfLink.children.some(
        (child) => child.isURDFJoint
      );
      if (hasNextURDFJoint) {
        baseJoint = child;
        break;
      }
    }

    return baseJoint;
  }

  _traverseURDFJoints(parentIkJoint, urdfJoint) {
    this._urdfJoints.push(urdfJoint);

    // 外部制限値を取得
    const externalLimit = this._externalLimitsMap ? this._externalLimitsMap[urdfJoint.name] : null;
    
    const ikJoint = new IKJoint(urdfJoint, externalLimit);
    this.addJoint(parentIkJoint, ikJoint);
    parentIkJoint = ikJoint;

    const [urdfLink] = urdfJoint.children;
    const { children } = urdfLink;
    const nextUrdfJoint = children.find((child) => child.isURDFJoint);
    
  
    const isEndEffector = ikJoint.isFixed && urdfJoint.name !== this._urdfBaseJointId;

    if (!nextUrdfJoint || isEndEffector) {
      this._endEffector = ikJoint;
      return;
    }

    this._traverseURDFJoints(parentIkJoint, nextUrdfJoint);
  }
}

export default IKChain;
