import {
	BaseBoxShapeUtil,
	DefaultColorStyle,
	HTMLContainer,
	RecordProps,
	T,
	TLBaseShape,
	TLDefaultColorStyle,
	Tldraw,
	createShapeId,
	useEditor,
} from 'tldraw'
import 'tldraw/tldraw.css'

// Define a test shape type
type TestShape = TLBaseShape<
	'test',
	{
		w: number
		h: number
		color: TLDefaultColorStyle
		canBeDeleted: boolean
	}
>

// Test shape util with custom deletion logic
class TestShapeUtil extends BaseBoxShapeUtil<TestShape> {
	static override type = 'test' as const

	static override props: RecordProps<TestShape> = {
		w: T.number,
		h: T.number,
		color: DefaultColorStyle,
		canBeDeleted: T.boolean,
	}

	getDefaultProps(): TestShape['props'] {
		return {
			w: 200,
			h: 100,
			color: 'blue',
			canBeDeleted: false,
		}
	}

	// Test canDelete - only allow deletion if canBeDeleted is true
	override canDelete(shape: TestShape): boolean {
		console.log('canDelete called for shape:', shape.id, 'canBeDeleted:', shape.props.canBeDeleted)
		return shape.props.canBeDeleted
	}

	// Test onBeforeDelete - show confirmation and mark as deletable
	override onBeforeDelete(shape: TestShape): boolean | void {
		console.log('onBeforeDelete called for shape:', shape.id)

		if (shape.props.canBeDeleted) {
			console.log('Shape is deletable, allowing deletion')
			return true
		}

		console.log('Shape is not deletable, showing confirmation')
		const confirmed = confirm(
			`Delete shape ${shape.id}? This will mark it as deletable and delete it.`
		)

		if (confirmed) {
			// Mark the shape as deletable and try to delete again
			this.editor.updateShape({
				id: shape.id,
				type: 'test',
				props: {
					...shape.props,
					canBeDeleted: true,
				},
			})

			// Try to delete again
			setTimeout(() => {
				this.editor.deleteShape(shape.id)
			}, 0)
		}

		return false // Prevent this deletion attempt
	}

	component(shape: TestShape) {
		return (
			<HTMLContainer
				style={{
					width: shape.props.w,
					height: shape.props.h,
					pointerEvents: 'all',
				}}
			>
				<div
					style={{
						width: '100%',
						height: '100%',
						backgroundColor: shape.props.color,
						borderRadius: '8px',
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						color: 'white',
						fontWeight: 'bold',
						fontSize: '14px',
						flexDirection: 'column',
						padding: '8px',
						boxSizing: 'border-box',
					}}
				>
					<div>Test Shape</div>
					<div style={{ fontSize: '12px', marginTop: '4px' }}>
						{shape.props.canBeDeleted ? '✅ Deletable' : '🔒 Protected'}
					</div>
					<div style={{ fontSize: '10px', marginTop: '4px', textAlign: 'center' }}>
						Press Delete key to test
					</div>
				</div>
			</HTMLContainer>
		)
	}

	indicator(shape: TestShape) {
		return <rect width={shape.props.w} height={shape.props.h} rx={8} />
	}
}

// Component to add test shapes
function TestControls() {
	const editor = useEditor()

	const addProtectedShape = () => {
		const id = createShapeId()
		editor.createShape({
			id,
			type: 'test',
			x: Math.random() * 400,
			y: Math.random() * 300,
			props: {
				w: 200,
				h: 100,
				color: 'red',
				canBeDeleted: false,
			},
		})
		editor.select(id)
	}

	const addDeletableShape = () => {
		const id = createShapeId()
		editor.createShape({
			id,
			type: 'test',
			x: Math.random() * 400,
			y: Math.random() * 300,
			props: {
				w: 200,
				h: 100,
				color: 'green',
				canBeDeleted: true,
			},
		})
		editor.select(id)
	}

	const testMultipleShapes = () => {
		const ids = []
		for (let i = 0; i < 3; i++) {
			const id = createShapeId()
			ids.push(id)
			editor.createShape({
				id,
				type: 'test',
				x: 100 + i * 220,
				y: 100,
				props: {
					w: 200,
					h: 100,
					color: i === 0 ? 'red' : 'blue',
					canBeDeleted: i !== 0, // First one is protected, others are deletable
				},
			})
		}
		editor.select(...ids)
	}

	return (
		<div
			style={{
				position: 'absolute',
				top: 10,
				left: 10,
				zIndex: 1000,
				background: 'white',
				padding: '10px',
				borderRadius: '8px',
				boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
				display: 'flex',
				flexDirection: 'column',
				gap: '8px',
			}}
		>
			<h3 style={{ margin: 0, fontSize: '14px' }}>Test Custom Deletion</h3>
			<button onClick={addProtectedShape} style={{ padding: '4px 8px', fontSize: '12px' }}>
				Add Protected Shape (Red)
			</button>
			<button onClick={addDeletableShape} style={{ padding: '4px 8px', fontSize: '12px' }}>
				Add Deletable Shape (Green)
			</button>
			<button onClick={testMultipleShapes} style={{ padding: '4px 8px', fontSize: '12px' }}>
				Test Multiple Selection
			</button>
			<div style={{ fontSize: '10px', color: '#666', marginTop: '4px' }}>
				Select shapes and press Delete key to test
			</div>
		</div>
	)
}

const customShapeUtils = [TestShapeUtil]

export default function CustomShapeDeletionExample() {
	return (
		<div style={{ position: 'relative', width: '100vw', height: '100vh' }}>
			<Tldraw
				shapeUtils={customShapeUtils}
				onMount={(editor) => {
					// Add some initial shapes for testing
					const protectedId = createShapeId()
					const deletableId = createShapeId()

					editor.createShapes([
						{
							id: protectedId,
							type: 'test',
							x: 100,
							y: 100,
							props: {
								w: 200,
								h: 100,
								color: 'red',
								canBeDeleted: false,
							},
						},
						{
							id: deletableId,
							type: 'test',
							x: 350,
							y: 100,
							props: {
								w: 200,
								h: 100,
								color: 'green',
								canBeDeleted: true,
							},
						},
					])

					console.log('Test shapes created. Try selecting and deleting them!')
				}}
			>
				<TestControls />
			</Tldraw>
		</div>
	)
}
