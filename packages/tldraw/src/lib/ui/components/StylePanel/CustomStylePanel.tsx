import { useEditor, usePassThroughWheelEvents, useValue } from '@tldraw/editor'
import { ReactNode, memo, useCallback, useEffect, useRef } from 'react'
import { CustomStylePanelContent } from './CustomStylePanelContent'

/** @public */
export interface TLUiCustomStylePanelProps {
	isMobile?: boolean
	children?: ReactNode
}

/** @public @react */
export const CustomStylePanel = memo(function CustomStylePanel({
	isMobile,
	children,
}: TLUiCustomStylePanelProps) {
	const editor = useEditor()
	const showUiLabels = useValue('showUiLabels', () => editor.user.getShowUiLabels(), [editor])

	const ref = useRef<HTMLDivElement>(null)
	usePassThroughWheelEvents(ref)

	const handlePointerOut = useCallback(() => {
		if (!isMobile) {
			editor.updateInstanceState({ isChangingStyle: false })
		}
	}, [editor, isMobile])

	const content = children ?? <CustomStylePanelContent styles={null} />

	useEffect(() => {
		function handleKeyDown(event: KeyboardEvent) {
			if (event.key === 'Escape' && ref.current?.contains(document.activeElement)) {
				event.stopPropagation()
				editor.getContainer().focus()
			}
		}

		const stylePanelContainerEl = ref.current
		stylePanelContainerEl?.addEventListener('keydown', handleKeyDown, { capture: true })
		return () => {
			stylePanelContainerEl?.removeEventListener('keydown', handleKeyDown, { capture: true })
		}
	}, [editor])

	return (
		<div
			ref={ref}
			className="tlui-custom-style-panel"
			data-ismobile={isMobile}
			data-show-ui-labels={showUiLabels}
			onPointerLeave={handlePointerOut}
		>
			{content}
		</div>
	)
})
