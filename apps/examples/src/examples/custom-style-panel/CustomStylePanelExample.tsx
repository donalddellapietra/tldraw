import { Tldraw, CustomStylePanel } from 'tldraw'
import 'tldraw/tldraw.css'

export default function CustomStylePanelExample() {
	return (
		<div style={{ position: 'fixed', inset: 0 }}>
			<Tldraw
				components={{
					StylePanel: CustomStylePanel,
				}}
			/>
		</div>
	)
}
