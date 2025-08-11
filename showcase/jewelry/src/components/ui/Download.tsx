import { useModularWorkerStore } from '@/stores/modularWorker'
import { motion, useAnimation } from 'framer-motion'

import { useCallback } from 'react'
import { DoubleSide, Mesh, MeshStandardMaterial, Object3D } from 'three'
import { STLExporter } from 'three-stdlib'
import Icon from './Icon'

export const Download = () => {
  const { geometries, currentType } = useModularWorkerStore()
  const meshes = geometries.filter(g => g.label === 'mesh')

  const handleDownload = useCallback(() => {
    // const mesh = geometries.filter(g => g.label === "mesh")
    // if (mesh.length === 0) return
    // const geometry = mesh[0].geometry
    // const mesh = new Mesh(geometry, new Material())
    // const scene = new Scene()
    const mesh = meshes.map(
      m => new Mesh(m.geometry, new MeshStandardMaterial({ side: DoubleSide }))
    )
    const root = new Object3D()
    root.add(...mesh)
    const exporter = new STLExporter()
    const data = exporter.parse(root)
    const blob = new Blob([data], {
      type: 'application/octet-stream',
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${currentType}.stl`
    a.click()
    URL.revokeObjectURL(url)
  }, [geometries])

  // 枠＆グローの回転コントロール
  const ringCtrl = useAnimation()
  const glowCtrl = useAnimation()

  const spinOnce = async () => {
    // 0 → 180（半周）→ 0 に戻す
    await Promise.all([
      ringCtrl.start({
        left: '100%',
        opacity: 1,
        transition: { duration: 0.6, ease: 'linear' },
      }),
      glowCtrl.start({
        left: '100%',
        opacity: 1,
        transition: { duration: 0.6, ease: 'linear' },
      }),
    ])
    ringCtrl.set({ left: '-100%', opacity: 0.2 })
    glowCtrl.set({ left: '-100%', opacity: 0.2 })
  }

  const disabled = meshes.length === 0

  return (
    // <button disabled={meshes.length === 0} onClick={handleDownload} className="t-button z-10">
    //   Download STL
    // </button>
    <motion.button
      disabled={disabled}
      onClick={handleDownload}
      onHoverStart={spinOnce} // ← ホバー時に1周だけ回す
      className="t-button z-10 w-36 h-10 right-8 top-8 absolute p-2"
      style={{
        // position: 'relative',

        borderRadius: '12px',
        background: '#eeeeee', // ライトテーマ
        color: '#111827',
        // border: '1px solid #e5e7eb',
        // boxShadow: '0 1px 2px rgba(0,0,0,.04), 0 8px 24px rgba(17,24,39,.06)',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        overflow: 'hidden',
        isolation: 'isolate',
      }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      whileHover={disabled ? {} : { scale: 1.02 }}>
      {/* 光る枠（ライト寄りのグラデ） */}
      {/* <motion.div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: 'inherit',
          padding: '2px',
          background:
            'conic-gradient(from 0deg, #60a5fa, #93c5fd, #a78bfa, #f0abfc, #fbbf24, #10b981, #60a5fa)',
          WebkitMask: 'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)',
          WebkitMaskComposite: 'xor',
          maskComposite: 'exclude',
          zIndex: -1,
        }}
        initial={{ rotate: 0 }}
        animate={ringCtrl}
      /> */}

      {/* ぼかしの光（控えめ・ライト向け） */}
      <motion.div
        style={{
          position: 'absolute',
          inset: '-1px',
          borderRadius: 'inherit',
          background:
            'conic-gradient(from 0deg, #daa520, #c0c0c0, #a9a9a9, #e5e4e2, #daa520, #c0c0c0, #bcc6cc)',
          filter: 'blur(10px) saturate(130%)',

          rotate: 45,
          zIndex: -2,
        }}
        initial={{ left: '-200%' }}
        animate={glowCtrl}
        // whileHover={{ opacity: 0.75 }}
      />

      <motion.span className="absolute inset-[2px] z-10 bg-[#eeeeee] rounded-[8px] font-serif flex gap-1 items-center justify-center">
        <Icon name="download" className="stroke-[.5px] size-6" />
        Download STL
      </motion.span>
    </motion.button>
  )
}
