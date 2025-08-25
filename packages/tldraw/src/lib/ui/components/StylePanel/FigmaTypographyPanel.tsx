import React, { useCallback, useState } from 'react'
import { useEditor, useIsDarkMode, getDefaultColorTheme } from '@tldraw/editor'
import {
	DefaultFontStyle,
	DefaultFontSizeStyle,
	DefaultTextAlignStyle,
	DefaultHorizontalAlignStyle,
	DefaultVerticalAlignStyle,
	ReadonlySharedStyleMap,
} from '@tldraw/editor'
import { TldrawUiButtonPicker } from '../primitives/TldrawUiButtonPicker'
import { TldrawUiToolbar } from '../primitives/TldrawUiToolbar'
import { useTranslation } from '../../hooks/useTranslation/useTranslation'
import { STYLES } from '../../../styles'

// Font family options with display names
const FONT_OPTIONS = [
	{ value: 'serif', label: 'Times New Roman', family: 'var(--tl-font-serif)' },
	{ value: 'draw', label: 'Draw', family: 'var(--tl-font-draw)' },
	{ value: 'sans', label: 'Arial', family: 'var(--tl-font-sans)' },
	{ value: 'mono', label: 'Courier New', family: 'var(--tl-font-mono)' },
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
			<svg width="14" height="14" viewBox="0 0 16 16" fill="none">
				<path d="M2 4h8M2 8h12M2 12h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
			</svg>
		), 
		label: 'Left' 
	},
	{ 
		value: 'middle', 
		icon: (
			<svg width="14" height="14" viewBox="0 0 16 16" fill="none">
				<path d="M2 4h12M2 8h12M2 12h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
			</svg>
		), 
		label: 'Center' 
	},
	{ 
		value: 'end', 
		icon: (
			<svg width="14" height="14" viewBox="0 0 16 16" fill="none">
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
			<svg width="14" height="14" viewBox="0 0 16 16" fill="none">
				<path d="M4 2h8M4 6h8M4 10h8M4 14h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
				<path d="M2 2l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
			</svg>
		), 
		label: 'Top' 
	},
	{ 
		value: 'middle', 
		icon: (
			<svg width="14" height="14" viewBox="0 0 16 16" fill="none">
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
			<svg width="14" height="14" viewBox="0 0 16 16" fill="none">
				<path d="M4 2h8M4 6h8M4 10h8M4 14h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
				<path d="M10 2l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
			</svg>
		), 
		label: 'Bottom' 
	},
]

interface FigmaTypographyPanelProps {
	styles: ReadonlySharedStyleMap
}

export function FigmaTypographyPanel({ styles }: FigmaTypographyPanelProps) {
	const editor = useEditor()
	const msg = useTranslation()
	const isDarkMode = useIsDarkMode()
	const theme = getDefaultColorTheme({ isDarkMode })
	
	const [customFontSize, setCustomFontSize] = useState<string>('')
	const [lineHeight, setLineHeight] = useState<string>('Auto')
	const [letterSpacing, setLetterSpacing] = useState<string>('0%')
	const [activeStyles, setActiveStyles] = useState<Set<string>>(new Set())

	// Get current styles from selected shapes
	const font = styles?.get(DefaultFontStyle)
	const fontSize = styles?.get(DefaultFontSizeStyle)
	const textAlign = styles?.get(DefaultTextAlignStyle)
	const horizontalAlign = styles?.get(DefaultHorizontalAlignStyle)
	const verticalAlign = styles?.get(DefaultVerticalAlignStyle)

	// Get current values
	const currentFont = font?.type === 'shared' ? font.value : 'serif'
	const currentFontSize = fontSize?.type === 'shared' ? fontSize.value : 'm'
	const currentTextAlign = textAlign?.type === 'shared' ? textAlign.value : 'start'
	const currentVerticalAlign = verticalAlign?.type === 'shared' ? verticalAlign.value : 'middle'

	// Update active styles when rich text editor changes
	React.useEffect(() => {
		const textEditor = editor.getRichTextEditor()
		if (textEditor) {
			const updateActiveStyles = () => {
				const styles = new Set<string>()
				if (textEditor.isActive('bold')) styles.add('bold')
				if (textEditor.isActive('italic')) styles.add('italic')
				if (textEditor.isActive('code')) styles.add('code')
				if (textEditor.isActive('highlight')) styles.add('highlight')
				setActiveStyles(styles)
			}
			
			updateActiveStyles()
			textEditor.on('update', updateActiveStyles)
			textEditor.on('selectionUpdate', updateActiveStyles)
			
			return () => {
				textEditor.off('update', updateActiveStyles)
				textEditor.off('selectionUpdate', updateActiveStyles)
			}
		}
	}, [editor])

	const handleValueChange = useCallback((style: any, value: any) => {
		editor.run(() => {
			if (editor.isIn('select')) {
				editor.setStyleForSelectedShapes(style, value)
			}
			editor.setStyleForNextShapes(style, value)
			editor.updateInstanceState({ isChangingStyle: true })
		})
	}, [editor])

	const onHistoryMark = useCallback((id: string) => editor.markHistoryStoppingPoint(id), [editor])

	// Handle rich text styling
	const handleRichTextStyle = useCallback((style: string) => {
		editor.run(() => {
			if (editor.isIn('select')) {
				const selectedShapes = editor.getSelectedShapes()
				selectedShapes.forEach(shape => {
					if (shape.type === 'text') {
						// Start editing the text shape first
						editor.setEditingShape(shape.id)
						
						// Wait for the rich text editor to be available
						setTimeout(() => {
							const textEditor = editor.getRichTextEditor()
							if (textEditor) {
								switch (style) {
									case 'bold':
										textEditor.chain().focus().toggleBold().run()
										break
									case 'italic':
										textEditor.chain().focus().toggleItalic().run()
										break
									case 'code':
										textEditor.chain().focus().toggleCode().run()
										break
									case 'highlight':
										textEditor.chain().focus().toggleHighlight().run()
										break
								}
							}
						}, 100) // Small delay to ensure the rich text editor is ready
					}
				})
			}
			onHistoryMark(`rich-text-${style}`)
		})
	}, [editor, onHistoryMark])

	// Handle custom font size
	const handleCustomFontSize = useCallback((value: string) => {
		setCustomFontSize(value)
		
		const numValue = parseInt(value)
		if (!isNaN(numValue) && numValue > 0 && numValue <= 200) {
			editor.run(() => {
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
			})
			onHistoryMark('custom-font-size')
		}
	}, [editor, onHistoryMark])

	return (
		<div className="figma-typography-panel">
			{/* Header */}
			<div className="figma-typography-header">
				<span className="figma-typography-title">Typography</span>
				<button className="figma-typography-menu-button">
					<svg width="14" height="14" viewBox="0 0 16 16" fill="none">
						<circle cx="4" cy="4" r="1.5" fill="currentColor"/>
						<circle cx="12" cy="4" r="1.5" fill="currentColor"/>
						<circle cx="4" cy="12" r="1.5" fill="currentColor"/>
						<circle cx="12" cy="12" r="1.5" fill="currentColor"/>
					</svg>
				</button>
			</div>

			{/* Font Family - Using working tldraw controls */}
			<div className="figma-typography-section">
				<label className="figma-typography-label">Font Family</label>
				{font !== undefined && (
					<select
						className="figma-typography-select"
						value={currentFont}
						onChange={(e) => handleValueChange(DefaultFontStyle, e.target.value)}
					>
						{FONT_OPTIONS.map(option => (
							<option key={option.value} value={option.value} style={{ fontFamily: option.family }}>
								{option.label}
							</option>
						))}
					</select>
				)}
			</div>

			{/* Font Size - Fixed to use proper enum values */}
			<div className="figma-typography-section">
				<label className="figma-typography-label">Font Size</label>
				<div className="figma-typography-row">
					{/* Preset font sizes */}
					<select
						className="figma-typography-select figma-typography-size-preset"
						value={currentFontSize}
						onChange={(e) => handleValueChange(DefaultFontSizeStyle, e.target.value)}
					>
						{Object.entries(FONT_SIZE_PRESETS).map(([key, preset]) => (
							<option key={key} value={key}>
								{preset.label} ({preset.size}px)
							</option>
						))}
					</select>
					
					{/* Custom font size input */}
					<input
						type="text"
						className="figma-typography-input figma-typography-size"
						value={customFontSize}
						onChange={(e) => handleCustomFontSize(e.target.value)}
						placeholder="Custom size (px)"
					/>
				</div>
			</div>

			{/* Text Styling Buttons - Now functional */}
			<div className="figma-typography-section">
				<label className="figma-typography-label">Text Style</label>
				<div className="figma-typography-styling-buttons">
					<button 
						className={`figma-typography-style-button ${activeStyles.has('bold') ? 'active' : ''}`}
						title="Bold"
						onClick={() => handleRichTextStyle('bold')}
					>
						<svg width="14" height="14" viewBox="0 0 16 16" fill="none">
							<path d="M4 2h4.5a3.5 3.5 0 0 1 0 7H4V2z" stroke="currentColor" strokeWidth="1.5"/>
							<path d="M4 9h5.5a3.5 3.5 0 0 1 0 7H4V9z" stroke="currentColor" strokeWidth="1.5"/>
						</svg>
					</button>
					<button 
						className={`figma-typography-style-button ${activeStyles.has('italic') ? 'active' : ''}`}
						title="Italic"
						onClick={() => handleRichTextStyle('italic')}
					>
						<svg width="14" height="14" viewBox="0 0 16 16" fill="none">
							<path d="M6 2h4M8 2v12M6 14h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
						</svg>
					</button>
					<button 
						className={`figma-typography-style-button ${activeStyles.has('code') ? 'active' : ''}`}
						title="Code"
						onClick={() => handleRichTextStyle('code')}
					>
						<svg width="14" height="14" viewBox="0 0 16 16" fill="none">
							<path d="M6 4L2 8L6 12M10 4L14 8L10 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
						</svg>
					</button>
					<button 
						className={`figma-typography-style-button ${activeStyles.has('highlight') ? 'active' : ''}`}
						title="Highlight"
						onClick={() => handleRichTextStyle('highlight')}
					>
						<svg width="14" height="14" viewBox="0 0 16 16" fill="none">
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
					<svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="figma-typography-icon">
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
					<svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="figma-typography-icon">
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

			{/* Alignment - Using custom Figma-styled buttons */}
			<div className="figma-typography-section">
				<label className="figma-typography-label">Alignment</label>
				<div className="figma-typography-alignment">
					{/* Horizontal alignment */}
					<div className="figma-typography-alignment-row">
						{TEXT_ALIGN_OPTIONS.map(option => (
							<button
								key={option.value}
								className={`figma-typography-align-button ${currentTextAlign === option.value ? 'active' : ''}`}
								onClick={() => handleValueChange(DefaultTextAlignStyle, option.value)}
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
								onClick={() => handleValueChange(DefaultVerticalAlignStyle, option.value)}
								title={option.label}
							>
								{option.icon}
							</button>
						))}
					</div>
					
					{/* Distribution button */}
					<button className="figma-typography-distribute-button" title="Distribute">
						<svg width="14" height="14" viewBox="0 0 16 16" fill="none">
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
