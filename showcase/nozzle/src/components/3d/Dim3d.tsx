import React from "react"
import { Vector3 } from "three"
import { Line, Text } from "@react-three/drei"
import { useSettingsStore } from "@/stores/settings"

interface Dim3dProps {
  pointA: [number, number, number] | Vector3
  pointB: [number, number, number] | Vector3
  label: string
  value?: number
  color?: string
  lineWidth?: number
  active: boolean
  offset?: number // オフセット値を設定するプロパティ
  
}

// ラベルタイプの判定ヘルパー
const isWidthType = (label: string) => label === "width"
const isDepthType = (label: string) => label === "depth"
const isHeightType = (label: string) => label === "height"
const isXYPlane = (label: string) => isWidthType(label) || isDepthType(label)

const Dim3d: React.FC<Dim3dProps> = ({
  pointA,
  pointB,
  label,
  value,
  active = false,
  color = active ? "#4597F7" : "#999",
  lineWidth = active ? 2 : 1,
  offset = 10, // デフォルトオフセット値
  
}) => {
  const {isRulerOn} = useSettingsStore()
  // Vector3オブジェクトに変換
  const vecA = pointA instanceof Vector3 ? pointA : new Vector3(...pointA)
  const vecB = pointB instanceof Vector3 ? pointB : new Vector3(...pointB)

  // A→Bベクトル
  const vecAB = new Vector3().subVectors(vecB, vecA)

  // 回転軸を決定
  const rotationAxis = isXYPlane(label)
    ? new Vector3(0, 0, 1)
    : new Vector3(1, 0, 0)

  // A→Bを90度回転させたベクトル（正規化して長さoffsetに設定）
  const vecRotatedFromA = vecAB
    .clone()
    .applyAxisAngle(rotationAxis, -Math.PI / 2)
    .normalize()
    .multiplyScalar(offset)

  // B→Aを90度回転させたベクトル（正規化してoffset長さに設定）
  const vecRotatedFromB = vecAB
    .clone()
    .negate()
    .applyAxisAngle(rotationAxis, Math.PI / 2)
    .normalize()
    .multiplyScalar(offset)

  // 点C: オフセット後のAから回転ベクトルを加えた点
  const vecC = new Vector3().addVectors(vecA, vecRotatedFromA)

  // 点D: オフセット後のBから回転ベクトルを加えた点
  const vecD = new Vector3().addVectors(vecB, vecRotatedFromB)

  // 基準平面に合わせて座標を調整
  if (isXYPlane(label)) {
    // XY平面の場合、Z座標を揃える
    vecC
      .setX(vecA.x)
      .setY(vecA.y)
      .setZ(vecA.z - offset)
    vecD
      .setX(vecB.x)
      .setY(vecB.y)
      .setZ(vecB.z - offset)
  } else {
    // YZ平面の場合、X座標を揃える
    vecC.setX(vecA.x)
    vecD.setX(vecB.x)
  }

  // 両端点からの補助線中間点を計算
  const midAC = new Vector3().copy(vecA).lerp(vecC, 0.7)
  const midBD = new Vector3().copy(vecB).lerp(vecD, 0.7)

  // 寸法線上の中点（ラベル位置）
  const labelPosition = new Vector3()
    .addVectors(midAC, midBD)
    .multiplyScalar(0.5)

  // テキスト位置の調整
  const textOffsetFactor = 0.4
  if (isWidthType(label)) {
    labelPosition.y -= offset * textOffsetFactor
  } else if (isDepthType(label)) {
    labelPosition.x += offset * textOffsetFactor
  } else if (isHeightType(label)) {
    labelPosition.y += offset * textOffsetFactor
  }

  // ラベルの回転角度を設定
  const labelRotation: [number, number, number] = isWidthType(label)
    ? [Math.PI / 2, 0, 0]
    : isDepthType(label)
    ? [0, Math.PI / 2, Math.PI / 2]
    : [Math.PI / 2, Math.PI / 2, 0]

  // テキストのアンカー位置を設定
  const anchorX = isXYPlane(label) ? "center" : "left"
  const anchorY = "middle"

  // 寸法線のポイント配列
  const points = [midAC, midBD]

  return (
    
    (isRulerOn && (
      <>
        {/* 寸法線 */}
        <Line points={points} color={color} lineWidth={lineWidth} />

        {/* 補助線1: A to C */}
        <Line
          points={[vecA, vecC]}
          color={color}
          lineWidth={lineWidth}
          dashed={false}
        />

        {/* 補助線2: B to D */}
        <Line
          points={[vecB, vecD]}
          color={color}
          lineWidth={lineWidth}
          dashed={false}
        />

        {/* ラベルテキスト */}
        <Text
          color={active ? "#4597F7" : "#999"}
          anchorX={"center"}
          anchorY={"bottom-baseline"}
          position={labelPosition}
          fontSize={2}
          rotation={labelRotation}>
          {value}
        </Text>
      </>
    ))
  )
}

export default Dim3d
