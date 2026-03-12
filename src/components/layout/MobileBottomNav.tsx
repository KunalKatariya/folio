'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { Home, CheckSquare, BarChart3, BookOpen, Settings } from 'lucide-react'

const NAV_ITEMS = [
  { href: '/',        Icon: Home,       label: 'Home'     },
  { href: '/tasks',   Icon: CheckSquare,label: 'My Day'   },
  { href: '/stats',   Icon: BarChart3,  label: 'Insights' },
  { href: '/blog',    Icon: BookOpen,   label: 'Write'    },
  { href: '/settings',Icon: Settings,   label: 'Settings' },
]

export function MobileBottomNav() {
  const pathname = usePathname()

  return (
    <nav className="mobile-bottom-nav">
      <div
        className="flex items-center justify-around px-2 py-2 rounded-[28px]"
        style={{
          background: 'rgba(20, 22, 35, 0.72)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border: '1px solid rgba(255,255,255,0.10)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.35), 0 0 0 0.5px rgba(255,255,255,0.06) inset',
        }}
      >
        {NAV_ITEMS.map(({ href, Icon, label }) => {
          const active = pathname === href || (href !== '/' && pathname.startsWith(href))
          return (
            <Link key={href} href={href} className="flex-1">
              <div className="flex flex-col items-center gap-1 py-1 relative">
                {/* Active pill indicator */}
                {active && (
                  <motion.div
                    layoutId="mobile-nav-pill"
                    className="absolute inset-0 rounded-2xl"
                    style={{ background: 'rgba(245,158,11,0.15)' }}
                    transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                  />
                )}
                <div className="relative z-10 w-9 h-9 flex items-center justify-center rounded-xl transition-transform active:scale-90">
                  <Icon
                    className="w-[19px] h-[19px] transition-all duration-200"
                    style={{
                      color: active ? '#f59e0b' : 'rgba(255,255,255,0.45)',
                      filter: active ? 'drop-shadow(0 0 6px rgba(245,158,11,0.5))' : 'none',
                      strokeWidth: active ? 2.2 : 1.8,
                    }}
                  />
                </div>
                <span
                  className="relative z-10 text-[9px] font-medium tracking-wide leading-none transition-all duration-200"
                  style={{ color: active ? '#f59e0b' : 'rgba(255,255,255,0.35)' }}
                >
                  {label}
                </span>
              </div>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
