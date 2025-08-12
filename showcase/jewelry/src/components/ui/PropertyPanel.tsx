import sizes from '@/assets/jsons/size.json'
import { useModularWorkerStore } from '@/stores/modularWorker'
import { Material, useRingStore } from '@/stores/ring'
import { motion } from 'framer-motion'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Tooltip } from 'react-tooltip'
import CustomSlider from './CustomSlider'

export const PropertyPanel: React.FC = () => {
  const { nodes, updateNodeProperty, nodeIds, currentType } = useModularWorkerStore()
  const navigate = useNavigate()

  const {
    material,
    size,
    braidParameters,
    bypassParameters,
    twistParameters,
    setBraidParameters,
    setBypassParameters,
    setTwistParameters,
    setMaterial,
    setSize,
  } = useRingStore()
  const types = ['braid', 'bypass', 'twist']
  const materials = [
    {
      label: 'gold',
      image: '/images/gold_t.png',
      color: '#e5ba4d',
    },
    {
      label: 'silver',
      image: '/images/silver_t.png',
      color: '#c2bfbf',
    },
    {
      label: 'platinum',
      image: '/images/platinum_t.png',
      color: '#c6d9da',
    },
  ]
  const [currentMenu, setCurrentMenu] = useState(0)
  const [menuOpen, setMenuOpen] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)

  const updateParameteStore = useCallback(
    (label: string, value: number) => {
      if (currentType === 'braid') {
        if (label === 'innerDiameter')
          setBraidParameters({ ...braidParameters, innerDiameter: value })
        if (label === 'waveCount') setBraidParameters({ ...braidParameters, waveCount: value })
        if (label === 'waveSize') setBraidParameters({ ...braidParameters, waveSize: value })
        if (label === 'width') setBraidParameters({ ...braidParameters, width: value })
        if (label === 'thickness') setBraidParameters({ ...braidParameters, thickness: value })
        if (label === 'ringCount') setBraidParameters({ ...braidParameters, ringCount: value })
      } else if (currentType === 'bypass') {
        if (label === 'innerDiameter')
          setBypassParameters({ ...bypassParameters, innerDiameter: value })
        if (label === 'startWidth') setBypassParameters({ ...bypassParameters, startWidth: value })
        if (label === 'endWidth') setBypassParameters({ ...bypassParameters, endWidth: value })
        if (label === 'length') setBypassParameters({ ...bypassParameters, length: value })
        if (label === 'gap') setBypassParameters({ ...bypassParameters, gap: value })
        if (label === 'thickness') setBypassParameters({ ...bypassParameters, thickness: value })
      } else if (currentType === 'twist') {
        if (label === 'innerDiameter')
          setTwistParameters({ ...twistParameters, innerDiameter: value })
        if (label === 'thicknessBottom')
          setTwistParameters({ ...twistParameters, thicknessBottom: value })
        if (label === 'thicknessTop')
          setTwistParameters({ ...twistParameters, thicknessTop: value })
        if (label === 'twist') setTwistParameters({ ...twistParameters, twist: value })
        if (label === 'polygon') setTwistParameters({ ...twistParameters, polygon: value })
      }
    },
    [
      currentType,
      braidParameters,
      bypassParameters,
      twistParameters,
      setBraidParameters,
      setBypassParameters,
      setTwistParameters,
    ]
  )

  const getParameterValue = useCallback(
    (label: string) => {
      if (currentType === 'braid') {
        if (label === 'innerDiameter') return braidParameters.innerDiameter
        if (label === 'waveCount') return braidParameters.waveCount
        if (label === 'waveSize') return braidParameters.waveSize
        if (label === 'width') return braidParameters.width
        if (label === 'thickness') return braidParameters.thickness
        if (label === 'ringCount') return braidParameters.ringCount
      } else if (currentType === 'bypass') {
        if (label === 'innerDiameter') return bypassParameters.innerDiameter
        if (label === 'startWidth') return bypassParameters.startWidth
        if (label === 'endWidth') return bypassParameters.endWidth
        if (label === 'length') return bypassParameters.length
        if (label === 'gap') return bypassParameters.gap
        if (label === 'thickness') return bypassParameters.thickness
      } else if (currentType === 'twist') {
        if (label === 'innerDiameter') return twistParameters.innerDiameter
        if (label === 'thicknessBottom') return twistParameters.thicknessBottom
        if (label === 'thicknessTop') return twistParameters.thicknessTop
        if (label === 'twist') return twistParameters.twist
        if (label === 'polygon') return twistParameters.polygon
      }
      return undefined;
    },
    [currentType, braidParameters, bypassParameters, twistParameters]
  )

  // 外部クリックを検出してメニューを閉じる
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        setMenuOpen(false)
      }
    }

    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [menuOpen])

  const handleChange = useCallback(
    (id: string, value: number) => {
      updateNodeProperty(id, value)
    },
    [updateNodeProperty]
  )

  const handleParameterUpdate = useCallback(
    (paramName: string, value: number) => {
      updateParameteStore(paramName, value)

      // nodeのプロパティも更新
      const node = nodes.find(n => n.label === paramName)
      if (node !== undefined) {
        handleChange(node.id, value)
      }
    },
    [updateParameteStore, nodes, handleChange]
  )

  const paramsDom = useMemo(() => {
    const nodeParamsDom = nodes
      .map(node => {
        const { properties } = node
        const property = properties.find(prop => prop.name === 'value')
        if (property === undefined) {
          return null
        }

        const { value } = property
        if (node.label !== undefined && node.label.trim() !== '' && value.type === 'Number') {
          if (node.label === 'innerDiameter') return null
          const range = properties.find(prop => prop.name === 'range')
          const step = properties.find(prop => prop.name === 'step')

          if (range?.value.type === 'Vector2d' && step?.value.type === 'Number') {
            const v = getParameterValue(node.label)
            return v !== undefined ? (
              <div
                className="grid grid-cols-[minmax(0,_1fr)_minmax(62px,_1fr)_minmax(36px,_auto)] items-center"
                key={node.id}>
                <p className="text-content-h-a text-sm">{node.label}</p>

                <CustomSlider
                  min={range.value.content[0]}
                  max={range.value.content[1]}
                  step={step.value.content}
                  value={v}
                  onChange={value => {
                    if (typeof node.label === 'string') {
                      handleParameterUpdate(node.label, value)
                    }
                  }}
                />
                <span className="w-9 text-right block">{v !== undefined ? v : value.content}</span>
              </div>
            ) : null
          }
        }
        return null
      })
      .filter(Boolean)

    return nodeParamsDom
  }, [nodes, handleParameterUpdate, getParameterValue])

  const handleChangeGraph = useCallback(
    (graph: string) => {
      navigate(`/${graph}`)
    },
    [navigate]
  )

  const handleSizeUpdate = useCallback(
    (value: number, locale: string) => {
      handleChange(nodeIds.innerDiameter, value)
      setSize(value, locale)
    },
    [handleChange, setSize]
  )

  return (
    <div className="absolute bottom-24 inset-x-0 z-10 font-serif" ref={panelRef}>
      <motion.div
        layout
        className={`relative gap-0 justify-center  rounded-full w-fit mx-auto items-center h-16 ${
          menuOpen
            ? 'grid grid-rows-1 [grid-template-columns:repeat(3,120px)] bg-surface-sheet-l'
            : 'flex cursor-pointer scale-100 bg-surface-sheet-h'
        }`}
        animate={{
          width: menuOpen ? 360 : 50,
          height: menuOpen ? 64 : 50,
        }}
        transition={{
          type: 'spring',
          visualDuration: 0.2,
          bounce: 0.2,
        }}
        whileHover={!menuOpen ? { scale: 1.05 } : {}}
        onClick={() => !menuOpen && setMenuOpen(true)}>
        {!menuOpen && <motion.div className="shadow"></motion.div>}
        {menuOpen && (
          <>
            <motion.div
              layout
              style={{
                justifyContent:
                  currentMenu === 0 ? 'flex-start' : currentMenu === 1 ? 'center' : 'flex-end',
              }}
              className={`pointer-events-none absolute inset-0 flex items-center`}>
              <motion.div
                className={`bg-white rounded-full w-[120px] h-full -z-10`}
                layout
                transition={{
                  type: 'spring',
                  visualDuration: 0.2,
                  bounce: 0.2,
                }}></motion.div>
            </motion.div>
            <p
              className={`cursor-pointer text-center p-2 flex flex-col items-center justify-center${
                currentMenu == 0 ? 'text-content-h-a' : 'text-content-l-a hover:text-content-h-a'
              } transition-all`}
              onClick={() => setCurrentMenu(0)}>
              <span className="text-xs">{size.locale.toUpperCase() + ' size'}</span>

              <span className="text-lg">{size.label}</span>
            </p>
            <div
              className={`cursor-pointer p-2 relative flex gap-2 justify-center items-center ${
                currentMenu == 1 ? 'text-content-h-a' : 'text-content-l-a hover:text-content-h-a'
              } transition-all`}
              onClick={() => setCurrentMenu(1)}>
              <img src={`/images/${currentType}.svg`} alt="design" className="size-10" />
              <span>{currentType}</span>
            </div>
            <div
              className={`cursor-pointer flex items-center gap-2 p-2 justify-center ${
                currentMenu == 2 ? 'text-content-h-a' : 'text-content-l-a hover:text-content-h-a'
              } transition-all`}
              onClick={() => setCurrentMenu(2)}>
              <img
                src={materials.find(m => m.label === material)?.image}
                alt=""
                className="size-12 rounded-full"
              />
              <p>{materials.find(m => m.label === material)?.label}</p>
            </div>
            <motion.ul
              className={`absolute bottom-20 bg-surface-sheet-h rounded-3xl p-4 backdrop-blur-md ${
                currentMenu === 1 ? 'w-80' : 'min-w-[160px]'
              }`}
              animate={{ 
                x: `-${currentMenu * 50}%`,
                left: `${currentMenu * 180}px`
              }}
              transition={{
                type: 'spring',
                visualDuration: 0.2,
                bounce: 0.2,
              }}>
              {currentMenu === 0 && (
                <>
                  <li className="grid [grid-template-columns:repeat(3,64px)] text-center text-xl border-b-[0.5px] border-content-l-a p-2">
                    <span>🇯🇵</span>
                    <span>🇺🇸</span>
                    <span>🇪🇺</span>
                  </li>
                  {sizes.sizes.map(size => (
                    <li
                      key={size.value}
                      className={`cursor-pointer grid [grid-template-columns:repeat(3,64px)] text-center hover:bg-content-xxl-a rounded-lg p-2`}>
                      <span
                        onClick={() => handleSizeUpdate(size.value, 'jp')}
                        className="text-content-l-a hover:text-content-h-a">
                        {size.jp}
                      </span>
                      <span
                        onClick={() => handleSizeUpdate(size.value, 'us')}
                        className="text-content-l-a hover:text-content-h-a">
                        {size.us}
                      </span>
                      <span
                        onClick={() => handleSizeUpdate(size.value, 'eu')}
                        className="text-content-l-a hover:text-content-h-a">
                        {size.eu}
                      </span>
                    </li>
                  ))}
                </>
              )}

              {currentMenu === 1 && (
                <li className="flex gap-2 flex-col">
                  <div className="flex gap-2 justify-center">
                    {types.map(type => (
                      <div
                        className="cursor-pointer text-center p-4 relative"
                        onClick={() => handleChangeGraph(type)}
                        key={type}
                        data-tooltip-content={type}
                        data-tooltip-id="hint-tooltip"
                        data-tooltip-offset={-5}>
                        {/* <Icon name={`${type}`} className="size-10" /> */}
                        <img src={`/images/${type}.svg`} alt={type} className="size-12" />
                        {type === currentType && (
                          <span className="size-1.5 rounded-full bg-content-h-a block absolute top-2 m-0 -translate-y-1/2 left-1/2 -translate-x-1/2"></span>
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="flex flex-col gap-2">{paramsDom}</div>
                </li>
              )}
              {currentMenu === 2 &&
                materials.map(m => (
                  <li
                    key={m.label}
                    className="cursor-pointer flex gap-2 items-center p-2 bg-transparent hover:bg-content-xxl-a transition-all rounded-2xl"
                    onClick={() => setMaterial(m.label as Material)}>
                    <img src={m.image} alt={m.label} className="size-12 rounded-full " />
                    <p>{m.label}</p>
                  </li>
                ))}
            </motion.ul>
          </>
        )}
      </motion.div>

      <Tooltip
        id="hint-tooltip"
        place="bottom"
        className="text-xs"
        style={{
          backgroundColor: '#1C1C1C',
          color: '#ffffff',
          fontSize: '12px',
          padding: '2px 4px 2px 4px',
          borderRadius: '4px',
          userSelect: 'none',
        }}
        noArrow
      />
    </div>
  )
}
