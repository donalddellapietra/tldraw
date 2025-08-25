import { useContainer, useEditor, DefaultColorStyle, DefaultFillStyle } from '@tldraw/editor'
import type { TLDefaultColorStyle } from '@tldraw/tlschema'
import React, { useCallback, useRef, useState, useEffect } from 'react'
import { TldrawUiPopover, TldrawUiPopoverContent, TldrawUiPopoverTrigger } from './TldrawUiPopover'
import { useUiEvents } from '../../context/events'
import { useTranslation } from '../../hooks/useTranslation/useTranslation'
import { TldrawUiButton } from './Button/TldrawUiButton'
import { TldrawUiButtonIcon } from './Button/TldrawUiButtonIcon'

interface FigmaColorPickerProps {
	value: string
	onValueChange: (color: string) => void
	title: string
}

export const TldrawUiFigmaColorPicker = React.memo(function TldrawUiFigmaColorPicker({
	value,
	onValueChange,
	title,
}: FigmaColorPickerProps) {
	const editor = useEditor()
	const container = useContainer()
	const msg = useTranslation()
	const trackEvent = useUiEvents()

	const [isOpen, setIsOpen] = useState(false)
	const [hexValue, setHexValue] = useState(value)
	const [hue, setHue] = useState(0)
	const [saturation, setSaturation] = useState(100)
	const [lightness, setLightness] = useState(50)
	const [alpha, setAlpha] = useState(100)

	const colorWheelRef = useRef<HTMLDivElement>(null)
	const saturationLightnessRef = useRef<HTMLDivElement>(null)
	const hueSliderRef = useRef<HTMLDivElement>(null)
	const alphaSliderRef = useRef<HTMLDivElement>(null)
	const isDragging = useRef(false)
	const dragType = useRef<'wheel' | 'saturation' | 'hue' | 'alpha' | null>(null)

	// Convert hex to HSL
	const hexToHSL = useCallback((hex: string) => {
		const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
		if (!result) return { h: 0, s: 100, l: 50, a: 100 }

		const r = parseInt(result[1], 16) / 255
		const g = parseInt(result[2], 16) / 255
		const b = parseInt(result[3], 16) / 255

		const max = Math.max(r, g, b)
		const min = Math.min(r, g, b)
		let h = 0
		let s = 0
		const l = (max + min) / 2

		if (max !== min) {
			const d = max - min
			s = l > 0.5 ? d / (2 - max - min) : d / (max + min)

			switch (max) {
				case r:
					h = (g - b) / d + (g < b ? 6 : 0)
					break
				case g:
					h = (b - r) / d + 2
					break
				case b:
					h = (r - g) / d + 4
					break
			}
			h /= 6
		}

		return { h: h * 360, s: s * 100, l: l * 100, a: 100 }
	}, [])

	// Convert HSL to hex
	const hslToHex = useCallback((h: number, s: number, l: number) => {
		h /= 360
		s /= 100
		l /= 100

		const c = (1 - Math.abs(2 * l - 1)) * s
		const x = c * (1 - Math.abs((h * 6) % 2 - 1))
		const m = l - c / 2
		let r = 0
		let g = 0
		let b = 0

		if (0 <= h && h < 1) {
			r = c
			g = x
			b = 0
		} else if (1 <= h && h < 2) {
			r = x
			g = c
			b = 0
		} else if (2 <= h && h < 3) {
			r = 0
			g = c
			b = x
		} else if (3 <= h && h < 4) {
			r = 0
			g = x
			b = c
		} else if (4 <= h && h < 5) {
			r = x
			g = 0
			b = c
		} else if (5 <= h && h < 6) {
			r = c
			g = 0
			b = x
		}

		const rHex = Math.round((r + m) * 255).toString(16).padStart(2, '0')
		const gHex = Math.round((g + m) * 255).toString(16).padStart(2, '0')
		const bHex = Math.round((b + m) * 255).toString(16).padStart(2, '0')

		return `#${rHex}${gHex}${bHex}`
	}, [])

	// Map hex color to closest tldraw color
	const hexToTldrawColor = useCallback((hex: string): TLDefaultColorStyle => {
		// Available tldraw colors
		const tldrawColors: TLDefaultColorStyle[] = [
			'black', 'grey', 'light-violet', 'violet', 'blue', 'light-blue', 
			'yellow', 'orange', 'green', 'light-green', 'light-red', 'red', 
			'white', 'brown', 'pink', 'cyan'
		]
		
		// For now, just use a simple mapping based on hue
		const hsl = hexToHSL(hex)
		
		// Map based on hue ranges
		if (hsl.h >= 0 && hsl.h < 30) return 'red'
		if (hsl.h >= 30 && hsl.h < 60) return 'orange'
		if (hsl.h >= 60 && hsl.h < 90) return 'yellow'
		if (hsl.h >= 90 && hsl.h < 150) return 'green'
		if (hsl.h >= 150 && hsl.h < 210) return 'cyan'
		if (hsl.h >= 210 && hsl.h < 270) return 'blue'
		if (hsl.h >= 270 && hsl.h < 330) return 'violet'
		return 'red' // fallback
	}, [hexToHSL])

	const handleOpenChange = useCallback(
		(open: boolean) => {
			console.log('Figma color picker open change:', open, 'value:', value)
			setIsOpen(open)
			if (open) {
				const hsl = hexToHSL(value)
				console.log('HSL values:', hsl)
				setHue(hsl.h)
				setSaturation(hsl.s)
				setLightness(hsl.l)
				setAlpha(hsl.a)
				setHexValue(value)
			}
		},
		[value, hexToHSL]
	)

	const handleColorChange = useCallback(
		(newColor: string) => {
			onValueChange(newColor)
			setHexValue(newColor)
			
			// Also update the selected shapes in real-time
			if (editor.isIn('select')) {
				const selectedShapes = editor.getSelectedShapes()
				selectedShapes.forEach(shape => {
					if (shape.type === 'geo' || shape.type === 'arrow' || shape.type === 'line' || shape.type === 'draw') {
						// First set the fill style to "solid" if it's not already filled
						if ('fill' in shape.props && shape.props.fill === 'none') {
							editor.setStyleForSelectedShapes(DefaultFillStyle, 'solid')
						}
						
						// Then set the color using the mapped tldraw color
						const tldrawColor = hexToTldrawColor(newColor)
						editor.setStyleForSelectedShapes(DefaultColorStyle, tldrawColor)
					}
				})
			}
		},
		[onValueChange, editor]
	)

	const handleHexChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			const hex = e.target.value
			setHexValue(hex)
			if (hex.match(/^#[0-9A-Fa-f]{6}$/)) {
				const hsl = hexToHSL(hex)
				setHue(hsl.h)
				setSaturation(hsl.s)
				setLightness(hsl.l)
				handleColorChange(hex)
			}
		},
		[handleColorChange, hexToHSL]
	)

	const updateColorFromWheel = useCallback(
		(clientX: number, clientY: number) => {
			if (!colorWheelRef.current) return

			const rect = colorWheelRef.current.getBoundingClientRect()
			const x = clientX - rect.left
			const y = clientY - rect.top
			const centerX = rect.width / 2
			const centerY = rect.height / 2

			const deltaX = x - centerX
			const deltaY = centerY - y
			const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)
			const maxDistance = Math.min(centerX, centerY)

			if (distance <= maxDistance) {
				const angle = (Math.atan2(deltaY, deltaX) * 180) / Math.PI
				const newHue = (90 - angle + 360) % 360
				const newSaturation = Math.min(100, (distance / maxDistance) * 100)

				setHue(newHue)
				setSaturation(newSaturation)

				const newColor = hslToHex(newHue, newSaturation, lightness)
				setHexValue(newColor)
				handleColorChange(newColor)
			}
		},
		[lightness, hslToHex, handleColorChange]
	)

	const updateColorFromSaturationLightness = useCallback(
		(clientX: number, clientY: number) => {
			if (!saturationLightnessRef.current) return

			const rect = saturationLightnessRef.current.getBoundingClientRect()
			const x = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
			const y = Math.max(0, Math.min(1, (clientY - rect.top) / rect.height))

			const newSaturation = x * 100
			const newLightness = (1 - y) * 100

			setSaturation(newSaturation)
			setLightness(newLightness)

			const newColor = hslToHex(hue, newSaturation, newLightness)
			setHexValue(newColor)
			handleColorChange(newColor)
		},
		[hue, hslToHex, handleColorChange]
	)

	const updateHue = useCallback(
		(clientX: number) => {
			if (!hueSliderRef.current) return

			const rect = hueSliderRef.current.getBoundingClientRect()
			const x = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
			const newHue = x * 360

			setHue(newHue)

			const newColor = hslToHex(newHue, saturation, lightness)
			setHexValue(newColor)
			handleColorChange(newColor)
		},
		[saturation, lightness, hslToHex, handleColorChange]
	)

	const updateAlpha = useCallback(
		(clientX: number) => {
			if (!alphaSliderRef.current) return

			const rect = alphaSliderRef.current.getBoundingClientRect()
			const x = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
			const newAlpha = x * 100

			setAlpha(newAlpha)
			// Note: Alpha changes don't affect hex, so we don't call handleColorChange here
		},
		[]
	)

	const handleMouseDown = useCallback(
		(e: React.MouseEvent, type: 'wheel' | 'saturation' | 'hue' | 'alpha') => {
			e.preventDefault()
			isDragging.current = true
			dragType.current = type

			switch (type) {
				case 'wheel':
					updateColorFromWheel(e.clientX, e.clientY)
					break
				case 'saturation':
					updateColorFromSaturationLightness(e.clientX, e.clientY)
					break
				case 'hue':
					updateHue(e.clientX)
					break
				case 'alpha':
					updateAlpha(e.clientX)
					break
			}
		},
		[updateColorFromWheel, updateColorFromSaturationLightness, updateHue, updateAlpha]
	)

	const handleMouseMove = useCallback(
		(e: MouseEvent) => {
			if (!isDragging.current || !dragType.current) return

			switch (dragType.current) {
				case 'wheel':
					updateColorFromWheel(e.clientX, e.clientY)
					break
				case 'saturation':
					updateColorFromSaturationLightness(e.clientX, e.clientY)
					break
				case 'hue':
					updateHue(e.clientX)
					break
				case 'alpha':
					updateAlpha(e.clientX)
					break
			}
		},
		[updateColorFromWheel, updateColorFromSaturationLightness, updateHue, updateAlpha]
	)

	const handleMouseUp = useCallback(() => {
		isDragging.current = false
		dragType.current = null
	}, [])

	useEffect(() => {
		if (isOpen) {
			document.addEventListener('mousemove', handleMouseMove)
			document.addEventListener('mouseup', handleMouseUp)
			return () => {
				document.removeEventListener('mousemove', handleMouseMove)
				document.removeEventListener('mouseup', handleMouseUp)
			}
		}
	}, [isOpen, handleMouseMove, handleMouseUp])

	const currentColor = `hsl(${hue}, ${saturation}%, ${lightness}%)`
	const currentColorWithAlpha = `hsla(${hue}, ${saturation}%, ${lightness}%, ${alpha / 100})`

		return (
		<TldrawUiPopover id="figma-color-picker" open={isOpen} onOpenChange={handleOpenChange}>
			<TldrawUiPopoverTrigger>
				<div
					className="tlui-figma-color-picker__trigger"
					title={title}
					onClick={() => {
						console.log('Figma color picker button clicked!', isOpen)
						setIsOpen(!isOpen)
					}}
					style={{
						width: '120px',
						height: '32px',
						background: currentColor,
						border: '1px solid var(--tl-color-border)',
						borderRadius: '6px',
						cursor: 'pointer',
						position: 'relative',
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'space-between',
						padding: '0 8px',
						transition: 'all 0.15s ease',
					}}
				>
					{/* Color swatch */}
					<div
						style={{
							width: '16px',
							height: '16px',
							background: currentColor,
							border: '1px solid var(--tl-color-border)',
							borderRadius: '3px',
						}}
					/>
					
					{/* Color info */}
					<div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '2px' }}>
						<div style={{ fontSize: '11px', fontWeight: '500', color: 'var(--tl-color-text-1)' }}>
							{hexValue}
						</div>
						<div style={{ fontSize: '10px', color: 'var(--tl-color-text-2)' }}>
							{Math.round(alpha)}%
						</div>
					</div>
				</div>
			</TldrawUiPopoverTrigger>

			<TldrawUiPopoverContent side="left" align="start" sideOffset={8}>
				<div className="tlui-figma-color-picker">
					<div className="tlui-figma-color-picker__content">

					{/* Main Color Selector */}
					<div className="tlui-figma-color-picker__main-selector">
						<div
							ref={saturationLightnessRef}
							className="tlui-figma-color-picker__saturation-lightness"
							style={{
								background: `linear-gradient(to top, #000, transparent), linear-gradient(to right, #fff, hsl(${hue}, 100%, 50%))`,
							}}
							onMouseDown={(e) => handleMouseDown(e, 'saturation')}
						>
							<div
								className="tlui-figma-color-picker__selector"
								style={{
									left: `${saturation}%`,
									top: `${100 - lightness}%`,
								}}
							/>
						</div>
					</div>

					{/* Hue Slider */}
					<div className="tlui-figma-color-picker__hue-slider">
						<div
							ref={hueSliderRef}
							className="tlui-figma-color-picker__hue-track"
							style={{
								background: `linear-gradient(to right, hsl(0, 100%, 50%), hsl(60, 100%, 50%), hsl(120, 100%, 50%), hsl(180, 100%, 50%), hsl(240, 100%, 50%), hsl(300, 100%, 50%), hsl(360, 100%, 50%))`,
							}}
							onMouseDown={(e) => handleMouseDown(e, 'hue')}
						>
							<div
								className="tlui-figma-color-picker__hue-thumb"
								style={{
									left: `${(hue / 360) * 100}%`,
								}}
							/>
						</div>
					</div>

					{/* Alpha Slider */}
					<div className="tlui-figma-color-picker__alpha-slider">
						<div
							ref={alphaSliderRef}
							className="tlui-figma-color-picker__alpha-track"
							style={{
								background: `linear-gradient(to right, transparent, ${currentColor})`,
							}}
							onMouseDown={(e) => handleMouseDown(e, 'alpha')}
						>
							<div
								className="tlui-figma-color-picker__alpha-thumb"
								style={{
									left: `${alpha}%`,
								}}
							/>
						</div>
					</div>

					{/* Color Input Fields */}
					<div className="tlui-figma-color-picker__inputs">
						<div className="tlui-figma-color-picker__input-group">
							<label>Hex</label>
							<input
								type="text"
								value={hexValue}
								onChange={handleHexChange}
								placeholder="#000000"
								className="tlui-figma-color-picker__hex-input"
							/>
						</div>
						<div className="tlui-figma-color-picker__input-group">
							<label>Alpha</label>
							<input
								type="text"
								value={`${Math.round(alpha)}%`}
								readOnly
								className="tlui-figma-color-picker__alpha-input"
							/>
						</div>
					</div>

					{/* Recent Colors */}
					<div className="tlui-figma-color-picker__recent">
						<label>On this page</label>
						<div className="tlui-figma-color-picker__color-swatches">
							<div className="tlui-figma-color-picker__swatch" style={{ background: '#000' }} />
							<div className="tlui-figma-color-picker__swatch" style={{ background: '#D9D9D9' }} />
							<div className="tlui-figma-color-picker__swatch" style={{ background: '#fff' }} />
							<div className="tlui-figma-color-picker__swatch tlui-figma-color-picker__swatch--transparent" />
						</div>
					</div>
				</div>
			</div>
			</TldrawUiPopoverContent>
		</TldrawUiPopover>
	)
})
