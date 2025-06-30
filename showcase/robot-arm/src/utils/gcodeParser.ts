import { Vector3 } from 'three';

export interface GcodeMove {
  x: number;
  y: number;
  z: number;
  e?: number; // extruder position
  f?: number; // feedrate
}

export interface ParsedGcode {
  moves: GcodeMove[];
  totalMoves: number;
  bounds: {
    min: Vector3;
    max: Vector3;
  };
}

export function parseGcode(gcodeText: string): ParsedGcode {
  const lines = gcodeText.split('\n');
  const moves: GcodeMove[] = [];
  let minX = Infinity, minY = Infinity, minZ = Infinity;
  let maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity;

  for (const line of lines) {
    const trimmedLine = line.trim();
    
    // Skip comments and non-movement commands
    if (trimmedLine.startsWith(';') || trimmedLine.startsWith('M') || trimmedLine.startsWith('G9')) {
      continue;
    }

    // Parse G1 (linear move) commands
    if (trimmedLine.startsWith('G1')) {
      const move: GcodeMove = { x: 0, y: 0, z: 0 };
      
      // Extract X coordinate
      const xMatch = trimmedLine.match(/X([-+]?\d*\.?\d+)/);
      if (xMatch) {
        move.x = parseFloat(xMatch[1]);
        minX = Math.min(minX, move.x);
        maxX = Math.max(maxX, move.x);
      }

      // Extract Y coordinate
      const yMatch = trimmedLine.match(/Y([-+]?\d*\.?\d+)/);
      if (yMatch) {
        move.y = parseFloat(yMatch[1]);
        minY = Math.min(minY, move.y);
        maxY = Math.max(maxY, move.y);
      }

      // Extract Z coordinate
      const zMatch = trimmedLine.match(/Z([-+]?\d*\.?\d+)/);
      if (zMatch) {
        move.z = parseFloat(zMatch[1]);
        minZ = Math.min(minZ, move.z);
        maxZ = Math.max(maxZ, move.z);
      }

      // Extract E (extruder) coordinate
      const eMatch = trimmedLine.match(/E([-+]?\d*\.?\d+)/);
      if (eMatch) {
        move.e = parseFloat(eMatch[1]);
      }

      // Extract F (feedrate)
      const fMatch = trimmedLine.match(/F([-+]?\d*\.?\d+)/);
      if (fMatch) {
        move.f = parseFloat(fMatch[1]);
      }

      // Only add moves with actual coordinates
      if (xMatch || yMatch || zMatch) {
        moves.push(move);
      }
    }
  }

  return {
    moves,
    totalMoves: moves.length,
    bounds: {
      min: new Vector3(minX, minY, minZ),
      max: new Vector3(maxX, maxY, maxZ)
    }
  };
}

export async function loadGcodeFile(filePath: string): Promise<ParsedGcode> {
  try {
    const response = await fetch(filePath);
    const gcodeText = await response.text();
    return parseGcode(gcodeText);
  } catch (error) {
    console.error('Error loading Gcode file:', error);
    throw error;
  }
}