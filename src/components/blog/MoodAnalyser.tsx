'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useStore } from '@/store/useStore'
import { Sparkles, RefreshCw, AlertCircle, ChevronDown } from 'lucide-react'

interface MoodResult {
  overallMood: string
  moodScore: number
  emoji: string
  summary: string
  themes: { label: string; strength: number }[]
  insights: { type: 'observation' | 'concern' | 'strength'; title: string; body: string }[]
  suggestions: { icon: string; text: string }[]
}

const INSIGHT_STYLES: Record<string, { bg: string; color: string; dot: string }> = {
  strength:    { bg: '#22c55e12', color: '#22c55e', dot: '#22c55e' },
  observation: { bg: '#f59e0b12', color: '#f59e0b', dot: '#f59e0b' },
  concern:     { bg: '#ef444412', color: '#ef4444', dot: '#ef4444' },
}

function scoreColor(score: number) {
  if (score >= 70) return '#22c55e'
  if (score >= 45) return '#f59e0b'
  return '#ef4444'
}

export function MoodAnalyser() {
  const { posts, settings } = useStore()
  const [result, setResult] = useState<MoodResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [open, setOpen] = useState(false)

  const hasPosts = posts.length > 0
  const hasKey = !!settings.geminiApiKey

  async function analyse() {
    if (!hasKey || !hasPosts) return
    setLoading(true)
    setError('')
    setResult(null)

    try {
      const postsPayload = posts.map((p) => ({
        title: p.title,
        content: p.content,
        publishedAt: new Date(p.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
        published: p.published,
      }))

      const res = await fetch('/api/mood', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey: settings.geminiApiKey, posts: postsPayload }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Unknown error')
      setResult(data)
      setOpen(true)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="rounded-2xl border overflow-hidden glass-card"
      style={{ borderColor: 'hsl(var(--border))' }}
    >
      {/* Header row — always visible */}
      <div
        role="button"
        tabIndex={0}
        className="w-full flex items-center justify-between px-5 py-4 cursor-pointer group"
        onClick={() => result ? setOpen((o) => !o) : analyse()}
        onKeyDown={(e) => e.key === 'Enter' && (result ? setOpen((o) => !o) : analyse())}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #8b5cf618, #7c3aed18)' }}
          >
            <Sparkles className="w-4 h-4" style={{ color: '#8b5cf6' }} />
          </div>
          <div className="text-left">
            <p className="text-sm font-semibold" style={{ color: 'hsl(var(--foreground))' }}>
              AI Mood Analysis
            </p>
            <p className="text-xs" style={{ color: 'hsl(var(--muted-foreground))' }}>
              {result
                ? `${result.overallMood} ${result.emoji}`
                : 'Understand your emotional patterns across all posts'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {loading && (
            <RefreshCw className="w-4 h-4 animate-spin" style={{ color: '#8b5cf6' }} />
          )}
          {!result && !loading && (
            <span
              className="text-xs font-medium px-3 py-1.5 rounded-xl transition-opacity group-hover:opacity-80"
              style={{
                background: !hasKey || !hasPosts ? 'hsl(var(--muted))' : 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                color: !hasKey || !hasPosts ? 'hsl(var(--muted-foreground))' : '#fff',
              }}
            >
              {!hasKey ? 'Add Gemini key in Settings' : !hasPosts ? 'Write some posts first' : 'Analyse'}
            </span>
          )}
          {result && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); analyse() }}
                className="p-1.5 rounded-lg transition-colors hover:bg-[hsl(var(--muted))] cursor-pointer"
                title="Re-analyse"
                style={{ color: 'hsl(var(--muted-foreground))' }}
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
              <ChevronDown
                className="w-4 h-4 transition-transform"
                style={{
                  color: 'hsl(var(--muted-foreground))',
                  transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
                }}
              />
            </>
          )}
        </div>
      </div>

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="px-5 pb-4"
          >
            <div className="flex items-start gap-2 p-3 rounded-xl" style={{ background: '#ef444412' }}>
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: '#ef4444' }} />
              <p className="text-xs" style={{ color: '#ef4444' }}>{error}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results */}
      <AnimatePresence>
        {result && open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-6 space-y-5 border-t" style={{ borderColor: 'hsl(var(--border))' }}>

              {/* Score + Summary */}
              <div className="pt-4 flex flex-col sm:flex-row gap-5">
                {/* Score circle */}
                <div className="flex flex-col items-center justify-center gap-1 flex-shrink-0">
                  <div className="relative w-20 h-20">
                    <svg width={80} height={80} viewBox="0 0 80 80">
                      <circle cx={40} cy={40} r={34} fill="none" stroke="hsl(var(--muted))" strokeWidth={6} />
                      <circle
                        cx={40} cy={40} r={34}
                        fill="none"
                        stroke={scoreColor(result.moodScore)}
                        strokeWidth={6}
                        strokeLinecap="round"
                        strokeDasharray={213.6}
                        strokeDashoffset={213.6 - (213.6 * result.moodScore) / 100}
                        style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%', transition: 'stroke-dashoffset 0.8s ease' }}
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-xl">{result.emoji}</span>
                      <span className="text-xs font-bold" style={{ color: scoreColor(result.moodScore) }}>{result.moodScore}</span>
                    </div>
                  </div>
                  <p className="text-xs font-semibold text-center" style={{ color: 'hsl(var(--foreground))' }}>{result.overallMood}</p>
                </div>

                {/* Summary */}
                <div className="flex-1">
                  <p className="text-sm leading-relaxed" style={{ color: 'hsl(var(--muted-foreground))' }}>
                    {result.summary}
                  </p>
                </div>
              </div>

              {/* Themes */}
              {result.themes?.length > 0 && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'hsl(var(--muted-foreground))' }}>
                    Emotional Themes
                  </p>
                  <div className="space-y-2.5">
                    {result.themes.map((theme) => (
                      <div key={theme.label}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-medium" style={{ color: 'hsl(var(--foreground))' }}>{theme.label}</span>
                          <span className="text-xs" style={{ color: 'hsl(var(--muted-foreground))' }}>{theme.strength}%</span>
                        </div>
                        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'hsl(var(--muted))' }}>
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${theme.strength}%` }}
                            transition={{ duration: 0.7, ease: 'easeOut' }}
                            className="h-full rounded-full"
                            style={{ background: `linear-gradient(90deg, #8b5cf6, #7c3aed)` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Insights */}
              {result.insights?.length > 0 && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'hsl(var(--muted-foreground))' }}>
                    Observations
                  </p>
                  <div className="space-y-2.5">
                    {result.insights.map((ins, i) => {
                      const style = INSIGHT_STYLES[ins.type] ?? INSIGHT_STYLES.observation
                      return (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: 12 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.07 }}
                          className="p-3.5 rounded-xl"
                          style={{ background: style.bg }}
                        >
                          <div className="flex items-start gap-2.5">
                            <div className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ background: style.dot }} />
                            <div>
                              <p className="text-xs font-semibold mb-0.5" style={{ color: style.color }}>{ins.title}</p>
                              <p className="text-xs leading-relaxed" style={{ color: 'hsl(var(--muted-foreground))' }}>{ins.body}</p>
                            </div>
                          </div>
                        </motion.div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Suggestions */}
              {result.suggestions?.length > 0 && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'hsl(var(--muted-foreground))' }}>
                    What You Can Do
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {result.suggestions.map((s, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 + i * 0.06 }}
                        className="flex items-start gap-2.5 p-3 rounded-xl"
                        style={{ background: 'hsl(var(--muted))', border: '1px solid hsl(var(--border))' }}
                      >
                        <span className="text-base flex-shrink-0 mt-0.5">{s.icon}</span>
                        <p className="text-xs leading-relaxed" style={{ color: 'hsl(var(--foreground))' }}>{s.text}</p>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
