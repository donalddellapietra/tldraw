---
title: Font Size Controls
description: Custom font size controls with presets and numeric input
details: This example demonstrates how to implement custom font size controls for text shapes, including preset sizes (xs, s, m, l, xl, xxl) and custom numeric input.
component: ./FontSizeControlsExample.tsx
category: shapes/tools
priority: 20
keywords: [text, font, size, controls, style panel]
hide: false
multiplayer: false
---

This example shows how to implement custom font size controls for text shapes in tldraw. The implementation includes:

## Features

- **Preset Font Sizes**: Predefined font size options (xs, s, m, l, xl, xxl)
- **Custom Numeric Input**: Ability to input custom font sizes from 1px to 200px
- **Style Panel Integration**: Font size controls integrated into the style panel
- **Real-time Updates**: Font size changes apply immediately to selected text shapes

## Implementation Details

The font size controls are implemented by:

1. **Extended Font Size Schema**: Added new font size presets beyond the default size options
2. **Custom Font Size Property**: Added support for custom numeric font sizes
3. **Style Panel Integration**: Integrated font size picker and custom input into the text style panel
4. **Font Size Input Component**: Created a reusable component for custom font size input

## Usage

1. Select a text shape on the canvas
2. Open the style panel (right sidebar)
3. Use the font size picker to select from preset sizes
4. Use the custom font size input to enter specific pixel values
5. Font size changes apply immediately to the selected text

## Technical Notes

- Font sizes are stored as both preset enum values and optional custom numeric values
- The system gracefully falls back to preset sizes when custom sizes are not available
- All font size changes are tracked in the editor's history system
