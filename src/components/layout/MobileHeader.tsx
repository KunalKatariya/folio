'use client'

import { Menu, Sparkles } from 'lucide-react'
import { ThemeToggle } from './ThemeToggle'

export function MobileHeader() {
  function toggle() {
    window.dispatchEvent(new CustomEvent('ls-sidebar-toggle'))
  }

  return (
    <div className="mobile-header">
      <div className="flex items-center gap-2.5">
        <button
          onClick={toggle}
          className="p-2 rounded-xl transition-colors hover:bg-[hsl(var(--muted))]"
          style={{ color: 'hsl(var(--foreground))' }}
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2">
          <div
            className="w-6 h-6 rounded-lg flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}
          >
            <Sparkles className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="font-semibold text-sm tracking-wide" style={{ color: 'hsl(var(--foreground))' }}>
            Folio
          </span>
        </div>
      </div>
      <ThemeToggle collapsed={false} />
    </div>
  )
}
