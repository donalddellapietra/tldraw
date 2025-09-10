import { useEditor, useValue } from 'tldraw'

// Enhanced debug component to help identify why the style panel isn't working in your external app
export function DebugStylePanel() {
	const editor = useEditor()

	// Check if editor is available
	const editorAvailable = !!editor

	// Check current tool state
	const currentTool = useValue('currentTool', () => editor?.getCurrentToolId(), [editor])

	// Check if we're in select mode
	const isInSelect = useValue('isInSelect', () => editor?.isIn('select'), [editor])

	// Check selected shapes
	const selectedShapes = useValue(
		'selectedShapes',
		() => {
			if (!editor?.isIn('select')) return []
			return editor.getSelectedShapes()
		},
		[editor]
	)

	// Check if any tldraw objects are selected (old logic)
	const hasTldrawObjectsSelectedOld = useValue(
		'hasTldrawObjectsSelectedOld',
		() => {
			if (!editor?.isIn('select')) return false
			const selectedShapeIds = editor.getSelectedShapeIds()
			return selectedShapeIds.length > 0
		},
		[editor]
	)

	// Check if any tldraw objects are selected (new enhanced logic)
	const hasTldrawObjectsSelectedNew = useValue(
		'hasTldrawObjectsSelectedNew',
		() => {
			if (!editor?.isIn('select')) return false
			const selectedShapeIds = editor.getSelectedShapeIds()

			// Additional check: ensure we actually have tldraw shapes selected
			if (selectedShapeIds.length === 0) return false

			// Verify that the selected shapes are actually tldraw shapes
			const selectedShapes = editor.getSelectedShapes()
			const validTldrawShapes = selectedShapes.filter((shape) => {
				// Check if it's a valid tldraw shape type
				const validTypes = [
					'text',
					'geo',
					'draw',
					'arrow',
					'line',
					'frame',
					'note',
					'image',
					'video',
					'embed',
					'bookmark',
					'highlight',
				]
				return validTypes.includes(shape.type)
			})

			return validTldrawShapes.length > 0
		},
		[editor]
	)

	return (
		<div
			style={{
				position: 'fixed',
				top: '10px',
				left: '10px',
				background: 'white',
				border: '1px solid #ccc',
				padding: '10px',
				borderRadius: '4px',
				fontSize: '12px',
				zIndex: 9999,
				maxWidth: '350px',
			}}
		>
			<h4>Style Panel Debug Info</h4>
			<div>
				<strong>Editor Available:</strong> {editorAvailable ? 'Yes' : 'No'}
			</div>
			<div>
				<strong>Current Tool:</strong> {currentTool || 'None'}
			</div>
			<div>
				<strong>Is in Select Mode:</strong> {isInSelect ? 'Yes' : 'No'}
			</div>
			<div>
				<strong>Selected Shapes Count:</strong> {selectedShapes.length}
			</div>
			<div>
				<strong>Has Tldraw Objects (Old Logic):</strong>{' '}
				{hasTldrawObjectsSelectedOld ? 'Yes' : 'No'}
			</div>
			<div>
				<strong>Has Tldraw Objects (New Logic):</strong>{' '}
				{hasTldrawObjectsSelectedNew ? 'Yes' : 'No'}
			</div>
			<div>
				<strong>Style Panel Should Show:</strong> {hasTldrawObjectsSelectedNew ? 'Yes' : 'No'}
			</div>
			{selectedShapes.length > 0 && (
				<div>
					<strong>Selected Shape Types:</strong>
					<ul>
						{selectedShapes.map((shape, index) => (
							<li key={index}>
								{shape.type} {shape.type === 'geo' ? `(${(shape as any).props.geo})` : ''}
							</li>
						))}
					</ul>
				</div>
			)}
			<div style={{ marginTop: '10px', fontSize: '10px', color: '#666' }}>
				<strong>Instructions:</strong>
				<br />
				1. Click on a Task Board widget (should show "No" for Style Panel)
				<br />
				2. Click on a tldraw shape (should show "Yes" for Style Panel)
				<br />
				3. The style panel should only appear for tldraw shapes
			</div>
		</div>
	)
}

// Usage in your external app:
// import { DebugStylePanel } from './debug-style-panel'
//
// function MyApp() {
//   return (
//     <div>
//       <Tldraw />
//       <DebugStylePanel />
//     </div>
//   )
// }
