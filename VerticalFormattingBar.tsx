import React, { useState, useRef, useEffect } from 'react';
import { 
  Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, 
  Palette, Type, Plus, Minus, Square, ChevronDown
} from 'lucide-react';

interface VerticalFormattingBarProps {
  isVisible?: boolean;
  onAddText?: () => void;
  onAddShape?: () => void;
  onTextColorChange?: (color: string) => void;
  onBackgroundColorChange?: (color: string) => void;
  onFontSizeChange?: (size: number) => void;
  onFontFamilyChange?: (font: string) => void;
  onBoldToggle?: () => void;
  onItalicToggle?: () => void;
  onUnderlineToggle?: () => void;
  currentTextColor?: string;
  currentBackgroundColor?: string;
  currentFontSize?: number;
  currentFontFamily?: string;
  isBold?: boolean;
  isItalic?: boolean;
  isUnderlined?: boolean;
}

export function VerticalFormattingBar({
  isVisible = true,
  onAddText,
  onAddShape,
  onTextColorChange,
  onBackgroundColorChange,
  onFontSizeChange,
  onFontFamilyChange,
  onBoldToggle,
  onItalicToggle,
  onUnderlineToggle,
  currentTextColor = '#000000',
  currentBackgroundColor = '#ffffff',
  currentFontSize = 16,
  currentFontFamily = 'Arial',
  isBold = false,
  isItalic = false,
  isUnderlined = false
}: VerticalFormattingBarProps) {
  const [showColorPicker, setShowColorPicker] = useState<string | null>(null);
  const [showFontDropdown, setShowFontDropdown] = useState(false);
  const [pendingTextColor, setPendingTextColor] = useState<string>(currentTextColor);
  const [pendingBackgroundColor, setPendingBackgroundColor] = useState<string>(currentBackgroundColor);
  
  const colorPickerRef = useRef<HTMLDivElement>(null);
  const fontDropdownRef = useRef<HTMLDivElement>(null);

  // Font options
  const fontOptions = [
    'Arial', 'Helvetica', 'Times New Roman', 'Georgia', 'Verdana', 'Comic Sans MS',
    'Impact', 'Trebuchet MS', 'Courier New', 'Lucida Console', 'Tahoma', 'Palatino'
  ];

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (colorPickerRef.current && !colorPickerRef.current.contains(event.target as Node)) {
        setShowColorPicker(null);
      }
      if (fontDropdownRef.current && !fontDropdownRef.current.contains(event.target as Node)) {
        setShowFontDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Apply text color
  const applyTextColor = () => {
    if (onTextColorChange) {
      onTextColorChange(pendingTextColor);
    }
    setShowColorPicker(null);
  };

  // Apply background color
  const applyBackgroundColor = () => {
    if (onBackgroundColorChange) {
      onBackgroundColorChange(pendingBackgroundColor);
    }
    setShowColorPicker(null);
  };

  // Handle font family change
  const handleFontChange = (font: string) => {
    if (onFontFamilyChange) {
      onFontFamilyChange(font);
    }
    setShowFontDropdown(false);
  };

  if (!isVisible) return null;

  return (
    <div className="vertical-formatting-bar">
      {/* Add Elements */}
      <button
        onClick={onAddText}
        className="formatting-button"
        title="Add Text"
      >
        <Type size={14} />
      </button>
      
      <button
        onClick={onAddShape}
        className="formatting-button"
        title="Add Shape"
      >
        <Square size={14} />
      </button>

      {/* Divider */}
      <div className="divider"></div>

      {/* Font Size Controls */}
      <div className="font-size-controls">
        <button
          className="formatting-button"
          title="Increase Font Size"
          onClick={() => onFontSizeChange && onFontSizeChange(Math.min(currentFontSize + 2, 72))}
        >
          <Plus size={14} />
        </button>
        <div className="font-size-display">
          {currentFontSize}px
        </div>
        <button
          className="formatting-button"
          title="Decrease Font Size"
          onClick={() => onFontSizeChange && onFontSizeChange(Math.max(currentFontSize - 2, 8))}
        >
          <Minus size={14} />
        </button>
      </div>

      {/* Font Family */}
      <div className="font-family" ref={fontDropdownRef}>
        <button
          onClick={() => setShowFontDropdown(!showFontDropdown)}
          className="font-family-button"
          title="Font Family"
        >
          <ChevronDown size={14} />
          <div className="font-family-text">
            {currentFontFamily.split(',')[0].replace(/['"]/g, '')}
          </div>
        </button>
        {showFontDropdown && (
          <div className="font-dropdown">
            <div className="font-dropdown-content">
              {fontOptions.map((font) => (
                <button
                  key={font}
                  onClick={() => handleFontChange(font)}
                  className={`font-option ${
                    currentFontFamily.includes(font) ? 'font-option--selected' : ''
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

      {/* Text Style Controls */}
      <button 
        onClick={onBoldToggle}
        className={`formatting-button ${isBold ? 'formatting-button--active' : ''}`}
        title="Bold"
      >
        <Bold size={14} />
      </button>
      
      <button 
        onClick={onItalicToggle}
        className={`formatting-button ${isItalic ? 'formatting-button--active' : ''}`}
        title="Italic"
      >
        <Italic size={14} />
      </button>
      
      <button 
        onClick={onUnderlineToggle}
        className={`formatting-button ${isUnderlined ? 'formatting-button--active' : ''}`}
        title="Underline"
      >
        <Underline size={14} />
      </button>

      {/* Divider */}
      <div className="divider"></div>

      {/* Text Alignment */}
      <button 
        className="formatting-button"
        title="Align Left"
      >
        <AlignLeft size={14} />
      </button>
      
      <button 
        className="formatting-button"
        title="Align Center"
      >
        <AlignCenter size={14} />
      </button>
      
      <button 
        className="formatting-button"
        title="Align Right"
      >
        <AlignRight size={14} />
      </button>

      {/* Divider */}
      <div className="divider"></div>

      {/* Text Color */}
      <div className="color-picker" ref={colorPickerRef}>
        <button
          onClick={() => {
            if (showColorPicker === 'text') {
              setShowColorPicker(null);
            } else {
              setPendingTextColor(currentTextColor);
              setShowColorPicker('text');
            }
          }}
          className="color-button"
          title="Text Color"
        >
          <Palette size={14} />
          <div 
            className="color-preview" 
            style={{ backgroundColor: currentTextColor }}
          />
        </button>
        
        {showColorPicker === 'text' && (
          <div className="color-picker-popup">
            <div className="color-picker-content">
              <div className="color-picker-buttons">
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
          </div>
        )}
      </div>

      {/* Background Color */}
      <div className="background-color">
        <button
          onClick={() => {
            if (showColorPicker === 'background') {
              setShowColorPicker(null);
            } else {
              setPendingBackgroundColor(currentBackgroundColor);
              setShowColorPicker('background');
            }
          }}
          className="background-button"
          title="Background Color"
        >
          <div className="background-preview"></div>
          <div className="background-label">BG</div>
        </button>
        
        {showColorPicker === 'background' && (
          <div className="color-picker-popup">
            <div className="color-picker-content">
              <div className="color-picker-buttons">
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
          </div>
        )}
      </div>
    </div>
  );
}
