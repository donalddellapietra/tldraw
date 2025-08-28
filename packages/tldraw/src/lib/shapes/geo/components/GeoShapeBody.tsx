import { getColorValue, TLGeoShape } from '@tldraw/editor'
import { ShapeFill } from '../../shared/ShapeFill'
import { STROKE_SIZES } from '../../shared/default-shape-constants'
import { useDefaultColorTheme } from '../../shared/useDefaultColorTheme'
import { getGeoShapePath } from '../getGeoShapePath'

export function GeoShapeBody({
	shape,
	shouldScale,
	forceSolid,
}: {
	shape: TLGeoShape
	shouldScale: boolean
	forceSolid: boolean
}) {
	const scaleToUse = shouldScale ? shape.props.scale : 1
	const theme = useDefaultColorTheme()
	const { props } = shape
	const { color, fill, dash, size } = props
	const strokeWidth = STROKE_SIZES[size] * scaleToUse

	const path = getGeoShapePath(shape)
	const fillPath =
		dash === 'draw' && !forceSolid
			? path.toDrawD({ strokeWidth, randomSeed: shape.id, passes: 1, offset: 0, onlyFilled: true })
			: path.toD({ onlyFilled: true })

	// Resolve fill and stroke colors with custom/meta fallbacks
	const resolvedFillHex = (function () {
		const custom = (props as any).customFillColor as string | undefined
		if (custom && typeof custom === 'string') return custom
		const meta = (shape as any).meta
		const metaCustom = meta?.customFillColor
		if (metaCustom && typeof metaCustom === 'string') return metaCustom
		return undefined
	})()

	const strokeColorToUse = (function () {
		const custom = (props as any).customStrokeColor as string | undefined
		if (custom && typeof custom === 'string') return custom as any
		const meta = (shape as any).meta
		const metaCustom = meta?.customStrokeColor
		if (metaCustom && typeof metaCustom === 'string') return metaCustom as any
		return color
	})()

	return (
		<>
			<ShapeFill
				theme={theme}
				d={fillPath}
				color={color}
				fill={fill}
				scale={scaleToUse}
				resolvedFillHex={resolvedFillHex}
			/>
			{path.toSvg({
				style: dash,
				strokeWidth,
				forceSolid,
				randomSeed: shape.id,
				props: {
					fill: 'none',
					stroke: strokeColorToUse.startsWith
						? (strokeColorToUse as any).startsWith('#')
							? (strokeColorToUse as any)
							: getColorValue(theme, strokeColorToUse as any, 'solid')
						: getColorValue(theme, strokeColorToUse as any, 'solid'),
				},
			})}
		</>
	)
}
