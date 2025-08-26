import { useEditor, TLShape, TLShapeId, toRichText } from '@tldraw/editor'
import { DefaultColorStyle, DefaultFillStyle, DefaultFontStyle, DefaultFontSizeStyle, DefaultTextAlignStyle } from '@tldraw/tlschema'
import { FONT_SIZES } from '../../../shapes/shared/default-shape-constants'

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
      // Only allow valid tldraw font values
      const validFonts = ['draw', 'sans', 'serif', 'mono']
      if (!validFonts.includes(fontFamily)) {
        console.warn('Invalid font family:', fontFamily, 'Valid options:', validFonts)
        return
      }
      
      this.editor.updateShapes(
        this.editor.getSelectedShapes()
          .filter((shape: TLShape) => shape.type === 'text') // Only update text shapes
          .map((shape: TLShape) => ({
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
      if (isNaN(sizeValue) || sizeValue < 1 || sizeValue > 200) {
        console.warn('Invalid font size:', size)
        return
      }
      
      this.editor.updateShapes(
        this.editor.getSelectedShapes()
          .filter((shape: TLShape) => shape.type === 'text') // Only update text shapes
          .map((shape: TLShape) => ({
            id: shape.id,
            type: shape.type,
            props: {
              ...shape.props,
              customFontSize: sizeValue
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
    if (selectedShapes.length === 0) return 'sans'
    
    const firstShape = selectedShapes[0]
    // Return the tldraw font value, not the CSS font family
    return firstShape.props?.font || 'sans'
  }

  getCurrentFontSize(): number {
    const selectedShapes = this.editor.getSelectedShapes()
    if (selectedShapes.length === 0) return 16
    
    const firstShape = selectedShapes[0]
    // Check for customFontSize first, then fall back to fontSize preset
    if (firstShape.props?.customFontSize) {
      return firstShape.props.customFontSize
    }
    
    // If no custom font size, try to get from fontSize preset and convert to pixel value
    const fontSizePreset = firstShape.props?.fontSize
    if (fontSizePreset && fontSizePreset in FONT_SIZES) {
      return FONT_SIZES[fontSizePreset as keyof typeof FONT_SIZES]
    }
    
    return 24 // Default to medium size
  }

  // Public method to access the editor's store for listening to changes
  getStore() {
    return this.editor.store
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
          customFontSize: 16,
          font: 'sans',
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
