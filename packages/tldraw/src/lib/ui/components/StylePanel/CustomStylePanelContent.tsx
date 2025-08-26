import React from 'react'
import { VerticalFormattingBar } from './VerticalFormattingBar'

/** @public */
export interface TLUiCustomStylePanelContentProps {
	styles?: any
}

/** @public @react */
export function CustomStylePanelContent({ styles }: TLUiCustomStylePanelContentProps) {
	return (
		<div className="tlui-style-panel__custom-content">
			<VerticalFormattingBar isVisible={true} />
		</div>
	)
}
