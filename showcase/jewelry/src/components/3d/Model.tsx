import { GeometryWithId } from '@/stores/modularWorker'
import { useRingStore } from '@/stores/ring'
import { useMemo } from 'react'

type ModelProps = {
  geometries: GeometryWithId[]
}

export default function Model({ geometries }: ModelProps) {
  const { material } = useRingStore()
  const previewGeometries = geometries.filter(g => g.label !== 'mesh')

  const getMaterialColor = (mat: string) => {
    if (mat === 'gold') return '#e5ba4d'
    if (mat === 'silver') return '#c2bfbf'
    if (mat === 'platinum') return '#c6d9da'
    return '#e5ba4d'
  }

  const color = useMemo(() => {
    return getMaterialColor(material)
  }, [material])

  return (
    <group rotation={[0, 0, 0]}>
      {previewGeometries.map((geometry, index) => (
        <mesh
          key={`${index}-${material}`}
          geometry={geometry.geometry}
          rotation={[-Math.PI / 2, 0, 0]}>
          <meshStandardMaterial
            color={color}
            metalness={0.9}
            roughness={0.2}
            envMapIntensity={1.5}
          />
        </mesh>
      ))}
    </group>
  )
}
