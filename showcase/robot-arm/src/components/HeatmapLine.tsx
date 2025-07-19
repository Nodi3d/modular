import { useMemo } from 'react';
import { Vector3, Color, Vector2 } from 'three';
import { Line2 } from 'three/examples/jsm/lines/Line2.js';
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry.js';
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial.js';

interface HeatmapLineProps {
  points: Vector3[] | [number, number, number][];
  lineWidth?: number;
}

export function HeatmapLine({ points, lineWidth = 2 }: HeatmapLineProps) {
  const line2 = useMemo(() => {
    if (points.length < 2) return null;

    // Convert points to array format
    const positions: number[] = [];
    const colors: number[] = [];
    
    let minZ = Infinity;
    let maxZ = -Infinity;

    // First pass: find min/max Z for normalization
    points.forEach((point) => {
      const z = Array.isArray(point) ? point[2] : point.z;
      minZ = Math.min(minZ, z);
      maxZ = Math.max(maxZ, z);
    });

    // Avoid division by zero
    const zRange = maxZ - minZ || 1;

    // Second pass: create positions and colors
    points.forEach((point) => {
      if (Array.isArray(point)) {
        positions.push(point[0], point[1], point[2]);
        
        // Calculate normalized Z for heatmap
        const normalizedZ = (point[2] - minZ) / zRange;
        const color = getHeatmapColor(normalizedZ);
        colors.push(color.r, color.g, color.b);
      } else {
        positions.push(point.x, point.y, point.z);
        
        // Calculate normalized Z for heatmap
        const normalizedZ = (point.z - minZ) / zRange;
        const color = getHeatmapColor(normalizedZ);
        colors.push(color.r, color.g, color.b);
      }
    });

    // Create Line2 geometry
    const geometry = new LineGeometry();
    geometry.setPositions(positions);
    geometry.setColors(colors);

    // Create Line2 material
    const material = new LineMaterial({
      color: 0xffffff,
      linewidth: lineWidth,
      vertexColors: true,
      resolution: new Vector2(window.innerWidth, window.innerHeight),
      dashed: false,
    });

    // Create Line2 object
    const line2Object = new Line2(geometry, material);
    line2Object.computeLineDistances();

    return line2Object;
  }, [points, lineWidth]);

  if (!line2) return null;

  return <primitive object={line2} />;
}

function getHeatmapColor(t: number): Color {
  // Clamp t to [0, 1]
  t = Math.max(0, Math.min(1, t));
  
  const color = new Color();
  
  if (t < 0.25) {
    // Blue to Cyan
    color.setRGB(0, t * 4, 1);
  } else if (t < 0.5) {
    // Cyan to Green
    const factor = (t - 0.25) * 4;
    color.setRGB(0, 1, 1 - factor);
  } else if (t < 0.75) {
    // Green to Yellow
    const factor = (t - 0.5) * 4;
    color.setRGB(factor, 1, 0);
  } else {
    // Yellow to Red
    const factor = (t - 0.75) * 4;
    color.setRGB(1, 1 - factor, 0);
  }
  
  return color;
}