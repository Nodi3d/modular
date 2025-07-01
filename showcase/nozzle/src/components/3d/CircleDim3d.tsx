import React, { useMemo } from "react"
import { Vector3 } from "three"
import { Line, Text } from "@react-three/drei"
import { useSettingsStore } from "@/stores/settings"

interface CircleDim3dProps {
  centerPosition: [number, number, number] | Vector3
  diameter: number
  color?: string
  lineWidth?: number
  active?: boolean
  segments?: number
  textOffset?: number
  position?:'tr'|'tl'|'br'|'bl'
}

const CircleDim3d: React.FC<CircleDim3dProps> = ({
  centerPosition,
  diameter,
  active = false,
  color = active ? "#4597F7" : "#999",
  lineWidth = active ? 2 : 1,
  segments = 64,
  textOffset = 10,
  position = 'tl'
}) => {
  const {isRulerOn} = useSettingsStore()
  // diameterからradiusを計算
  const radius = diameter / 2
  // Vector3オブジェクトに変換
  const center = useMemo(() => 
    centerPosition instanceof Vector3 
      ? centerPosition 
      : new Vector3(...centerPosition),
    [centerPosition]
  )

  // 円の点を生成（XZ平面）
  const circlePoints = useMemo(() => {
    const points: Vector3[] = []
    for (let i = 0; i <= segments; i++) {
      const angle = (i / segments) * Math.PI * 2
      const x = center.x + Math.cos(angle) * radius
      const z = center.z + Math.sin(angle) * radius
      const y = center.y
      points.push(new Vector3(x, y, z))
    }
    return points
  }, [center, radius, segments])

  // テキスト位置（XZ平面を上から見て円の右上、45度の位置）
  const angle45 = position === 'tr' ? Math.PI / 4 : position === 'tl' ? -Math.PI / 4 : position === 'br' ? 3 * Math.PI / 4 : -3 * Math.PI / 4
  const secondPoint = useMemo(() => new Vector3(
    center.x + Math.cos(angle45) * (radius + textOffset),
    center.y,
    center.z + Math.sin(angle45) * (radius + textOffset)
  ), [center, radius, textOffset, angle45])

  // secondPointからcenterPositionに向かうベクトル
  const vectorToCenter = useMemo(() => 
    new Vector3().subVectors(center, secondPoint),
    [center, secondPoint]
  )

  // リーダーラインの終点（secondPointからcenterに向かって、距離-radiusの位置）
  const lineEndPoint = useMemo(() => {
    const distanceToCenter = secondPoint.distanceTo(center)
    const lineLength = distanceToCenter - radius
    const normalizedVector = vectorToCenter.clone().normalize()
    return secondPoint.clone().add(normalizedVector.multiplyScalar(lineLength))
  }, [secondPoint, center, radius, vectorToCenter])

  


  // テキストの回転（XZ平面なので水平に表示）
  const textRotation: [number, number, number] = [-Math.PI / 2, 0, 0]

  const distance = 3

  return (
    isRulerOn&&(
    <>
      {/* 円の描画 */}
      <Line points={circlePoints} color={color} lineWidth={lineWidth} />

      {/* リーダーライン（secondPointからcenterに向かって距離-radiusの長さ） */}
      <Line
        points={[secondPoint, lineEndPoint]}
        color={color}
        lineWidth={lineWidth}
      />
      <Line
        points={[secondPoint, [secondPoint.x+distance, secondPoint.y, secondPoint.z]]}
        color={color}
        lineWidth={lineWidth}
      />

      {/* 半径値のテキスト */}
      <Text
        color={color}
        anchorX="left"
        anchorY="middle"
        position={[secondPoint.x+distance, secondPoint.y, secondPoint.z]}
        fontSize={2}
        rotation={textRotation}>
        Φ {diameter?.toFixed(1) || '0.0'}
      </Text>
    </>
    )
  )
}

export default CircleDim3d