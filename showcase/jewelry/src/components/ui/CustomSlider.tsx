import React, { useRef, useEffect, useState, useCallback } from 'react'
import { useDebounce } from 'use-debounce'

interface CustomSliderProps {
  min: number
  max: number
  step: number
  value: number
  onChange: (value: number) => void
  className?: string
}

const CustomSlider: React.FC<CustomSliderProps> = ({
  min,
  max,
  step,
  value,
  onChange,
  className = ""
}) => {
  const sliderRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [debouncedValue, setDebouncedValue] = useDebounce(value, 10)

  useEffect(() => {
    if (sliderRef.current) {
      const progress = ((value - min) / (max - min)) * 100
      sliderRef.current.style.setProperty('--progress', `${progress}%`)
    }
  }, [value, min, max])

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    e.stopPropagation()
    setIsDragging(true)
    if (sliderRef.current) {
      sliderRef.current.focus()
    }
  }, [])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDragging || !sliderRef.current) return
    
    e.preventDefault()
    e.stopPropagation()
    
    const touch = e.touches[0]
    const rect = sliderRef.current.getBoundingClientRect()
    const percent = Math.max(0, Math.min(1, (touch.clientX - rect.left) / rect.width))
    const newValue = min + percent * (max - min)
    const steppedValue = Math.round(newValue / step) * step
    setDebouncedValue(Math.max(min, Math.min(max, steppedValue)))
  }, [isDragging, min, max, step, setDebouncedValue])

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false)
  }, [])

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setDebouncedValue(Number(e.target.value))
  }, [setDebouncedValue])

  useEffect(() => {
    if (debouncedValue !== value) {
      onChange(debouncedValue)
    }
  }, [debouncedValue, onChange, value])

  return (
    <input
      ref={sliderRef}
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={handleChange}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className={`custom-slider ${className}`}
      style={{
        '--progress': `${((value - min) / (max - min)) * 100}%`
      } as React.CSSProperties}
    />
  )
}

export default CustomSlider