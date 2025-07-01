import React, { Suspense, lazy, memo } from "react"

// アイコンコンポーネントのキャッシュ
const iconCache: Record<string, React.ComponentType<any>> = {}

// アイコンを取得する関数（キャッシュがあれば再利用）
const loadIcon = (name: string) => {
  if (!iconCache[name]) {
    iconCache[name] = lazy(() => import(`../../../assets/icons/${name}.svg`))
  }
  return iconCache[name]
}

interface IconProps {
  name: string // SVGファイル名 (拡張子なし)
  color?: string // 上書き可能な色
  strokeWidth?: number // 上書き可能な線の太さ
  size?: number // アイコンのサイズ (幅と高さ)
  className?: string // 任意のクラス名
  onClick?: () => void // クリックイベントハンドラー
}

const Icon: React.FC<IconProps> = memo(
  ({ name, size = 24, className = "", onClick }) => {
    // キャッシュからアイコンを取得または新たにロード
    const SvgIcon = loadIcon(name)

    return (
      <Suspense fallback={<div className={`w-${size} h-${size}`} />}>
        <SvgIcon
          className={`w-${size} h-${size} ${className}`}
          onClick={onClick}
        />
      </Suspense>
    )
  }
)

export default Icon
