import { GeometryWithId } from '@/stores/modularWorker'
import { useRingStore } from '@/stores/ring'

type ModelProps = {
  geometries: GeometryWithId[]
}

export default function Model({ geometries }: ModelProps) {
  const { material } = useRingStore()

  const getMaterialColor = (mat: string) => {
    if (mat === 'gold') return '#e5ba4d'
    if (mat === 'silver') return '#c2bfbf'
    if (mat === 'platinum') return '#c6d9da'
    return '#e5ba4d'
  }

  return (
    <group rotation={[0, 0, 0]}>
      {geometries.map((geometry, index) => (
        <mesh
          key={`${index}-${material}`}
          geometry={geometry.geometry}
          rotation={[-Math.PI / 2, 0, 0]}>
          <meshStandardMaterial
            color={getMaterialColor(material)}
            metalness={0.9}
            roughness={0.2}
            envMapIntensity={1.5}
          />
        </mesh>
      ))}
    </group>
  )
}
