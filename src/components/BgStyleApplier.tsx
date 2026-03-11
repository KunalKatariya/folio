'use client'

import { useEffect, useRef } from 'react'
import { useStore } from '@/store/useStore'
import { useTheme } from 'next-themes'

export function BgStyleApplier() {
  const { settings } = useStore()
  const { theme, setTheme } = useTheme()
  const prevTheme = useRef<string | null>(null)

  // Force dark mode when custom background is active; restore when removed
  useEffect(() => {
    if (settings.customBgImage) {
      if (theme !== 'dark') {
        prevTheme.current = theme ?? 'dark'
        setTheme('dark')
      }
    } else {
      if (prevTheme.current && prevTheme.current !== 'dark') {
        setTheme(prevTheme.current)
        prevTheme.current = null
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings.customBgImage])

  useEffect(() => {
    document.documentElement.setAttribute('data-bg', settings.bgStyle ?? 'default')

    // Inject (or clear) a <style> block — using !important lets us override div inline styles
    let styleEl = document.getElementById('__ls-bg') as HTMLStyleElement | null
    if (!styleEl) {
      styleEl = document.createElement('style')
      styleEl.id = '__ls-bg'
      document.head.appendChild(styleEl)
    }

    if (settings.customBgImage) {
      styleEl.textContent = `
        body {
          background-image: url("${settings.customBgImage}") !important;
          background-size: cover !important;
          background-position: center !important;
          background-attachment: fixed !important;
          background-color: transparent !important;
        }
        .app-shell {
          background: transparent !important;
        }
        .sidebar-panel {
          background: rgba(0, 0, 0, 0.55) !important;
          backdrop-filter: blur(20px) !important;
          -webkit-backdrop-filter: blur(20px) !important;
          /* Override CSS vars so theme-based text is always readable over dark bg */
          --foreground: 0 0% 95%;
          --muted-foreground: 0 0% 65%;
          --sidebar: transparent;
          --sidebar-border: 0 0% 100% / 0.08;
          --muted: 0 0% 100% / 0.08;
          --border: 0 0% 100% / 0.08;
        }
        .main-content {
          background: rgba(0, 0, 0, 0.45) !important;
        }
        .mobile-header {
          background: rgba(0, 0, 0, 0.55) !important;
          backdrop-filter: blur(20px) !important;
          -webkit-backdrop-filter: blur(20px) !important;
          --foreground: 0 0% 95%;
          --muted-foreground: 0 0% 65%;
          --border: 0 0% 100% / 0.08;
        }
      `
    } else {
      styleEl.textContent = ''
    }
  }, [settings.bgStyle, settings.customBgImage])

  return null
}

