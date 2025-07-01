import { useSettingsStore } from "../stores/settings"

// 小数点以下第2位で四捨五入
function truncate(value: number, precision: number = 1e2): number {
  return Math.floor(value * precision) / precision
}

// Rust <-> Three.jsのスケール変換を一箇所で管理
const useConversion = () => {
  const unitValue = useSettingsStore((state) => state.unit)
  // Three.jsのスケール(scale:1=100mm)をRust側のスケール（実寸）に変換
  const unit = (value: number) => truncate(value * unitValue)
  // Rustのスケール(実寸)をThree.js側のスケール(scale:1=100mm)に変換
  const deunit = (value: number) => truncate(value / unitValue)

  const rad2Deg = (rad: number) => truncate((rad * 180) / Math.PI, 1e1)
  const deg2Rad = (deg: number) => truncate((deg * Math.PI) / 180)

  return { unit, deunit, rad2Deg, deg2Rad, truncate }
}

export default useConversion
