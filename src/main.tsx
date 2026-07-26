import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { Capacitor } from '@capacitor/core'
import { StatusBar, Style } from '@capacitor/status-bar'
import { App as CapApp } from '@capacitor/app'

if (Capacitor.isNativePlatform()) {
  StatusBar.setStyle({ style: Style.Light }).catch(() => {})
  StatusBar.setBackgroundColor({ color: '#FFFFFF' }).catch(() => {})
  CapApp.addListener('backButton', ({ canGoBack }) => {
    if (!canGoBack) CapApp.exitApp()
    else window.history.back()
  })
}

// Prevent iOS rubber-band scroll on the shell
document.addEventListener(
  'touchmove',
  (e) => {
    const target = e.target as HTMLElement
    if (!target.closest('.no-scrollbar, [data-scrollable]')) e.preventDefault()
  },
  { passive: false },
)

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
