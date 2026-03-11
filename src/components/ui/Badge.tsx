'use client'

import { cn, getPriorityBg } from '@/lib/utils'

interface BadgeProps {
  label: string
  variant?: 'default' | 'priority' | 'category' | 'success' | 'muted'
  className?: string
}

export function Badge({ label, variant = 'default', className }: BadgeProps) {
  const baseClasses = 'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium'

  const variantClasses = {
    default: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
    priority: getPriorityBg(label),
    category: 'bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]',
    success: 'bg-green-500/10 text-green-600 dark:text-green-400',
    muted: 'bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]',
  }

  return (
    <span className={cn(baseClasses, variantClasses[variant], className)}>
      {label}
    </span>
  )
}
