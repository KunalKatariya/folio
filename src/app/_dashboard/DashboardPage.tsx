'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useStore, Task } from '@/store/useStore'
import { ProgressRing } from '@/components/ui/ProgressRing'
import { StatsChart } from '@/components/charts/StatsChart'
import { TaskItem } from '@/components/tasks/TaskItem'
import { AddTaskModal } from '@/components/tasks/AddTaskModal'
import { ApplyToAllModal } from '@/components/tasks/ApplyToAllModal'
import {
  formatDateFull,
  getTodayString,
  getScoreColor,
  CATEGORY_COLORS,
} from '@/lib/utils'
import {
  Plus,
  TrendingUp,
  Flame,
  Target,
  BookOpen,
  CheckSquare,
  ArrowRight,
  Youtube,
  Instagram,
  ExternalLink,
} from 'lucide-react'
import Link from 'next/link'
import { AnimatePresence } from 'framer-motion'

function getStreak(getDayStats: (n: number) => { date: string; score: number }[]): number {
  const stats = getDayStats(365)
  let streak = 0
  for (let i = stats.length - 2; i >= 0; i--) {
    if (stats[i].score > 0) streak++
    else break
  }
  return streak
}

export default function DashboardPage() {
  const { getTasksForDate, getCompletionRate, getDayStats, tasks, posts, settings } = useStore()
  const [addOpen, setAddOpen] = useState(false)
  const [editTask, setEditTask] = useState<Task | null>(null)
  const [applyTaskId, setApplyTaskId] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const today = getTodayString()
  const todayTasks = mounted ? getTasksForDate(today) : []
  const completionRate = mounted ? getCompletionRate(today) : 0
  const weekStats = mounted ? getDayStats(7) : []
  const streak = mounted ? getStreak(getDayStats) : 0
  const publishedPosts = mounted ? posts.filter((p) => p.published).length : 0
  const totalTasks = mounted ? tasks.length : 0
  const completedTasks = mounted ? tasks.filter((t) => t.completed).length : 0
  const totalPosts = mounted ? posts.length : 0

  // Category breakdown
  const categoryMap: Record<string, { total: number; completed: number }> = {}
  todayTasks.forEach((t) => {
    if (!categoryMap[t.category]) categoryMap[t.category] = { total: 0, completed: 0 }
    categoryMap[t.category].total++
    if (t.completed) categoryMap[t.category].completed++
  })

  const stats = [
    {
      label: "Today's Progress",
      value: `${completionRate}%`,
      sub: `${todayTasks.filter((t) => t.completed).length}/${todayTasks.length} tasks`,
      icon: Target,
      color: getScoreColor(completionRate),
    },
    {
      label: 'Current Streak',
      value: `${streak}d`,
      sub: 'consecutive active days',
      icon: Flame,
      color: '#f97316',
    },
    {
      label: 'Total Tasks',
      value: totalTasks.toString(),
      sub: `${completedTasks} completed`,
      icon: CheckSquare,
      color: '#3b82f6',
    },
    {
      label: 'Blog Posts',
      value: totalPosts.toString(),
      sub: `${publishedPosts} published`,
      icon: BookOpen,
      color: '#8b5cf6',
    },
  ]

  return (
    <div className="min-h-full px-4 md:px-8 pt-6 md:pt-10 pb-16 max-w-5xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-10"
      >
        <p className="text-sm font-medium mb-1" style={{ color: 'hsl(var(--muted-foreground))' }}>
          {formatDateFull(today)}
        </p>
        <h1
          className="text-3xl md:text-4xl font-bold leading-tight"
          style={{ fontFamily: 'var(--font-playfair)', color: 'hsl(var(--foreground))' }}
        >
          Good {getGreeting()}, <span className="gold-text">{settings.userName || 'there'}.</span>
        </h1>
        <p className="mt-2 text-base" style={{ color: 'hsl(var(--muted-foreground))' }}>
          {todayTasks.length === 0
            ? "No tasks yet today. Let's set some intentions."
            : completionRate === 100
            ? 'All done! You crushed it today. 🏆'
            : `${todayTasks.length - todayTasks.filter((t) => t.completed).length} tasks remaining. Keep going.`}
        </p>
      </motion.div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07, type: 'spring', stiffness: 300, damping: 30 }}
            className="rounded-2xl border p-5 glass-card"
          >
            <div className="flex items-center justify-between mb-3">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: `${stat.color}18` }}
              >
                <stat.icon className="w-4.5 h-4.5" style={{ color: stat.color, width: 18, height: 18 }} />
              </div>
            </div>
            <p className="text-2xl font-bold" style={{ color: stat.color }}>
              {stat.value}
            </p>
            <p className="text-xs mt-0.5" style={{ color: 'hsl(var(--muted-foreground))' }}>
              {stat.sub}
            </p>
            <p className="text-xs font-medium mt-1" style={{ color: 'hsl(var(--foreground))' }}>
              {stat.label}
            </p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Today's Tasks */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-3 rounded-2xl border p-6 glass-card"
        >
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-semibold" style={{ color: 'hsl(var(--foreground))' }}>
              Today&apos;s Tasks
            </h2>
            <div className="flex items-center gap-2">
              <Link href="/tasks">
                <button
                  className="text-xs flex items-center gap-1 transition-colors cursor-pointer hover:opacity-70"
                  style={{ color: '#f59e0b' }}
                >
                  View all <ArrowRight className="w-3 h-3" />
                </button>
              </Link>
              <button
                onClick={() => setAddOpen(true)}
                className="w-7 h-7 rounded-xl flex items-center justify-center transition-all cursor-pointer hover:opacity-80"
                style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}
              >
                <Plus className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>

          {todayTasks.length === 0 ? (
            <div className="flex flex-col items-center py-10 gap-3">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center"
                style={{ background: 'hsl(var(--muted))' }}
              >
                <CheckSquare className="w-7 h-7" style={{ color: 'hsl(var(--muted-foreground))' }} />
              </div>
              <p className="text-sm" style={{ color: 'hsl(var(--muted-foreground))' }}>
                No tasks for today
              </p>
              <button
                onClick={() => setAddOpen(true)}
                className="text-sm font-medium px-4 py-2 rounded-xl transition-all cursor-pointer hover:opacity-80"
                style={{ background: '#f59e0b18', color: '#f59e0b' }}
              >
                Add your first task
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <AnimatePresence>
                {todayTasks.slice(0, 5).map((task) => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    onEdit={(t) => setEditTask(t)}
                    onApplyToAll={(id) => setApplyTaskId(id)}
                  />
                ))}
              </AnimatePresence>
              {todayTasks.length > 5 && (
                <Link href="/tasks">
                  <p
                    className="text-xs text-center pt-2 cursor-pointer hover:opacity-70 transition-opacity"
                    style={{ color: 'hsl(var(--muted-foreground))' }}
                  >
                    +{todayTasks.length - 5} more tasks →
                  </p>
                </Link>
              )}
            </div>
          )}
        </motion.div>

        {/* Right column */}
        <div className="lg:col-span-2 space-y-5">
          {/* Progress ring */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="rounded-2xl border p-6 flex flex-col items-center glass-card"
          >
            <h3 className="text-sm font-semibold mb-4 self-start" style={{ color: 'hsl(var(--foreground))' }}>
              Today&apos;s Score
            </h3>
            <ProgressRing
              value={completionRate}
              size={110}
              strokeWidth={8}
              color={getScoreColor(completionRate)}
              label={`${completionRate}%`}
              sublabel="complete"
            />
            <div className="grid grid-cols-3 gap-3 w-full mt-5">
              {Object.entries(categoryMap).slice(0, 3).map(([cat, data]) => (
                <div key={cat} className="text-center">
                  <div
                    className="w-2 h-2 rounded-full mx-auto mb-1"
                    style={{ background: CATEGORY_COLORS[cat] || '#6b7280' }}
                  />
                  <p className="text-xs font-medium leading-none" style={{ color: 'hsl(var(--foreground))' }}>
                    {data.completed}/{data.total}
                  </p>
                  <p className="text-xs mt-0.5 truncate" style={{ color: 'hsl(var(--muted-foreground))' }}>
                    {cat}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Week chart */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="rounded-2xl border p-6 glass-card"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold" style={{ color: 'hsl(var(--foreground))' }}>
                7-Day Trend
              </h3>
              <TrendingUp className="w-4 h-4 text-amber-500" />
            </div>
            <StatsChart data={weekStats} type="bar" height={120} />
          </motion.div>
        </div>
      </div>

      <AddTaskModal
        open={addOpen || !!editTask}
        onClose={() => { setAddOpen(false); setEditTask(null) }}
        editTask={editTask}
      />
      <ApplyToAllModal
        open={!!applyTaskId}
        onClose={() => setApplyTaskId(null)}
        taskId={applyTaskId}
      />

      {/* Social Stats — always shown */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-6"
      >
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold" style={{ color: 'hsl(var(--muted-foreground))' }}>Social</h2>
          {(!settings.youtubeChannelId && !settings.instagramHandle) && (
            <Link href="/settings" className="text-xs text-amber-500 hover:underline">Set up in Settings →</Link>
          )}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <a
            href={settings.youtubeChannelId ? `https://youtube.com/channel/${settings.youtubeChannelId}` : '/settings'}
            target={settings.youtubeChannelId ? '_blank' : undefined}
            rel={settings.youtubeChannelId ? 'noopener noreferrer' : undefined}
            className="flex items-center gap-4 rounded-2xl border p-5 hover:border-red-500/40 transition-colors group glass-card"
          >
            <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: '#ff000018' }}>
              <Youtube className="w-5 h-5" style={{ color: '#ff0000' }} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xl font-bold" style={{ color: 'hsl(var(--foreground))' }}>
                {settings.youtubeSubscribers > 0 ? settings.youtubeSubscribers.toLocaleString() : '—'}
              </p>
              <p className="text-xs mt-0.5" style={{ color: 'hsl(var(--muted-foreground))' }}>
                {settings.youtubeChannelId ? 'YouTube Subscribers' : 'YouTube · configure in Settings'}
              </p>
            </div>
            <ExternalLink className="w-4 h-4 opacity-0 group-hover:opacity-50 transition-opacity flex-shrink-0" style={{ color: 'hsl(var(--muted-foreground))' }} />
          </a>

          <a
            href={settings.instagramHandle ? `https://instagram.com/${settings.instagramHandle}` : '/settings'}
            target={settings.instagramHandle ? '_blank' : undefined}
            rel={settings.instagramHandle ? 'noopener noreferrer' : undefined}
            className="flex items-center gap-4 rounded-2xl border p-5 hover:border-pink-500/40 transition-colors group glass-card"
          >
            <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: '#e1306c18' }}>
              <Instagram className="w-5 h-5" style={{ color: '#e1306c' }} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xl font-bold" style={{ color: 'hsl(var(--foreground))' }}>
                {settings.instagramFollowers > 0 ? settings.instagramFollowers.toLocaleString() : '—'}
              </p>
              <p className="text-xs mt-0.5" style={{ color: 'hsl(var(--muted-foreground))' }}>
                {settings.instagramHandle ? 'Instagram Followers' : 'Instagram · configure in Settings'}
              </p>
            </div>
            <ExternalLink className="w-4 h-4 opacity-0 group-hover:opacity-50 transition-opacity flex-shrink-0" style={{ color: 'hsl(var(--muted-foreground))' }} />
          </a>
        </div>
      </motion.div>
    </div>
  )
}

function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 5) return 'night owl'
  if (hour < 12) return 'morning'
  if (hour < 17) return 'afternoon'
  if (hour < 21) return 'evening'
  return 'night'
}
