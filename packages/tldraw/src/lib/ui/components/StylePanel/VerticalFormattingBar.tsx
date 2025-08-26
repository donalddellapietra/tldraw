'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, 
  Palette, Type, Plus, Minus, Square, ChevronDown
} from 'lucide-react';
import { SketchPicker } from 'react-color';
import { useCustomFormattingManager } from './CustomFormattingManager';
import './VerticalFormattingBar.css';

interface VerticalFormattingBarProps {
  isVisible: boolean;
}

export function VerticalFormattingBar({
  isVisible
}: VerticalFormattingBarProps) {
  const [showColorPicker, setShowColorPicker] = useState<string | null>(null);
  const [showFontDropdown, setShowFontDropdown] = useState(false);
  const [pendingTextColor, setPendingTextColor] = useState<string>('#000000');
  const [pendingBackgroundColor, setPendingBackgroundColor] = useState<string>('#ffffff');
  const [fontSize, setFontSize] = useState<string>('16');
  
  const colorPickerRef = useRef<HTMLDivElement>(null);
  const fontDropdownRef = useRef<HTMLDivElement>(null);
  const formattingManager = useCustomFormattingManager();

  // Font options (same as slide editor)
  const fontOptions = [
    'Arial', 'Helvetica', 'Times New Roman', 'Georgia', 'Verdana', 'Comic Sans MS',
    'Impact', 'Trebuchet MS', 'Courier New', 'Lucida Console', 'Tahoma', 'Palatino'
  ];

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Check if click is outside color picker (including react-color components)
      if (colorPickerRef.current && !colorPickerRef.current.contains(event.target as Node)) {
        const target = event.target as Element;
        if (!target.closest('.sketch-picker') && !target.closest('.compact-picker')) {
          setShowColorPicker(null);
        }
      }
      // Check if click is outside font dropdown
      if (fontDropdownRef.current && !fontDropdownRef.current.contains(event.target as Node)) {
        setShowFontDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Get current text color using the formatting manager (memoized to avoid calling on every render)
  const getCurrentTextColor = (): string => {
    // Only get color when actually opening the color picker
    return formattingManager.getCurrentColor();
  };

  // Apply text color using the formatting manager
  const applyTextColor = () => {
    formattingManager.text.setColor(pendingTextColor);
    setShowColorPicker(null);
  };

  // Apply background color using the formatting manager
  const applyBackgroundColor = () => {
    formattingManager.element.setBackground(pendingBackgroundColor);
    setShowColorPicker(null);
  };

  // Handle font family change
  const handleFontChange = (font: string) => {
    formattingManager.text.setFamily(font);
    setShowFontDropdown(false);
  };

  // Check if text is selected (tldraw-specific logic)
  const hasTextSelected = () => {
    const selectedElements = formattingManager.getSelectedElementsForFormatting();
    return selectedElements.some((element: any) => {
      return element.type === 'text' || element.props?.richText;
    });
  };

  const showTextFormatting = hasTextSelected();

  if (!isVisible) return null;

  // Debug: Log what we're rendering
  console.log('VerticalFormattingBar rendering, showTextFormatting:', showTextFormatting);

  return (
    <div className="vertical-formatting-bar">
      {/* Add Elements */}
      <button
        onClick={() => formattingManager.addTextElement()}
        className="formatting-button"
        title="Add Text"
      >
        <Type size={14} />
      </button>
      
      <button
        onClick={() => formattingManager.addShapeElement()}
        className="formatting-button"
        title="Add Shape"
      >
        <Square size={14} />
      </button>

      {/* Text formatting controls - show always for now */}
      {true && (
        <>
          {/* Divider */}
          <div className="divider"></div>

          {/* Font Size Controls */}
          <div className="font-size-controls">
            <button
              className="formatting-button"
              title="Increase Font Size"
              onClick={() => {
                const currentSize = formattingManager.getCurrentFontSize();
                const newSize = Math.min(currentSize + 2, 72);
                setFontSize(newSize.toString());
                formattingManager.text.setSize(`${newSize}px`);
              }}
            >
              <Plus size={14} />
            </button>
            <div className="font-size-display">
              {fontSize}px
            </div>
            <button
              className="formatting-button"
              title="Decrease Font Size"
              onClick={() => {
                const currentSize = formattingManager.getCurrentFontSize();
                const newSize = Math.max(currentSize - 2, 8);
                setFontSize(newSize.toString());
                formattingManager.text.setSize(`${newSize}px`);
              }}
            >
              <Minus size={14} />
            </button>
          </div>

          {/* Font Family */}
          <div className="font-family-dropdown" ref={fontDropdownRef}>
            <button
              onClick={() => setShowFontDropdown(!showFontDropdown)}
              className="font-family-button"
              title="Font Family"
            >
              <ChevronDown size={14} />
              <div className="font-family-text">
                {formattingManager.getCurrentFontFamily().split(',')[0].replace(/['"]/g, '')}
              </div>
            </button>
            {showFontDropdown && (
              <div className="font-dropdown-menu">
                <div className="font-dropdown-content">
                  {fontOptions.map((font) => (
                    <button
                      key={font}
                      onClick={() => handleFontChange(font)}
                      className={`font-option ${
                        formattingManager.getCurrentFontFamily().includes(font) ? 'active' : ''
                      }`}
                      style={{ fontFamily: font }}
                    >
                      {font}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="divider"></div>

          {/* Text Style Controls - FUNCTIONAL */}
          <button 
            onClick={() => formattingManager.text.bold()}
            className={`formatting-button ${formattingManager.isBold() ? 'active' : ''}`}
            title="Bold"
          >
            <Bold size={14} />
          </button>
          
          <button 
            onClick={() => formattingManager.text.italic()}
            className={`formatting-button ${formattingManager.isItalic() ? 'active' : ''}`}
            title="Italic"
          >
            <Italic size={14} />
          </button>
          
          <button 
            onClick={() => formattingManager.text.underline()}
            className={`formatting-button ${formattingManager.isUnderlined() ? 'active' : ''}`}
            title="Underline"
          >
            <Underline size={14} />
          </button>

          {/* Divider */}
          <div className="divider"></div>

          {/* Text Alignment - Non-functional for now */}
          <button 
            className="formatting-button"
            title="Align Left (Non-functional)"
          >
            <AlignLeft size={14} />
          </button>
          
          <button 
            className="formatting-button"
            title="Align Center (Non-functional)"
          >
            <AlignCenter size={14} />
          </button>
          
          <button 
            className="formatting-button"
            title="Align Right (Non-functional)"
          >
            <AlignRight size={14} />
          </button>

          {/* Divider */}
          <div className="divider"></div>

          {/* Text Color - FUNCTIONAL */}
          <div className="color-picker-container" ref={colorPickerRef}>
            <button
              onClick={() => {
                if (showColorPicker === 'text') {
                  setShowColorPicker(null);
                } else {
                  const currentColor = getCurrentTextColor();
                  setPendingTextColor(currentColor);
                  setShowColorPicker('text');
                }
              }}
              className="color-picker-button"
              title="Text Color"
            >
              <Palette size={14} />
              <div 
                className="color-preview" 
                style={{ backgroundColor: getCurrentTextColor() }}
              />
            </button>
            
            {showColorPicker === 'text' && (
              <div className="color-picker-popup">
                <SketchPicker
                  color={pendingTextColor}
                  onChange={(color: any) => setPendingTextColor(color.hex)}
                  disableAlpha
                />
                <div className="color-picker-actions">
                  <button
                    onClick={applyTextColor}
                    className="apply-button"
                  >
                    Apply
                  </button>
                  <button
                    onClick={() => setShowColorPicker(null)}
                    className="cancel-button"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* Background Color - FUNCTIONAL */}
      <div className="color-picker-container">
        <button
          onClick={() => {
            if (showColorPicker === 'background') {
              setShowColorPicker(null);
            } else {
              setPendingBackgroundColor('#ffffff');
              setShowColorPicker('background');
            }
          }}
          className="color-picker-button"
          title="Background Color"
        >
          <div className="background-color-preview"></div>
          <div className="background-color-text">BG</div>
        </button>
        
        {showColorPicker === 'background' && (
          <div className="color-picker-popup">
            <SketchPicker
              color={pendingBackgroundColor}
              onChange={(color: any) => setPendingBackgroundColor(color.hex)}
              disableAlpha
            />
            <div className="color-picker-actions">
              <button
                onClick={applyBackgroundColor}
                className="apply-button"
              >
                Apply
              </button>
              <button
                onClick={() => setShowColorPicker(null)}
                className="cancel-button"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}