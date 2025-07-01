import { useLoader } from "@react-three/fiber"
import { TextureLoader, RepeatWrapping } from "three"
import { useEffect } from "react"
import { MeshTransmissionMaterial } from "@react-three/drei"

type ImagePlaneProps = {
  position?: [number, number, number]
  rotation?: [number, number, number]
  scale?: number
  width: number
  height: number
}

export const ImagePlane = ({ 
  position = [0, 0, 0], 
  rotation = [0, 0, 0],
  scale = 1,
  width,
  height
}: ImagePlaneProps) => {
  const texture = useLoader(TextureLoader, "/images/about006.png")

  useEffect(() => {
    if (!texture.image) return

    texture.wrapS = RepeatWrapping
    texture.wrapT = RepeatWrapping
    
    // 画像とPlaneのアスペクト比を計算
    const imageAspect = texture.image.width / texture.image.height
    const planeAspect = width / height

    if (imageAspect > planeAspect) {
      // 画像の方が横長の場合、高さに合わせる
      const scale = planeAspect / imageAspect
      texture.repeat.set(scale, 1)
      texture.offset.set((1 - scale) / 2, 0)
    } else {
      // 画像の方が縦長の場合、幅に合わせる
      const scale = imageAspect / planeAspect
      texture.repeat.set(1, scale)
      texture.offset.set(0, (1 - scale) / 2)
    }
  }, [texture, width, height])

  return (
    <>
      <mesh position={position} rotation={rotation}>
        <planeGeometry args={[width * scale, height * scale]} />
        <meshBasicMaterial map={texture} transparent={true} />
      </mesh>
      <mesh position={[position[0],position[1],position[2]+0.05]} rotation={rotation}>
        <boxGeometry args={[width * scale, height * scale, 0.05]} />
        <MeshTransmissionMaterial 
          thickness={0.2}
          roughness={0}
          transmission={1}
          ior={1.2}
          chromaticAberration={0.02}
          backside={true}
        />
      </mesh>
    </>
  )
} 