'use client'

import { Sparkles } from 'lucide-react'

export function MobileHeader() {
  return (
    <div className="mobile-header">
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
  )
}
