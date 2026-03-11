import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, isToday, isYesterday, formatDistanceToNow } from 'date-fns'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  if (isToday(d)) return 'Today'
  if (isYesterday(d)) return 'Yesterday'
  return format(d, 'MMM d, yyyy')
}

export function formatDateShort(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return format(d, 'MMM d')
}

export function formatDateFull(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return format(d, 'EEEE, MMMM d, yyyy')
}

export function timeAgo(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return formatDistanceToNow(d, { addSuffix: true })
}

export function getTodayString(): string {
  return new Date().toISOString().split('T')[0]
}

export function getDateString(date: Date): string {
  return date.toISOString().split('T')[0]
}

export function getDayOfWeek(dateStr: string): string {
  return format(new Date(dateStr), 'EEE')
}

export function getScoreColor(score: number): string {
  if (score >= 80) return '#22c55e'
  if (score >= 60) return '#eab308'
  if (score >= 40) return '#f97316'
  if (score > 0) return '#ef4444'
  return '#6b7280'
}

export function getPriorityColor(priority: string): string {
  switch (priority) {
    case 'high': return 'text-red-500'
    case 'medium': return 'text-amber-500'
    case 'low': return 'text-green-500'
    default: return 'text-gray-500'
  }
}

export function getPriorityBg(priority: string): string {
  switch (priority) {
    case 'high': return 'bg-red-500/10 text-red-500'
    case 'medium': return 'bg-amber-500/10 text-amber-500'
    case 'low': return 'bg-green-500/10 text-green-600'
    default: return 'bg-gray-500/10 text-gray-500'
  }
}

export const CATEGORIES = [
  'Health', 'Work', 'Learning', 'Personal', 'Finance',
  'Relationships', 'Creativity', 'Mindfulness', 'Exercise', 'Other'
]

export const CATEGORY_COLORS: Record<string, string> = {
  Health: '#22c55e',
  Work: '#3b82f6',
  Learning: '#8b5cf6',
  Personal: '#f97316',
  Finance: '#eab308',
  Relationships: '#ec4899',
  Creativity: '#06b6d4',
  Mindfulness: '#a78bfa',
  Exercise: '#ef4444',
  Other: '#6b7280',
}
