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
  const [showStrokeWidthDropdown, setShowStrokeWidthDropdown] = useState(false);
  const [pendingTextColor, setPendingTextColor] = useState<string>('#000000');
  const [pendingBackgroundColor, setPendingBackgroundColor] = useState<string>('#ffffff');
  const [pendingStrokeColor, setPendingStrokeColor] = useState<string>('#000000');
  const [fontSize, setFontSize] = useState<string>('16');
  // Removed formattingState to avoid re-render loops
  
  const colorPickerRef = useRef<HTMLDivElement>(null);
  const bgColorPickerRef = useRef<HTMLDivElement>(null);
  const strokeColorPickerRef = useRef<HTMLDivElement>(null);
  const strokeWidthDropdownRef = useRef<HTMLDivElement>(null);
  const fontDropdownRef = useRef<HTMLDivElement>(null);
  const formattingManager = useCustomFormattingManager();

  // Sync font size with selected text
  useEffect(() => {
    const updateFontSize = () => {
      const currentSize = formattingManager.getCurrentFontSize();
      const next = currentSize.toString();
      setFontSize(prev => (prev !== next ? next : prev));
    };

    // Update initially
    updateFontSize();

    // Listen for selection changes
    const unsubscribe = formattingManager.getStore().listen(() => {
      updateFontSize();
    });

    return unsubscribe;
  }, [formattingManager]);

  // Sync background color with selected shapes
  useEffect(() => {
    const updateBackgroundColor = () => {
      // Don't update if color picker is open
      if (showColorPicker === 'background') return;

      const currentBgColor = formattingManager.getCurrentBackgroundColor();
      setPendingBackgroundColor(prev => (prev !== currentBgColor ? currentBgColor : prev));
    };

    // Update initially
    updateBackgroundColor();

    // Listen for selection changes
    const unsubscribe = formattingManager.getStore().listen(() => {
      updateBackgroundColor();
    });

    return unsubscribe;
  }, [formattingManager, showColorPicker]);

  // Sync stroke color with selected shapes
  useEffect(() => {
    const updateStrokeColor = () => {
      // Don't update if color picker is open
      if (showColorPicker === 'stroke') return;

      const currentStrokeColor = formattingManager.getCurrentStrokeColor();
      setPendingStrokeColor(prev => (prev !== currentStrokeColor ? currentStrokeColor : prev));
    };

    // Update initially
    updateStrokeColor();

    // Listen for selection changes
    const unsubscribe = formattingManager.getStore().listen(() => {
      updateStrokeColor();
    });

    return unsubscribe;
  }, [formattingManager, showColorPicker]);

  // Sync stroke width with selected shapes
  useEffect(() => {
    const updateStrokeWidth = () => {
      // This will be handled by the button states automatically
      // since we're calling getCurrentStrokeWidth() in the render
    };

    // Listen for selection changes to trigger re-render
    const unsubscribe = formattingManager.getStore().listen(() => {
      updateStrokeWidth();
    });

    return unsubscribe;
  }, [formattingManager]);
 
  // Font options (tldraw supported fonts with user-friendly names)
  const fontOptions = [
    { value: 'serif', label: 'Times New Roman', family: 'var(--tl-font-serif)' },
    { value: 'draw', label: 'Draw', family: 'var(--tl-font-draw)' },
    { value: 'sans', label: 'Arial', family: 'var(--tl-font-sans)' },
    { value: 'mono', label: 'Courier New', family: 'var(--tl-font-mono)' }
  ];

  // Stroke width options (tldraw supported sizes with user-friendly names)
  const strokeWidthOptions = [
    { value: 's', label: 'Small (1.5px)' },
    { value: 'm', label: 'Medium (2.5px)' },
    { value: 'l', label: 'Large (4px)' },
    { value: 'xl', label: 'XL (6px)' }
  ];

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;

      // Close text color picker if open and click is outside its container and picker element
      if (
        showColorPicker === 'text' &&
        colorPickerRef.current &&
        !colorPickerRef.current.contains(target) &&
        !(target as Element).closest('.sketch-picker') &&
        !(target as Element).closest('.compact-picker')
      ) {
        setShowColorPicker(null);
      }

      // Close background color picker if open and click is outside its container and picker element
      if (
        showColorPicker === 'background' &&
        bgColorPickerRef.current &&
        !bgColorPickerRef.current.contains(target) &&
        !(target as Element).closest('.sketch-picker') &&
        !(target as Element).closest('.compact-picker')
      ) {
        setShowColorPicker(null);
      }

      // Close stroke color picker if open and click is outside its container and picker element
      if (
        showColorPicker === 'stroke' &&
        strokeColorPickerRef.current &&
        !strokeColorPickerRef.current.contains(target) &&
        !(target as Element).closest('.sketch-picker') &&
        !(target as Element).closest('.compact-picker')
      ) {
        setShowColorPicker(null);
      }

      // Close font dropdown on outside click
      if (fontDropdownRef.current && !fontDropdownRef.current.contains(target)) {
        setShowFontDropdown(false);
      }

      // Close stroke width dropdown on outside click
      if (strokeWidthDropdownRef.current && !strokeWidthDropdownRef.current.contains(target)) {
        setShowStrokeWidthDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showColorPicker]);

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

  // Apply stroke color using the formatting manager
  const applyStrokeColor = () => {
    formattingManager.element.setStrokeColor(pendingStrokeColor);
    setShowColorPicker(null);
  };

  // Handle font family change
  const handleFontChange = (font: string) => {
    formattingManager.text.setFamily(font);
    setShowFontDropdown(false);
  };

  // Handle stroke width change
  const handleStrokeWidthChange = (width: string) => {
    if (width === 's' || width === 'm' || width === 'l' || width === 'xl') {
      formattingManager.element.setStrokeWidth(width);
      setShowStrokeWidthDropdown(false);
    }
  };

  // Check if text is selected (tldraw-specific logic)
  const hasTextSelected = () => {
    const selectedElements = formattingManager.getSelectedElementsForFormatting();
    return selectedElements.some((element: any) => {
      return element.type === 'text' || element.props?.richText;
    });
  };

  // Check if any shapes are selected for background formatting
  const hasShapesSelected = () => {
    const selectedElements = formattingManager.getSelectedElementsForFormatting();
    return selectedElements.length > 0;
  };

  const showTextFormatting = hasTextSelected();

  if (!isVisible) return null;

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

      {/* Text formatting controls - show only when text is selected */}
      {showTextFormatting && (
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
                {fontOptions.find(f => f.value === formattingManager.getCurrentFontFamily())?.label || 'Sans'}
              </div>
            </button>
            {showFontDropdown && (
              <div className="font-dropdown-menu">
                <div className="font-dropdown-content">
                  {fontOptions.map((font) => (
                    <button
                      key={font.value}
                      onClick={() => handleFontChange(font.value)}
                      className={`font-option ${
                        formattingManager.getCurrentFontFamily() === font.value ? 'active' : ''
                      }`}
                      style={{ fontFamily: font.family }}
                    >
                      {font.label}
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
            onClick={() => formattingManager.text.code()}
            className={`formatting-button ${formattingManager.isCode() ? 'active' : ''}`}
            title="Code"
          >
            <span style={{ fontFamily: 'monospace', fontWeight: 'bold' }}>{'</>'}</span>
          </button>

          {/* Divider */}
          <div className="divider"></div>

          {/* Text Alignment - Now Functional */}
          <button 
            onClick={() => formattingManager.text.alignLeft()}
            className={`formatting-button ${formattingManager.getCurrentTextAlign() === 'start' ? 'active' : ''}`}
            title="Align Left"
          >
            <AlignLeft size={14} />
          </button>
          
          <button 
            onClick={() => formattingManager.text.alignCenter()}
            className={`formatting-button ${formattingManager.getCurrentTextAlign() === 'middle' ? 'active' : ''}`}
            title="Align Center"
          >
            <AlignCenter size={14} />
          </button>
          
          <button 
            onClick={() => formattingManager.text.alignRight()}
            className={`formatting-button ${formattingManager.getCurrentTextAlign() === 'end' ? 'active' : ''}`}
            title="Align Right"
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

      {/* Background Color - show when shapes are selected */}
      {hasShapesSelected() && (
        <div className="color-picker-container" ref={bgColorPickerRef}>
          <button
            onClick={() => {
              if (showColorPicker === 'background') {
                setShowColorPicker(null);
              } else {
                const currentBgColor = formattingManager.getCurrentBackgroundColor();
                setPendingBackgroundColor(currentBgColor);
                setShowColorPicker('background');
              }
            }}
            className="color-picker-button"
            title="Background Color"
          >
            <div
              className="background-color-preview"
              style={{ backgroundColor: formattingManager.getCurrentBackgroundColor() }}
            />
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
                <button onClick={applyBackgroundColor} className="apply-button">
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
      )}

      {/* Stroke Color - show when shapes are selected */}
      {hasShapesSelected() && (
        <div className="color-picker-container" ref={strokeColorPickerRef}>
          <button
            onClick={() => {
              if (showColorPicker === 'stroke') {
                setShowColorPicker(null);
              } else {
                const currentStrokeColor = formattingManager.getCurrentStrokeColor();
                setPendingStrokeColor(currentStrokeColor);
                setShowColorPicker('stroke');
              }
            }}
            className="color-picker-button"
            title="Stroke Color"
          >
            <div
              className="stroke-color-preview"
              style={{ backgroundColor: formattingManager.getCurrentStrokeColor() }}
            />
            <div className="stroke-color-text">ST</div>
          </button>
          
          {showColorPicker === 'stroke' && (
            <div className="color-picker-popup">
              <SketchPicker
                color={pendingStrokeColor}
                onChange={(color: any) => setPendingStrokeColor(color.hex)}
                disableAlpha
              />
              <div className="color-picker-actions">
                <button onClick={applyStrokeColor} className="apply-button">
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
      )}

      {/* Stroke Width - show when shapes are selected */}
      {hasShapesSelected() && (
        <div className="stroke-width-dropdown" ref={strokeWidthDropdownRef}>
          <button
            onClick={() => setShowStrokeWidthDropdown(!showStrokeWidthDropdown)}
            className="stroke-width-button"
            title="Stroke Width"
          >
            <ChevronDown size={14} />
            <div className="stroke-width-text">
              {strokeWidthOptions.find(w => w.value === formattingManager.getCurrentStrokeWidth())?.label || 'M'}
            </div>
          </button>
          {showStrokeWidthDropdown && (
            <div className="stroke-width-dropdown-menu">
              <div className="stroke-width-dropdown-content">
                {strokeWidthOptions.map((width) => (
                  <button
                    key={width.value}
                    onClick={() => handleStrokeWidthChange(width.value)}
                    className={`stroke-width-option ${
                      formattingManager.getCurrentStrokeWidth() === width.value ? 'active' : ''
                    }`}
                  >
                    {width.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}