import React, { useState, useCallback } from 'react'
import { TldrawUiPopover, TldrawUiPopoverContent, TldrawUiPopoverTrigger } from '../primitives/TldrawUiPopover'
import { TldrawUiButton } from '../primitives/Button/TldrawUiButton'
import { TldrawUiButtonIcon } from '../primitives/Button/TldrawUiButtonIcon'
import { useTranslation } from '../../hooks/useTranslation/useTranslation'
import { DefaultColorStyle } from '@tldraw/editor'
import { STYLES } from '../../styles'

interface EnhancedColorPickerProps {
  value: string
  onValueChange: (color: string) => void
  title: string
  showHexInput?: boolean
}

export const EnhancedColorPicker = React.memo(function EnhancedColorPicker({
  value,
  onValueChange,
  title,
  showHexInput = true,
}: EnhancedColorPickerProps) {
  const msg = useTranslation()
  const [isOpen, setIsOpen] = useState(false)
  const [hexValue, setHexValue] = useState(value)
  const [isHexMode, setIsHexMode] = useState(false)

  // Check if current value is a hex color
  const isCurrentValueHex = value.startsWith('#') && (value.length === 7 || value.length === 4)

  const handleColorChange = useCallback((newColor: string) => {
    onValueChange(newColor)
    setHexValue(newColor)
    setIsHexMode(newColor.startsWith('#'))
  }, [onValueChange])

  const handleHexChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const hex = e.target.value
    setHexValue(hex)
    if (hex.match(/^#[0-9A-Fa-f]{6}$/)) {
      handleColorChange(hex)
    }
  }, [handleColorChange])

  const handleHexSubmit = useCallback(() => {
    if (hexValue.match(/^#[0-9A-Fa-f]{6}$/)) {
      handleColorChange(hexValue)
    }
  }, [hexValue, handleColorChange])

  const toggleMode = useCallback(() => {
    setIsHexMode(!isHexMode)
  }, [isHexMode])

  return (
    <TldrawUiPopover open={isOpen} onOpenChange={setIsOpen}>
      <TldrawUiPopoverTrigger asChild>
        <TldrawUiButton
          type="icon"
          title={title}
          className="tlui-style-panel__color-picker"
        >
          <div
            className="tlui-style-panel__color-picker__color"
            style={{
              backgroundColor: isCurrentValueHex ? value : undefined,
              color: isCurrentValueHex ? value : undefined,
            }}
          >
            {!isCurrentValueHex && (
              <TldrawUiButtonIcon icon="color" />
            )}
          </div>
        </TldrawUiButton>
      </TldrawUiPopoverTrigger>
      <TldrawUiPopoverContent side="bottom" align="start">
        <div className="tlui-style-panel__color-picker__content">
          {/* Mode Toggle */}
          <div className="tlui-style-panel__color-picker__mode-toggle">
            <TldrawUiButton
              type="icon"
              title="Toggle between preset and custom colors"
              onClick={toggleMode}
            >
              <TldrawUiButtonIcon icon={isHexMode ? "color" : "edit"} />
            </TldrawUiButton>
          </div>

          {isHexMode ? (
            /* Hex Color Input Mode */
            <div className="tlui-style-panel__color-picker__hex-mode">
              <div className="tlui-style-panel__color-picker__hex-input">
                <input
                  type="text"
                  value={hexValue}
                  onChange={handleHexChange}
                  onKeyDown={(e) => e.key === 'Enter' && handleHexSubmit()}
                  placeholder="#000000"
                  className="tlui-style-panel__color-picker__hex-input__field"
                />
                <TldrawUiButton
                  type="icon"
                  title="Apply hex color"
                  onClick={handleHexSubmit}
                >
                  <TldrawUiButtonIcon icon="check" />
                </TldrawUiButton>
              </div>
              
              {/* Quick Color Presets */}
              <div className="tlui-style-panel__color-picker__quick-colors">
                {['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF', '#FF8000', '#8000FF', '#FF0080', '#80FF00'].map((color) => (
                  <button
                    key={color}
                    className="tlui-style-panel__color-picker__quick-color"
                    style={{ backgroundColor: color }}
                    onClick={() => handleColorChange(color)}
                    title={color}
                  />
                ))}
              </div>
            </div>
          ) : (
            /* Preset Color Mode */
            <div className="tlui-style-panel__color-picker__preset-mode">
              <div className="tlui-style-panel__color-picker__preset-grid">
                {STYLES.color.map((colorOption) => (
                  <button
                    key={colorOption.value}
                    className="tlui-style-panel__color-picker__preset-color"
                    style={{
                      backgroundColor: colorOption.value === 'white' ? '#ffffff' : undefined,
                      border: colorOption.value === 'white' ? '1px solid #ccc' : undefined,
                    }}
                    onClick={() => handleColorChange(colorOption.value)}
                    title={msg(`color-style.${colorOption.value}`)}
                  >
                    {colorOption.value === 'white' && (
                      <TldrawUiButtonIcon icon="color" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </TldrawUiPopoverContent>
    </TldrawUiPopover>
  )
})
