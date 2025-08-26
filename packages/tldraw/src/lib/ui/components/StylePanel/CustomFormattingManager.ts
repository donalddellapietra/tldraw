import { useEditor, TLShape, TLShapeId, toRichText } from '@tldraw/editor'
import { DefaultColorStyle, DefaultFillStyle, DefaultFontStyle, DefaultFontSizeStyle, DefaultTextAlignStyle } from '@tldraw/tlschema'

export class CustomFormattingManager {
  private editor: any

  constructor(editor: any) {
    this.editor = editor
  }

  // Text formatting methods
  text = {
    setColor: (color: string) => {
      this.editor.updateShapes(
        this.editor.getSelectedShapes().map((shape: TLShape) => ({
          id: shape.id,
          type: shape.type,
          props: {
            ...shape.props,
            color: color as any
          }
        }))
      )
    },

    setFamily: (fontFamily: string) => {
      this.editor.updateShapes(
        this.editor.getSelectedShapes().map((shape: TLShape) => ({
          id: shape.id,
          type: shape.type,
          props: {
            ...shape.props,
            font: fontFamily as any
          }
        }))
      )
    },

    setSize: (size: string) => {
      const sizeValue = parseInt(size.replace('px', ''))
      this.editor.updateShapes(
        this.editor.getSelectedShapes().map((shape: TLShape) => ({
          id: shape.id,
          type: shape.type,
          props: {
            ...shape.props,
            fontSize: sizeValue as any
          }
        }))
      )
    },

    bold: () => {
      // Toggle bold - this would need to be implemented based on tldraw's text formatting
      console.log('Bold toggle - implement based on tldraw text formatting')
    },

    italic: () => {
      // Toggle italic - this would need to be implemented based on tldraw's text formatting
      console.log('Italic toggle - implement based on tldraw text formatting')
    },

    underline: () => {
      // Toggle underline - this would need to be implemented based on tldraw's text formatting
      console.log('Underline toggle - implement based on tldraw text formatting')
    }
  }

  // Element formatting methods
  element = {
    setBackground: (color: string) => {
      this.editor.updateShapes(
        this.editor.getSelectedShapes().map((shape: TLShape) => ({
          id: shape.id,
          type: shape.type,
          props: {
            ...shape.props,
            fill: color as any
          }
        }))
      )
    }
  }

  // Utility methods
  getCurrentColor(): string {
    const selectedShapes = this.editor.getSelectedShapes()
    if (selectedShapes.length === 0) return '#000000'
    
    const firstShape = selectedShapes[0]
    return firstShape.props?.color || '#000000'
  }

  getCurrentFontFamily(): string {
    const selectedShapes = this.editor.getSelectedShapes()
    if (selectedShapes.length === 0) return 'Arial'
    
    const firstShape = selectedShapes[0]
    return firstShape.props?.font || 'Arial'
  }

  getCurrentFontSize(): number {
    const selectedShapes = this.editor.getSelectedShapes()
    if (selectedShapes.length === 0) return 16
    
    const firstShape = selectedShapes[0]
    return firstShape.props?.fontSize || 16
  }

  isBold(): boolean {
    // This would need to be implemented based on tldraw's text formatting
    return false
  }

  isItalic(): boolean {
    // This would need to be implemented based on tldraw's text formatting
    return false
  }

  isUnderlined(): boolean {
    // This would need to be implemented based on tldraw's text formatting
    return false
  }

  getSelectedElementsForFormatting() {
    return this.editor.getSelectedShapes()
  }

  addTextElement() {
    this.editor.createShapes([
      {
        type: 'text',
        x: 100,
        y: 100,
        props: {
          richText: toRichText('New Text'),
          textAlign: 'middle',
          color: 'black',
          fontSize: 16,
          font: 'draw',
        },
        autoSize: true,
      },
    ])
  }

  addShapeElement() {
    this.editor.createShapes([
      {
        type: 'geo',
        x: 100,
        y: 100,
        geo: 'rectangle',
        props: {
          fill: 'none',
          color: 'black',
        },
        strokeColor: 'black',
        size: 'm',
      },
    ])
  }
}

// Hook to use the formatting manager
export function useCustomFormattingManager() {
  const editor = useEditor()
  return new CustomFormattingManager(editor)
}
