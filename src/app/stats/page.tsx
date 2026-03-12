'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useStore } from '@/store/useStore'
import { StatsChart } from '@/components/charts/StatsChart'
import { ProgressRing } from '@/components/ui/ProgressRing'
import { getScoreColor, CATEGORY_COLORS } from '@/lib/utils'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from 'recharts'
import { useTheme } from 'next-themes'
import { TrendingUp, Award, Zap, Calendar, Sparkles, RefreshCw, AlertCircle, Flame, Lightbulb, AlertTriangle, BookMarked } from 'lucide-react'

const TABS = ['Week', 'Month', 'Year']

export default function StatsPage() {
  const { getDayStats, getMonthlyStats, tasks, settings } = useStore()
  const [mounted, setMounted] = useState(false)
  const [tab, setTab] = useState('Week')
  const { theme } = useTheme()

  useEffect(() => setMounted(true), [])

  const weekData = mounted ? getDayStats(7) : []
  const monthData = mounted ? getDayStats(30) : []
  const yearData = mounted ? getMonthlyStats(12) : []
  const resolvedTasks = mounted ? tasks : []

  const axisColor = theme === 'dark' ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)'
  const gridColor = theme === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'

  // Category analytics
  const categoryMap: Record<string, { total: number; completed: number }> = {}
  resolvedTasks.forEach((t) => {
    if (!categoryMap[t.category]) categoryMap[t.category] = { total: 0, completed: 0 }
    categoryMap[t.category].total++
    if (t.completed) categoryMap[t.category].completed++
  })
  const categoryData = Object.entries(categoryMap)
    .map(([cat, d]) => ({
      name: cat,
      score: d.total === 0 ? 0 : Math.round((d.completed / d.total) * 100),
      total: d.total,
      completed: d.completed,
      color: CATEGORY_COLORS[cat] || '#6b7280',
    }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 6)

  // Overall stats
  const totalTasks = resolvedTasks.length
  const completedTasks = resolvedTasks.filter((t) => t.completed).length
  const overallRate = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100)
  const weekAvg = weekData.length === 0 ? 0 : Math.round(weekData.reduce((a, b) => a + b.score, 0) / weekData.length)
  const bestDay = weekData.reduce((a, b) => (a.score > b.score ? a : b), { score: 0, date: '' })

  // AI insights state
  const [insights, setInsights] = useState<{ title: string; body: string; type: string }[]>([])
  const [insightLoading, setInsightLoading] = useState(false)
  const [insightError, setInsightError] = useState('')

  async function generateInsights() {
    if (!settings.geminiApiKey) { setInsightError('Set your Gemini API key in Settings first.'); return }
    setInsightLoading(true); setInsightError('')
    try {
      const res = await fetch('/api/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apiKey: settings.geminiApiKey,
          stats: {
            totalTasks, completedTasks, overallRate, weekAvg,
            streak: 0,
            bestDay: bestDay.date,
            categories: categoryData.map((c) => ({ name: c.name, score: c.score, total: c.total })),
            recentDays: weekData.map((d) => ({ date: d.date, score: d.score })),
          },
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Unknown error')
      setInsights(data.insights)
    } catch (e: unknown) {
      setInsightError(e instanceof Error ? e.message : 'Failed to fetch insights')
    } finally {
      setInsightLoading(false)
    }
  }

  const insightIcon: Record<string, React.ElementType> = {
    strength: Flame, warning: AlertTriangle, tip: Lightbulb, pattern: BookMarked,
  }
  const insightColor: Record<string, string> = {
    strength: '#22c55e', warning: '#f97316', tip: '#3b82f6', pattern: '#8b5cf6',
  }

  const overviewStats = [
    { label: 'Overall Rate', value: `${overallRate}%`, color: getScoreColor(overallRate), icon: Award },
    { label: 'Week Average', value: `${weekAvg}%`, color: getScoreColor(weekAvg), icon: TrendingUp },
    { label: 'Total Tasks', value: totalTasks.toString(), color: '#3b82f6', icon: Calendar },
    { label: 'Completed', value: completedTasks.toString(), color: '#22c55e', icon: Zap },
  ]

  const currentData = tab === 'Week' ? weekData : monthData

  return (
    <div className="min-h-full px-4 md:px-8 pt-6 md:pt-10 pb-16 max-w-5xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1
          className="text-3xl font-bold mb-1"
          style={{ fontFamily: 'var(--font-playfair)', color: 'hsl(var(--foreground))' }}
        >
          Insights
        </h1>
        <p className="text-sm" style={{ color: 'hsl(var(--muted-foreground))' }}>
          Understand your patterns. Improve every day.
        </p>
      </motion.div>

      {/* Overview cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {overviewStats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            className="rounded-2xl border p-5 glass-card"
          >
            <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3"
              style={{ background: `${s.color}18` }}>
              <s.icon style={{ color: s.color, width: 18, height: 18 }} />
            </div>
            <p className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</p>
            <p className="text-xs mt-1 font-medium" style={{ color: 'hsl(var(--foreground))' }}>{s.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Main chart */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-2 rounded-2xl border p-6 glass-card"
        >
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-semibold" style={{ color: 'hsl(var(--foreground))' }}>
              Completion Rate
            </h2>
            <div className="flex items-center gap-1">
              {TABS.map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer"
                  style={{
                    background: tab === t ? '#f59e0b18' : 'transparent',
                    color: tab === t ? '#f59e0b' : 'hsl(var(--muted-foreground))',
                  }}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {tab === 'Year' ? (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={yearData}>
                <defs>
                  <linearGradient id="yearGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#f59e0b" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke={gridColor} strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 11, fill: axisColor }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: axisColor }}
                  axisLine={false}
                  tickLine={false}
                  domain={[0, 100]}
                  tickFormatter={(v) => `${v}%`}
                  width={36}
                />
                <Tooltip
                  contentStyle={{
                    background: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: 12,
                    fontSize: 12,
                  }}
                  formatter={(val) => [`${val}%`, 'Score']}
                />
                <Area
                  type="monotone"
                  dataKey="score"
                  stroke="#f59e0b"
                  strokeWidth={2.5}
                  fill="url(#yearGradient)"
                  dot={{ fill: '#f59e0b', strokeWidth: 0, r: 3 }}
                  activeDot={{ r: 5, fill: '#f59e0b', strokeWidth: 0 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <StatsChart
              data={currentData}
              type="area"
              height={220}
              showGrid
            />
          )}
        </motion.div>

        {/* Progress ring */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="rounded-2xl border p-6 flex flex-col items-center justify-center glass-card"
        >
          <h3 className="text-sm font-semibold mb-5 self-start" style={{ color: 'hsl(var(--foreground))' }}>
            All-Time Score
          </h3>
          <ProgressRing
            value={overallRate}
            size={130}
            strokeWidth={10}
            color={getScoreColor(overallRate)}
            label={`${overallRate}%`}
            sublabel="overall"
          />
          <div className="mt-5 w-full space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs" style={{ color: 'hsl(var(--muted-foreground))' }}>Week avg</span>
              <span className="text-xs font-semibold" style={{ color: getScoreColor(weekAvg) }}>{weekAvg}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs" style={{ color: 'hsl(var(--muted-foreground))' }}>Best this week</span>
              <span className="text-xs font-semibold" style={{ color: '#22c55e' }}>{bestDay.score}%</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Category breakdown */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="rounded-2xl border p-6 mb-6 glass-card"
      >
        <h2 className="text-base font-semibold mb-5" style={{ color: 'hsl(var(--foreground))' }}>
          By Category
        </h2>
        {categoryData.length === 0 ? (
          <p className="text-sm text-center py-8" style={{ color: 'hsl(var(--muted-foreground))' }}>
            Start adding tasks to see category analytics
          </p>
        ) : (
          <div className="space-y-3">
            {categoryData.map((cat) => (
              <div key={cat.name} className="flex items-center gap-4">
                <div
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ background: cat.color }}
                />
                <span className="text-sm w-24 flex-shrink-0" style={{ color: 'hsl(var(--foreground))' }}>
                  {cat.name}
                </span>
                <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: 'hsl(var(--muted))' }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${cat.score}%` }}
                    transition={{ duration: 0.6, delay: 0.1, ease: 'easeOut' }}
                    className="h-full rounded-full"
                    style={{ background: cat.color }}
                  />
                </div>
                <div className="flex flex-col items-end flex-shrink-0 w-12">
                  <span className="text-xs font-semibold" style={{ color: cat.color }}>{cat.score}%</span>
                  <span className="text-xs" style={{ color: 'hsl(var(--muted-foreground))' }}>{cat.completed}/{cat.total}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>
      {/* AI Insights */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45 }}
        className="rounded-2xl border p-6 glass-card"
      >
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'hsl(43 96% 56% / 0.12)' }}>
              <Sparkles className="w-4 h-4 text-amber-500" />
            </div>
            <div>
              <h2 className="text-base font-semibold" style={{ color: 'hsl(var(--foreground))' }}>AI Insights</h2>
              <p className="text-xs" style={{ color: 'hsl(var(--muted-foreground))' }}>Powered by Gemini 2.5 Flash</p>
            </div>
          </div>
          <button
            onClick={generateInsights}
            disabled={insightLoading}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-opacity disabled:opacity-50 cursor-pointer"
            style={{ background: '#f59e0b', color: '#000' }}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${insightLoading ? 'animate-spin' : ''}`} />
            {insightLoading ? 'Analysing…' : insights.length ? 'Refresh' : 'Generate'}
          </button>
        </div>

        {insightError && (
          <div className="flex items-start gap-2 text-xs px-3 py-3 rounded-xl mb-4" style={{ background: '#ef444418', color: '#ef4444' }}>
            <AlertCircle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
            {insightError}
            {!settings.geminiApiKey && (
              <a href="/settings" className="underline ml-1 font-medium">Open Settings →</a>
            )}
          </div>
        )}

        {insights.length === 0 && !insightError && !insightLoading && (
          <div className="text-center py-8">
            <Sparkles className="w-10 h-10 mx-auto mb-3 opacity-20" style={{ color: 'hsl(var(--foreground))' }} />
            <p className="text-sm" style={{ color: 'hsl(var(--muted-foreground))' }}>
              {settings.geminiApiKey
                ? 'Click Generate to get personalised insights about your habits.'
                : 'Add your free Gemini API key in Settings to unlock AI insights.'}
            </p>
          </div>
        )}

        <AnimatePresence>
          {insights.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-1 sm:grid-cols-2 gap-4"
            >
              {insights.map((ins, i) => {
                const Icon = insightIcon[ins.type] ?? Lightbulb
                const color = insightColor[ins.type] ?? '#6b7280'
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.07 }}
                    className="rounded-xl border p-4"
                    style={{ borderColor: `${color}30`, background: `${color}08` }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Icon className="w-4 h-4 flex-shrink-0" style={{ color }} />
                      <span className="text-xs font-semibold uppercase tracking-wide" style={{ color }}>
                        {ins.type}
                      </span>
                    </div>
                    <p className="text-sm font-semibold mb-1" style={{ color: 'hsl(var(--foreground))' }}>
                      {ins.title}
                    </p>
                    <p className="text-xs leading-relaxed" style={{ color: 'hsl(var(--muted-foreground))' }}>
                      {ins.body}
                    </p>
                  </motion.div>
                )
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}
