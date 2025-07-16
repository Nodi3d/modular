import { Group, Object3D, Mesh, Vector3, Quaternion, MeshStandardMaterial } from 'three';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js';
import { RobotDescription, Joint, Link } from './urdfParser';

export interface RobotJoint {
  name: string;
  object3D: Group;
  axis: Vector3;
  limits?: {
    lower: number;
    upper: number;
  };
  currentAngle: number;
}

export interface RobotLink {
  name: string;
  object3D: Group;
  mesh?: Mesh;
}

export interface Robot {
  rootGroup: Group;
  joints: Map<string, RobotJoint>;
  links: Map<string, RobotLink>;
  endEffector: Group;
  jointOrder: string[];
}

export class RobotBuilder {
  private stlLoader: STLLoader;
  private loadedMeshes: Map<string, Mesh> = new Map();

  constructor() {
    this.stlLoader = new STLLoader();
  }

  async buildRobot(robotDescription: RobotDescription): Promise<Robot> {
    const rootGroup = new Group();
    const joints = new Map<string, RobotJoint>();
    const links = new Map<string, RobotLink>();

    // Load all STL meshes first
    await this.preloadMeshes(robotDescription);

    // Build kinematic tree
    const rootLink = this.findRootLink(robotDescription);
    if (!rootLink) {
      throw new Error('No root link found in robot description');
    }

    // Create root link
    const rootLinkObj = await this.createLink(rootLink);
    rootGroup.add(rootLinkObj.object3D);
    links.set(rootLink.name, rootLinkObj);

    // Build the kinematic chain recursively
    await this.buildKinematicChain(
      rootLink.name,
      rootLinkObj.object3D,
      robotDescription,
      joints,
      links
    );

    // Find end effector (last link in the chain)
    const endEffector = this.findEndEffector(robotDescription, links);

    return {
      rootGroup,
      joints,
      links,
      endEffector,
      jointOrder: robotDescription.jointOrder
    };
  }

  private async preloadMeshes(robotDescription: RobotDescription): Promise<void> {
    const meshFilenames = new Set<string>();
    
    robotDescription.links.forEach(link => {
      if (link.visual?.geometry.mesh?.filename) {
        let filename = link.visual.geometry.mesh.filename;
        // Convert relative path to absolute
        if (filename.startsWith('../')) {
          filename = filename.replace('../meshes/stl/', '/kuka/meshes/stl/');
        }
        meshFilenames.add(filename);
      }
    });

    const loadPromises = Array.from(meshFilenames).map(async filename => {
      try {
        const geometry = await this.loadSTL(filename);
        const material = new MeshStandardMaterial({ 
          color: 0xffa500, // Orange color
          metalness: 0.6,
          roughness: 0.4
        });
        const mesh = new Mesh(geometry, material);
        // Scale mesh from millimeters to meters
        // mesh.scale.setScalar(0.001);
        mesh.scale.setScalar(1);
        this.loadedMeshes.set(filename, mesh);
      } catch (error) {
        console.warn(`Failed to load mesh ${filename}:`, error);
      }
    });

    await Promise.all(loadPromises);
  }

  private loadSTL(filename: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.stlLoader.load(
        filename,
        geometry => resolve(geometry),
        undefined,
        error => reject(error)
      );
    });
  }

  private async createLink(link: Link): Promise<RobotLink> {
    const linkGroup = new Group();
    linkGroup.name = link.name;

    let mesh: Mesh | undefined;

    if (link.visual?.geometry.mesh?.filename) {
      let filename = link.visual.geometry.mesh.filename;
      if (filename.startsWith('../')) {
        filename = filename.replace('../meshes/stl/', '/kuka/meshes/stl/');
      }

      const loadedMesh = this.loadedMeshes.get(filename);
      if (loadedMesh) {
        mesh = loadedMesh.clone();
        
        // Apply visual origin transform
        if (link.visual.origin) {
          mesh.position.copy(link.visual.origin.xyz);
          mesh.rotation.copy(link.visual.origin.rpy);
        }
        
        linkGroup.add(mesh);
      }
    }

    return {
      name: link.name,
      object3D: linkGroup,
      mesh
    };
  }

  private async createJoint(joint: Joint): Promise<RobotJoint> {
    const jointGroup = new Group();
    jointGroup.name = joint.name;

    // Apply joint origin transform
    jointGroup.position.copy(joint.origin.xyz);
    const quaternion = new Quaternion().setFromEuler(joint.origin.rpy);
    jointGroup.quaternion.copy(quaternion);

    const robotJoint: RobotJoint = {
      name: joint.name,
      object3D: jointGroup,
      axis: joint.axis.clone(),
      currentAngle: 0
    };

    if (joint.limits) {
      robotJoint.limits = {
        lower: joint.limits.lower,
        upper: joint.limits.upper
      };
    }

    return robotJoint;
  }

  private async buildKinematicChain(
    parentLinkName: string,
    parentObject: Object3D,
    robotDescription: RobotDescription,
    joints: Map<string, RobotJoint>,
    links: Map<string, RobotLink>
  ): Promise<void> {
    // Find joints that have this link as parent
    for (const joint of robotDescription.joints.values()) {
      if (joint.parent === parentLinkName) {
        // Create joint
        const robotJoint = await this.createJoint(joint);
        joints.set(joint.name, robotJoint);
        parentObject.add(robotJoint.object3D);

        // Create child link
        const childLink = robotDescription.links.get(joint.child);
        if (childLink) {
          const robotLink = await this.createLink(childLink);
          links.set(childLink.name, robotLink);
          robotJoint.object3D.add(robotLink.object3D);

          // Recursively build children
          await this.buildKinematicChain(
            childLink.name,
            robotLink.object3D,
            robotDescription,
            joints,
            links
          );
        }
      }
    }
  }

  private findRootLink(robotDescription: RobotDescription): Link | null {
    // Find link that is not a child of any joint
    const childLinks = new Set<string>();
    robotDescription.joints.forEach(joint => {
      childLinks.add(joint.child);
    });

    for (const link of robotDescription.links.values()) {
      if (!childLinks.has(link.name)) {
        return link;
      }
    }

    return null;
  }

  private findEndEffector(robotDescription: RobotDescription, links: Map<string, RobotLink>): Group {
    // Find the last link in the kinematic chain (not parent of any joint)
    const parentLinks = new Set<string>();
    robotDescription.joints.forEach(joint => {
      parentLinks.add(joint.parent);
    });

    for (const link of robotDescription.links.values()) {
      if (!parentLinks.has(link.name)) {
        const robotLink = links.get(link.name);
        if (robotLink) {
          return robotLink.object3D;
        }
      }
    }

    // Fallback: return the last link in the chain
    const lastLinkName = Array.from(robotDescription.links.keys()).pop();
    const lastLink = lastLinkName ? links.get(lastLinkName) : null;
    return lastLink?.object3D || new Group();
  }

  setJointAngle(robot: Robot, jointName: string, angle: number): void {
    const joint = robot.joints.get(jointName);
    if (!joint) return;

    // Apply joint limits
    if (joint.limits) {
      angle = Math.max(joint.limits.lower, Math.min(joint.limits.upper, angle));
    }

    joint.currentAngle = angle;

    // Apply rotation around joint axis
    const quaternion = new Quaternion().setFromAxisAngle(joint.axis, angle);
    joint.object3D.quaternion.copy(quaternion);
  }

  getJointAngles(robot: Robot): number[] {
    return robot.jointOrder.map(jointName => {
      const joint = robot.joints.get(jointName);
      return joint ? joint.currentAngle : 0;
    });
  }

  setJointAngles(robot: Robot, angles: number[]): void {
    robot.jointOrder.forEach((jointName, index) => {
      if (index < angles.length) {
        this.setJointAngle(robot, jointName, angles[index]);
      }
    });
  }
}