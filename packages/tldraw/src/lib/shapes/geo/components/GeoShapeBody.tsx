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
	const { fillColor, strokeColor, fill, dash, size } = props
	const strokeWidth = STROKE_SIZES[size] * scaleToUse

	const path = getGeoShapePath(shape)
	const fillPath =
		dash === 'draw' && !forceSolid
			? path.toDrawD({ strokeWidth, randomSeed: shape.id, passes: 1, offset: 0, onlyFilled: true })
			: path.toD({ onlyFilled: true })

	// Use the new separate color properties
	const fillColorToUse = fillColor || props.color // Fallback to old color for backward compatibility
	const strokeColorToUse = strokeColor || props.color // Fallback to old color for backward compatibility

	return (
		<>
			<ShapeFill
				theme={theme}
				d={fillPath}
				color={fillColorToUse}
				fill={fill}
				scale={scaleToUse}
				resolvedFillHex={undefined}
			/>
			{path.toSvg({
				style: dash,
				strokeWidth,
				forceSolid,
				randomSeed: shape.id,
				props: {
					fill: 'none',
					stroke: getColorValue(theme, strokeColorToUse, 'solid'),
				},
			})}
		</>
	)
}
