import React, { useCallback, useState } from 'react'
import { useEditor, useIsDarkMode, getDefaultColorTheme, useValue } from '@tldraw/editor'
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

// Font weight options (like Figma)
const FONT_WEIGHT_OPTIONS = [
	{ value: '100', label: 'Thin' },
	{ value: '200', label: 'Extra Light' },
	{ value: '300', label: 'Light' },
	{ value: '400', label: 'Regular' },
	{ value: '500', label: 'Medium' },
	{ value: '600', label: 'Semi Bold' },
	{ value: '700', label: 'Bold' },
	{ value: '800', label: 'Extra Bold' },
	{ value: '900', label: 'Black' },
]

// Font size presets with pixel values (like Figma)
const FONT_SIZE_PRESETS = [
	{ value: 8, label: '8' },
	{ value: 9, label: '9' },
	{ value: 10, label: '10' },
	{ value: 11, label: '11' },
	{ value: 12, label: '12' },
	{ value: 14, label: '14' },
	{ value: 16, label: '16' },
	{ value: 18, label: '18' },
	{ value: 20, label: '20' },
	{ value: 24, label: '24' },
	{ value: 30, label: '30' },
	{ value: 36, label: '36' },
	{ value: 48, label: '48' },
	{ value: 60, label: '60' },
	{ value: 72, label: '72' },
	{ value: 96, label: '96' },
]

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
	
	const [lineHeight, setLineHeight] = useState<string>('Auto')
	const [letterSpacing, setLetterSpacing] = useState<string>('0%')

	// Get current styles from selected shapes
	const font = styles.get(DefaultFontStyle)
	const fontSize = styles.get(DefaultFontSizeStyle)
	const textAlign = styles.get(DefaultTextAlignStyle)
	const horizontalAlign = styles.get(DefaultHorizontalAlignStyle)
	const verticalAlign = styles.get(DefaultVerticalAlignStyle)

	// Current values for display
	const currentFont = font?.type === 'shared' ? font.value : 'sans'
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
				console.log('Active styles updated:', Array.from(styles))
				// setActiveStyles(styles) // This state is no longer needed
			}
			
			updateActiveStyles()
			textEditor.on('update', updateActiveStyles)
			textEditor.on('selectionUpdate', updateActiveStyles)
			
			return () => {
				textEditor.off('update', updateActiveStyles)
				textEditor.off('selectionUpdate', updateActiveStyles)
			}
		} else {
			// If no active editor, check if we have selected text shapes and show their styles
			if (editor.isIn('select')) {
				const selectedShapes = editor.getSelectedShapes()
				const textShape = selectedShapes.find(shape => shape.type === 'text')
				
				if (textShape && textShape.type === 'text') {
					// Try to extract style information from the rich text content
					// This is a simplified approach - in a real implementation you might want to parse the rich text
					// setActiveStyles(styles) // This state is no longer needed
				} else {
					// setActiveStyles(new Set()) // This state is no longer needed
				}
			} else {
				// setActiveStyles(new Set()) // This state is no longer needed
			}
		}
	}, [editor]) // Removed hasActiveEditor dependency to avoid circular reference

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

	// Handle rich text styling - properly using TipTap editor with tldraw's richText property
	const handleRichTextStyle = useCallback((style: 'bold' | 'italic' | 'code') => {
		console.log('Applying style:', style)
		
		try {
			// First try to get the active rich text editor
			let textEditor = editor.getRichTextEditor()
			
			if (!textEditor) {
				// If no active editor, find a selected text shape and start editing it
				const selectedShapes = editor.getSelectedShapes()
				const textShape = selectedShapes.find(shape => shape.type === 'text')
				
				if (textShape && textShape.type === 'text') {
					console.log('Starting to edit text shape:', textShape.id)
					editor.setEditingShape(textShape.id)
					
					// Wait a bit for the editor to initialize, then apply the style
					setTimeout(() => {
						const newTextEditor = editor.getRichTextEditor()
						if (newTextEditor) {
							console.log('Applying style after editor initialization:', style)
							applyStyle(newTextEditor, style)
						} else {
							console.warn('Failed to get rich text editor after setEditingShape')
						}
					}, 100)
					return
				} else {
					console.warn('No text shape selected')
					return
				}
			}
			
			// Apply the style to the active editor
			applyStyle(textEditor, style)
			
		} catch (error) {
			console.error('Error applying rich text style:', error)
		}
	}, [editor])

	// Helper function to apply a style using TipTap
	const applyStyle = useCallback((textEditor: any, style: 'bold' | 'italic' | 'code') => {
		try {
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
			}
			console.log('Style applied successfully:', style)
		} catch (error) {
			console.error('Error applying style:', style, error)
		}
	}, [])

	// Handle font weight change using TipTap
	const handleFontWeightChange = useCallback((weightValue: string) => {
		console.log('Changing font weight to:', weightValue)
		
		try {
			// First try to get the active rich text editor
			let textEditor = editor.getRichTextEditor()
			
			if (!textEditor) {
				// If no active editor, find a selected text shape and start editing it
				const selectedShapes = editor.getSelectedShapes()
				const textShape = selectedShapes.find(shape => shape.type === 'text')
				
				if (textShape && textShape.type === 'text') {
					console.log('Starting to edit text shape for font weight:', textShape.id)
					editor.setEditingShape(textShape.id)
					
					// Wait a bit for the editor to initialize, then apply the font weight
					setTimeout(() => {
						const newTextEditor = editor.getRichTextEditor()
						if (newTextEditor) {
							console.log('Applying font weight after editor initialization:', weightValue)
							applyFontWeight(newTextEditor, weightValue)
						} else {
							console.warn('Failed to get rich text editor after setEditingShape')
						}
					}, 100)
					return
				} else {
					console.warn('No text shape selected for font weight change')
					return
				}
			}
			
			// Apply the font weight to the active editor
			applyFontWeight(textEditor, weightValue)
			
		} catch (error) {
			console.error('Error applying font weight:', error)
		}
	}, [editor])

	// Helper function to apply font weight using TipTap
	const applyFontWeight = useCallback((textEditor: any, weight: string) => {
		try {
			// Use TipTap's CSS extension to set font weight
			textEditor.chain().focus().setMark('textStyle', { fontWeight: weight }).run()
			console.log('Font weight applied successfully:', weight)
		} catch (error) {
			console.error('Error applying font weight:', weight, error)
		}
	}, [])

	// Track active styles from the rich text editor
	const [activeStyles, setActiveStyles] = useState<Set<string>>(new Set())
	const [currentFontWeight, setCurrentFontWeight] = useState<string>('400')
	const [currentCustomFontSize, setCurrentCustomFontSize] = useState<number>(16)

	// Update active styles when rich text editor changes
	React.useEffect(() => {
		const textEditor = editor.getRichTextEditor()
		if (textEditor) {
			const updateActiveStyles = () => {
				const styles = new Set<string>()
				if (textEditor.isActive('bold')) styles.add('bold')
				if (textEditor.isActive('italic')) styles.add('italic')
				if (textEditor.isActive('code')) styles.add('code')
				
				// Also track current font weight
				const fontWeight = textEditor.getAttributes('textStyle').fontWeight || '400'
				setCurrentFontWeight(fontWeight)
				
				console.log('Active styles updated:', Array.from(styles), 'Font weight:', fontWeight)
				setActiveStyles(styles)
			}
			
			updateActiveStyles()
			textEditor.on('update', updateActiveStyles)
			textEditor.on('selectionUpdate', updateActiveStyles)
			
			return () => {
				textEditor.off('update', updateActiveStyles)
				textEditor.off('selectionUpdate', updateActiveStyles)
			}
		} else {
			// Clear styles when no editor is active
			setActiveStyles(new Set())
		}
	}, [editor])

	// Update current custom font size when selected shapes change
	React.useEffect(() => {
		if (editor.isIn('select')) {
			const selectedShapes = editor.getSelectedShapes()
			const textShape = selectedShapes.find(shape => shape.type === 'text')
			
			if (textShape && textShape.type === 'text') {
				const customSize = (textShape as any).props.customFontSize
				if (customSize) {
					setCurrentCustomFontSize(customSize)
				}
			}
		}
	}, [editor])

	// Check if we have text shapes selected that can be styled
	const [hasTextSelected, setHasTextSelected] = useState(false)
	const [hasActiveEditor, setHasActiveEditor] = useState(false)

	// Update state when editor changes
	React.useEffect(() => {
		const updateState = () => {
			const isInSelect = editor.isIn('select')
			const selectedShapes = editor.getSelectedShapes()
			const hasText = selectedShapes.some(shape => shape.type === 'text')
			const hasEditor = !!editor.getRichTextEditor()
			
			console.log('State update:', { isInSelect, hasText, hasEditor, selectedShapes: selectedShapes.map(s => ({ type: s.type, id: s.id })) })
			
			setHasTextSelected(isInSelect && hasText)
			setHasActiveEditor(hasEditor)
		}

		// Initial update
		updateState()

		// Subscribe to editor changes
		const unsubscribe = editor.store.listen(() => {
			updateState()
		})

		return unsubscribe
	}, [editor])

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

			{/* Font Weight - New Figma-style dropdown */}
			<div className="figma-typography-section">
				<label className="figma-typography-label">Font Weight</label>
				<select
					className="figma-typography-select"
					value={currentFontWeight}
					onChange={(e) => handleFontWeightChange(e.target.value)}
				>
					{FONT_WEIGHT_OPTIONS.map(option => (
						<option key={option.value} value={option.value}>
							{option.label}
						</option>
					))}
				</select>
			</div>

			{/* Font Size - Fixed to use proper enum values */}
			<div className="figma-typography-section">
				<label className="figma-typography-label">Font Size</label>
				<div className="figma-typography-row">
					{/* Preset font sizes */}
					<select
						className="figma-typography-select"
						value={currentCustomFontSize}
						onChange={(e) => {
							const selectedSize = parseInt(e.target.value)
							if (!isNaN(selectedSize)) {
								// Use customFontSize for pixel values
								editor.run(() => {
									if (editor.isIn('select')) {
										const selectedShapes = editor.getSelectedShapes()
										selectedShapes.forEach(shape => {
											if (shape.type === 'text') {
												editor.updateShape({
													id: shape.id,
													type: 'text',
													props: { customFontSize: selectedSize }
												})
											}
										})
									}
								})
								onHistoryMark('font-size-change')
								// Update local state
								setCurrentCustomFontSize(selectedSize)
							}
						}}
					>
						{FONT_SIZE_PRESETS.map(preset => (
							<option key={preset.value} value={preset.value}>
								{preset.label} ({preset.value}px)
							</option>
						))}
					</select>
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