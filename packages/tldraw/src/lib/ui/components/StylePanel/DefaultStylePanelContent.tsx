import {
	ArrowShapeArrowheadEndStyle,
	ArrowShapeArrowheadStartStyle,
	ArrowShapeKindStyle,
	DefaultColorStyle,
	DefaultDashStyle,
	DefaultFillStyle,
	DefaultFontSizeStyle,
	DefaultFontStyle,
	DefaultHorizontalAlignStyle,
	DefaultSizeStyle,
	DefaultTextAlignStyle,
	DefaultVerticalAlignStyle,
	GeoShapeGeoStyle,
	LineShapeSplineStyle,
	TLArrowShapeArrowheadStyle,
	TLDefaultColorTheme,
	getColorValue,
	getDefaultColorTheme,
	kickoutOccludedShapes,
	minBy,
	useEditor,
	useValue,
} from '@tldraw/editor'
import React, { useCallback, useState } from 'react'
import { EXTENDED_FONT_SIZES, STROKE_SIZES } from '../../../shapes/shared/default-shape-constants'
import { STYLES } from '../../../styles'
import { useUiEvents } from '../../context/events'
import { useTranslation } from '../../hooks/useTranslation/useTranslation'
import { TldrawUiButtonIcon } from '../primitives/Button/TldrawUiButtonIcon'
import { TldrawUiButtonPicker } from '../primitives/TldrawUiButtonPicker'

import { TldrawUiFigmaColorPicker } from '../primitives/TldrawUiFigmaColorPicker'
import { TldrawUiSlider } from '../primitives/TldrawUiSlider'
import { TldrawUiToolbar, TldrawUiToolbarButton } from '../primitives/TldrawUiToolbar'
import { DoubleDropdownPicker } from './DoubleDropdownPicker'
import { DropdownPicker } from './DropdownPicker'

// Local component for style panel subheadings
function StylePanelSubheading({ children }: { children: React.ReactNode }) {
	return <h3 className="tlui-style-panel__subheading">{children}</h3>
}

/** @public */
export interface TLUiStylePanelContentProps {
	styles: ReturnType<typeof useRelevantStyles>
}

/** @public @react */
export function DefaultStylePanelContent() {
	return (
		<>
			<CommonStylePickerSet theme={theme} styles={styles} />
			{!(hideGeo && hideArrowHeads && hideSpline && hideArrowKind) && (
				<div className="tlui-style-panel__section">
					<GeoStylePickerSet styles={styles} />
					<ArrowStylePickerSet styles={styles} />
					<ArrowheadStylePickerSet styles={styles} />
					<SplineStylePickerSet styles={styles} />
				</div>
			)}
		</>
	)
}

function useStyleChangeCallback() {
	const editor = useEditor()
	const trackEvent = useUiEvents()

	return React.useMemo(
		() =>
			function handleStyleChange<T>(style: StyleProp<T>, value: T) {
				editor.run(() => {
					if (editor.isIn('select')) {
						editor.setStyleForSelectedShapes(style, value)
					}
					editor.setStyleForNextShapes(style, value)
					editor.updateInstanceState({ isChangingStyle: true })
				})

				trackEvent('set-style', { source: 'style-panel', id: style.id, value: value as string })
			},
		[editor, trackEvent]
	)
}

/** @public */
export interface ThemeStylePickerSetProps {
	styles: ReadonlySharedStyleMap
	theme: TLDefaultColorTheme
}

/** @public */
export interface StylePickerSetProps {
	styles: ReadonlySharedStyleMap
}

/** @public @react */
export function StylePanelColorPicker() {
	const { styles } = useStylePanelContext()
	const msg = useTranslation()
	const editor = useEditor()

	const onHistoryMark = useCallback((id: string) => editor.markHistoryStoppingPoint(id), [editor])
	const showUiLabels = useValue('showUiLabels', () => editor.user.getShowUiLabels(), [editor])

	const handleValueChange = useStyleChangeCallback()

	const [isDashSectionExpanded, setIsDashSectionExpanded] = useState(true)
	const [isSizeSectionExpanded, setIsSizeSectionExpanded] = useState(true)
	const [isTextSectionExpanded, setIsTextSectionExpanded] = useState(true)

	const color = styles.get(DefaultColorStyle)
	const strokeColor = styles.get(DefaultColorStyle)
	const fill = styles.get(DefaultFillStyle)
	const dash = styles.get(DefaultDashStyle)
	const size = styles.get(DefaultSizeStyle)
	const font = styles.get(DefaultFontStyle)
	const fontSize = styles.get(DefaultFontSizeStyle)
	const textAlign = styles.get(DefaultTextAlignStyle)
	const labelAlign = styles.get(DefaultHorizontalAlignStyle)
	const verticalLabelAlign = styles.get(DefaultVerticalAlignStyle)

	// Only show text-related styles when text shapes are actually selected
	const hasTextShapes = font !== undefined || fontSize !== undefined || textAlign !== undefined

	return (
		<>
			<div data-testid="style.panel">
				{/* Fill Section */}
				{fill !== undefined && (
					<div
						style={{
							marginTop: '0px',
							marginBottom: '9px',
							background: 'var(--tl-color-panel)',
							borderRadius: '4.5px',
							border: '1px solid var(--tl-color-border)',
							overflow: 'hidden',
							width: '100%',
							boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
						}}
					>
						{/* Fill Header */}
						<div
							style={{
								padding: '9px 12px',
								background: 'var(--tl-color-muted-1)',
								borderBottom: '1px solid var(--tl-color-border)',
								fontSize: '9px',
								fontWeight: '500',
								color: 'var(--tl-color-text-1)',
								textTransform: 'uppercase',
								letterSpacing: '0.5px',
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'space-between',
								userSelect: 'none',
							}}
						>
							<span style={{ fontWeight: '500' }}>Fill</span>
						</div>

						{/* Fill Content */}
						<div style={{ padding: '12px' }}>
							{/* Fill Type Selector */}
							<div style={{ marginBottom: '9px' }}>
								<TldrawUiToolbar orientation="horizontal" label={msg('style-panel.fill')}>
									<TldrawUiButtonPicker
										title={msg('style-panel.fill')}
										uiType="fill"
										style={DefaultFillStyle}
										items={STYLES.fill}
										value={fill}
										onValueChange={handleValueChange}
										theme={theme}
										onHistoryMark={onHistoryMark}
									/>
								</TldrawUiToolbar>
							</div>

							{/* Color Picker - Only show when fill is not 'none' */}
							{fill?.type !== 'mixed' &&
								fill?.value !== 'none' &&
								color?.type !== 'mixed' &&
								color && (
									<div style={{ marginTop: '6px' }}>
										{showUiLabels && (
											<StylePanelSubheading>{msg('style-panel.color')}</StylePanelSubheading>
										)}
										<TldrawUiFigmaColorPicker
											value={getColorValue(theme, color.value, 'solid')}
											onValueChange={(newColor) => handleValueChange(DefaultColorStyle, newColor)}
											title={msg('style-panel.color')}
										/>
									</div>
								)}

							{/* Current Fill Preview */}
							{fill?.type !== 'mixed' &&
								fill?.value !== 'none' &&
								color?.type !== 'mixed' &&
								color && (
									<div style={{ marginTop: '9px' }}>
										<div
											style={{
												fontSize: '8.5px',
												color: 'var(--tl-color-text-2)',
												marginBottom: '4.5px',
												textTransform: 'uppercase',
												letterSpacing: '0.5px',
											}}
										>
											Preview
										</div>
										<div
											style={{
												width: '100%',
												height: '30px',
												background: getColorValue(theme, color.value, fill.value),
												border: '1px solid var(--tl-color-border)',
												borderRadius: '4.5px',
												position: 'relative',
												overflow: 'hidden',
												boxShadow: 'inset 0 1px 3px rgba(0, 0, 0, 0.1)',
											}}
										>
											{/* Pattern overlay for pattern fill */}
											{fill.value === 'pattern' && (
												<div
													style={{
														position: 'absolute',
														top: '0',
														left: '0',
														right: '0',
														bottom: '0',
														backgroundImage:
															'radial-gradient(circle at 2px 2px, rgba(0,0,0,0.1) 1px, transparent 1px)',
														backgroundColor: getColorValue(theme, color.value, 'solid'),
													}}
												/>
											)}
											{/* Semi-transparent overlay for semi fill */}
											{fill.value === 'semi' && (
												<div
													style={{
														position: 'absolute',
														top: '0',
														left: '0',
														right: '0',
														bottom: '0',
														background: 'rgba(255,255,255,0.5)',
													}}
												/>
											)}
										</div>
									</div>
								)}
						</div>
					</div>
				)}

				{/* Stroke Color Section */}
				{strokeColor !== undefined && (
					<div
						style={{
							marginTop: '0px',
							marginBottom: '9px',
							background: 'var(--tl-color-panel)',
							borderRadius: '4.5px',
							border: '1px solid var(--tl-color-border)',
							overflow: 'hidden',
							width: '100%',
							boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
						}}
					>
						{/* Stroke Color Header */}
						<div
							style={{
								padding: '9px 12px',
								background: 'var(--tl-color-muted-1)',
								borderBottom: '1px solid var(--tl-color-border)',
								fontSize: '9px',
								fontWeight: '500',
								color: 'var(--tl-color-text-1)',
								textTransform: 'uppercase',
								letterSpacing: '0.5px',
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'space-between',
								userSelect: 'none',
							}}
						>
							<span style={{ fontWeight: '500' }}>Stroke Color</span>
						</div>

						{/* Stroke Color Content */}
						<div style={{ padding: '12px' }}>
							{strokeColor?.type !== 'mixed' && strokeColor && (
								<TldrawUiFigmaColorPicker
									value={getColorValue(theme, strokeColor.value, 'solid')}
									onValueChange={(newColor) => handleValueChange(DefaultColorStyle, newColor)}
									title="Stroke Color"
								/>
							)}
						</div>
					</div>
				)}

				{/* Dash Session Section */}
				{dash !== undefined && (
					<div
						style={{
							marginTop: '0px',
							marginBottom: '9px',
							background: 'var(--tl-color-panel)',
							borderRadius: '4.5px',
							border: '1px solid var(--tl-color-border)',
							overflow: 'hidden',
							width: '100%',
							boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
						}}
					>
						{/* Session Header - Clickable for Expand/Collapse */}
						<div
							onClick={() => setIsDashSectionExpanded(!isDashSectionExpanded)}
							style={{
								padding: '9px 12px',
								background: 'var(--tl-color-muted-1)',
								borderBottom: '1px solid var(--tl-color-border)',
								fontSize: '9px',
								fontWeight: '500',
								color: 'var(--tl-color-text-1)',
								textTransform: 'uppercase',
								letterSpacing: '0.5px',
								cursor: 'pointer',
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'space-between',
								userSelect: 'none',
								transition: 'background-color 0.15s ease',
							}}
							onMouseEnter={(e) =>
								(e.currentTarget.style.backgroundColor = 'var(--tl-color-muted-2)')
							}
							onMouseLeave={(e) =>
								(e.currentTarget.style.backgroundColor = 'var(--tl-color-muted-1)')
							}
						>
							<span style={{ fontWeight: '500' }}>Dash</span>
							<div
								style={{
									width: '10px',
									height: '10px',
									display: 'flex',
									alignItems: 'center',
									justifyContent: 'center',
									transform: isDashSectionExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
									transition: 'transform 0.2s ease',
									color: 'var(--tl-color-text-2)',
								}}
							>
								<svg
									width="8"
									height="8"
									viewBox="0 0 24 24"
									fill="none"
									xmlns="http://www.w3.org/2000/svg"
								>
									<path
										d="M6 9L12 15L18 9"
										stroke="currentColor"
										strokeWidth="1.5"
										strokeLinecap="round"
										strokeLinejoin="round"
									/>
								</svg>
							</div>
						</div>

						{/* Session Content - Expandable */}
						{isDashSectionExpanded && (
							<div style={{ padding: '12px' }}>
								{showUiLabels && (
									<StylePanelSubheading>{msg('style-panel.dash')}</StylePanelSubheading>
								)}
								<TldrawUiToolbar orientation="horizontal" label={msg('style-panel.dash')}>
									<TldrawUiButtonPicker
										title={msg('style-panel.dash')}
										uiType="dash"
										style={DefaultDashStyle}
										items={STYLES.dash}
										value={dash}
										onValueChange={handleValueChange}
										theme={theme}
										onHistoryMark={onHistoryMark}
									/>
								</TldrawUiToolbar>

								{/* Thickness Control - Integrated with dash section */}
								{size !== undefined && (
									<div style={{ marginTop: '12px' }}>
										{showUiLabels && (
											<StylePanelSubheading>{msg('style-panel.size')}</StylePanelSubheading>
										)}
										<TldrawUiToolbar orientation="horizontal" label={msg('style-panel.size')}>
											<TldrawUiButtonPicker
												title={msg('style-panel.size')}
												uiType="size"
												style={DefaultSizeStyle}
												items={STYLES.size}
												value={size}
												onValueChange={(style, value) => {
													handleValueChange(style, value)
													const selectedShapeIds = editor.getSelectedShapeIds()
													if (selectedShapeIds.length > 0) {
														kickoutOccludedShapes(editor, selectedShapeIds)
													}
												}}
												theme={theme}
												onHistoryMark={onHistoryMark}
											/>
										</TldrawUiToolbar>

										{/* Custom Thickness Input */}
										<div style={{ marginTop: '9px' }}>
											{showUiLabels && (
												<div
													style={{
														marginBottom: '6px',
														fontSize: '10px',
														color: 'var(--tl-color-text-2)',
													}}
												>
													Custom Thickness
												</div>
											)}
											<div style={{ position: 'relative', width: '100%' }}>
												<input
													type="number"
													min="0.1"
													max="20"
													step="0.1"
													placeholder="e.g., 3.5"
													defaultValue={
														size && size.type === 'shared' ? STROKE_SIZES[size.value] : ''
													}
													style={{
														width: '100%',
														padding: '6px 9px',
														border: '1px solid var(--tl-color-border)',
														borderRadius: '3px',
														background: 'var(--tl-color-panel)',
														color: 'var(--tl-color-text-1)',
														fontSize: '10px',
														fontFamily: 'inherit',
														outline: 'none',
														transition: 'border-color 0.15s ease',
													}}
													onFocus={(e) => (e.target.style.borderColor = 'var(--tl-color-focus)')}
													onBlur={(e) => (e.target.style.borderColor = 'var(--tl-color-border)')}
													onKeyDown={(e) => {
														if (e.key === 'Enter') {
															const value = parseFloat(e.currentTarget.value)
															if (!isNaN(value) && value > 0) {
																// Convert custom thickness to closest size preset
																const sizes = { s: 1.5, m: 2.5, l: 4, xl: 6 }
																let closestSize: 's' | 'm' | 'l' | 'xl' = 'm'
																let minDiff = Math.abs(sizes.m - value)

																if (Math.abs(sizes.s - value) < minDiff) {
																	closestSize = 's'
																	minDiff = Math.abs(sizes.s - value)
																}
																if (Math.abs(sizes.l - value) < minDiff) {
																	closestSize = 'l'
																	minDiff = Math.abs(sizes.l - value)
																}
																if (Math.abs(sizes.xl - value) < minDiff) {
																	closestSize = 'xl'
																}

																handleValueChange(DefaultSizeStyle, closestSize)
																// Clear the input after applying
																e.currentTarget.value = ''
															}
														}
													}}
												/>
												<div
													style={{
														position: 'absolute',
														right: '6px',
														top: '50%',
														transform: 'translateY(-50%)',
														pointerEvents: 'none',
														color: 'var(--tl-color-text-3)',
														fontSize: '8.5px',
														fontWeight: '500',
													}}
												>
													px
												</div>
											</div>
										</div>
									</div>
								)}
							</div>
						)}
					</div>
				)}

				{/* Size Session Section */}
				{size !== undefined && (
					<div
						style={{
							marginTop: '0px',
							marginBottom: '9px',
							background: 'var(--tl-color-panel)',
							borderRadius: '4.5px',
							border: '1px solid var(--tl-color-border)',
							overflow: 'hidden',
							width: '100%',
							boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
						}}
					>
						{/* Session Header - Clickable for Expand/Collapse */}
						<div
							onClick={() => setIsSizeSectionExpanded(!isSizeSectionExpanded)}
							style={{
								padding: '9px 12px',
								background: 'var(--tl-color-muted-1)',
								borderBottom: '1px solid var(--tl-color-border)',
								fontSize: '9px',
								fontWeight: '500',
								color: 'var(--tl-color-text-1)',
								textTransform: 'uppercase',
								letterSpacing: '0.5px',
								cursor: 'pointer',
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'space-between',
								userSelect: 'none',
								transition: 'background-color 0.15s ease',
							}}
							onMouseEnter={(e) =>
								(e.currentTarget.style.backgroundColor = 'var(--tl-color-muted-2)')
							}
							onMouseLeave={(e) =>
								(e.currentTarget.style.backgroundColor = 'var(--tl-color-muted-1)')
							}
						>
							<span style={{ fontWeight: '500' }}>Size</span>
							<div
								style={{
									width: '10px',
									height: '10px',
									display: 'flex',
									alignItems: 'center',
									justifyContent: 'center',
									transform: isSizeSectionExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
									transition: 'transform 0.2s ease',
									color: 'var(--tl-color-text-2)',
								}}
							>
								<svg
									width="8"
									height="8"
									viewBox="0 0 24 24"
									fill="none"
									xmlns="http://www.w3.org/2000/svg"
								>
									<path
										d="M6 9L12 15L18 9"
										stroke="currentColor"
										strokeWidth="1.5"
										strokeLinecap="round"
										strokeLinejoin="round"
									/>
								</svg>
							</div>
						</div>

						{/* Session Content - Expandable */}
						{isSizeSectionExpanded && (
							<div style={{ padding: '12px' }}>
								{showUiLabels && (
									<StylePanelSubheading>{msg('style-panel.size')}</StylePanelSubheading>
								)}
								<TldrawUiToolbar orientation="horizontal" label={msg('style-panel.size')}>
									<TldrawUiButtonPicker
										title={msg('style-panel.size')}
										uiType="size"
										style={DefaultSizeStyle}
										items={STYLES.size}
										value={size}
										onValueChange={(style, value) => {
											handleValueChange(style, value)
											const selectedShapeIds = editor.getSelectedShapeIds()
											if (selectedShapeIds.length > 0) {
												kickoutOccludedShapes(editor, selectedShapeIds)
											}
										}}
										theme={theme}
										onHistoryMark={onHistoryMark}
									/>
								</TldrawUiToolbar>
							</div>
						)}
					</div>
				)}

				{/* Text Session Section */}
				{hasTextShapes && (
					<div
						style={{
							marginTop: '0px',
							marginBottom: '9px',
							background: 'var(--tl-color-panel)',
							borderRadius: '4.5px',
							border: '1px solid var(--tl-color-border)',
							overflow: 'hidden',
							width: '100%',
							boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
						}}
					>
						{/* Session Header - Clickable for Expand/Collapse */}
						<div
							onClick={() => setIsTextSectionExpanded(!isTextSectionExpanded)}
							style={{
								padding: '9px 12px',
								background: 'var(--tl-color-muted-1)',
								borderBottom: '1px solid var(--tl-color-border)',
								fontSize: '9px',
								fontWeight: '500',
								color: 'var(--tl-color-text-1)',
								textTransform: 'uppercase',
								letterSpacing: '0.5px',
								cursor: 'pointer',
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'space-between',
								userSelect: 'none',
								transition: 'background-color 0.15s ease',
							}}
							onMouseEnter={(e) =>
								(e.currentTarget.style.backgroundColor = 'var(--tl-color-muted-2)')
							}
							onMouseLeave={(e) =>
								(e.currentTarget.style.backgroundColor = 'var(--tl-color-muted-1)')
							}
						>
							<span style={{ fontWeight: '500' }}>Text</span>
							<div
								style={{
									width: '10px',
									height: '10px',
									display: 'flex',
									alignItems: 'center',
									justifyContent: 'center',
									transform: isTextSectionExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
									transition: 'transform 0.2s ease',
									color: 'var(--tl-color-text-2)',
								}}
							>
								<svg
									width="8"
									height="8"
									viewBox="0 0 24 24"
									fill="none"
									xmlns="http://www.w3.org/2000/svg"
								>
									<path
										d="M6 9L12 15L18 9"
										stroke="currentColor"
										strokeWidth="1.5"
										strokeLinecap="round"
										strokeLinejoin="round"
									/>
								</svg>
							</div>
						</div>
					</div>
				)}
			</div>
		</>
	)
}

// Helper function to get current font size
function getCurrentFontSize(styles: ReturnType<typeof useRelevantStyles>): number {
	if (!styles) return 24

	const fontSize = styles.get(DefaultFontSizeStyle)

	// Check if we have a custom font size first
	const editor = useEditor()
	if (editor.isIn('select')) {
		const selectedShapes = editor.getSelectedShapes()
		for (const shape of selectedShapes) {
			if (shape.type === 'text' && 'customFontSize' in shape.props && shape.props.customFontSize) {
				return shape.props.customFontSize as number
			}
		}
	}

	// Only use font size styles, never fall back to stroke size
	if (fontSize && fontSize.type === 'shared' && typeof fontSize.value === 'string') {
		return EXTENDED_FONT_SIZES[fontSize.value] || 24
	}
	return 24
}

// Helper function to get current text style property
function getCurrentTextStyle(
	styles: ReturnType<typeof useRelevantStyles>,
	property: string
): string | undefined {
	const editor = useEditor()
	if (editor.isIn('select')) {
		const selectedShapes = editor.getSelectedShapes()
		for (const shape of selectedShapes) {
			if (shape.type === 'text' && property in shape.props) {
				return (shape.props as any)[property]
			}
		}
	}
	return undefined
}

/** @public @react */
export function TextStylePickerSet({ theme, styles }: ThemeStylePickerSetProps) {
	const msg = useTranslation()
	const handleValueChange = useStyleChangeCallback()

	const editor = useEditor()
	const onHistoryMark = useCallback((id: string) => editor.markHistoryStoppingPoint(id), [editor])
	const showUiLabels = useValue('showUiLabels', () => editor.user.getShowUiLabels(), [editor])
	const labelStr = showUiLabels && msg('style-panel.font')

	const font = styles.get(DefaultFontStyle)
	const fontSize = styles.get(DefaultFontSizeStyle)
	const textAlign = styles.get(DefaultTextAlignStyle)
	const labelAlign = styles.get(DefaultHorizontalAlignStyle)
	const verticalLabelAlign = styles.get(DefaultVerticalAlignStyle)

	if (font === undefined && fontSize === undefined && labelAlign === undefined) {
		return null
	}

	return (
		<div className="tlui-style-panel__section">
			{font === undefined ? null : (
				<>
					{labelStr && <StylePanelSubheading>{labelStr}</StylePanelSubheading>}
					<TldrawUiToolbar orientation="horizontal" label={msg('style-panel.font')}>
						<TldrawUiButtonPicker
							title={msg('style-panel.font')}
							uiType="font"
							style={DefaultFontStyle}
							items={STYLES.font}
							value={font}
							onValueChange={handleValueChange}
							theme={theme}
							onHistoryMark={onHistoryMark}
						/>
					</TldrawUiToolbar>
				</>
			)}

			{fontSize === undefined ? null : (
				<>
					{showUiLabels && (
						<StylePanelSubheading>{msg('style-panel.font-size')}</StylePanelSubheading>
					)}
					<TldrawUiToolbar orientation="horizontal" label={msg('style-panel.font-size')}>
						<TldrawUiButtonPicker
							title={msg('style-panel.font-size')}
							uiType="fontSize"
							style={DefaultFontSizeStyle}
							items={STYLES.fontSize}
							value={fontSize}
							onValueChange={handleValueChange}
							theme={theme}
							onHistoryMark={onHistoryMark}
						/>
					</TldrawUiToolbar>
					{/* Custom font size input - works independently from presets */}
					<div style={{ marginTop: '6px' }}>
						<input
							type="number"
							onChange={(e) => {
								const value = parseInt(e.target.value)
								if (!isNaN(value) && value > 0 && value <= 200) {
									// Update the custom font size on selected shapes
									editor.run(() => {
										if (editor.isIn('select')) {
											const selectedShapes = editor.getSelectedShapes()
											selectedShapes.forEach((shape) => {
												if (shape.type === 'text') {
													editor.updateShape({
														id: shape.id,
														type: 'text',
														props: { customFontSize: value },
													})
												}
											})
										}
									})
									onHistoryMark('custom-font-size')
								}
							}}
							style={{
								width: '100%',
								padding: '4.5px 6px',
								border: '1px solid var(--tl-color-border)',
								borderRadius: '3px',
								background: 'var(--tl-color-panel)',
								color: 'var(--tl-color-text-1)',
								fontSize: '10px',
								fontFamily: 'inherit',
								outline: 'none',
							}}
							placeholder="Custom size (px)"
							min="1"
							max="200"
						/>
					</div>
				</>
			)}

			{textAlign === undefined ? null : (
				<>
					{showUiLabels && <StylePanelSubheading>{msg('style-panel.align')}</StylePanelSubheading>}
					<TldrawUiToolbar orientation="horizontal" label={msg('style-panel.align')}>
						<TldrawUiButtonPicker
							title={msg('style-panel.align')}
							uiType="align"
							style={DefaultTextAlignStyle}
							items={STYLES.textAlign}
							value={textAlign}
							onValueChange={handleValueChange}
							theme={theme}
							onHistoryMark={onHistoryMark}
						/>
						<TldrawUiToolbarButton
							type="icon"
							title={msg('style-panel.vertical-align')}
							data-testid="vertical-align"
							disabled
						>
							<TldrawUiButtonIcon icon="vertical-align-middle" />
						</TldrawUiToolbarButton>
					</TldrawUiToolbar>
				</>
			)}

			{labelAlign === undefined ? null : (
				<>
					{showUiLabels && (
						<StylePanelSubheading>{msg('style-panel.label-align')}</StylePanelSubheading>
					)}
					<TldrawUiToolbar orientation="horizontal" label={msg('style-panel.label-align')}>
						<TldrawUiButtonPicker
							title={msg('style-panel.label-align')}
							uiType="align"
							style={DefaultHorizontalAlignStyle}
							items={STYLES.horizontalAlign}
							value={labelAlign}
							onValueChange={handleValueChange}
							theme={theme}
							onHistoryMark={onHistoryMark}
						/>
						{verticalLabelAlign === undefined ? (
							<TldrawUiToolbarButton
								type="icon"
								title={msg('style-panel.vertical-align')}
								data-testid="vertical-align"
								disabled
							>
								<TldrawUiButtonIcon icon="vertical-align-middle" />
							</TldrawUiToolbarButton>
						) : (
							<DropdownPicker
								type="icon"
								id="geo-vertical-alignment"
								uiType="verticalAlign"
								stylePanelType="vertical-align"
								style={DefaultVerticalAlignStyle}
								items={STYLES.verticalAlign}
								value={verticalLabelAlign}
								onValueChange={handleValueChange}
							/>
						)}
					</TldrawUiToolbar>
				</>
			)}
		</div>
	)
}
/** @public @react */
export function GeoStylePickerSet({ styles }: StylePickerSetProps) {
	const msg = useTranslation()
	const handleValueChange = useStyleChangeCallback()
	const editor = useEditor()

	const geo = styles.get(GeoShapeGeoStyle)

	// Move all hooks before any conditional returns to maintain hook order
	const cornerRadius = useValue(
		'cornerRadius',
		() => {
			if (!editor.isIn('select')) return 0
			const selectedShapes = editor.getSelectedShapes()
			if (selectedShapes.length === 0) return 0

			// Check if all selected shapes are geo shapes with the same corner radius
			const geoShapes = selectedShapes.filter((shape) => shape.type === 'geo')
			if (geoShapes.length === 0) return 0

			const firstCornerRadius = (geoShapes[0] as any).props.cornerRadius
			const allSame = geoShapes.every(
				(shape) => (shape as any).props.cornerRadius === firstCornerRadius
			)

			return allSame ? firstCornerRadius : 0
		},
		[editor]
	)

	const handleCornerRadiusChange = useCallback(
		(value: number) => {
			editor.run(() => {
				if (editor.isIn('select')) {
					const selectedShapes = editor.getSelectedShapes()
					selectedShapes.forEach((shape) => {
						if (shape.type === 'geo') {
							editor.updateShape({
								id: shape.id,
								type: 'geo',
								props: { cornerRadius: value },
							})
						}
					})
				}
			})
		},
		[editor]
	)

	// Early return after all hooks are called
	if (geo === undefined) {
		return null
	}

	return (
		<>
			<TldrawUiToolbar orientation="horizontal" label={msg('style-panel.geo')}>
				<DropdownPicker
					id="geo"
					type="menu"
					label={'style-panel.geo'}
					uiType="geo"
					stylePanelType="geo"
					style={GeoShapeGeoStyle}
					items={STYLES.geo}
					value={geo}
					onValueChange={handleValueChange}
				/>
			</TldrawUiToolbar>
			{geo.type === 'shared' && geo.value === 'rectangle' && (
				<div style={{ marginTop: '9px' }}>
					<div style={{ marginBottom: '6px', fontSize: '10px', color: 'var(--tl-color-text-2)' }}>
						Corner Radius
					</div>
					<TldrawUiSlider
						value={Math.round(cornerRadius / 2)}
						onValueChange={(value) => handleCornerRadiusChange(value * 2)}
						steps={20}
						label="Corner Radius"
						title="Corner Radius"
						onHistoryMark={() => editor.markHistoryStoppingPoint('corner-radius-change')}
					/>
				</div>
			)}
		</>
	)
}
/** @public @react */
export function SplineStylePickerSet({ styles }: StylePickerSetProps) {
	const msg = useTranslation()
	const handleValueChange = useStyleChangeCallback()

	const spline = styles.get(LineShapeSplineStyle)
	if (spline === undefined) {
		return null
	}

	return (
		<TldrawUiToolbar orientation="horizontal" label={msg('style-panel.spline')}>
			<DropdownPicker
				id="spline"
				type="menu"
				label={'style-panel.spline'}
				uiType="spline"
				stylePanelType="spline"
				style={LineShapeSplineStyle}
				items={STYLES.spline}
				value={spline}
				onValueChange={handleValueChange}
			/>
		</TldrawUiToolbar>
	)
}
/** @public @react */
export function ArrowStylePickerSet({ styles }: StylePickerSetProps) {
	const msg = useTranslation()
	const handleValueChange = useStyleChangeCallback()

	const arrowKind = styles.get(ArrowShapeKindStyle)
	if (arrowKind === undefined) {
		return null
	}

	return (
		<TldrawUiToolbar orientation="horizontal" label={msg('style-panel.arrow-kind')}>
			<DropdownPicker
				id="arrow-kind"
				type="menu"
				label={'style-panel.arrow-kind'}
				uiType="arrow-kind"
				stylePanelType="arrow-kind"
				style={ArrowShapeKindStyle}
				items={STYLES.arrowKind}
				value={arrowKind}
				onValueChange={handleValueChange}
			/>
		</TldrawUiToolbar>
	)
}
/** @public @react */
export function ArrowheadStylePickerSet({ styles }: StylePickerSetProps) {
	const handleValueChange = useStyleChangeCallback()

	const arrowheadEnd = styles.get(ArrowShapeArrowheadEndStyle)
	const arrowheadStart = styles.get(ArrowShapeArrowheadStartStyle)
	if (!arrowheadEnd || !arrowheadStart) {
		return null
	}

	return (
		<DoubleDropdownPicker<TLArrowShapeArrowheadStyle>
			label={'style-panel.arrowheads'}
			uiTypeA="arrowheadStart"
			styleA={ArrowShapeArrowheadStartStyle}
			itemsA={STYLES.arrowheadStart}
			valueA={arrowheadStart}
			uiTypeB="arrowheadEnd"
			styleB={ArrowShapeArrowheadEndStyle}
			itemsB={STYLES.arrowheadEnd}
			valueB={arrowheadEnd}
			onValueChange={handleValueChange}
			labelA="style-panel.arrowhead-start"
			labelB="style-panel.arrowhead-end"
		/>
	)
}

const tldrawSupportedOpacities = [0.1, 0.25, 0.5, 0.75, 1] as const
/** @public @react */
export function StylePanelOpacityPicker() {
	const editor = useEditor()
	const { onHistoryMark, showUiLabels } = useStylePanelContext()

	const opacity = useValue('opacity', () => editor.getSharedOpacity(), [editor])
	const trackEvent = useUiEvents()
	const msg = useTranslation()

	const handleOpacityValueChange = React.useCallback(
		(value: number) => {
			const item = tldrawSupportedOpacities[value]
			editor.run(() => {
				if (editor.isIn('select')) {
					editor.setOpacityForSelectedShapes(item)
				}
				editor.setOpacityForNextShapes(item)
				editor.updateInstanceState({ isChangingStyle: true })
			})

			trackEvent('set-style', { source: 'style-panel', id: 'opacity', value })
		},
		[editor, trackEvent]
	)

	if (opacity === undefined) return null

	const opacityIndex =
		opacity.type === 'mixed'
			? -1
			: tldrawSupportedOpacities.indexOf(
					minBy(tldrawSupportedOpacities, (supportedOpacity) =>
						Math.abs(supportedOpacity - opacity.value)
					)!
				)

	return (
		<>
			{showUiLabels && <StylePanelSubheading>{msg('style-panel.opacity')}</StylePanelSubheading>}
			<TldrawUiSlider
				data-testid="style.opacity"
				value={opacityIndex >= 0 ? opacityIndex : tldrawSupportedOpacities.length - 1}
				label={opacity.type === 'mixed' ? 'style-panel.mixed' : `opacity-style.${opacity.value}`}
				onValueChange={handleOpacityValueChange}
				steps={tldrawSupportedOpacities.length - 1}
				title={msg('style-panel.opacity')}
				onHistoryMark={onHistoryMark}
				ariaValueModifier={25}
			/>
		</>
	)
}

/** @public @react */
export function StylePanelFillPicker() {
	const { styles } = useStylePanelContext()
	const msg = useTranslation()
	const fill = styles.get(DefaultFillStyle)
	if (fill === undefined) return null

	return (
		<StylePanelButtonPicker
			title={msg('style-panel.fill')}
			uiType="fill"
			style={DefaultFillStyle}
			items={STYLES.fill}
			value={fill}
		/>
	)
}

/** @public @react */
export function StylePanelDashPicker() {
	const { styles } = useStylePanelContext()
	const msg = useTranslation()
	const dash = styles.get(DefaultDashStyle)
	if (dash === undefined) return null

	return (
		<StylePanelButtonPicker
			title={msg('style-panel.dash')}
			uiType="dash"
			style={DefaultDashStyle}
			items={STYLES.dash}
			value={dash}
		/>
	)
}

/** @public @react */
export function StylePanelSizePicker() {
	const editor = useEditor()
	const { styles, onValueChange } = useStylePanelContext()
	const msg = useTranslation()
	const size = styles.get(DefaultSizeStyle)
	if (size === undefined) return null

	return (
		<StylePanelButtonPicker
			title={msg('style-panel.size')}
			uiType="size"
			style={DefaultSizeStyle}
			items={STYLES.size}
			value={size}
			onValueChange={(style, value) => {
				onValueChange(style, value)
				const selectedShapeIds = editor.getSelectedShapeIds()
				if (selectedShapeIds.length > 0) {
					kickoutOccludedShapes(editor, selectedShapeIds)
				}
			}}
		/>
	)
}

/** @public @react */
export function StylePanelFontPicker() {
	const { styles } = useStylePanelContext()
	const msg = useTranslation()
	const font = styles.get(DefaultFontStyle)
	if (font === undefined) return null

	return (
		<StylePanelButtonPicker
			title={msg('style-panel.font')}
			uiType="font"
			style={DefaultFontStyle}
			items={STYLES.font}
			value={font}
		/>
	)
}

/** @public @react */
export function StylePanelTextAlignPicker() {
	const { styles } = useStylePanelContext()
	const msg = useTranslation()
	const textAlign = styles.get(DefaultTextAlignStyle)
	if (textAlign === undefined) return null

	return (
		<TldrawUiToolbar orientation="horizontal" label={msg('style-panel.align')}>
			<StylePanelButtonPicker
				title={msg('style-panel.align')}
				uiType="align"
				style={DefaultTextAlignStyle}
				items={STYLES.textAlign}
				value={textAlign}
			/>
			<TldrawUiToolbarButton
				type="icon"
				title={msg('style-panel.vertical-align')}
				data-testid="vertical-align"
				disabled
			>
				<TldrawUiButtonIcon icon="vertical-align-middle" />
			</TldrawUiToolbarButton>
		</TldrawUiToolbar>
	)
}

/** @public @react */
export function StylePanelLabelAlignPicker() {
	const { styles } = useStylePanelContext()
	const msg = useTranslation()
	const labelAlign = styles.get(DefaultHorizontalAlignStyle)
	const verticalLabelAlign = styles.get(DefaultVerticalAlignStyle)
	if (labelAlign === undefined) return null

	return (
		<TldrawUiToolbar orientation="horizontal" label={msg('style-panel.label-align')}>
			<StylePanelButtonPicker
				title={msg('style-panel.label-align')}
				uiType="align"
				style={DefaultHorizontalAlignStyle}
				items={STYLES.horizontalAlign}
				value={labelAlign}
			/>
			{verticalLabelAlign === undefined ? (
				<TldrawUiToolbarButton
					type="icon"
					title={msg('style-panel.vertical-align')}
					data-testid="vertical-align"
					disabled
				>
					<TldrawUiButtonIcon icon="vertical-align-middle" />
				</TldrawUiToolbarButton>
			) : (
				<StylePanelDropdownPicker
					type="icon"
					id="geo-vertical-alignment"
					uiType="verticalAlign"
					stylePanelType="vertical-align"
					style={DefaultVerticalAlignStyle}
					items={STYLES.verticalAlign}
					value={verticalLabelAlign}
				/>
			)}
		</TldrawUiToolbar>
	)
}

/** @public @react */
export function StylePanelGeoShapePicker() {
	const { styles } = useStylePanelContext()
	const geo = styles.get(GeoShapeGeoStyle)
	if (geo === undefined) return null

	return (
		<StylePanelDropdownPicker
			label="style-panel.geo"
			type="menu"
			id="geo"
			uiType="geo"
			stylePanelType="geo"
			style={GeoShapeGeoStyle}
			items={STYLES.geo}
			value={geo}
		/>
	)
}

/** @public @react */
export function StylePanelArrowKindPicker() {
	const { styles } = useStylePanelContext()
	const arrowKind = styles.get(ArrowShapeKindStyle)
	if (arrowKind === undefined) return null

	return (
		<StylePanelDropdownPicker
			id="arrow-kind"
			type="menu"
			label={'style-panel.arrow-kind'}
			uiType="arrow-kind"
			stylePanelType="arrow-kind"
			style={ArrowShapeKindStyle}
			items={STYLES.arrowKind}
			value={arrowKind}
		/>
	)
}

/** @public @react */
export function StylePanelArrowheadPicker() {
	const { styles } = useStylePanelContext()
	const arrowheadEnd = styles.get(ArrowShapeArrowheadEndStyle)
	const arrowheadStart = styles.get(ArrowShapeArrowheadStartStyle)
	if (arrowheadEnd === undefined || arrowheadStart === undefined) return null

	return (
		<StylePanelDoubleDropdownPicker<TLArrowShapeArrowheadStyle>
			label={'style-panel.arrowheads'}
			uiTypeA="arrowheadStart"
			styleA={ArrowShapeArrowheadStartStyle}
			itemsA={STYLES.arrowheadStart}
			valueA={arrowheadStart}
			uiTypeB="arrowheadEnd"
			styleB={ArrowShapeArrowheadEndStyle}
			itemsB={STYLES.arrowheadEnd}
			valueB={arrowheadEnd}
			labelA="style-panel.arrowhead-start"
			labelB="style-panel.arrowhead-end"
		/>
	)
}

/** @public @react */
export function StylePanelSplinePicker() {
	const { styles } = useStylePanelContext()
	const spline = styles.get(LineShapeSplineStyle)
	if (spline === undefined) return null

	return (
		<StylePanelDropdownPicker
			type="menu"
			id="spline"
			uiType="spline"
			stylePanelType="spline"
			label="style-panel.spline"
			style={LineShapeSplineStyle}
			items={STYLES.spline}
			value={spline}
		/>
	)
}
