import { useFrame, useThree } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";

// Three.jsのElementを常に一定サイズにキープするカスタムフック
const useConstantScale = (initialScale = 1) => {
  const { camera } = useThree();
  const meshRef = useRef<THREE.Mesh>(null);
  let zoom = 0;
  useFrame(() => {
    if (meshRef.current) {
      zoom = Math.round(camera.zoom * 1e2) / 1e2;

      meshRef.current.scale.setScalar(initialScale / zoom);
    }
  });

  return meshRef;
};

export default useConstantScale;
