'use client'

import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { useStore } from '@/store/useStore'
import type { BgStyle } from '@/store/useStore'
import {
  User, Palette, Youtube, Instagram, Check,
  RefreshCw, AlertCircle, ImageIcon, X, ExternalLink, Sparkles,
  HardDrive, Download, Upload, AlertTriangle,
} from 'lucide-react'
import type { Task, BlogPost, AppSettings } from '@/store/useStore'

const BG_PRESETS: { key: BgStyle; label: string; description: string; preview: string }[] = [
  { key: 'default', label: 'Default', description: 'Classic dark/light', preview: 'bg-zinc-900' },
  { key: 'warm', label: 'Warm', description: 'Amber-tinted depth', preview: 'bg-amber-950' },
  { key: 'cool', label: 'Cool', description: 'Slate-blue calm', preview: 'bg-slate-900' },
  { key: 'midnight', label: 'Midnight', description: 'Deep navy night', preview: 'bg-indigo-950' },
  { key: 'forest', label: 'Forest', description: 'Earthy green tones', preview: 'bg-emerald-950' },
]

function Section({
  icon: Icon, title, badge, children,
}: {
  icon: React.ElementType; title: string; badge?: string; children: React.ReactNode
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border p-6 space-y-5 glass-card"
    >
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'hsl(43 96% 56% / 0.12)' }}>
          <Icon className="w-4 h-4 text-amber-500" />
        </div>
        <h2 className="text-base font-semibold" style={{ color: 'hsl(var(--foreground))' }}>{title}</h2>
        {badge && (
          <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: 'hsl(var(--muted))', color: 'hsl(var(--muted-foreground))' }}>
            {badge}
          </span>
        )}
      </div>
      {children}
    </motion.div>
  )
}

function Field({
  label, description, children,
}: {
  label: string; description?: React.ReactNode; children: React.ReactNode
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-6">
      <div className="sm:w-48 flex-shrink-0">
        <p className="text-sm font-medium" style={{ color: 'hsl(var(--foreground))' }}>{label}</p>
        {description && <p className="text-xs mt-0.5" style={{ color: 'hsl(var(--muted-foreground))' }}>{description}</p>}
      </div>
      <div className="flex-1">{children}</div>
    </div>
  )
}

function TInput({ value, onChange, placeholder, type = 'text' }: { value: string | number; onChange: (v: string) => void; placeholder?: string; type?: string }) {
  return (
    <input
      type={type}
      value={value ?? ''}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full px-3 py-2 rounded-xl text-sm border outline-none transition-colors focus:border-amber-500/60"
      style={{ background: 'hsl(var(--background))', borderColor: 'hsl(var(--border))', color: 'hsl(var(--foreground))' }}
    />
  )
}

export default function SettingsPage() {
  const { settings, updateSettings, importData } = useStore()
  const [ytFetching, setYtFetching] = useState(false)
  const [ytError, setYtError] = useState('')
  const [ytSuccess, setYtSuccess] = useState('')
  const [saved, setSaved] = useState(false)
  const [importStatus, setImportStatus] = useState<{ type: 'success' | 'error'; msg: string } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const importFileRef = useRef<HTMLInputElement>(null)

  function flash() {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  async function fetchYouTube() {
    if (!settings.youtubeChannelId) { setYtError('Enter your Channel ID first'); return }
    if (!settings.youtubeApiKey) { setYtError('Enter your API Key first'); return }
    setYtFetching(true); setYtError(''); setYtSuccess('')
    try {
      const res = await fetch(
        `/api/youtube?channelId=${encodeURIComponent(settings.youtubeChannelId)}&apiKey=${encodeURIComponent(settings.youtubeApiKey)}`
      )
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Unknown error')
      updateSettings({ youtubeSubscribers: data.subscriberCount, youtubeLastFetched: Date.now() })
      setYtSuccess(`Fetched! ${data.subscriberCount.toLocaleString()} subscribers on "${data.title}"`)
    } catch (e: unknown) {
      setYtError(e instanceof Error ? e.message : 'Fetch failed')
    } finally {
      setYtFetching(false)
    }
  }

  function exportData() {
    const state = useStore.getState()
    const payload = {
      version: 1,
      exportedAt: new Date().toISOString(),
      tasks: state.tasks,
      posts: state.posts,
      settings: state.settings,
    }
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `folio-backup-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  function handleImportFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(ev.target?.result as string)
        if (!parsed || typeof parsed !== 'object') throw new Error('Invalid file format')
        const { tasks, posts, settings: importedSettings } = parsed as {
          tasks?: Task[]; posts?: BlogPost[]; settings?: Partial<AppSettings>
        }
        if (!Array.isArray(tasks) && !Array.isArray(posts)) throw new Error('File does not contain valid data')
        if (!window.confirm(
          `This will replace your current data with:\n• ${(tasks ?? []).length} tasks\n• ${(posts ?? []).length} blog posts\n\nContinue?`
        )) return
        importData({ tasks, posts, settings: importedSettings })
        setImportStatus({ type: 'success', msg: `Imported ${(tasks ?? []).length} tasks and ${(posts ?? []).length} posts.` })
        setTimeout(() => setImportStatus(null), 5000)
      } catch (err) {
        setImportStatus({ type: 'error', msg: err instanceof Error ? err.message : 'Failed to parse file' })
        setTimeout(() => setImportStatus(null), 5000)
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      updateSettings({ customBgImage: ev.target?.result as string })
      flash()
    }
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  return (
    <div className="min-h-full px-4 md:px-8 pt-6 md:pt-10 pb-16 max-w-3xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
        <h1 className="text-4xl font-bold" style={{ fontFamily: 'var(--font-playfair)', color: 'hsl(var(--foreground))' }}>
          Settings
        </h1>
        <p className="mt-1 text-sm" style={{ color: 'hsl(var(--muted-foreground))' }}>
          Personalize your Folio experience
        </p>
      </motion.div>

      <div className="space-y-5">
        {/* Profile */}
        <Section icon={User} title="Profile">
          <Field label="Your Name" description="Used in greetings across the app">
            <TInput value={settings.userName} onChange={(v) => { updateSettings({ userName: v }); flash() }} placeholder="Enter your name" />
          </Field>
        </Section>

        {/* Appearance */}
        <Section icon={Palette} title="Appearance">
          <Field label="Colour Palette" description="Ambient tone for the whole app">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {BG_PRESETS.map((preset) => (
                <button
                  key={preset.key}
                  onClick={() => { updateSettings({ bgStyle: preset.key }); flash() }}
                  className="relative flex flex-col items-start gap-2 p-3 rounded-xl border text-left transition-all"
                  style={{
                    background: 'hsl(var(--background))',
                    borderColor: settings.bgStyle === preset.key && !settings.customBgImage ? '#f59e0b99' : 'hsl(var(--border))',
                  }}
                >
                  <div className={`w-full h-10 rounded-lg ${preset.preview}`} />
                  <div>
                    <p className="text-xs font-medium" style={{ color: 'hsl(var(--foreground))' }}>{preset.label}</p>
                    <p className="text-xs" style={{ color: 'hsl(var(--muted-foreground))' }}>{preset.description}</p>
                  </div>
                  {settings.bgStyle === preset.key && !settings.customBgImage && (
                    <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-amber-500 flex items-center justify-center">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </Field>

          {/* Custom background image */}
          <div className="border-t pt-5" style={{ borderColor: 'hsl(var(--border))' }}>
            <Field label="Custom Background" description="Upload any image as your app background">
              <div className="space-y-3">
                {settings.customBgImage ? (
                  <div className="relative rounded-xl overflow-hidden border" style={{ borderColor: '#f59e0b99' }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={settings.customBgImage} alt="Custom background" className="w-full h-32 object-cover" />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center gap-3 opacity-0 hover:opacity-100 transition-opacity">
                      <button onClick={() => fileInputRef.current?.click()}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/90 text-xs font-medium text-black">
                        <ImageIcon className="w-3.5 h-3.5" /> Change
                      </button>
                      <button onClick={() => { updateSettings({ customBgImage: '' }); flash() }}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/90 text-xs font-medium text-black">
                        <X className="w-3.5 h-3.5" /> Remove
                      </button>
                    </div>
                    <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-amber-500 flex items-center justify-center">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                  </div>
                ) : (
                  <button onClick={() => fileInputRef.current?.click()}
                    className="w-full h-24 rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-2 transition-colors hover:border-amber-500/50"
                    style={{ borderColor: 'hsl(var(--border))' }}>
                    <ImageIcon className="w-5 h-5" style={{ color: 'hsl(var(--muted-foreground))' }} />
                    <p className="text-xs" style={{ color: 'hsl(var(--muted-foreground))' }}>Click to upload (JPG, PNG, WebP)</p>
                  </button>
                )}
                <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleImageUpload} />
                {settings.customBgImage && (
                  <p className="text-xs" style={{ color: 'hsl(var(--muted-foreground))' }}>
                    Custom image overrides the colour palette. Hover the preview to change or remove it.
                  </p>
                )}
              </div>
            </Field>
          </div>
        </Section>

        {/* YouTube */}
        <Section icon={Youtube} title="YouTube">
          <Field label="Channel ID" description="YouTube Studio → Settings → Channel → Advanced settings">
            <TInput value={settings.youtubeChannelId} onChange={(v) => updateSettings({ youtubeChannelId: v })} placeholder="UCxxxxxxxxxxxxxxxxxxxx" />
          </Field>
          <Field label="API Key"
            description={
              <span>Free from <a href="https://console.cloud.google.com/apis/library/youtube.googleapis.com" target="_blank" rel="noopener noreferrer" className="underline text-amber-500 inline-flex items-center gap-0.5">Google Cloud Console <ExternalLink className="w-3 h-3" /></a>. Enable &ldquo;YouTube Data API v3&rdquo;.</span>
            }>
            <TInput value={settings.youtubeApiKey} onChange={(v) => updateSettings({ youtubeApiKey: v })} placeholder="AIzaSy..." type="password" />
          </Field>
          <Field label="Live Stats" description="Fetches subscriber, view & video counts from YouTube API">
            <div className="space-y-2">
              <button onClick={fetchYouTube} disabled={ytFetching}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-opacity disabled:opacity-50"
                style={{ background: '#f59e0b', color: '#000' }}>
                <RefreshCw className={`w-4 h-4 ${ytFetching ? 'animate-spin' : ''}`} />
                {ytFetching ? 'Fetching…' : 'Fetch Live Stats'}
              </button>
              {ytError && (
                <div className="flex items-start gap-2 text-xs px-3 py-2 rounded-lg" style={{ background: '#ef444418', color: '#ef4444' }}>
                  <AlertCircle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" /> {ytError}
                </div>
              )}
              {ytSuccess && (
                <div className="flex items-start gap-2 text-xs px-3 py-2 rounded-lg" style={{ background: '#22c55e18', color: '#22c55e' }}>
                  <Check className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" /> {ytSuccess}
                </div>
              )}
              {settings.youtubeLastFetched > 0 && (
                <p className="text-xs" style={{ color: 'hsl(var(--muted-foreground))' }}>
                  Last fetched: {new Date(settings.youtubeLastFetched).toLocaleString()}
                </p>
              )}
            </div>
          </Field>
        </Section>

        {/* Gemini AI */}
        <Section icon={Sparkles} title="AI (Gemini)">
          <Field
            label="Gemini API Key"
            description={
              <span>Free from <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener noreferrer" className="underline text-amber-500 inline-flex items-center gap-0.5">Google AI Studio <ExternalLink className="w-3 h-3" /></a>. Enables AI insights on the Insights page (uses gemini-2.5-flash).</span>
            }
          >
            <TInput value={settings.geminiApiKey} onChange={(v) => { updateSettings({ geminiApiKey: v }); flash() }} placeholder="AIzaSy..." type="password" />
          </Field>
        </Section>

        {/* Data */}
        <Section icon={HardDrive} title="Data & Backup">
          <Field label="Export" description="Download all your tasks, posts and settings as a JSON file">
            <button
              onClick={exportData}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-opacity hover:opacity-80"
              style={{ background: '#f59e0b', color: '#000' }}
            >
              <Download className="w-4 h-4" />
              Export Backup
            </button>
          </Field>
          <Field label="Import" description="Restore from a previously exported JSON backup. This overwrites current data.">
            <div className="space-y-2">
              <button
                onClick={() => importFileRef.current?.click()}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border transition-colors hover:border-amber-500/60"
                style={{ borderColor: 'hsl(var(--border))', color: 'hsl(var(--foreground))' }}
              >
                <Upload className="w-4 h-4" />
                Choose Backup File
              </button>
              <input ref={importFileRef} type="file" accept="application/json,.json" className="hidden" onChange={handleImportFile} />
              {importStatus && (
                <div
                  className="flex items-start gap-2 text-xs px-3 py-2 rounded-lg"
                  style={{
                    background: importStatus.type === 'success' ? '#22c55e18' : '#ef444418',
                    color: importStatus.type === 'success' ? '#22c55e' : '#ef4444',
                  }}
                >
                  {importStatus.type === 'success'
                    ? <Check className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                    : <AlertTriangle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />}
                  {importStatus.msg}
                </div>
              )}
            </div>
          </Field>
        </Section>

        {/* Instagram */}
        <Section icon={Instagram} title="Instagram" badge="Manual only">
          <div className="flex items-start gap-2.5 text-xs px-3 py-3 rounded-xl" style={{ background: 'hsl(var(--muted))', color: 'hsl(var(--muted-foreground))' }}>
            <AlertCircle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-amber-500" />
            <span>Instagram&apos;s public API was deprecated in December 2024. The Graph API now requires Facebook Business account verification and app review — no simple fetch is possible. Follower counts must be entered manually.</span>
          </div>
          <Field label="Username" description="Your Instagram handle (without @)">
            <TInput value={settings.instagramHandle} onChange={(v) => { updateSettings({ instagramHandle: v }); flash() }} placeholder="yourhandle" />
          </Field>
          <Field label="Follower Count" description="Update this whenever you like">
            <TInput type="number" value={settings.instagramFollowers || ''} onChange={(v) => { updateSettings({ instagramFollowers: parseInt(v) || 0 }); flash() }} placeholder="e.g. 2300" />
          </Field>
        </Section>
      </div>

      <motion.div
        animate={{ opacity: saved ? 1 : 0, y: saved ? 0 : 8 }}
        transition={{ duration: 0.3 }}
        className="fixed bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2 px-5 py-3 rounded-full text-sm font-medium shadow-lg pointer-events-none"
        style={{ background: '#f59e0b', color: '#000' }}
      >
        <Check className="w-4 h-4" /> Saved
      </motion.div>
    </div>
  )
}
