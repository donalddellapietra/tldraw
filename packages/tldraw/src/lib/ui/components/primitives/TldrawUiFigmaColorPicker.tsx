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
		
		const hsl = hexToHSL(hex)
		
		// Handle special cases first
		if (hsl.l < 15) return 'black'
		if (hsl.l > 85 && hsl.s < 20) return 'white'
		if (hsl.s < 15) return 'grey'
		
		// Map based on hue ranges with better precision
		if (hsl.h >= 0 && hsl.h < 30) {
			return hsl.l > 60 ? 'light-red' : 'red'
		}
		if (hsl.h >= 30 && hsl.h < 60) {
			return hsl.l > 60 ? 'orange' : 'brown'
		}
		if (hsl.h >= 60 && hsl.h < 90) {
			return hsl.l > 60 ? 'yellow' : 'brown'
		}
		if (hsl.h >= 90 && hsl.h < 150) {
			return hsl.l > 60 ? 'light-green' : 'green'
		}
		if (hsl.h >= 150 && hsl.h < 210) {
			return 'cyan'
		}
		if (hsl.h >= 210 && hsl.h < 270) {
			return hsl.l > 60 ? 'light-blue' : 'blue'
		}
		if (hsl.h >= 270 && hsl.h < 330) {
			return hsl.l > 60 ? 'light-violet' : 'violet'
		}
		if (hsl.h >= 330 && hsl.h < 360) {
			return hsl.l > 60 ? 'pink' : 'red'
		}
		
		return 'red' // fallback
	}, [hexToHSL])

	const handleOpenChange = useCallback(
		(open: boolean) => {
			console.log('Figma color picker open change:', open, 'value:', value, 'current isOpen:', isOpen)
			
			// Only allow opening, prevent automatic closing
			if (open) {
				setIsOpen(true)
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
			// Convert hex to tldraw color and call onValueChange with that
			const tldrawColor = hexToTldrawColor(newColor)
			onValueChange(tldrawColor)
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
						editor.setStyleForSelectedShapes(DefaultColorStyle, tldrawColor)
					}
				})
			}
		},
		[onValueChange, editor, hexToTldrawColor]
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
		<TldrawUiPopover 
			id="figma-color-picker" 
			open={isOpen} 
			onOpenChange={handleOpenChange}
		>
			<TldrawUiPopoverTrigger>
				<div
					title={title}
					onClick={(e) => {
						console.log('Trigger clicked, current isOpen:', isOpen)
						e.stopPropagation()
					}}
					style={{
						width: '100%',
						height: '40px',
						background: currentColor,
						border: '1px solid #e1e5e9',
						borderRadius: '6px',
						cursor: 'pointer',
						position: 'relative',
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'space-between',
						padding: '0 12px',
						transition: 'all 0.15s ease',
						boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
						overflow: 'hidden',
					}}
				>
					{/* Color swatch */}
					<div
						style={{
							width: '20px',
							height: '20px',
							background: currentColor,
							border: '1px solid rgba(255, 255, 255, 0.3)',
							borderRadius: '4px',
							boxShadow: 'inset 0 1px 2px rgba(0, 0, 0, 0.1)',
						}}
					/>
					
					{/* Color info */}
					<div style={{ 
						display: 'flex', 
						flexDirection: 'column', 
						alignItems: 'flex-start', 
						gap: '2px',
						color: '#fff',
						textShadow: '0 1px 2px rgba(0, 0, 0, 0.5)'
					}}>
						<div style={{ fontSize: '12px', fontWeight: '600' }}>
							{hexValue}
						</div>
						<div style={{ fontSize: '10px', opacity: 0.9 }}>
							{Math.round(alpha)}%
						</div>
					</div>
				</div>
			</TldrawUiPopoverTrigger>

			<TldrawUiPopoverContent side="left" align="start" sideOffset={8}>
				<div 
					onClick={(e) => {
						e.stopPropagation()
						console.log('Popover content clicked, preventing close')
					}}
					onMouseDown={(e) => {
						e.stopPropagation()
						console.log('Popover content mouse down, preventing close')
					}}
					style={{
						background: 'white',
						borderRadius: '8px',
						border: '1px solid #e1e5e9',
						boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(0, 0, 0, 0.05)',
						padding: '16px',
						width: '240px',
						fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
					}}
				>
					{/* Main Color Selector */}
					<div style={{ marginBottom: '16px' }}>
						<div
							ref={saturationLightnessRef}
							style={{
								width: '100%',
								height: '200px',
								background: `linear-gradient(to top, #000, transparent), linear-gradient(to right, #fff, hsl(${hue}, 100%, 50%))`,
								borderRadius: '6px',
								position: 'relative',
								cursor: 'crosshair',
								border: '1px solid #e1e5e9',
							}}
							onMouseDown={(e) => handleMouseDown(e, 'saturation')}
						>
							<div
								style={{
									position: 'absolute',
									width: '12px',
									height: '12px',
									border: '2px solid white',
									borderRadius: '50%',
									boxShadow: '0 0 0 1px rgba(0, 0, 0, 0.3)',
									transform: 'translate(-50%, -50%)',
									left: `${saturation}%`,
									top: `${100 - lightness}%`,
									pointerEvents: 'none',
								}}
							/>
						</div>
					</div>

					{/* Hue Slider */}
					<div style={{ marginBottom: '16px' }}>
						<div
							ref={hueSliderRef}
							style={{
								width: '100%',
								height: '12px',
								background: `linear-gradient(to right, hsl(0, 100%, 50%), hsl(60, 100%, 50%), hsl(120, 100%, 50%), hsl(180, 100%, 50%), hsl(240, 100%, 50%), hsl(300, 100%, 50%), hsl(360, 100%, 50%))`,
								borderRadius: '6px',
								position: 'relative',
								cursor: 'pointer',
								border: '1px solid #e1e5e9',
							}}
							onMouseDown={(e) => handleMouseDown(e, 'hue')}
						>
							<div
								style={{
									position: 'absolute',
									width: '16px',
									height: '16px',
									background: 'white',
									border: '2px solid #e1e5e9',
									borderRadius: '50%',
									boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
									transform: 'translate(-50%, -50%)',
									left: `${(hue / 360) * 100}%`,
									top: '50%',
									pointerEvents: 'none',
								}}
							/>
						</div>
					</div>

					{/* Alpha Slider */}
					<div style={{ marginBottom: '16px' }}>
						<div
							ref={alphaSliderRef}
							style={{
								width: '100%',
								height: '12px',
								background: `linear-gradient(to right, transparent, ${currentColor})`,
								borderRadius: '6px',
								position: 'relative',
								cursor: 'pointer',
								border: '1px solid #e1e5e9',
								backgroundImage: `linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)`,
								backgroundSize: '8px 8px',
								backgroundPosition: '0 0, 0 4px, 4px -4px, -4px 0px',
							}}
							onMouseDown={(e) => handleMouseDown(e, 'alpha')}
						>
							<div
								style={{
									position: 'absolute',
									width: '16px',
									height: '16px',
									background: 'white',
									border: '2px solid #e1e5e9',
									borderRadius: '50%',
									boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
									transform: 'translate(-50%, -50%)',
									left: `${alpha}%`,
									top: '50%',
									pointerEvents: 'none',
								}}
							/>
						</div>
					</div>

					{/* Color Input Fields */}
					<div style={{ 
						display: 'flex', 
						gap: '12px', 
						marginBottom: '16px',
						alignItems: 'flex-end'
					}}>
						<div style={{ flex: 1 }}>
							<label style={{
								display: 'block',
								fontSize: '11px',
								fontWeight: '600',
								color: '#333',
								marginBottom: '4px',
								textTransform: 'uppercase',
								letterSpacing: '0.5px'
							}}>
								Hex
							</label>
							<input
								type="text"
								value={hexValue}
								onChange={handleHexChange}
								placeholder="#000000"
								style={{
									width: '100%',
									padding: '6px 8px',
									border: '1px solid #e1e5e9',
									borderRadius: '4px',
									fontSize: '12px',
									fontFamily: 'monospace',
									background: '#f8f9fa'
								}}
							/>
						</div>
						<div style={{ flex: 1 }}>
							<label style={{
								display: 'block',
								fontSize: '11px',
								fontWeight: '600',
								color: '#333',
								marginBottom: '4px',
								textTransform: 'uppercase',
								letterSpacing: '0.5px'
							}}>
								Alpha
							</label>
							<input
								type="text"
								value={`${Math.round(alpha)}%`}
								readOnly
								style={{
									width: '100%',
									padding: '6px 8px',
									border: '1px solid #e1e5e9',
									borderRadius: '4px',
									fontSize: '12px',
									fontFamily: 'monospace',
									background: '#f8f9fa',
									textAlign: 'center'
								}}
							/>
						</div>
					</div>

					{/* Recent Colors */}
					<div style={{ marginBottom: '16px' }}>
						<label style={{
							display: 'block',
							fontSize: '11px',
							fontWeight: '600',
							color: '#333',
							marginBottom: '8px',
							textTransform: 'uppercase',
							letterSpacing: '0.5px'
						}}>
							On this page
						</label>
						<div style={{
							display: 'flex',
							gap: '6px',
							flexWrap: 'wrap'
						}}>
							<div style={{
								width: '24px',
								height: '24px',
								background: '#000',
								borderRadius: '4px',
								border: '1px solid #e1e5e9',
								cursor: 'pointer',
								boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)'
							}} />
							<div style={{
								width: '24px',
								height: '24px',
								background: '#D9D9D9',
								borderRadius: '4px',
								border: '1px solid #e1e5e9',
								cursor: 'pointer',
								boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)'
							}} />
							<div style={{
								width: '24px',
								height: '24px',
								background: '#fff',
								borderRadius: '4px',
								border: '1px solid #e1e5e9',
								cursor: 'pointer',
								boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)'
							}} />
							<div style={{
								width: '24px',
								height: '24px',
								background: 'transparent',
								backgroundImage: 'linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)',
								backgroundSize: '4px 4px',
								backgroundPosition: '0 0, 0 2px, 2px -2px, -2px 0px',
								borderRadius: '4px',
								border: '1px solid #e1e5e9',
								cursor: 'pointer',
								boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)'
							}} />
							<div style={{
								width: '24px',
								height: '24px',
								background: '#D43333',
								borderRadius: '4px',
								border: '1px solid #e1e5e9',
								cursor: 'pointer',
								boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)'
							}} />
						</div>
					</div>
				</div>
			</TldrawUiPopoverContent>
		</TldrawUiPopover>
	)
})
