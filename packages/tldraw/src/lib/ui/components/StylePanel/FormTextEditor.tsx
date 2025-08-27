import { useEditor } from '@tldraw/editor'
import { useEffect, useRef } from 'react'

interface FormTextEditorProps {
	// This component will be automatically injected into the editor
}

export function FormTextEditor({}: FormTextEditorProps) {
	const editor = useEditor()
	const observerRef = useRef<MutationObserver | null>(null)

	// Function to make text inside forms editable
	const makeFormsEditable = () => {
		console.log('🔧 FormTextEditor: Making forms editable...')

		// Find all geo shapes (forms)
		const geoShapes = document.querySelectorAll('.tl-geo')
		console.log('🔧 Found geo shapes:', geoShapes.length)

		geoShapes.forEach((geoShape, index) => {
			const geoShapeId = geoShape.getAttribute('data-shape-id')
			if (geoShapeId) {
				try {
					const shape = editor.getShape(geoShapeId as any)
					if (shape && shape.type === 'geo' && (shape.props as any).richText) {
						console.log(`🔧 Geo shape ${index} has richText, making it editable`)

						// Remove existing event listeners to avoid duplicates
						geoShape.removeEventListener('click', handleFormClick)
						geoShape.removeEventListener('dblclick', handleFormDoubleClick)

						// Add click and double-click handlers for text editing
						geoShape.addEventListener('click', handleFormClick)
						geoShape.addEventListener('dblclick', handleFormDoubleClick)

						// Mark as having text and make it look editable
						geoShape.setAttribute('data-has-text', 'true')
						geoShape.classList.add('tl-form-with-text')
						;(geoShape as HTMLElement).style.cursor = 'text'

						// Apply font size from meta data if it exists
						if (shape.meta && shape.meta.textFontSize) {
							applyFontSizeToGeoShape(geoShape, shape.meta.textFontSize as number)
						}

						// Apply text alignment from meta data if it exists (for geo shapes)
						if (shape.meta && shape.meta.textAlign) {
							applyTextAlignToGeoShape(geoShape, shape.meta.textAlign as string)
						}

						// Apply text style highlighting classes if styles are applied
						if ((shape.props as any).richText) {
							applyTextStyleHighlighting(geoShape, (shape.props as any).richText)
						}

						// Apply text color from meta data if it exists
						if (shape.meta && shape.meta.textColor) {
							applyTextColorToGeoShape(geoShape, shape.meta.textColor as string)
						}

						// Refresh text style highlighting to ensure current state is visible
						setTimeout(() => {
							refreshTextStyleHighlighting(geoShape, (shape.props as any).richText)
						}, 100)

						// Add hover effects
						geoShape.addEventListener('mouseenter', () => {
							geoShape.classList.add('tl-text-hover')
						})

						geoShape.addEventListener('mouseleave', () => {
							geoShape.classList.remove('tl-text-hover')
						})
					}
				} catch (error) {
					console.warn('Failed to check geo shape for richText:', error)
				}
			}
		})

		console.log('🔧 Text enhancement completed')
	}

	// Function to apply font size to geo shape text elements
	const applyFontSizeToGeoShape = (geoShape: Element, fontSize: number) => {
		const textElements = geoShape.querySelectorAll('.tl-text-content, .tl-rich-text')
		textElements.forEach((textElement) => {
			;(textElement as HTMLElement).style.fontSize = `${fontSize}px`
		})
	}

	// Function to apply text alignment to geo shape text elements
	const applyTextAlignToGeoShape = (geoShape: Element, textAlign: string) => {
		const textElements = geoShape.querySelectorAll('.tl-text-content, .tl-rich-text')
		textElements.forEach((textElement) => {
			;(textElement as HTMLElement).style.textAlign = textAlign
		})
	}

	// Function to apply text style highlighting classes
	const applyTextStyleHighlighting = (geoShape: Element, richText: any) => {
		const textElements = geoShape.querySelectorAll('.tl-text-content, .tl-rich-text')
		textElements.forEach((textElement) => {
			const textContent = textElement.textContent || ''
			let classes = ''

			if (richText.bold) {
				classes += ' tl-bold'
			}
			if (richText.italic) {
				classes += ' tl-italic'
			}
			if (richText.code) {
				classes += ' tl-code'
			}

			if (classes) {
				;(textElement as HTMLElement).classList.add(...classes.split(' '))
			}
		})
	}

	// Function to refresh text style highlighting classes
	const refreshTextStyleHighlighting = (geoShape: Element, richText: any) => {
		const textElements = geoShape.querySelectorAll('.tl-text-content, .tl-rich-text')
		textElements.forEach((textElement) => {
			const textContent = textElement.textContent || ''
			let classes = ''

			if (richText.bold) {
				classes += ' tl-bold'
			}
			if (richText.italic) {
				classes += ' tl-italic'
			}
			if (richText.code) {
				classes += ' tl-code'
			}

			if (classes) {
				;(textElement as HTMLElement).classList.remove(...classes.split(' ')) // Remove all existing classes
				;(textElement as HTMLElement).classList.add(...classes.split(' ')) // Add new classes
			}
		})
	}

	// Function to apply text color to geo shape text elements
	const applyTextColorToGeoShape = (geoShape: Element, textColor: string) => {
		const textElements = geoShape.querySelectorAll('.tl-text-content, .tl-rich-text')
		textElements.forEach((textElement) => {
			;(textElement as HTMLElement).style.color = textColor
		})
	}

	// Function to watch for font size changes in meta data
	const watchForFontSizeChanges = () => {
		// Set up a mutation observer to watch for changes in the editor
		const observer = new MutationObserver((mutations) => {
			mutations.forEach((mutation) => {
				if (mutation.type === 'attributes' && mutation.attributeName === 'data-shape-id') {
					// A shape's data-shape-id changed, check if it has font size meta data
					const geoShape = mutation.target as Element
					const geoShapeId = geoShape.getAttribute('data-shape-id')

					if (geoShapeId) {
						try {
							const shape = editor.getShape(geoShapeId as any)
							if (shape && shape.type === 'geo' && shape.meta && shape.meta.textFontSize) {
								console.log('🔧 Applying font size from meta data:', shape.meta.textFontSize)
								applyFontSizeToGeoShape(geoShape, shape.meta.textFontSize as number)
							}
						} catch (error) {
							// Shape might not exist yet, ignore
						}
					}
				}
			})
		})

		// Start observing
		const editorContainer = editor.getContainer()
		if (editorContainer) {
			observer.observe(editorContainer, {
				attributes: true,
				attributeFilter: ['data-shape-id'],
				subtree: true,
			})
		}

		return observer
	}

	// Handle clicks on forms to start text editing
	const handleFormClick = (event: Event) => {
		event.preventDefault()
		event.stopPropagation()

		const geoShape = event.currentTarget as HTMLElement
		const geoShapeId = geoShape.getAttribute('data-shape-id')

		if (geoShapeId) {
			try {
				const shape = editor.getShape(geoShapeId as any)
				if (shape && shape.type === 'geo' && (shape.props as any).richText) {
					console.log('🔧 Starting text editing for geo shape:', shape)

					// Use tldraw's built-in text editing system
					editor.setEditingShape(shape)
				}
			} catch (error) {
				console.warn('Failed to start text editing:', error)
			}
		}
	}

	// Handle double-clicks on forms
	const handleFormDoubleClick = (event: Event) => {
		event.preventDefault()
		event.stopPropagation()

		// Double-click also starts editing
		handleFormClick(event)
	}

	// Initialize form text editing
	useEffect(() => {
		// Wait for editor to be ready
		const timer = setTimeout(() => {
			makeFormsEditable()
		}, 1000)

		// Set up observer to watch for new shapes
		const observer = new MutationObserver((mutations) => {
			mutations.forEach((mutation) => {
				if (mutation.type === 'childList') {
					// Check if new shapes were added
					mutation.addedNodes.forEach((node) => {
						if (node.nodeType === Node.ELEMENT_NODE) {
							const element = node as Element
							if (element.classList.contains('tl-geo') || element.querySelector('.tl-geo')) {
								// New shapes added, make forms editable
								setTimeout(makeFormsEditable, 100)
							}
						}
					})
				}
			})
		})

		// Start observing
		const editorContainer = editor.getContainer()
		if (editorContainer) {
			observer.observe(editorContainer, {
				childList: true,
				subtree: true,
			})
			observerRef.current = observer
		}

		// Cleanup
		return () => {
			clearTimeout(timer)
			if (observerRef.current) {
				observerRef.current.disconnect()
			}

			// Remove all event listeners
			const geoShapes = document.querySelectorAll('.tl-geo[data-has-text="true"]')
			geoShapes.forEach((shape) => {
				shape.removeEventListener('click', handleFormClick)
				shape.removeEventListener('dblclick', handleFormDoubleClick)
			})
		}
	}, [editor])

	// Re-run when editor changes
	useEffect(() => {
		if (editor) {
			makeFormsEditable()
		}
	}, [editor])

	// This component doesn't render anything visible
	return null
}
