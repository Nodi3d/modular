import React, { useEffect, useState } from "react"

import { Tooltip } from "react-tooltip"
import { motion } from "framer-motion"

import {  useModularStore } from "@/stores/modular"
import { Material, useNozzleStore } from "@/stores/nozzle"
import { useSettingsStore } from "@/stores/settings"
import CustomSlider from "./CustomSlider"

export const PropertyPanel: React.FC = () => {
  const {updateNodeProperty,nodeIds} = useModularStore()
  const {length,outerSize,tipInnerSize,tipOuterSize,needleLength,updateNozzle,material} = useNozzleStore()
  const {propertyHover, setPropertyHover} = useSettingsStore()
  
  useEffect(()=>{
    if (nodeIds.length&&nodeIds.outerSize&&nodeIds.tipInnerSize&&nodeIds.tipOuterSize&&nodeIds.needleLength){
      updateNodeProperty(nodeIds.length, length)
      updateNodeProperty(nodeIds.outerSize, outerSize)
      updateNodeProperty(nodeIds.tipInnerSize, tipInnerSize)
      updateNodeProperty(nodeIds.tipOuterSize, tipOuterSize)
      updateNodeProperty(nodeIds.needleLength, needleLength)
    }
  },[length,outerSize,tipInnerSize,tipOuterSize,needleLength,nodeIds])  

  return (
    <>
      <motion.div
        className={`absolute h-auto top-2 md:top-8 left-0 md:left-8 w-full md:w-64 p-4 py-0 md:py-2 z-20 rounded-md backdrop-blur-sm flex flex-col gap-2 items-center justify-center font-serif text-content-h-a`}
        layout>
        <div className="grid grid-cols-[minmax(0,_1fr)_repeat(2,_minmax(62px,_1fr))] gap-2 items-center w-full">
          <label className="text-sm" htmlFor="material">
            材質
          </label>
          <div className="t-tabs col-span-2 text-sm">
            <button
              className={material === "bronze" ? "t-tab-active" : ""}
              onClick={() => updateNozzle({ material: "bronze" as Material })}>
              真鍮
            </button>
            <span className="bg-transparent"></span>
            <button
              className={material === "high-wear-steel" ? "t-tab-active" : ""}
              onClick={() =>
                updateNozzle({ material: "high-wear-steel" as Material })
              }>
              高耐摩耗鋼
            </button>
          </div>
        </div>
        <div
          className="grid grid-cols-[minmax(0,_1fr)_repeat(2,_minmax(62px,_1fr))] gap-2 items-center w-full"
          onMouseEnter={() =>
            setPropertyHover({ ...propertyHover, length: true })
          }
          onMouseLeave={() =>
            setPropertyHover({ ...propertyHover, length: false })
          }>
          <label className="text-sm" htmlFor="length">
            全長
          </label>
          <div className="relative">
            <input
              type="text"
              value={length}
              onChange={(e) => {
                updateNozzle({ length: Number(e.target.value) })
              }}
              className="t-input bg-content-xxl-a w-full"
            />
            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px]">
              mm
            </span>
          </div>
          <CustomSlider
            min={10}
            max={20}
            step={0.1}
            value={length}
            onChange={(value) => {
              updateNozzle({ length: value })
              // updateNodeProperty(nodeIds.holeSize, value)
            }}
          />
        </div>
        <div
          className="grid grid-cols-[minmax(0,_1fr)_repeat(2,_minmax(62px,_1fr))] gap-2 items-center w-full"
          onMouseEnter={() =>
            setPropertyHover({ ...propertyHover, outerSize: true })
          }
          onMouseLeave={() =>
            setPropertyHover({ ...propertyHover, outerSize: false })
          }>
          <label className="text-sm" htmlFor="maxOuterDiameter">
            最大外径
          </label>
          <div className="relative">
            <input
              type="text"
              value={outerSize}
              onChange={(e) => {
                updateNozzle({ outerSize: Number(e.target.value) })
              }}
              className="t-input bg-content-xxl-a w-full"
            />
            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px]">
              mm
            </span>
          </div>
          <CustomSlider
            min={6}
            max={10}
            step={0.1}
            value={outerSize}
            onChange={(value) => {
              updateNozzle({ outerSize: value })
              // updateNodeProperty(nodeIds.nozzleSize, value)
            }}
          />
        </div>
        <div
          className="grid grid-cols-[minmax(0,_1fr)_repeat(2,_minmax(62px,_1fr))] gap-2 items-center w-full"
          onMouseEnter={() =>
            setPropertyHover({ ...propertyHover, tipInnerSize: true })
          }
          onMouseLeave={() =>
            setPropertyHover({ ...propertyHover, tipInnerSize: false })
          }>
          <label className="text-sm" htmlFor="tipInnerDiameter">
            先端部内径
          </label>
          <div className="relative">
            <input
              type="text"
              value={tipInnerSize}
              onChange={(e) => {
                updateNozzle({ tipInnerSize: Number(e.target.value) })
              }}
              className="t-input bg-content-xxl-a w-full"
            />
            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px]">
              mm
            </span>
          </div>
          <CustomSlider
            min={0.1}
            max={tipOuterSize}
            step={0.1}
            value={tipInnerSize}
            onChange={(value) => {
              updateNozzle({ tipInnerSize: value })
              // updateNodeProperty(nodeIds.nozzleSize, value)
            }}
          />
        </div>
        <div
          className="grid grid-cols-[minmax(0,_1fr)_repeat(2,_minmax(62px,_1fr))] gap-2 items-center col-span-2 w-full"
          onMouseEnter={() =>
            setPropertyHover({ ...propertyHover, tipOuterSize: true })
          }
          onMouseLeave={() =>
            setPropertyHover({ ...propertyHover, tipOuterSize: false })
          }>
          <label className="text-sm" htmlFor="tipOuterDiameter">
            先端部外径
          </label>
          <div className="relative">
            <input
              type="text"
              value={tipOuterSize}
              onChange={(e) => {
                updateNozzle({ tipOuterSize: Number(e.target.value) })
              }}
              className="t-input bg-content-xxl-a w-full"
            />
            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px]">
              mm
            </span>
          </div>
          <CustomSlider
            min={tipInnerSize}
            max={1}
            step={0.1}
            value={tipOuterSize}
            onChange={(value) => {
              updateNozzle({ tipOuterSize: value })
              // updateNodeProperty(nodeIds.nozzleSize, value)
            }}
          />
        </div>
        <div
          className="grid grid-cols-[minmax(0,_1fr)_repeat(2,_minmax(62px,_1fr))] gap-2 items-center w-full"
          onMouseEnter={() =>
            setPropertyHover({ ...propertyHover, needleLength: true })
          }
          onMouseLeave={() =>
            setPropertyHover({ ...propertyHover, needleLength: false })
          }>
          <label className="text-sm" htmlFor="tipNeedleLength">
            先端針長さ
          </label>
          <div className="relative">
            <input
              type="text"
              value={needleLength}
              onChange={(e) => {
                updateNozzle({ needleLength: Number(e.target.value) })
              }}
              className="t-input bg-content-xxl-a w-full"
            />
            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px]">
              mm
            </span>
          </div>
          <CustomSlider
            min={0.0}
            max={10}
            step={0.01}
            value={needleLength}
            onChange={(value) => {
              updateNozzle({ needleLength: value })
              // updateNodeProperty(nodeIds.nozzleSize, value)
            }}
          />
        </div>
        <a
          className="border-[1px] border-content-h-a px-4 py-2 text-sm hover:bg-content-h-a hover:text-content-dark-h-a w-full mt-2 transition-all text-center"
          href={`https://docs.google.com/forms/d/e/1FAIpQLSf5L-INqDqmH0yHtx1aOoFguA1MpkODBXZIua-5Bm2t3KBU6Q/viewform?usp=pp_url&entry.1225353679=${encodeURIComponent(length)}&entry.11693644=${encodeURIComponent(outerSize)}&entry.1455151050=${encodeURIComponent(tipInnerSize)}&entry.300096431=${encodeURIComponent(tipOuterSize)}&entry.1298909336=${encodeURIComponent(needleLength)}`}
          target={"_blank"}
          >
          ORDER
        </a>

        <Tooltip
          id="hint-tooltip"
          place="bottom"
          className="text-xs"
          style={{
            backgroundColor: "#1C1C1C",
            color: "#ffffff",
            fontSize: "12px",
            padding: "2px 4px 2px 4px",
            borderRadius: "4px",
            userSelect: "none",
          }}
          noArrow
        />
      </motion.div>
    </>
  )
}
