import { Vector3, Euler } from 'three';

export interface JointLimits {
  lower: number;
  upper: number;
  effort: number;
  velocity: number;
}

export interface Joint {
  name: string;
  type: 'revolute' | 'prismatic' | 'fixed';
  parent: string;
  child: string;
  origin: {
    xyz: Vector3;
    rpy: Euler;
  };
  axis: Vector3;
  limits?: JointLimits;
}

export interface Link {
  name: string;
  visual?: {
    origin: {
      xyz: Vector3;
      rpy: Euler;
    };
    geometry: {
      mesh?: {
        filename: string;
      };
    };
  };
  inertial?: {
    mass: number;
    origin: {
      xyz: Vector3;
    };
  };
}

export interface RobotDescription {
  name: string;
  links: Map<string, Link>;
  joints: Map<string, Joint>;
  jointOrder: string[];
}

export class URDFParser {
  static parseURDF(urdfContent: string): RobotDescription {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(urdfContent, 'text/xml');
    
    const robotElement = xmlDoc.querySelector('robot');
    if (!robotElement) {
      throw new Error('Invalid URDF: No robot element found');
    }

    const robotName = robotElement.getAttribute('name') || 'unknown';
    const links = new Map<string, Link>();
    const joints = new Map<string, Joint>();
    const jointOrder: string[] = [];

    // Parse links
    const linkElements = xmlDoc.querySelectorAll('link');
    linkElements.forEach(linkEl => {
      const link = this.parseLink(linkEl);
      links.set(link.name, link);
    });

    // Parse joints
    const allElements = xmlDoc.querySelectorAll('joint');
    allElements.forEach(jointEl => {
      // Skip if this is inside a transmission element
      if (jointEl.parentElement?.tagName === 'transmission') {
        return;
      }
      
      try {
        const joint = this.parseJoint(jointEl);
        joints.set(joint.name, joint);
        jointOrder.push(joint.name);
      } catch (error) {
        console.warn(`Failed to parse joint:`, error);
      }
    });

    return {
      name: robotName,
      links,
      joints,
      jointOrder
    };
  }

  private static parseLink(linkElement: Element): Link {
    const name = linkElement.getAttribute('name') || '';
    const link: Link = { name };

    // Parse visual element
    const visualEl = linkElement.querySelector('visual');
    if (visualEl) {
      const originEl = visualEl.querySelector('origin');
      const geometryEl = visualEl.querySelector('geometry');
      
      link.visual = {
        origin: this.parseOrigin(originEl),
        geometry: this.parseGeometry(geometryEl)
      };
    }

    // Parse inertial element
    const inertialEl = linkElement.querySelector('inertial');
    if (inertialEl) {
      const massEl = inertialEl.querySelector('mass');
      const originEl = inertialEl.querySelector('origin');
      
      if (massEl && originEl) {
        link.inertial = {
          mass: parseFloat(massEl.getAttribute('value') || '0'),
          origin: {
            xyz: this.parseXYZ(originEl.getAttribute('xyz') || '0 0 0')
          }
        };
      }
    }

    return link;
  }

  private static parseJoint(jointElement: Element): Joint {
    const name = jointElement.getAttribute('name') || '';
    const type = jointElement.getAttribute('type') as 'revolute' | 'prismatic' | 'fixed' || 'revolute';
    
    const parentEl = jointElement.querySelector('parent');
    const childEl = jointElement.querySelector('child');
    const originEl = jointElement.querySelector('origin');
    const axisEl = jointElement.querySelector('axis');
    const limitEl = jointElement.querySelector('limit');

    if (!parentEl || !childEl) {
      console.error('Joint element:', jointElement);
      console.error('Parent element:', parentEl);
      console.error('Child element:', childEl);
      throw new Error(`Invalid joint ${name}: missing parent or child`);
    }

    const joint: Joint = {
      name,
      type,
      parent: parentEl.getAttribute('link') || '',
      child: childEl.getAttribute('link') || '',
      origin: this.parseOrigin(originEl),
      axis: this.parseAxis(axisEl)
    };

    // Parse joint limits for revolute/prismatic joints
    if (limitEl && (type === 'revolute' || type === 'prismatic')) {
      joint.limits = {
        lower: parseFloat(limitEl.getAttribute('lower') || '0'),
        upper: parseFloat(limitEl.getAttribute('upper') || '0'),
        effort: parseFloat(limitEl.getAttribute('effort') || '0'),
        velocity: parseFloat(limitEl.getAttribute('velocity') || '0')
      };
    }

    return joint;
  }

  private static parseOrigin(originElement: Element | null): { xyz: Vector3; rpy: Euler } {
    if (!originElement) {
      return {
        xyz: new Vector3(0, 0, 0),
        rpy: new Euler(0, 0, 0)
      };
    }

    const xyzStr = originElement.getAttribute('xyz') || '0 0 0';
    const rpyStr = originElement.getAttribute('rpy') || '0 0 0';

    return {
      xyz: this.parseXYZ(xyzStr),
      rpy: this.parseRPY(rpyStr)
    };
  }

  private static parseGeometry(geometryElement: Element | null): { mesh?: { filename: string } } {
    if (!geometryElement) {
      return {};
    }

    const meshEl = geometryElement.querySelector('mesh');
    if (meshEl) {
      return {
        mesh: {
          filename: meshEl.getAttribute('filename') || ''
        }
      };
    }

    return {};
  }

  private static parseAxis(axisElement: Element | null): Vector3 {
    if (!axisElement) {
      return new Vector3(0, 0, 1); // Default Z axis
    }

    const xyzStr = axisElement.getAttribute('xyz') || '0 0 1';
    return this.parseXYZ(xyzStr);
  }

  private static parseXYZ(xyzStr: string): Vector3 {
    const values = xyzStr.trim().split(/\s+/).map(v => parseFloat(v));
    return new Vector3(values[0] || 0, values[1] || 0, values[2] || 0);
  }

  private static parseRPY(rpyStr: string): Euler {
    const values = rpyStr.trim().split(/\s+/).map(v => parseFloat(v));
    return new Euler(values[0] || 0, values[1] || 0, values[2] || 0);
  }
}