import React from 'react'
import { Tldraw, TLComponents } from 'tldraw'
import { VerticalFormattingBar } from './VerticalFormattingBar'

// Custom Style Panel component that uses our VerticalFormattingBar
function CustomStylePanel() {
  return (
    <div className="tlui-style-panel tlui-custom-style-panel">
      <VerticalFormattingBar isVisible={true} />
    </div>
  )
}

// Define custom components
const components: TLComponents = {
  StylePanel: CustomStylePanel,
}

// Example usage in your app
export function ExampleApp() {
  return (
    <Tldraw
      components={components}
      // other props...
    />
  )
}

// Or if you want to use it standalone (not recommended for production)
export function StandaloneVerticalFormattingBar() {
  return (
    <div style={{ position: 'fixed', right: '1rem', top: '50%', transform: 'translateY(-50%)' }}>
      <VerticalFormattingBar isVisible={true} />
    </div>
  )
}
