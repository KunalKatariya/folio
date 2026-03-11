'use client'

import { useTheme } from 'next-themes'
import { Sun, Moon } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useEffect, useState } from 'react'
import { useStore } from '@/store/useStore'

interface ThemeToggleProps {
  collapsed?: boolean
}

export function ThemeToggle({ collapsed }: ThemeToggleProps) {
  const { theme, setTheme } = useTheme()
  const { settings } = useStore()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])
  if (!mounted) return null

  const isDark = theme === 'dark'
  const locked = !!settings.customBgImage

  return (
    <button
      onClick={() => !locked && setTheme(isDark ? 'light' : 'dark')}
      disabled={locked}
      className={cn(
        'flex items-center gap-3 rounded-xl text-sm transition-colors cursor-pointer',
        collapsed ? 'w-9 h-9 justify-center' : 'w-full px-0 py-2',
        locked ? 'opacity-30 cursor-not-allowed' : 'hover:bg-[hsl(var(--muted))]'
      )}
      style={{ color: 'hsl(var(--muted-foreground))' }}
      title={locked ? 'Theme locked while custom background is active' : isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <motion.div
        key={theme}
        initial={{ rotate: -30, opacity: 0, scale: 0.7 }}
        animate={{ rotate: 0, opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        className="flex-shrink-0"
      >
        {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
      </motion.div>
      <AnimatePresence>
        {!collapsed && (
          <motion.span
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -8 }}
            transition={{ duration: 0.12 }}
          >
            {isDark ? 'Light mode' : 'Dark mode'}
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  )
}
