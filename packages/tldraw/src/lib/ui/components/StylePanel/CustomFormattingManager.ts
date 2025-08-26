import { useEditor, TLShape, TLShapeId, toRichText } from '@tldraw/editor'
import { DefaultColorStyle, DefaultFillStyle, DefaultFontStyle, DefaultFontSizeStyle, DefaultTextAlignStyle, DefaultStrokeColorStyle, DefaultSizeStyle } from '@tldraw/tlschema'
import { FONT_SIZES, STROKE_SIZES } from '../../../shapes/shared/default-shape-constants'

export class CustomFormattingManager {
  private editor: any

  constructor(editor: any) {
    this.editor = editor
  }

  // Text formatting methods
  text = {
    setColor: (color: string) => {
      // For now, we'll use the color conversion to avoid validation errors
      // TODO: In the future, we could modify the schema to accept hex colors directly
      const tldrawColor = this.hexToTldrawColor(color)
      
      this.editor.updateShapes(
        this.editor.getSelectedShapes()
          .filter((shape: TLShape) => shape.type === 'text') // Only update text shapes
          .map((shape: TLShape) => ({
            id: shape.id,
            type: shape.type,
            props: {
              ...shape.props,
              color: tldrawColor
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
    },

    // Text alignment methods
    alignLeft: () => {
      this.setTextAlign('start')
    },

    alignCenter: () => {
      this.setTextAlign('middle')
    },

    alignRight: () => {
      this.setTextAlign('end')
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

  // Helper method to set text alignment
  private setTextAlign(alignment: 'start' | 'middle' | 'end') {
    const selectedShapes = this.editor.getSelectedShapes()
    const textShapes = selectedShapes.filter((shape: TLShape) => shape.type === 'text')
    
    if (textShapes.length === 0) return
    
    this.editor.run(() => {
      textShapes.forEach((shape: TLShape) => {
        if (shape.type === 'text') {
          this.editor.updateShape({
            id: shape.id,
            type: 'text',
            props: { textAlign: alignment }
          })
        }
      })
    })
  }

  // Helper method to get current text alignment
  getCurrentTextAlign(): 'start' | 'middle' | 'end' {
    const selectedShapes = this.editor.getSelectedShapes()
    const textShapes = selectedShapes.filter((shape: TLShape) => shape.type === 'text')
    
    if (textShapes.length === 0) return 'start'
    
    const firstShape = textShapes[0]
    return firstShape.props?.textAlign || 'start'
  }

  // Element formatting methods
  element = {
    setBackground: (color: string) => {
      console.log('🚀 setBackground called with color:', color);
      
      // Convert hex color to tldraw color
      const tldrawColor = this.hexToTldrawColor(color)
      console.log('🎨 Converted to tldraw color:', tldrawColor);
      
      this.editor.run(() => {
        // Apply to currently selected shapes unconditionally
        const selectedShapes = this.editor.getSelectedShapes();
        console.log('📝 Selected shapes count:', selectedShapes.length);
        
        if (selectedShapes.length > 0) {
          console.log('🔧 Setting styles for selected shapes...');
          this.editor.setStyleForSelectedShapes(DefaultFillStyle, 'solid')
          this.editor.setStyleForSelectedShapes(DefaultColorStyle, tldrawColor)
          console.log('✅ Styles set for selected shapes');
        }
        
        // Also set as default for next shapes
        console.log('🔧 Setting styles for next shapes...');
        this.editor.setStyleForNextShapes(DefaultFillStyle, 'solid')
        this.editor.setStyleForNextShapes(DefaultColorStyle, tldrawColor)
        this.editor.updateInstanceState({ isChangingStyle: true })
        console.log('✅ Styles set for next shapes');
      })
      
      console.log('🏁 setBackground completed');
    },

    // Method to set fill style (none, semi, solid, pattern, fill)
    setFillStyle: (fillStyle: 'none' | 'semi' | 'solid' | 'pattern' | 'fill') => {
      this.editor.run(() => {
        if (this.editor.isIn('select')) {
          this.editor.setStyleForSelectedShapes(DefaultFillStyle, fillStyle)
        }
        this.editor.setStyleForNextShapes(DefaultFillStyle, fillStyle)
        this.editor.updateInstanceState({ isChangingStyle: true })
      })
    },

    // Method to set both fill style and color at once
    setFill: (fillStyle: 'none' | 'semi' | 'solid' | 'pattern' | 'fill', color: string) => {
      const tldrawColor = this.hexToTldrawColor(color)
      
      this.editor.run(() => {
        if (this.editor.isIn('select')) {
          this.editor.setStyleForSelectedShapes(DefaultFillStyle, fillStyle)
          this.editor.setStyleForSelectedShapes(DefaultColorStyle, tldrawColor)
        }
        this.editor.setStyleForNextShapes(DefaultFillStyle, fillStyle)
        this.editor.setStyleForNextShapes(DefaultColorStyle, tldrawColor)
        this.editor.updateInstanceState({ isChangingStyle: true })
      })
    },

    // Method to set stroke color (line/border color)
    setStrokeColor: (color: string) => {
      console.log('🎨 setStrokeColor called with color:', color);
      
      // Convert hex color to tldraw color
      const tldrawColor = this.hexToTldrawColor(color)
      console.log('🎨 Converted to tldraw color:', tldrawColor);
      
      this.editor.run(() => {
        // Apply to currently selected shapes unconditionally
        const selectedShapes = this.editor.getSelectedShapes();
        console.log('📝 Selected shapes count:', selectedShapes.length);
        
        if (selectedShapes.length > 0) {
          console.log('🔧 Setting stroke color for selected shapes...');
          this.editor.setStyleForSelectedShapes(DefaultStrokeColorStyle, tldrawColor)
          console.log('✅ Stroke color set for selected shapes');
        }
        
        // Also set as default for next shapes
        console.log('🔧 Setting stroke color for next shapes...');
        this.editor.setStyleForNextShapes(DefaultStrokeColorStyle, tldrawColor)
        this.editor.updateInstanceState({ isChangingStyle: true })
        console.log('✅ Stroke color set for next shapes');
      })
      
      console.log('🏁 setStrokeColor completed');
    },

    // Method to set stroke width (line thickness)
    setStrokeWidth: (width: 's' | 'm' | 'l' | 'xl') => {
      console.log('📏 setStrokeWidth called with width:', width);
      
      this.editor.run(() => {
        // Apply to currently selected shapes unconditionally
        const selectedShapes = this.editor.getSelectedShapes();
        console.log('📝 Selected shapes count:', selectedShapes.length);
        
        if (selectedShapes.length > 0) {
          console.log('🔧 Setting stroke width for selected shapes...');
          this.editor.setStyleForSelectedShapes(DefaultSizeStyle, width)
          console.log('✅ Stroke width set for selected shapes');
        }
        
        // Also set as default for next shapes
        console.log('🔧 Setting stroke width for next shapes...');
        this.editor.setStyleForNextShapes(DefaultSizeStyle, width)
        this.editor.updateInstanceState({ isChangingStyle: true })
        console.log('✅ Stroke width set for next shapes');
      })
      
      console.log('🏁 setStrokeWidth completed');
    }
  }

  // Utility methods
  getCurrentColor(): string {
    const selectedShapes = this.editor.getSelectedShapes()
    if (selectedShapes.length === 0) return '#000000'
    
    const firstShape = selectedShapes[0]
    return firstShape.props?.color || '#000000'
  }

  getCurrentBackgroundColor(): string {
    const selectedShapes = this.editor.getSelectedShapes()
    if (selectedShapes.length === 0) return '#ffffff'
    
    // Use the proper tldraw style system to get current styles
    const sharedStyles = this.editor.getSharedStyles()
    
    const currentFill = sharedStyles.get(DefaultFillStyle)
    const currentColor = sharedStyles.get(DefaultColorStyle)
    
    // If the shape has a fill and it's not 'none', return the color
    if (currentFill && currentFill.type === 'shared' && currentFill.value !== 'none' && 
        currentColor && currentColor.type === 'shared') {
      // Convert tldraw color back to hex
      const hexColor = this.tldrawColorToHex(currentColor.value)
      return hexColor
    }
    
    return '#ffffff'
  }

  getCurrentFillStyle(): 'none' | 'semi' | 'solid' | 'pattern' | 'fill' {
    const selectedShapes = this.editor.getSelectedShapes()
    if (selectedShapes.length === 0) return 'none'
    
    // Use the proper tldraw style system
    const sharedStyles = this.editor.getSharedStyles()
    const currentFill = sharedStyles.get(DefaultFillStyle)
    
    if (currentFill && currentFill.type === 'shared') {
      return currentFill.value
    }
    
    return 'none'
  }

  getCurrentStrokeColor(): string {
    const selectedShapes = this.editor.getSelectedShapes()
    if (selectedShapes.length === 0) return '#000000'
    
    // Use the proper tldraw style system to get current styles
    const sharedStyles = this.editor.getSharedStyles()
    const currentStrokeColor = sharedStyles.get(DefaultStrokeColorStyle)
    
    if (currentStrokeColor && currentStrokeColor.type === 'shared') {
      // Convert tldraw color back to hex
      const hexColor = this.tldrawColorToHex(currentStrokeColor.value)
      return hexColor
    }
    
    return '#000000'
  }

  getCurrentStrokeWidth(): 's' | 'm' | 'l' | 'xl' {
    const selectedShapes = this.editor.getSelectedShapes()
    if (selectedShapes.length === 0) return 'm'
    
    // Use the proper tldraw style system
    const sharedStyles = this.editor.getSharedStyles()
    const currentSize = sharedStyles.get(DefaultSizeStyle)
    
    if (currentSize && currentSize.type === 'shared') {
      return currentSize.value
    }
    
    return 'm'
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

  // Convert hex color to closest tldraw color
  private hexToTldrawColor(hex: string): string {
    // Available tldraw colors
    const tldrawColors = [
      'black', 'grey', 'light-violet', 'violet', 'blue', 'light-blue', 
      'yellow', 'orange', 'green', 'light-green', 'light-red', 'red', 
      'white', 'brown', 'pink', 'cyan'
    ]
    
    // Convert hex to HSL
    const hsl = this.hexToHSL(hex)
    
    // Handle special cases first
    if (hsl.l < 15) return 'black'
    if (hsl.l > 85 && hsl.s < 20) return 'white'
    if (hsl.s < 15) return 'grey'
    
    // Map based on hue ranges with better precision
    if (hsl.h >= 0 && hsl.h < 30) {
      return hsl.l > 60 ? 'light-red' : 'red'
    }
    if (hsl.h >= 30 && hsl.h < 60) {
      return hsl.l > 60 ? 'orange' : 'brown'
    }
    if (hsl.h >= 60 && hsl.h < 90) {
      return hsl.l > 60 ? 'yellow' : 'brown'
    }
    if (hsl.h >= 90 && hsl.h < 150) {
      return hsl.l > 60 ? 'light-green' : 'green'
    }
    if (hsl.h >= 150 && hsl.h < 210) {
      return 'cyan'
    }
    if (hsl.h >= 210 && hsl.h < 270) {
      return hsl.l > 60 ? 'light-blue' : 'blue'
    }
    if (hsl.h >= 270 && hsl.h < 330) {
      return hsl.l > 60 ? 'light-violet' : 'violet'
    }
    if (hsl.h >= 330 && hsl.h < 360) {
      return hsl.l > 60 ? 'pink' : 'red'
    }
    
    return 'red' // fallback
  }

  // Convert hex to HSL
  private hexToHSL(hex: string): { h: number; s: number; l: number } {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    if (!result) return { h: 0, s: 100, l: 50 }

    const r = parseInt(result[1], 16) / 255
    const g = parseInt(result[2], 16) / 255
    const b = parseInt(result[3], 16) / 255

    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)
    let h = 0
    let s = 0
    const l = (max + min) / 2

    if (max !== min) {
      const d = max - min
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min)

      switch (max) {
        case r:
          h = (g - b) / d + (g < b ? 6 : 0)
          break
        case g:
          h = (b - r) / d + 2
          break
        case b:
          h = (r - g) / d + 4
          break
      }
      h /= 6
    }

    return { h: h * 360, s: s * 100, l: l * 100 }
  }

  // Convert tldraw color to hex (simplified conversion)
  private tldrawColorToHex(tldrawColor: string): string {
    // Map tldraw colors to hex values
    const colorMap: Record<string, string> = {
      'black': '#000000',
      'grey': '#6b7280',
      'light-violet': '#a78bfa',
      'violet': '#7c3aed',
      'blue': '#2563eb',
      'light-blue': '#60a5fa',
      'yellow': '#eab308',
      'orange': '#ea580c',
      'green': '#16a34a',
      'light-green': '#4ade80',
      'light-red': '#f87171',
      'red': '#dc2626',
      'white': '#ffffff',
      'brown': '#92400e',
      'pink': '#ec4899',
      'cyan': '#0891b2'
    }
    
    return colorMap[tldrawColor] || '#000000'
  }
}

// Hook to use the formatting manager
export function useCustomFormattingManager() {
  const editor = useEditor()
  return new CustomFormattingManager(editor)
}
