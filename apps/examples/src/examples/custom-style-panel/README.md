---
title: Custom Style Panel
description: Replace the default style panel with a custom vertical formatting bar
details: This example shows how to replace tldraw's default style panel with a custom vertical formatting bar that provides quick access to text formatting, font controls, and element creation tools.
category: ui
priority: 1
component: ./CustomStylePanelExample.tsx
keywords: ['style panel', 'formatting', 'custom ui', 'vertical toolbar']
multiplayer: false
---

# Custom Style Panel

This example demonstrates how to replace tldraw's default style panel with a custom vertical formatting bar. The custom panel provides:

- **Element Creation**: Quick buttons to add text and shapes
- **Text Formatting**: Font size controls, font family selection, and text styling
- **Color Controls**: Text color and background color pickers
- **Responsive Design**: Adapts to show/hide text formatting based on selection

## Key Features

- **Vertical Layout**: Compact vertical toolbar that saves horizontal space
- **Context-Aware**: Only shows text formatting when text elements are selected
- **Custom Styling**: Uses tldraw's design system variables for consistent theming
- **Integration**: Seamlessly integrates with tldraw's editor API

## Implementation

The example uses several custom components:

1. **CustomFormattingManager**: Handles all formatting operations using tldraw's editor API
2. **VerticalFormattingBar**: The main UI component with all formatting controls
3. **CustomStylePanel**: Wrapper that integrates the formatting bar into tldraw's UI system

## Usage

```tsx
import { Tldraw, CustomStylePanel } from 'tldraw'

export default function MyApp() {
  return (
    <Tldraw
      components={{
        StylePanel: CustomStylePanel,
      }}
    />
  )
}
```

## Customization

You can further customize the formatting bar by:

- Adding more formatting options (alignment, spacing, etc.)
- Implementing additional text styles (strikethrough, subscript, etc.)
- Adding shape-specific formatting controls
- Customizing the color picker implementation
