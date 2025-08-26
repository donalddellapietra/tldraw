import { useEditor, TLShape, TLShapeId, toRichText } from '@tldraw/editor'
import { DefaultColorStyle, DefaultFillStyle, DefaultFontStyle, DefaultFontSizeStyle, DefaultTextAlignStyle, DefaultStrokeColorStyle, DefaultSizeStyle } from '@tldraw/tlschema'
import { FONT_SIZES, STROKE_SIZES } from '../../../shapes/shared/default-shape-constants'
import React from 'react'

export class CustomFormattingManager {
  private editor: any
  private onStateChange?: () => void

  constructor(editor: any) {
    this.editor = editor
  }

  // Set callback for state changes
  setStateChangeCallback(callback: () => void) {
    this.onStateChange = callback
  }

  // Trigger state change notification
  private notifyStateChange() {
    if (this.onStateChange) {
      this.onStateChange()
    }
  }

  // Text formatting methods
  text = {
    setColor: (color: string) => {
      // For now, we'll use the color conversion to avoid validation errors
      // TODO: In the future, we could modify the schema to accept hex colors directly
      const tldrawColor = this.hexToTldrawColor(color)
      
      // Get shapes that can have text formatting (text shapes OR geo shapes with richText)
      const shapesToUpdate = this.editor.getSelectedShapes()
        .filter((shape: TLShape) => {
          if (shape.type === 'text') return true
          if (shape.type === 'geo' && (shape.props as any).richText) return true
          return false
        })
      
      console.log('🔧 setColor: Updating shapes with text formatting:', shapesToUpdate)
      
      this.editor.updateShapes(
        shapesToUpdate.map((shape: TLShape) => ({
          id: shape.id,
          type: shape.type,
          props: {
            ...shape.props,
            color: tldrawColor
          }
        }))
      )
      
      // Notify state change after updating
      this.notifyStateChange()
    },

    setFamily: (fontFamily: string) => {
      // Only allow valid tldraw font values
      const validFonts = ['draw', 'sans', 'serif', 'mono']
      if (!validFonts.includes(fontFamily)) {
        console.warn('Invalid font family:', fontFamily, 'Valid options:', validFonts)
        return
      }
      
      // Get shapes that can have text formatting (text shapes OR geo shapes with richText)
      const shapesToUpdate = this.editor.getSelectedShapes()
        .filter((shape: TLShape) => {
          if (shape.type === 'text') return true
          if (shape.type === 'geo' && (shape.props as any).richText) return true
          return false
        })
      
      console.log('🔧 setFamily: Updating shapes with text formatting:', shapesToUpdate)
      
      this.editor.updateShapes(
        shapesToUpdate.map((shape: TLShape) => ({
          id: shape.id,
          type: shape.type,
          props: {
            ...shape.props,
            font: fontFamily as any
          }
        }))
      )
      
      // Notify state change after updating
      this.notifyStateChange()
    },

    setSize: (size: string) => {
      const sizeValue = parseInt(size.replace('px', ''))
      if (isNaN(sizeValue) || sizeValue < 1 || sizeValue > 200) {
        console.warn('Invalid font size:', size)
        return
      }
      
      // Get shapes that can have text formatting (text shapes OR geo shapes with richText)
      const shapesToUpdate = this.editor.getSelectedShapes()
        .filter((shape: TLShape) => {
          if (shape.type === 'text') return true
          if (shape.type === 'geo' && (shape.props as any).richText) return true
          return false
        })
      
      console.log('🔧 setSize: Updating shapes with text formatting:', shapesToUpdate)
      
      this.editor.run(() => {
        shapesToUpdate.forEach((shape: TLShape) => {
          if (shape.type === 'text') {
            // For text shapes, use customFontSize
            this.editor.updateShapes([{
              id: shape.id,
              type: shape.type,
              props: {
                ...shape.props,
                customFontSize: sizeValue
              }
            }])
          } else if (shape.type === 'geo' && (shape.props as any).richText) {
            // For geo shapes with richText, we can't use fontSize marks (not supported)
            // Instead, we'll use CSS styling to control the font size
            // The richText will maintain its structure, but the rendering will be controlled by CSS
            console.log('🔧 Geo shape font size change - using CSS approach for size:', sizeValue)
            
            // We'll store the font size in the shape's meta data for CSS to use
            this.editor.updateShapes([{
              id: shape.id,
              type: shape.type,
              meta: {
                ...shape.meta,
                textFontSize: sizeValue
              }
            }])
            
            // Apply the font size change immediately to the DOM
            setTimeout(() => {
              this.applyFontSizeToGeoShape(shape.id, sizeValue)
            }, 50)
          }
        })
      })
      
      // Notify state change after updating
      this.notifyStateChange()
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
    
    // Get shapes that can have text formatting (text shapes OR geo shapes with richText)
    const shapesWithText = selectedShapes.filter((shape: TLShape) => {
      if (shape.type === 'text') return true
      if (shape.type === 'geo' && (shape.props as any).richText) return true
      return false
    })
    
    console.log('Shapes with text found:', shapesWithText.length)
    
    if (shapesWithText.length === 0) {
      console.log('No shapes with text found, returning')
      return
    }
    
    this.editor.run(() => {
      shapesWithText.forEach((shape: TLShape) => {
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
                        const newMark = { type: style }
                        const updatedMarks = [...newMarks, newMark]
                        console.log('Adding style, new marks:', updatedMarks)
                        return {
                          ...child,
                          marks: updatedMarks
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
          
          // Update the shape with the new rich text
          this.editor.updateShapes([{
            id: shape.id,
            type: shape.type,
            props: {
              ...shape.props,
              richText: newRichText
            }
          }])
          
          // For geo shapes with richText, apply blue highlighting immediately to DOM
          if (shape.type === 'geo' && (shape.props as any).richText) {
            // Check if the style is being applied or removed
            const hasStyleInRichText = newRichText.content.some((block: any) => 
              block.type === 'paragraph' && block.content && 
              block.content.some((child: any) => 
                child.type === 'text' && child.marks && 
                child.marks.some((mark: any) => mark.type === style)
              )
            )
            
            setTimeout(() => {
              this.applyTextStyleHighlighting(shape.id, style, hasStyleInRichText)
            }, 50)
          }
        }
      })
    })
    
    // Notify state change after updating
    this.notifyStateChange()
  }

  // Helper method to set text alignment
  private setTextAlign(alignment: 'start' | 'middle' | 'end') {
    const selectedShapes = this.editor.getSelectedShapes()
    
    // Get shapes that can have text formatting (text shapes OR geo shapes with richText)
    const shapesWithText = selectedShapes.filter((shape: TLShape) => {
      if (shape.type === 'text') return true
      if (shape.type === 'geo' && (shape.props as any).richText) return true
      return false
    })
    
    if (shapesWithText.length === 0) return
    
    console.log('🔧 setTextAlign: Updating shapes with text formatting:', shapesWithText)
    
    this.editor.run(() => {
      shapesWithText.forEach((shape: TLShape) => {
        if (shape.type === 'text') {
          // For text shapes, use textAlign property
          this.editor.updateShapes([{
            id: shape.id,
            type: shape.type,
            props: { 
              ...shape.props,
              textAlign: alignment 
            }
          }])
        } else if (shape.type === 'geo' && (shape.props as any).richText) {
          // For geo shapes with richText, store alignment in meta data
          console.log('🔧 Geo shape text alignment change - storing in meta data:', alignment)
          
          this.editor.updateShapes([{
            id: shape.id,
            type: shape.type,
            meta: {
              ...shape.meta,
              textAlign: alignment
            }
          }])
          
          // Apply the alignment immediately to the DOM
          setTimeout(() => {
            this.applyTextAlignToGeoShape(shape.id, alignment)
          }, 50)
        }
      })
    })
    
    // Notify state change after updating
    this.notifyStateChange()
  }

  // Helper method to get current text alignment
  getCurrentTextAlign(): 'start' | 'middle' | 'end' {
    const selectedShapes = this.editor.getSelectedShapes()
    
    // Get shapes that can have text formatting (text shapes OR geo shapes with richText)
    const shapesWithText = selectedShapes.filter((shape: TLShape) => {
      if (shape.type === 'text') return true
      if (shape.type === 'geo' && (shape.props as any).richText) return true
      return false
    })
    
    if (shapesWithText.length === 0) return 'start'
    
    const firstShape = shapesWithText[0]
    
    if (firstShape.type === 'text') {
      return firstShape.props?.textAlign || 'start'
    } else if (firstShape.type === 'geo' && (firstShape.props as any).richText) {
      // For geo shapes with richText, check meta data for text alignment
      return firstShape.meta?.textAlign || 'start'
    }
    
    return 'start'
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

  getCurrentCornerRadius(): number {
    const selectedShapes = this.editor.getSelectedShapes()
    if (selectedShapes.length === 0) return 0
    
    // Check if all selected shapes are geo shapes with the same corner radius
    const geoShapes = selectedShapes.filter((shape: TLShape) => shape.type === 'geo')
    if (geoShapes.length === 0) return 0
    
    const firstCornerRadius = (geoShapes[0] as any).props.cornerRadius || 0
    const allSame = geoShapes.every((shape: TLShape) => 
      (shape as any).props.cornerRadius === firstCornerRadius
    )
    
    return allSame ? firstCornerRadius : 0
  }

  getMaxCornerRadius(): number {
    const selectedShapes = this.editor.getSelectedShapes()
    if (selectedShapes.length === 0) return 100 // Default max
    
    // Find the smallest dimension among selected geo shapes
    const geoShapes = selectedShapes.filter((shape: TLShape) => shape.type === 'geo')
    if (geoShapes.length === 0) return 100
    
    let minDimension = Infinity
    geoShapes.forEach((shape: TLShape) => {
      const w = (shape as any).props.w || 100
      const h = (shape as any).props.h || 100
      const smallerDimension = Math.min(w, h)
      minDimension = Math.min(minDimension, smallerDimension)
    })
    
    // Return half of the smallest dimension (max possible radius)
    // But cap at a reasonable maximum of 100px
    return Math.min(minDimension / 2, 100)
  }

  setCornerRadius(value: number) {
    console.log('🔧 setCornerRadius called with value:', value)
    
    this.editor.run(() => {
      // Apply to currently selected shapes
      const selectedShapes = this.editor.getSelectedShapes()
      console.log('📝 Selected shapes count:', selectedShapes.length)
      
      if (selectedShapes.length > 0) {
        console.log('🔧 Setting corner radius for selected shapes...')
        selectedShapes.forEach((shape: TLShape) => {
          if (shape.type === 'geo') {
            this.editor.updateShape({
              id: shape.id,
              type: 'geo',
              props: { cornerRadius: value }
            })
          }
        })
        console.log('✅ Corner radius set for selected shapes')
      }
    })
    
    console.log('🏁 setCornerRadius completed')
  }

  getCurrentFontFamily(): string {
    const selectedShapes = this.editor.getSelectedShapes()
    if (selectedShapes.length === 0) return 'sans'
    
    const firstShape = selectedShapes[0]
    // Return the tldraw font value, not the CSS font family
    return firstShape.props?.font || 'sans'
  }

  // Helper method to get current font size
  getCurrentFontSize(): number {
    const selectedShapes = this.editor.getSelectedShapes()
    
    if (selectedShapes.length === 0) return 16
    
    const firstShape = selectedShapes[0]
    
    if (firstShape.type === 'text') {
      if (firstShape.props?.customFontSize) {
        return firstShape.props.customFontSize
      }
      const fontSizePreset = firstShape.props?.fontSize
      if (fontSizePreset && fontSizePreset in FONT_SIZES) {
        return FONT_SIZES[fontSizePreset as keyof typeof FONT_SIZES]
      }
    } else if (firstShape.type === 'geo' && (firstShape.props as any).richText) {
      if (firstShape.meta?.textFontSize) {
        return firstShape.meta.textFontSize
      }
    }
    
    return 16 // Default to base font size
  }

  // Refresh text style highlighting for selected shapes
  refreshTextStyleHighlighting() {
    const selectedShapes = this.editor.getSelectedShapes()
    
    selectedShapes.forEach((shape: TLShape) => {
      if (shape.type === 'geo' && (shape.props as any).richText) {
        // Check each style and apply highlighting if needed
        const hasBold = this.hasTextStyle('bold')
        const hasItalic = this.hasTextStyle('italic')
        const hasCode = this.hasTextStyle('code')
        
        // Apply highlighting for each active style
        if (hasBold) {
          setTimeout(() => this.applyTextStyleHighlighting(shape.id, 'bold', true), 10)
        }
        if (hasItalic) {
          setTimeout(() => this.applyTextStyleHighlighting(shape.id, 'italic', true), 10)
        }
        if (hasCode) {
          setTimeout(() => this.applyTextStyleHighlighting(shape.id, 'code', true), 10)
        }
      }
    })
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
  public hasTextStyle(style: 'bold' | 'italic' | 'code'): boolean {
    const selectedShapes = this.editor.getSelectedShapes()
    
    console.log('🔍 hasTextStyle called for style:', style)
    console.log('🔍 Selected shapes:', selectedShapes.map((s: TLShape) => ({ type: s.type, id: s.id })))
    
    // Get shapes that can have text formatting (text shapes OR geo shapes with richText)
    const shapesWithText = selectedShapes.filter((shape: TLShape) => {
      if (shape.type === 'text') return true
      if (shape.type === 'geo' && (shape.props as any).richText) return true
      return false
    })
    
    console.log('🔍 Shapes with text found:', shapesWithText.length)
    
    if (shapesWithText.length === 0) return false
    
    // Check if any of the selected shapes have the style
    const hasStyle = shapesWithText.some((shape: TLShape) => {
      const richText = (shape.props as any).richText
      console.log(`🔍 Checking shape ${shape.id} for ${style}:`, richText)
      
      // Handle the structure with 'content' array (the correct structure)
      if (richText && richText.content && richText.content.length > 0) {
        console.log(`🔍 RichText has content array with ${richText.content.length} blocks`)
        const found = richText.content.some((block: any) => {
          if (block.type === 'paragraph' && block.content) {
            return block.content.some((child: any) => {
              if (child.type === 'text' && child.marks) {
                const hasMark = child.marks.some((mark: any) => mark.type === style)
                console.log(`🔍 Text child "${child.text}" has marks:`, child.marks, `Looking for ${style}:`, hasMark)
                return hasMark
              }
              return false
            })
          }
          return false
        })
        console.log(`🔍 Found ${style} style in content array:`, found)
        return found
      }
      
      // Handle the old array structure (fallback)
      if (richText && richText.length > 0) {
        console.log(`🔍 RichText has old array structure with ${richText.length} blocks`)
        const found = richText.some((block: any) => {
          if (block.type === 'paragraph' && block.children) {
            return block.children.some((child: any) => {
              if (child.type === 'text' && child.marks) {
                const hasMark = child.marks.some((mark: any) => mark.type === style)
                console.log(`🔍 Text child "${child.text}" has marks:`, child.marks, `Looking for ${style}:`, hasMark)
                return hasMark
              }
              return false
            })
          }
          return false
        })
        console.log(`🔍 Found ${style} style in old array:`, found)
        return found
      }
      
      console.log(`🔍 No valid richText structure found for shape ${shape.id}`)
      return false
    })
    
    console.log(`🔍 Final result for ${style}:`, hasStyle)
    return hasStyle
  }

  getSelectedElementsForFormatting() {
    const selectedShapes = this.editor.getSelectedShapes()
    console.log('🔍 getSelectedElementsForFormatting called')
    console.log('🔍 Editor selected shapes:', selectedShapes)
    console.log('🔍 Editor selected shape IDs:', selectedShapes.map((s: TLShape) => s.id))
    console.log('🔍 Editor selected shape types:', selectedShapes.map((s: TLShape) => s.type))
    
    // Also try alternative methods to get selection
    try {
      const currentPageShapes = this.editor.getCurrentPageShapes()
      console.log('🔍 All current page shapes:', currentPageShapes.map((s: TLShape) => ({ id: s.id, type: s.type })))
      
      // Check if there are any shapes with selection state
      const shapesWithSelection = currentPageShapes.filter((s: TLShape) => (s as any).isSelected)
      console.log('🔍 Shapes with isSelected flag:', shapesWithSelection.map((s: TLShape) => ({ id: s.id, type: s.type })))
    } catch (error) {
      console.log('🔍 Error getting alternative selection info:', error)
    }
    
    return selectedShapes
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

  // Apply font size to a geo shape using CSS transform
  private applyFontSizeToGeoShape(shapeId: TLShapeId, fontSize: number) {
    // Find the DOM element for this shape
    const shapeElement = document.querySelector(`[data-shape-id="${shapeId}"]`)
    if (!shapeElement) return
    
    // Find text elements within the geo shape
    const textElements = shapeElement.querySelectorAll('.tl-text-content, .tl-rich-text')
    if (textElements.length === 0) return
    
    // Calculate scale factor (assuming base font size is 16px)
    const baseFontSize = 16
    const scaleFactor = fontSize / baseFontSize
    
    console.log(`🔧 Applying font size ${fontSize}px with scale factor ${scaleFactor}`)
    
    // Apply CSS transform to scale the text
    textElements.forEach((textElement) => {
      const element = textElement as HTMLElement
      
      // Preserve existing text alignment if it exists
      const existingTextAlign = element.style.textAlign || 'left'
      
      // Combine font size scaling with text alignment
      element.style.transform = `scale(${scaleFactor})`
      element.style.transformOrigin = 'center center'
      element.style.fontSize = `${baseFontSize}px` // Keep base font size
      element.style.textAlign = existingTextAlign // Preserve text alignment
    })
  }

  // Apply text alignment to a geo shape using CSS text-align
  private applyTextAlignToGeoShape(shapeId: TLShapeId, alignment: 'start' | 'middle' | 'end') {
    // Find the DOM element for this shape
    const shapeElement = document.querySelector(`[data-shape-id="${shapeId}"]`)
    if (!shapeElement) return

    // Find text elements within the geo shape
    const textElements = shapeElement.querySelectorAll('.tl-text-content, .tl-rich-text')
    if (textElements.length === 0) return

    // Convert tldraw alignment values to CSS text-align values
    let cssAlignment = 'left';
    if (alignment === 'start') {
      cssAlignment = 'left';
    } else if (alignment === 'middle') {
      cssAlignment = 'center';
    } else if (alignment === 'end') {
      cssAlignment = 'right';
    }

    console.log(`🔧 Applying text alignment ${alignment} with CSS text-align: ${cssAlignment}`);

    // Apply CSS text-align to align the text
    textElements.forEach((textElement) => {
      const element = textElement as HTMLElement;
      element.style.textAlign = cssAlignment;
    });
  }

  // Apply text style highlighting to a geo shape
  private applyTextStyleHighlighting(shapeId: TLShapeId, style: 'bold' | 'italic' | 'code', isApplying: boolean) {
    // Find the DOM element for this shape
    const shapeElement = document.querySelector(`[data-shape-id="${shapeId}"]`)
    if (!shapeElement) return

    // Find text elements within the geo shape
    const textElements = shapeElement.querySelectorAll('.tl-text-content, .tl-rich-text')
    if (textElements.length === 0) return

    // Apply a class to the shape element to indicate the style
    const shapeClass = `tl-text-${style}`;
    if (isApplying) {
      shapeElement.classList.add(shapeClass);
    } else {
      shapeElement.classList.remove(shapeClass);
    }
  }
}

// Hook to use the formatting manager
export function useCustomFormattingManager() {
  const editor = useEditor()
  
  // Use useMemo to create a persistent instance
  const formattingManager = React.useMemo(() => {
    return new CustomFormattingManager(editor)
  }, [editor])
  
  // Add reactive state for formatting
  const [formattingState, setFormattingState] = React.useState({
    isBold: false,
    isItalic: false,
    isCode: false,
    textAlign: 'start' as 'start' | 'middle' | 'end',
    hasTextSelected: false
  })
  
  // Listen to editor changes and update formatting state
  React.useEffect(() => {
    const updateFormattingState = () => {
      const selectedShapes = editor.getSelectedShapes()
      
      // Check for both text shapes AND geo shapes with richText
      const hasTextShapes = selectedShapes.some((shape: TLShape) => shape.type === 'text')
      const hasGeoWithText = selectedShapes.some((shape: TLShape) => 
        shape.type === 'geo' && (shape.props as any).richText && 
        (shape.props as any).richText.content && (shape.props as any).richText.content.length > 0
      )
      
      if (!hasTextShapes && !hasGeoWithText) {
        setFormattingState({
          isBold: false,
          isItalic: false,
          isCode: false,
          textAlign: 'start',
          hasTextSelected: false
        })
        return
      }
      
      // Check formatting state of selected text (works for both text shapes and geo shapes with richText)
      const isBold = formattingManager.hasTextStyle('bold')
      const isItalic = formattingManager.hasTextStyle('italic')
      const isCode = formattingManager.hasTextStyle('code')
      const textAlign = formattingManager.getCurrentTextAlign()
      
      console.log('🔧 updateFormattingState - Text styles detected:', { isBold, isItalic, isCode, textAlign })
      
      setFormattingState({
        isBold,
        isItalic,
        isCode,
        textAlign,
        hasTextSelected: true
      })
    }
    
    // Initial update
    updateFormattingState()
    
    // Subscribe to editor changes
    const unsubscribe = editor.store.listen(() => {
      updateFormattingState()
    })
    
    // Set up callback for immediate updates after formatting operations
    formattingManager.setStateChangeCallback(updateFormattingState)
    
    return unsubscribe
  }, [editor, formattingManager])
  
  // Check if text is selected (tldraw-specific logic)
  const selection = formattingManager.getSelectedElementsForFormatting();
  const hasSelection = selection.length > 0;
  const allTextSelected = hasSelection && selection.every((el: any) => el.type === 'text');
  const allNonTextSelected = hasSelection && selection.every((el: any) => el.type !== 'text');

  // DEBUG LOGGING
  console.log('🔍 DEBUG: StylePanel Selection Analysis');
  console.log('Selection:', selection);
  console.log('Has Selection:', hasSelection);
  console.log('All Text Selected:', allTextSelected);
  console.log('All Non-Text Selected:', allNonTextSelected);

  // Enhanced detection: check if we have text inside forms
  const hasTextInForms = hasSelection && selection.some((el: any) => {
    if (el.type === 'text') {
      // Check if this text is positioned inside a geo shape
      const textBounds = editor.getShapeGeometry(el).bounds;
      const allShapes = editor.getCurrentPageShapes();
      const geoShapes = allShapes.filter((shape: any) => shape.type === 'geo');
      
      console.log('🔍 Text shape bounds:', textBounds);
      console.log('🔍 All shapes:', allShapes.map(s => ({ type: s.type, id: s.id })));
      console.log('🔍 Geo shapes:', geoShapes.map(s => ({ type: s.type, id: s.id })));
      
      const isInside = geoShapes.some((geoShape: any) => {
        const geoBounds = editor.getShapeGeometry(geoShape).bounds;
        console.log('🔍 Comparing text bounds with geo bounds:', { textBounds, geoBounds });
        
        // Check if text is inside the geo shape bounds
        const inside = textBounds.minX >= geoBounds.minX && 
               textBounds.maxX <= geoBounds.maxX && 
               textBounds.minY >= geoBounds.minY && 
               textBounds.maxY <= geoBounds.maxY;
        
        console.log('🔍 Is text inside this geo shape?', inside);
        return inside;
      });
      
      console.log('🔍 Text is inside any geo shape:', isInside);
      return isInside;
    }
    return false;
  });

  // Also check if we have a geo shape selected that contains text
  const hasGeoShapeWithText = hasSelection && selection.some((el: any) => {
    if (el.type === 'geo') {
      console.log('🔍 Found geo shape in selection:', el);
      
      // Check if this geo shape has richText content
      const hasRichText = el.props && el.props.richText && el.props.richText.content && el.props.richText.content.length > 0;
      console.log('🔍 Geo shape has richText content:', hasRichText);
      
      if (hasRichText) {
        console.log('🔍 Geo shape contains text, will show text formatting');
        return true;
      }
      
      // Also check if there are text shapes positioned inside this geo shape
      const geoBounds = editor.getShapeGeometry(el).bounds;
      const allShapes = editor.getCurrentPageShapes();
      const textShapes = allShapes.filter((shape: any) => shape.type === 'text');
      
      console.log('🔍 Geo shape bounds:', geoBounds);
      console.log('🔍 All text shapes:', textShapes.map(s => ({ id: s.id, props: s.props })));
      
      const containsText = textShapes.some((textShape: any) => {
        const textBounds = editor.getShapeGeometry(textShape).bounds;
        console.log('🔍 Text shape bounds:', textBounds);
        
        // Check if text is inside the geo shape bounds
        const inside = textBounds.minX >= geoBounds.minX && 
               textBounds.maxX <= geoBounds.maxX && 
               textBounds.minY >= geoBounds.minY && 
               textBounds.maxY <= geoBounds.maxY;
        
        console.log('🔍 Is this text inside the selected geo shape?', inside);
        return inside;
      });
      
      console.log('🔍 Selected geo shape contains positioned text:', containsText);
      return containsText;
    }
    return false;
  });

  console.log('🔍 Has Text In Forms:', hasTextInForms);
  console.log('🔍 Has Geo Shape With Text:', hasGeoShapeWithText);

  const showTextFormatting = allTextSelected || hasTextInForms || hasGeoShapeWithText;
  const showShapeFormatting = allNonTextSelected && !hasTextInForms && !hasGeoShapeWithText;

  console.log('🔍 Show Text Formatting:', showTextFormatting);
  console.log('🔍 Show Shape Formatting:', showShapeFormatting);
  console.log('🔍 Final decision - Text formatting will be shown:', showTextFormatting);

  // Return both the manager and the current state
  return {
    manager: formattingManager,
    state: formattingState
  }
}
