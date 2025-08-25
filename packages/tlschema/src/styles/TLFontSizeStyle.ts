import { T } from '@tldraw/validate'
import { StyleProp } from './StyleProp'

/** @public */
export const DefaultFontSizeStyle = StyleProp.defineEnum('tldraw:fontSize', {
	defaultValue: 'm',
	values: ['s', 'm', 'l', 'xl'],
})

/** @public */
export type TLDefaultFontSizeStyle = T.TypeOf<typeof DefaultFontSizeStyle>
