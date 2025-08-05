import { GeometryWithId } from "@/stores/modular"
import { useNozzleStore } from "@/stores/nozzle"
import Dim3d from "./Dim3d"
import CircleDim3d from "./CircleDim3d"
import { useSettingsStore } from "@/stores/settings"


type ModelProps = {
  geometries: GeometryWithId[]
}

export default function Model({ geometries }: ModelProps) {
  const {material, outerSize, length, tipInnerSize, tipOuterSize} = useNozzleStore()
  const {propertyHover} = useSettingsStore()
  const r = ((outerSize / 2) * Math.sqrt(3)) / 2.0
  const tipHeight = r+2.8


  return (
    <group rotation={[0, 0, 0]}>
      {geometries.map((geometry, index) => (
        <mesh
          key={index}
          geometry={geometry.geometry}
          rotation={[-Math.PI / 2, 0, 0]}>
          <meshStandardMaterial
            color={material === "high-wear-steel" ? "#808080" : "#e5ba4d"}
            metalness={0.9}
            roughness={0.1}
            envMapIntensity={1.5}
          />
        </mesh>
      ))}
      
    </group>
  )
}
