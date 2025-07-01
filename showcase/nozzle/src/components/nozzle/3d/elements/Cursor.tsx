import useConstantScale from "@/hooks/useConstantScale";
import { Sphere } from "@react-three/drei";
import { Vector2 } from "three";

type CursorProps = {
  point: Vector2;
};

export const Cursor = (props: CursorProps) => {
  const sphereRef = useConstantScale(3);
  return (
    <>
      <Sphere ref={sphereRef} position={[props.point.x, props.point.y, 0]}>
        <meshStandardMaterial color="pink" />
      </Sphere>
    </>
  );
};
