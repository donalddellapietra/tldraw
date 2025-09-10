import { Tldraw } from 'tldraw'
import 'tldraw/tldraw.css'

// Test component to verify our style panel changes work correctly
export function TestStylePanelChanges() {
	return (
		<div style={{ width: '100vw', height: '100vh' }}>
			<Tldraw
				persistenceKey="test-style-panel-changes"
				// You can add any props here to test different scenarios
			/>
		</div>
	)
}

// Instructions for testing:
// 1. Import this component in your external app
// 2. Replace your current Tldraw usage with <TestStylePanelChanges />
// 3. Test the following scenarios:
//    - No selection: Style panel should be hidden
//    - Select a rectangle: Style panel should show with corner radius
//    - Select an arrow: Style panel should show but NO corner radius
//    - Select a circle: Style panel should show but NO corner radius
//    - Select multiple shapes: Style panel should show if any are tldraw objects
