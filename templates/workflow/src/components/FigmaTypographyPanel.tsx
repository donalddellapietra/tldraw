import React, { useCallback, useState } from 'react'
import { useEditor } from 'tldraw'
import {
	DefaultFontStyle,
	DefaultFontSizeStyle,
	DefaultTextAlignStyle,
	DefaultHorizontalAlignStyle,
	DefaultVerticalAlignStyle,
} from '@tldraw/editor'
import { useRelevantStyles } from 'tldraw'

// Font family options with display names
const FONT_OPTIONS = [
	{ value: 'serif', label: 'Times New Roman', family: 'var(--tl-font-serif)' },
	{ value: 'draw', label: 'Draw', family: 'var(--tl-font-draw)' },
	{ value: 'sans', label: 'Arial', family: 'var(--tl-font-sans)' },
	{ value: 'mono', label: 'Courier New', family: 'var(--tl-font-mono)' },
]

// Font weight options
const FONT_WEIGHTS = [
	{ value: 'normal', label: 'Regular' },
	{ value: 'bold', label: 'Bold' },
	{ value: '100', label: 'Thin' },
	{ value: '300', label: 'Light' },
	{ value: '500', label: 'Medium' },
	{ value: '700', label: 'Bold' },
	{ value: '900', label: 'Black' },
]

// Font size presets (using tldraw's default sizes)
const FONT_SIZE_PRESETS: Record<string, { value: string; label: string; size: number }> = {
	s: { value: 's', label: 'S', size: 18 },
	m: { value: 'm', label: 'M', size: 24 },
	l: { value: 'l', label: 'L', size: 36 },
	xl: { value: 'xl', label: 'XL', size: 44 },
}

// Text alignment options with proper SVG icons
const TEXT_ALIGN_OPTIONS = [
	{ 
		value: 'start', 
		icon: (
			<svg width="16" height="16" viewBox="0 0 16 16" fill="none">
				<path d="M2 4h8M2 8h12M2 12h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
			</svg>
		), 
		label: 'Left' 
	},
	{ 
		value: 'middle', 
		icon: (
			<svg width="16" height="16" viewBox="0 0 16 16" fill="none">
				<path d="M2 4h12M2 8h12M2 12h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
			</svg>
		), 
		label: 'Center' 
	},
	{ 
		value: 'end', 
		icon: (
			<svg width="16" height="16" viewBox="0 0 16 16" fill="none">
				<path d="M6 4h8M4 8h12M6 12h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
			</svg>
		), 
		label: 'Right' 
	},
]

// Vertical alignment options with proper SVG icons
const VERTICAL_ALIGN_OPTIONS = [
	{ 
		value: 'start', 
		icon: (
			<svg width="16" height="16" viewBox="0 0 16 16" fill="none">
				<path d="M4 2h8M4 6h8M4 10h8M4 14h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
				<path d="M2 2l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
			</svg>
		), 
		label: 'Top' 
	},
	{ 
		value: 'middle', 
		icon: (
			<svg width="16" height="16" viewBox="0 0 16 16" fill="none">
				<path d="M4 2h8M4 6h8M4 10h8M4 14h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
				<path d="M2 6l4 2-4 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
				<path d="M10 6l4 2-4 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
			</svg>
		), 
		label: 'Middle' 
	},
	{ 
		value: 'end', 
		icon: (
			<svg width="16" height="16" viewBox="0 0 16 16" fill="none">
				<path d="M4 2h8M4 6h8M4 10h8M4 14h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
				<path d="M10 2l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
			</svg>
		), 
		label: 'Bottom' 
	},
]

export function FigmaTypographyPanel() {
	const editor = useEditor()
	const styles = useRelevantStyles()
	
	const [customFontSize, setCustomFontSize] = useState<string>('')
	const [lineHeight, setLineHeight] = useState<string>('Auto')
	const [letterSpacing, setLetterSpacing] = useState<string>('0%')

	// Get current styles from selected shapes
	const font = styles?.get(DefaultFontStyle)
	const fontSize = styles?.get(DefaultFontSizeStyle)
	const textAlign = styles?.get(DefaultTextAlignStyle)
	const horizontalAlign = styles?.get(DefaultHorizontalAlignStyle)
	const verticalAlign = styles?.get(DefaultVerticalAlignStyle)

	const handleFontChange = useCallback((fontValue: string) => {
		if (editor.isIn('select')) {
			const selectedShapes = editor.getSelectedShapes()
			selectedShapes.forEach(shape => {
				if (shape.type === 'text') {
					editor.updateShape({
						id: shape.id,
						type: 'text',
						props: { font: fontValue }
					})
				}
			})
		}
		editor.markHistoryStoppingPoint('font-change')
	}, [editor])

	const handleFontSizeChange = useCallback((sizeValue: string) => {
		if (editor.isIn('select')) {
			const selectedShapes = editor.getSelectedShapes()
			selectedShapes.forEach(shape => {
				if (shape.type === 'text') {
					editor.updateShape({
						id: shape.id,
						type: 'text',
						props: { fontSize: sizeValue }
					})
				}
			})
		}
		editor.markHistoryStoppingPoint('font-size-change')
	}, [editor])

	const handleCustomFontSizeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value
		setCustomFontSize(value)
		
		const numValue = parseInt(value)
		if (!isNaN(numValue) && numValue > 0 && numValue <= 200) {
			if (editor.isIn('select')) {
				const selectedShapes = editor.getSelectedShapes()
				selectedShapes.forEach(shape => {
					if (shape.type === 'text') {
						editor.updateShape({
							id: shape.id,
							type: 'text',
							props: { customFontSize: numValue }
						})
					}
				})
			}
			editor.markHistoryStoppingPoint('custom-font-size')
		}
	}, [editor])

	const handleTextAlignChange = useCallback((alignValue: string) => {
		if (editor.isIn('select')) {
			const selectedShapes = editor.getSelectedShapes()
			selectedShapes.forEach(shape => {
				if (shape.type === 'text') {
					editor.updateShape({
						id: shape.id,
						type: 'text',
						props: { textAlign: alignValue }
					})
				}
			})
		}
		editor.markHistoryStoppingPoint('text-align-change')
	}, [editor])

	const handleVerticalAlignChange = useCallback((alignValue: string) => {
		if (editor.isIn('select')) {
			const selectedShapes = editor.getSelectedShapes()
			selectedShapes.forEach(shape => {
				if (shape.type === 'text') {
					editor.updateShape({
						id: shape.id,
						type: 'text',
						props: { verticalAlign: alignValue }
					})
				}
			})
		}
		editor.markHistoryStoppingPoint('vertical-align-change')
	}, [editor])

	// Get current values
	const currentFont = font?.type === 'shared' ? font.value : 'serif'
	const currentFontSize = fontSize?.type === 'shared' ? fontSize.value : 'm'
	const currentTextAlign = textAlign?.type === 'shared' ? textAlign.value : 'start'
	const currentVerticalAlign = verticalAlign?.type === 'shared' ? verticalAlign.value : 'middle'

	return (
		<div className="figma-typography-panel">
			{/* Header */}
			<div className="figma-typography-header">
				<span className="figma-typography-title">Typography</span>
				<button className="figma-typography-menu-button">
					<svg width="16" height="16" viewBox="0 0 16 16" fill="none">
						<circle cx="4" cy="4" r="1.5" fill="currentColor"/>
						<circle cx="12" cy="4" r="1.5" fill="currentColor"/>
						<circle cx="4" cy="12" r="1.5" fill="currentColor"/>
						<circle cx="12" cy="12" r="1.5" fill="currentColor"/>
					</svg>
				</button>
			</div>

			{/* Font Family */}
			<div className="figma-typography-section">
				<label className="figma-typography-label">Font Family</label>
				<select
					className="figma-typography-select"
					value={currentFont}
					onChange={(e) => handleFontChange(e.target.value)}
				>
					{FONT_OPTIONS.map(option => (
						<option key={option.value} value={option.value} style={{ fontFamily: option.family }}>
							{option.label}
						</option>
					))}
				</select>
			</div>

			{/* Font Weight and Size */}
			<div className="figma-typography-row">
				<div className="figma-typography-section">
					<select className="figma-typography-select figma-typography-weight">
						{FONT_WEIGHTS.map(weight => (
							<option key={weight.value} value={weight.value}>
								{weight.label}
							</option>
						))}
					</select>
				</div>
				<div className="figma-typography-section">
					<input
						type="text"
						className="figma-typography-input figma-typography-size"
						value={customFontSize || FONT_SIZE_PRESETS[currentFontSize]?.size || 24}
						onChange={handleCustomFontSizeChange}
						placeholder="12"
					/>
				</div>
			</div>

			{/* Text Styling Buttons */}
			<div className="figma-typography-section">
				<div className="figma-typography-styling-buttons">
					<button className="figma-typography-style-button" title="Bold">
						<svg width="16" height="16" viewBox="0 0 16 16" fill="none">
							<path d="M4 2h4.5a3.5 3.5 0 0 1 0 7H4V2z" stroke="currentColor" strokeWidth="1.5"/>
							<path d="M4 9h5.5a3.5 3.5 0 0 1 0 7H4V9z" stroke="currentColor" strokeWidth="1.5"/>
						</svg>
					</button>
					<button className="figma-typography-style-button" title="Italic">
						<svg width="16" height="16" viewBox="0 0 16 16" fill="none">
							<path d="M6 2h4M8 2v12M6 14h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
						</svg>
					</button>
					<button className="figma-typography-style-button" title="Code">
						<svg width="16" height="16" viewBox="0 0 16 16" fill="none">
							<path d="M6 4L2 8L6 12M10 4L14 8L10 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
						</svg>
					</button>
					<button className="figma-typography-style-button" title="Highlight">
						<svg width="16" height="16" viewBox="0 0 16 16" fill="none">
							<path d="M2 4h12v8H2z" stroke="currentColor" strokeWidth="1.5"/>
							<path d="M4 8h8M4 10h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
						</svg>
					</button>
				</div>
			</div>

			{/* Line Height */}
			<div className="figma-typography-section">
				<label className="figma-typography-label">Line height</label>
				<div className="figma-typography-input-with-icon">
					<svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="figma-typography-icon">
						<path d="M2 4h12M2 8h12M2 12h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
					</svg>
					<input
						type="text"
						className="figma-typography-input"
						value={lineHeight}
						onChange={(e) => setLineHeight(e.target.value)}
					/>
				</div>
			</div>

			{/* Letter Spacing */}
			<div className="figma-typography-section">
				<label className="figma-typography-label">Letter spacing</label>
				<div className="figma-typography-input-with-icon">
					<svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="figma-typography-icon">
						<path d="M2 4h12M2 8h12M2 12h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
						<path d="M4 2v12M12 2v12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
					</svg>
					<input
						type="text"
						className="figma-typography-input"
						value={letterSpacing}
						onChange={(e) => setLetterSpacing(e.target.value)}
					/>
				</div>
			</div>

			{/* Alignment */}
			<div className="figma-typography-section">
				<label className="figma-typography-label">Alignment</label>
				<div className="figma-typography-alignment">
					{/* Horizontal alignment */}
					<div className="figma-typography-alignment-row">
						{TEXT_ALIGN_OPTIONS.map(option => (
							<button
								key={option.value}
								className={`figma-typography-align-button ${currentTextAlign === option.value ? 'active' : ''}`}
								onClick={() => handleTextAlignChange(option.value)}
								title={option.label}
							>
								{option.icon}
							</button>
						))}
					</div>
					
					{/* Vertical alignment */}
					<div className="figma-typography-alignment-row">
						{VERTICAL_ALIGN_OPTIONS.map(option => (
							<button
								key={option.value}
								className={`figma-typography-align-button ${currentVerticalAlign === option.value ? 'active' : ''}`}
								onClick={() => handleVerticalAlignChange(option.value)}
								title={option.label}
							>
								{option.icon}
							</button>
						))}
					</div>
					
					{/* Distribution button */}
					<button className="figma-typography-distribute-button" title="Distribute">
						<svg width="16" height="16" viewBox="0 0 16 16" fill="none">
							<path d="M2 2h12M2 8h12M2 14h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
							<circle cx="2" cy="2" r="1.5" fill="currentColor"/>
							<circle cx="14" cy="2" r="1.5" fill="currentColor"/>
							<circle cx="2" cy="8" r="1.5" fill="currentColor"/>
							<circle cx="14" cy="8" r="1.5" fill="currentColor"/>
							<circle cx="2" cy="14" r="1.5" fill="currentColor"/>
							<circle cx="14" cy="14" r="1.5" fill="currentColor"/>
						</svg>
					</button>
				</div>
			</div>
		</div>
	)
}
