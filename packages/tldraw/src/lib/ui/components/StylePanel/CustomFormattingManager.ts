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
      console.log('Bold method called')
      this.toggleTextStyle('bold')
    },

    italic: () => {
      console.log('Italic method called')
      this.toggleTextStyle('italic')
    },

    code: () => {
      console.log('Code method called')
      this.toggleTextStyle('code')
    }
  }

  // Helper method to toggle text styles (bold, italic, code)
  private toggleTextStyle(style: 'bold' | 'italic' | 'code') {
    console.log('toggleTextStyle called with style:', style)
    const selectedShapes = this.editor.getSelectedShapes()
    console.log('Selected shapes:', selectedShapes.map((s: TLShape) => ({ type: s.type, id: s.id })))
    
    const textShapes = selectedShapes.filter((shape: TLShape) => shape.type === 'text')
    console.log('Text shapes found:', textShapes.length)
    
    if (textShapes.length === 0) {
      console.log('No text shapes found, returning')
      return
    }
    
    this.editor.run(() => {
      textShapes.forEach((shape: TLShape) => {
        if (shape.type === 'text') {
          const currentRichText = (shape.props as any).richText
          console.log('Current rich text for shape:', shape.id, currentRichText)
          
          if (currentRichText && currentRichText.content && currentRichText.content.length > 0) {
            // Handle the structure with 'content' array (the correct structure)
            console.log('Processing rich text with content array')
            
            const newRichText = {
              ...currentRichText,
              content: currentRichText.content.map((block: any) => {
                if (block.type === 'paragraph' && block.content) {
                  return {
                    ...block,
                    content: block.content.map((child: any) => {
                      if (child.type === 'text') {
                        const newMarks = child.marks ? [...child.marks] : []
                        console.log('Child text:', child.text, 'Current marks:', newMarks)
                        
                        // Check if the style is already applied
                        const hasStyle = newMarks.some((mark: any) => mark.type === style)
                        console.log('Has style', style, ':', hasStyle)
                        
                        if (hasStyle) {
                          // Remove the style if it's already applied
                          const filteredMarks = newMarks.filter((mark: any) => mark.type !== style)
                          console.log('Removing style, new marks:', filteredMarks)
                          return {
                            ...child,
                            marks: filteredMarks
                          }
                        } else {
                          // Add the style if it's not applied
                          newMarks.push({ type: style })
                          console.log('Adding style, new marks:', newMarks)
                          return {
                            ...child,
                            marks: newMarks
                          }
                        }
                      }
                      return child
                    })
                  }
                }
                return block
              })
            }
            
            console.log('New rich text:', newRichText)
            
            // Update the shape with new rich text
            this.editor.updateShape({
              id: shape.id,
              type: 'text',
              props: { richText: newRichText }
            })
            
            console.log('Shape updated with new rich text')
          } else if (currentRichText && currentRichText.length > 0) {
            // Handle the old array structure (fallback)
            console.log('Processing rich text with old array structure')
            
            const newRichText = currentRichText.map((block: any) => {
              if (block.type === 'paragraph' && block.children) {
                return {
                  ...block,
                  children: block.children.map((child: any) => {
                    if (child.type === 'text') {
                      const newMarks = child.marks ? [...child.marks] : []
                      console.log('Child text:', child.text, 'Current marks:', newMarks)
                      
                      // Check if the style is already applied
                      const hasStyle = newMarks.some((mark: any) => mark.type === style)
                      console.log('Has style', style, ':', hasStyle)
                      
                      if (hasStyle) {
                        // Remove the style if it's already applied
                        const filteredMarks = newMarks.filter((mark: any) => mark.type !== style)
                        console.log('Removing style, new marks:', filteredMarks)
                        return {
                          ...child,
                          marks: filteredMarks
                        }
                      } else {
                        // Add the style if it's not applied
                        newMarks.push({ type: style })
                        console.log('Adding style, new marks:', newMarks)
                        return {
                          ...child,
                          marks: newMarks
                        }
                      }
                    }
                    return child
                  })
                }
              }
              return block
            })
            
            console.log('New rich text:', newRichText)
            
            // Update the shape with new rich text
            this.editor.updateShape({
              id: shape.id,
              type: 'text',
              props: { richText: newRichText }
            })
            
            console.log('Shape updated with new rich text')
          } else {
            console.log('No rich text found in shape')
          }
        }
      })
    })
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
    return this.hasTextStyle('bold')
  }

  isItalic(): boolean {
    return this.hasTextStyle('italic')
  }

  isCode(): boolean {
    return this.hasTextStyle('code')
  }

  // Helper method to check if text has a specific style
  private hasTextStyle(style: 'bold' | 'italic' | 'code'): boolean {
    const selectedShapes = this.editor.getSelectedShapes()
    const textShapes = selectedShapes.filter((shape: TLShape) => shape.type === 'text')
    
    if (textShapes.length === 0) return false
    
    // Check if any of the selected text shapes have the style
    return textShapes.some((shape: TLShape) => {
      if (shape.type === 'text') {
        const richText = (shape.props as any).richText
        
        // Handle the structure with 'content' array (the correct structure)
        if (richText && richText.content && richText.content.length > 0) {
          return richText.content.some((block: any) => {
            if (block.type === 'paragraph' && block.content) {
              return block.content.some((child: any) => {
                if (child.type === 'text' && child.marks) {
                  return child.marks.some((mark: any) => mark.type === style)
                }
                return false
              })
            }
            return false
          })
        }
        
        // Handle the old array structure (fallback)
        if (richText && richText.length > 0) {
          return richText.some((block: any) => {
            if (block.type === 'paragraph' && block.children) {
              return block.children.some((child: any) => {
                if (child.type === 'text' && child.marks) {
                  return child.marks.some((mark: any) => mark.type === style)
                }
                return false
              })
            }
            return false
          })
        }
      }
      return false
    })
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
