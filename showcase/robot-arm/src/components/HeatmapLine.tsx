import { useMemo } from 'react';
import { BufferGeometry, Float32BufferAttribute, ShaderMaterial, Vector3 } from 'three';
import { extend } from '@react-three/fiber';

// Extend Three.js for React Three Fiber
extend({ BufferGeometry, ShaderMaterial });

interface HeatmapLineProps {
  points: Vector3[] | [number, number, number][];
  lineWidth?: number;
}

export function HeatmapLine({ points, lineWidth = 0.5 }: HeatmapLineProps) {
  const { geometry, material, minY, maxY } = useMemo(() => {
    if (points.length < 2) {
      return { 
        geometry: new BufferGeometry(), 
        material: new ShaderMaterial(), 
        minY: 0, 
        maxY: 1 
      };
    }

    // Create geometry from points
    const positions = new Float32Array(points.length * 3);
    let minY = Infinity;
    let maxY = -Infinity;

    points.forEach((point, i) => {
      if (Array.isArray(point)) {
        positions[i * 3] = point[0];
        positions[i * 3 + 1] = point[1];
        positions[i * 3 + 2] = point[2];
        
        // Track min/max Y for normalization
        minY = Math.min(minY, point[1]);
        maxY = Math.max(maxY, point[1]);
      } else {
        positions[i * 3] = point.x;
        positions[i * 3 + 1] = point.y;
        positions[i * 3 + 2] = point.z;
        
        // Track min/max Y for normalization
        minY = Math.min(minY, point.y);
        maxY = Math.max(maxY, point.y);
      }
    });

    const geometry = new BufferGeometry();
    geometry.setAttribute('position', new Float32BufferAttribute(positions, 3));

    // Shader material with heatmap colors
    const material = new ShaderMaterial({
      uniforms: {
        minY: { value: minY },
        maxY: { value: maxY }
      },
      vertexShader: `
        uniform float minY;
        uniform float maxY;
        varying float vNormalizedY;
        
        void main() {
          vec4 worldPosition = modelMatrix * vec4(position, 1.0);
          vNormalizedY = (worldPosition.y - minY) / (maxY - minY);
          gl_Position = projectionMatrix * viewMatrix * worldPosition;
        }
      `,
      fragmentShader: `
        varying float vNormalizedY;
        
        vec3 heatmapColor(float t) {
          // Clamp t to [0, 1]
          t = clamp(t, 0.0, 1.0);
          
          vec3 color;
          
          if (t < 0.25) {
            // Blue to Cyan
            color = mix(vec3(0.0, 0.0, 1.0), vec3(0.0, 1.0, 1.0), t * 4.0);
          } else if (t < 0.5) {
            // Cyan to Green
            color = mix(vec3(0.0, 1.0, 1.0), vec3(0.0, 1.0, 0.0), (t - 0.25) * 4.0);
          } else if (t < 0.75) {
            // Green to Yellow
            color = mix(vec3(0.0, 1.0, 0.0), vec3(1.0, 1.0, 0.0), (t - 0.5) * 4.0);
          } else {
            // Yellow to Red
            color = mix(vec3(1.0, 1.0, 0.0), vec3(1.0, 0.0, 0.0), (t - 0.75) * 4.0);
          }
          
          return color;
        }
        
        void main() {
          vec3 color = heatmapColor(vNormalizedY);
          gl_FragColor = vec4(color, 1.0);
        }
      `,
      linewidth: lineWidth,
    });

    return { geometry, material, minY, maxY };
  }, [points, lineWidth]);

  if (points.length < 2) return null;

  return (
    <line>
      <primitive object={geometry} attach="geometry" />
      <primitive object={material} attach="material" />
    </line>
  );
}