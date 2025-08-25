import {
	ArrowShapeArrowheadEndStyle,
	ArrowShapeArrowheadStartStyle,
	ArrowShapeKindStyle,
	DefaultColorStyle,
	DefaultDashStyle,
	DefaultFillStyle,
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
import { DefaultFontSizeStyle, DefaultStrokeColorStyle } from '@tldraw/tlschema'
import React, { useCallback, useState } from 'react'
import { STYLES } from '../../../styles'
import { useUiEvents } from '../../context/events'
import { useTranslation } from '../../hooks/useTranslation/useTranslation'
import { EXTENDED_FONT_SIZES, FONT_SIZES, STROKE_SIZES } from '../../../shapes/shared/default-shape-constants'
import { TldrawUiButtonIcon } from '../primitives/Button/TldrawUiButtonIcon'
import { TldrawUiButtonPicker } from '../primitives/TldrawUiButtonPicker'
import { TldrawUiColorPicker } from '../primitives/TldrawUiColorPicker'
import { TldrawUiSlider } from '../primitives/TldrawUiSlider'
import { TldrawUiToolbar, TldrawUiToolbarButton } from '../primitives/TldrawUiToolbar'
import { DoubleDropdownPicker } from './DoubleDropdownPicker'
import { DropdownPicker } from './DropdownPicker'
import { FigmaTypographyPanel } from './FigmaTypographyPanel'
import './FigmaTypographyPanel.css'


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
	const [isColorSectionExpanded, setIsColorSectionExpanded] = useState(true)
	const [isFillSectionExpanded, setIsFillSectionExpanded] = useState(true)
	const [isDashSectionExpanded, setIsDashSectionExpanded] = useState(true)
	const [isSizeSectionExpanded, setIsSizeSectionExpanded] = useState(true)
	const [isTextSectionExpanded, setIsTextSectionExpanded] = useState(true)

	const color = styles.get(DefaultColorStyle)
	const strokeColor = styles.get(DefaultStrokeColorStyle)
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
				{/* Color Session Section */}
				<div
					style={{
						marginTop: '0px',
						marginBottom: '12px',
						background: 'var(--tl-color-panel)',
						borderRadius: '6px',
						border: '1px solid var(--tl-color-border)',
						overflow: 'hidden',
						width: '100%',
						boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
					}}
				>
					{/* Session Header - Clickable for Expand/Collapse */}
					<div
						onClick={() => setIsColorSectionExpanded(!isColorSectionExpanded)}
						style={{
							padding: '12px 16px',
							background: 'var(--tl-color-muted-1)',
							borderBottom: '1px solid var(--tl-color-border)',
							fontSize: '11px',
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
						<span style={{ fontWeight: '500' }}>Color</span>
						<div
							style={{
								width: '14px',
								height: '14px',
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center',
								transform: isColorSectionExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
								transition: 'transform 0.2s ease',
								color: 'var(--tl-color-text-2)',
							}}
						>
							<svg
								width="10"
								height="10"
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
					{isColorSectionExpanded && (
						<div style={{ padding: '16px' }}>
							{/* Current Color Section */}
							<div style={{ marginBottom: '20px' }}>
								<div
									style={{
										fontSize: '12px',
										fontWeight: '500',
										color: 'var(--tl-color-text-2)',
										marginBottom: '12px',
									}}
								>
									Current Color:
								</div>

								{/* Color Picker Dropdown */}
								{color === undefined ? null : (
									<TldrawUiToolbar orientation="horizontal" label={msg('style-panel.color')}>
										<TldrawUiColorPicker
											title={msg('style-panel.color')}
											value={
												color.type === 'shared'
													? getColorValue(theme, color.value, 'solid')
													: '#000000'
											}
											onValueChange={(newColor) => {
												console.log('Color picker selected:', newColor)
												console.log('Current editor selection:', editor.getSelectedShapeIds())
												console.log('Current color style:', color)

												// Find the closest tldraw color to the hex color
												const hexToRgb = (hex: string) => {
													const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
													return result
														? {
																r: parseInt(result[1], 16),
																g: parseInt(result[2], 16),
																b: parseInt(result[3], 16),
															}
														: null
												}

												const rgbToHsl = (r: number, g: number, b: number) => {
													r /= 255
													g /= 255
													b /= 255

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

													return { h: h * 360, s: s * 100, l: l * 100 }
												}

												const findClosestColor = (hexColor: string) => {
													const targetRgb = hexToRgb(hexColor)
													if (!targetRgb) return 'black'

													const targetHsl = rgbToHsl(targetRgb.r, targetRgb.g, targetRgb.b)

													let closestColor = 'black'
													let minDistance = Infinity

													STYLES.color.forEach((colorStyle) => {
														const colorHex = getColorValue(theme, colorStyle.value, 'solid')
														const colorRgb = hexToRgb(colorHex)
														if (colorRgb) {
															const colorHsl = rgbToHsl(colorRgb.r, colorRgb.g, colorRgb.b)

															// Calculate distance using HSL (more perceptually accurate)
															const hDiff = Math.min(
																Math.abs(targetHsl.h - colorHsl.h),
																360 - Math.abs(targetHsl.h - colorHsl.h)
															)
															const sDiff = Math.abs(targetHsl.s - colorHsl.s)
															const lDiff = Math.abs(targetHsl.l - colorHsl.l)

															const distance = Math.sqrt(
																hDiff * hDiff + sDiff * sDiff + lDiff * lDiff
															)

															if (distance < minDistance) {
																minDistance = distance
																closestColor = colorStyle.value
															}
														}
													})

													return closestColor
												}

												const closestTldrawColor = findClosestColor(newColor)
												console.log('Mapped to tldraw color:', closestTldrawColor)

												// Mark history before changing the color
												onHistoryMark?.('color-picker-change')

												// Apply the color change
												handleValueChange(DefaultColorStyle, closestTldrawColor)

												// Explicitly update the selected shapes to ensure the color change is visible
												const selectedShapeIds = editor.getSelectedShapeIds()
												if (selectedShapeIds.length > 0) {
													console.log(
														'Updating selected shapes with new color:',
														closestTldrawColor
													)
													selectedShapeIds.forEach((shapeId) => {
														const shape = editor.getShape(shapeId)
														if (shape && 'color' in shape.props) {
															editor.updateShape({
																id: shapeId,
																type: shape.type,
																props: {
																	...shape.props,
																	color: closestTldrawColor,
																},
															})
														}
													})
												}

												// Force a repaint to ensure the change is visible
												editor.updateInstanceState({})

												console.log(
													'Color change applied, new selection state:',
													editor.getSelectedShapeIds()
												)
											}}
										/>
									</TldrawUiToolbar>
								)}
							</div>

							{/* Stroke Color Section - Only show when stroke color is relevant */}
							{strokeColor !== undefined && (
								<div style={{ marginBottom: '20px' }}>
									<div
										style={{
											fontSize: '12px',
											fontWeight: '500',
											color: 'var(--tl-color-text-2)',
											marginBottom: '12px',
										}}
									>
										Stroke Color:
									</div>

									{/* Stroke Color Picker Dropdown */}
									<TldrawUiToolbar orientation="horizontal" label="Stroke Color">
										<TldrawUiColorPicker
											title="Stroke Color"
											value={
												strokeColor.type === 'shared'
													? getColorValue(theme, strokeColor.value, 'solid')
													: '#000000'
											}
											onValueChange={(newColor) => {
												console.log('Stroke color picker selected:', newColor)
												console.log('Current editor selection:', editor.getSelectedShapeIds())
												console.log('Current stroke color style:', strokeColor)

												// Find the closest tldraw color to the hex color
												const hexToRgb = (hex: string) => {
													const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
													return result
														? {
																r: parseInt(result[1], 16),
																g: parseInt(result[2], 16),
																b: parseInt(result[3], 16),
															}
														: null
												}

												const rgbToHsl = (r: number, g: number, b: number) => {
													r /= 255
													g /= 255
													b /= 255

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

													return { h: h * 360, s: s * 100, l: l * 100 }
												}

												const findClosestColor = (hexColor: string) => {
													const targetRgb = hexToRgb(hexColor)
													if (!targetRgb) return 'black'

													const targetHsl = rgbToHsl(targetRgb.r, targetRgb.g, targetRgb.b)

													let closestColor = 'black'
													let minDistance = Infinity

													STYLES.color.forEach((colorStyle) => {
														const colorHex = getColorValue(theme, colorStyle.value, 'solid')
														const colorRgb = hexToRgb(colorHex)
														if (colorRgb) {
															const colorHsl = rgbToHsl(colorRgb.r, colorRgb.g, colorRgb.b)

															// Calculate distance using HSL (more perceptually accurate)
															const hDiff = Math.min(
																Math.abs(targetHsl.h - colorHsl.h),
																360 - Math.abs(targetHsl.h - colorHsl.h)
															)
															const sDiff = Math.abs(targetHsl.s - colorHsl.s)
															const lDiff = Math.abs(targetHsl.l - colorHsl.l)

															const distance = Math.sqrt(
																hDiff * hDiff + sDiff * sDiff + lDiff * lDiff
															)

															if (distance < minDistance) {
																minDistance = distance
																closestColor = colorStyle.value
															}
														}
													})

													return closestColor
												}

												const closestTldrawColor = findClosestColor(newColor)
												console.log('Mapped to tldraw stroke color:', closestTldrawColor)

												// Mark history before changing the stroke color
												onHistoryMark?.('stroke-color-picker-change')

												// Apply the stroke color change
												handleValueChange(DefaultStrokeColorStyle, closestTldrawColor)

												// Explicitly update the selected shapes to ensure the stroke color change is visible
												const selectedShapeIds = editor.getSelectedShapeIds()
												if (selectedShapeIds.length > 0) {
													console.log(
														'Updating selected shapes with new stroke color:',
														closestTldrawColor
													)
													selectedShapeIds.forEach((shapeId) => {
														const shape = editor.getShape(shapeId)
														if (shape && 'strokeColor' in shape.props) {
															editor.updateShape({
																id: shapeId,
																type: shape.type,
																props: {
																	...shape.props,
																	strokeColor: closestTldrawColor,
																},
															})
														}
													})
												}

												// Force a repaint to ensure the change is visible
												editor.updateInstanceState({})

												console.log(
													'Stroke color change applied, new selection state:',
													editor.getSelectedShapeIds()
												)
											}}
										/>
									</TldrawUiToolbar>
								</div>
							)}

							{/* Opacity Section */}
							<div>
								<div
									style={{
										fontSize: '12px',
										fontWeight: '500',
										color: 'var(--tl-color-text-2)',
										marginBottom: '8px',
									}}
								>
									Opacity:
								</div>
								<OpacitySlider />
							</div>
						</div>
					)}
				</div>
			</div>
			{/* Fill Session Section */}
			{fill !== undefined && (
				<div
					style={{
						marginTop: '0px',
						marginBottom: '12px',
						background: 'var(--tl-color-panel)',
						borderRadius: '6px',
						border: '1px solid var(--tl-color-border)',
						overflow: 'hidden',
						width: '100%',
						boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
					}}
				>
					{/* Session Header - Clickable for Expand/Collapse */}
					<div
						onClick={() => setIsFillSectionExpanded(!isFillSectionExpanded)}
						style={{
							padding: '12px 16px',
							background: 'var(--tl-color-muted-1)',
							borderBottom: '1px solid var(--tl-color-border)',
							fontSize: '11px',
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
						<span style={{ fontWeight: '500' }}>Fill</span>
						<div
							style={{
								width: '14px',
								height: '14px',
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center',
								transform: isFillSectionExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
								transition: 'transform 0.2s ease',
								color: 'var(--tl-color-text-2)',
							}}
						>
							<svg
								width="10"
								height="10"
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
					{isFillSectionExpanded && (
						<div style={{ padding: '16px' }}>
							{showUiLabels && (
								<StylePanelSubheading>{msg('style-panel.fill')}</StylePanelSubheading>
							)}
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
					)}
				</div>
			)}

			{/* Dash Session Section */}
			{dash !== undefined && (
				<div
					style={{
						marginTop: '0px',
						marginBottom: '12px',
						background: 'var(--tl-color-panel)',
						borderRadius: '6px',
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
							padding: '12px 16px',
							background: 'var(--tl-color-muted-1)',
							borderBottom: '1px solid var(--tl-color-border)',
							fontSize: '11px',
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
								width: '14px',
								height: '14px',
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center',
								transform: isDashSectionExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
								transition: 'transform 0.2s ease',
								color: 'var(--tl-color-text-2)',
							}}
						>
							<svg
								width="10"
								height="10"
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
						<div style={{ padding: '16px' }}>
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
								<div style={{ marginTop: '16px' }}>
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
									<div style={{ marginTop: '12px' }}>
										{showUiLabels && (
											<div style={{ marginBottom: '8px', fontSize: '12px', color: 'var(--tl-color-text-2)' }}>
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
												defaultValue={size && size.type === 'shared' ? STROKE_SIZES[size.value] : ''}
												style={{
													width: '100%',
													padding: '8px 12px',
													border: '1px solid var(--tl-color-border)',
													borderRadius: '4px',
													background: 'var(--tl-color-panel)',
													color: 'var(--tl-color-text-1)',
													fontSize: '12px',
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
											<div style={{
												position: 'absolute',
												right: '8px',
												top: '50%',
												transform: 'translateY(-50%)',
												pointerEvents: 'none',
												color: 'var(--tl-color-text-3)',
												fontSize: '10px',
												fontWeight: '500',
											}}>
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
						marginBottom: '12px',
						background: 'var(--tl-color-panel)',
						borderRadius: '6px',
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
							padding: '12px 16px',
							background: 'var(--tl-color-muted-1)',
							borderBottom: '1px solid var(--tl-color-border)',
							fontSize: '11px',
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
								width: '14px',
								height: '14px',
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center',
								transform: isSizeSectionExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
								transition: 'transform 0.2s ease',
								color: 'var(--tl-color-text-2)',
							}}
						>
							<svg
								width="10"
								height="10"
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
						<div style={{ padding: '16px' }}>
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
						marginBottom: '12px',
						background: 'var(--tl-color-panel)',
						borderRadius: '6px',
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
							padding: '12px 16px',
							background: 'var(--tl-color-muted-1)',
							borderBottom: '1px solid var(--tl-color-border)',
							fontSize: '11px',
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
								width: '14px',
								height: '14px',
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center',
								transform: isTextSectionExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
								transition: 'transform 0.2s ease',
								color: 'var(--tl-color-text-2)',
							}}
						>
							<svg
								width="10"
								height="10"
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
					{isTextSectionExpanded && (
						<div style={{ padding: '16px' }}>
							<FigmaTypographyPanel styles={styles} />
						</div>
					)}
				</div>
			)}
		</>
	)
}

// Helper function to get current font size
function getCurrentFontSize(styles: ReturnType<typeof useRelevantStyles>): number {
	if (!styles) return 24
	
	const fontSize = styles.get(DefaultFontSizeStyle)
	const size = styles.get(DefaultSizeStyle)
	
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
	
	// Fall back to preset values
	if (fontSize && fontSize.type === 'shared' && typeof fontSize.value === 'string') {
		return EXTENDED_FONT_SIZES[fontSize.value] || 24
	}
	if (size && size.type === 'shared' && typeof size.value === 'string') {
		return FONT_SIZES[size.value] || 24
	}
	return 24
}

// Helper function to get current text style property
function getCurrentTextStyle(styles: ReturnType<typeof useRelevantStyles>, property: string): string | undefined {
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
					{showUiLabels && <StylePanelSubheading>{msg('style-panel.font-size')}</StylePanelSubheading>}
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
													<div style={{ marginTop: '8px' }}>
														<input
															type="number"
															onChange={(e) => {
																const value = parseInt(e.target.value)
																if (!isNaN(value) && value > 0 && value <= 200) {
																	// Update the custom font size on selected shapes
																	editor.run(() => {
																		if (editor.isIn('select')) {
																			const selectedShapes = editor.getSelectedShapes()
																			selectedShapes.forEach(shape => {
																				if (shape.type === 'text') {
																					editor.updateShape({
																						id: shape.id,
																						type: 'text',
																						props: { customFontSize: value }
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
																padding: '6px 8px',
																border: '1px solid var(--tl-color-border)',
																borderRadius: '4px',
																background: 'var(--tl-color-panel)',
																color: 'var(--tl-color-text-1)',
																fontSize: '12px',
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

	const geo = styles.get(GeoShapeGeoStyle)
	if (geo === undefined) {
		return null
	}

	return (
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
