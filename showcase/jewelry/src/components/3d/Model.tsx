import { GeometryWithId } from "@/stores/modularWorker"



type ModelProps = {
  geometries: GeometryWithId[]
}

export default function Model({ geometries }: ModelProps) {
  
  


  return (
    <group rotation={[0, 0, 0]}>
      {geometries.map((geometry, index) => (
        <mesh
          key={index}
          geometry={geometry.geometry}
          rotation={[-Math.PI / 2, 0, 0]}>
          <meshStandardMaterial
            color={"#e5ba4d"}
            metalness={0.9}
            roughness={0.1}
            envMapIntensity={1.5}
          />
        </mesh>
      ))}
      
    </group>
  )
}
