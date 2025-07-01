import { Modular } from 'nodi-modular';
import { convertGeometryInterop } from './geometryUtils';
import { GeometryWithId } from '@/stores/modular';

// ジオメトリ情報の型を定義


export const evaluateGraph = async (
  modular: Modular | null,
  setGeometries: (geometries: GeometryWithId[]) => void
) => {
  if (!modular) return;

  try {
    const result = await modular.evaluate();
    if (!result || !result.geometryIdentifiers) {
      setGeometries([]);
      return;
    }

    const gs = Array.isArray(result.geometryIdentifiers)
      ? result.geometryIdentifiers
          .map((id) => {
            const interop = modular.findGeometryInteropById(id);
            const {transform} = id
            const geometry = interop ? convertGeometryInterop(interop, transform) : null;
            
            return geometry ? {
              id,
              geometry
            } : null;
          })
          .filter((g): g is GeometryWithId => g !== null)
      : [];
    
    setGeometries(gs);
  } catch (error) {
    console.error("Error evaluating graph:", error);
    setGeometries([]);
  }
};