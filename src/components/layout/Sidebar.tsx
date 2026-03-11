'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard,
  CheckSquare,
  BookOpen,
  BarChart3,
  Settings,
  Sparkles,
  ChevronRight,
  X,
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { ThemeToggle } from './ThemeToggle'

const navItems = [
  { href: '/', icon: LayoutDashboard, label: 'Home' },
  { href: '/tasks', icon: CheckSquare, label: 'My Day' },
  { href: '/stats', icon: BarChart3, label: 'Insights' },
  { href: '/blog', icon: BookOpen, label: 'Write' },
  { href: '/settings', icon: Settings, label: 'Settings' },
]

function SidebarContent({
  collapsed,
  setCollapsed,
  onClose,
  isMobile,
}: {
  collapsed: boolean
  setCollapsed: (v: boolean) => void
  onClose?: () => void
  isMobile?: boolean
}) {
  const pathname = usePathname()

  return (
    <>
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b flex-shrink-0" style={{ borderColor: 'hsl(var(--sidebar-border))' }}>
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}
        >
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <motion.div
          animate={{ opacity: collapsed && !isMobile ? 0 : 1, maxWidth: collapsed && !isMobile ? 0 : 200 }}
          transition={{ duration: 0.2, ease: 'easeInOut' }}
          className="overflow-hidden whitespace-nowrap flex-1"
        >
          <p className="font-semibold text-sm tracking-wide" style={{ color: 'hsl(var(--foreground))' }}>Folio</p>
          <p className="text-xs" style={{ color: 'hsl(var(--muted-foreground))' }}>Your personal OS</p>
        </motion.div>
        {isMobile && (
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-[hsl(var(--muted))] transition-colors"
            style={{ color: 'hsl(var(--muted-foreground))' }}
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-5 space-y-1 overflow-y-auto">
        {navItems.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || (href !== '/' && pathname.startsWith(href))
          return (
            <Link key={href} href={href} onClick={isMobile ? onClose : undefined}>
              <motion.div
                whileHover={{ x: collapsed && !isMobile ? 0 : 4 }}
                whileTap={{ scale: 0.97 }}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors duration-150',
                  active ? 'text-amber-500' : 'hover:bg-[hsl(var(--muted))]'
                )}
                style={{
                  background: active ? 'hsl(43 96% 56% / 0.12)' : undefined,
                  color: active ? '#f59e0b' : 'hsl(var(--muted-foreground))',
                }}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <motion.span
                  animate={{ opacity: collapsed && !isMobile ? 0 : 1, maxWidth: collapsed && !isMobile ? 0 : 160 }}
                  transition={{ duration: 0.2, ease: 'easeInOut' }}
                  className="overflow-hidden whitespace-nowrap truncate"
                >
                  {label}
                </motion.span>
              </motion.div>
            </Link>
          )
        })}
      </nav>

      {/* Bottom */}
      <div className="px-2 py-4 border-t space-y-1 flex-shrink-0" style={{ borderColor: 'hsl(var(--sidebar-border))' }}>
        {!isMobile && (
          <div className={cn('flex items-center px-3 py-2', collapsed ? 'justify-center' : 'justify-between')}>
            <ThemeToggle collapsed={collapsed} />
          </div>
        )}
        {!isMobile && (
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs transition-colors hover:bg-[hsl(var(--muted))] cursor-pointer overflow-hidden"
            style={{ color: 'hsl(var(--muted-foreground))' }}
          >
            <motion.div
              animate={{ rotate: collapsed ? 0 : 180 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className="flex-shrink-0"
            >
              <ChevronRight className="w-4 h-4" />
            </motion.div>
            <motion.span
              animate={{ opacity: collapsed ? 0 : 1, maxWidth: collapsed ? 0 : 80 }}
              transition={{ duration: 0.2, ease: 'easeInOut' }}
              className="overflow-hidden whitespace-nowrap"
            >
              Collapse
            </motion.span>
          </button>
        )}
      </div>
    </>
  )
}

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    function handle() { setMobileOpen((o) => !o) }
    window.addEventListener('ls-sidebar-toggle', handle)
    return () => window.removeEventListener('ls-sidebar-toggle', handle)
  }, [])

  return (
    <>
      {/* Desktop sidebar */}
      <motion.aside
        animate={{ width: collapsed ? 72 : 240 }}
        transition={{ type: 'spring', stiffness: 280, damping: 26, mass: 0.8 }}
        className="desktop-sidebar sidebar-panel relative flex-shrink-0 flex flex-col h-screen overflow-hidden border-r"
        style={{ borderColor: 'hsl(var(--sidebar-border))' }}
      >
        <SidebarContent collapsed={collapsed} setCollapsed={setCollapsed} />
      </motion.aside>

      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              key="overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="mobile-sidebar-overlay fixed inset-0 z-40 bg-black/50"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              key="drawer"
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', stiffness: 320, damping: 32 }}
              className="mobile-sidebar-drawer sidebar-panel fixed left-0 top-0 bottom-0 z-50 flex flex-col border-r overflow-hidden"
              style={{ width: 260, borderColor: 'hsl(var(--sidebar-border))' }}
            >
              <SidebarContent
                collapsed={false}
                setCollapsed={() => {}}
                onClose={() => setMobileOpen(false)}
                isMobile
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
