'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useStore } from '@/store/useStore'
import { CheckSquare, PenLine, BarChart2, Sparkles, ArrowRight, Check } from 'lucide-react'
import type { BgStyle } from '@/store/useStore'

/* ─── Palette data ────────────────────────────────────────── */
const PALETTES: { value: BgStyle; label: string; light: string; dark: string }[] = [
  { value: 'default', label: 'Classic',   light: '#f5f1ec', dark: '#1a1f35' },
  { value: 'warm',    label: 'Warm',      light: '#f9f2e7', dark: '#251a10' },
  { value: 'cool',    label: 'Cool',      light: '#edf1f9', dark: '#111c2d' },
  { value: 'midnight',label: 'Midnight',  light: '#eeecf8', dark: '#0d0d1f' },
  { value: 'forest',  label: 'Forest',    light: '#eaf4ec', dark: '#0c1a0f' },
]

/* ─── Feature cards ───────────────────────────────────────── */
const FEATURES = [
  {
    Icon: CheckSquare,
    color: '#f59e0b',
    bg: '#f59e0b18',
    title: 'My Day',
    desc: 'Plan tasks, set priorities, and build lasting daily streaks.',
  },
  {
    Icon: PenLine,
    color: '#8b5cf6',
    bg: '#8b5cf618',
    title: 'Write',
    desc: 'A distraction-free editor for thoughts, stories, and ideas.',
  },
  {
    Icon: BarChart2,
    color: '#22c55e',
    bg: '#22c55e18',
    title: 'Insights',
    desc: 'Charts and patterns that turn consistency into visible progress.',
  },
]

/* ─── Step slide variants ─────────────────────────────────── */
const slideVariants = {
  enter: (dir: number) => ({ opacity: 0, x: dir > 0 ? 48 : -48 }),
  center:               { opacity: 1, x: 0 },
  exit:  (dir: number) => ({ opacity: 0, x: dir > 0 ? -48 : 48 }),
}
const transition = { type: 'spring' as const, stiffness: 320, damping: 32 }

/* ─── Main component ──────────────────────────────────────── */
export function OnboardingFlow() {
  const { settings, updateSettings } = useStore()
  const [mounted, setMounted] = useState(false)
  const [step, setStep] = useState(0)
  const [dir, setDir] = useState(1)
  const [name, setName] = useState('')
  const [palette, setPalette] = useState<BgStyle>('default')
  const TOTAL = 4

  useEffect(() => setMounted(true), [])
  if (!mounted) return null
  if (settings.onboarded) return null

  function advance() {
    setDir(1)
    setStep((s) => s + 1)
  }

  function handleContinue() {
    if (step === 0) {
      updateSettings({ userName: name.trim() || 'Friend' })
    }
    if (step === 1) {
      updateSettings({ bgStyle: palette })
    }
    if (step < TOTAL - 1) {
      advance()
    }
  }

  function handleEnter() {
    updateSettings({ onboarded: true })
  }

  const displayName = name.trim() || settings.userName || 'Friend'

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden">
      {/* Rich ambient background */}
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse 80% 60% at 50% 30%, #1e2340 0%, #0d0f1a 60%, #07080f 100%)',
        }}
      />
      {/* Subtle gold glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 50% 35% at 50% 0%, rgba(245,158,11,0.12) 0%, transparent 70%)',
        }}
      />
      {/* Grid texture */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.4) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-md mx-4 rounded-3xl overflow-hidden"
        style={{
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.1)',
          boxShadow: '0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(245,158,11,0.08)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
        }}
      >
        {/* Top gradient accent */}
        <div
          className="absolute top-0 left-0 right-0 h-px"
          style={{ background: 'linear-gradient(90deg, transparent, rgba(245,158,11,0.6), transparent)' }}
        />

        {/* Progress dots */}
        <div className="flex justify-center gap-2 pt-6 pb-0">
          {Array.from({ length: TOTAL }).map((_, i) => (
            <motion.div
              key={i}
              animate={{
                width: i === step ? 24 : 6,
                opacity: i === step ? 1 : i < step ? 0.5 : 0.25,
              }}
              transition={{ type: 'spring', stiffness: 300, damping: 28 }}
              className="h-1.5 rounded-full"
              style={{ background: i === step ? '#f59e0b' : 'rgba(255,255,255,0.4)' }}
            />
          ))}
        </div>

        {/* Step content */}
        <div className="px-8 py-8 min-h-[380px] flex flex-col">
          <AnimatePresence mode="wait" custom={dir}>
            <motion.div
              key={step}
              custom={dir}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={transition}
              className="flex flex-col flex-1"
            >
              {/* ── Step 0: Welcome ── */}
              {step === 0 && (
                <div className="flex flex-col flex-1">
                  <div className="flex items-center gap-3 mb-6">
                    <div
                      className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0"
                      style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}
                    >
                      <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <span
                      className="text-2xl font-bold tracking-tight"
                      style={{ fontFamily: 'var(--font-playfair)', color: '#f5f5f0' }}
                    >
                      Folio
                    </span>
                  </div>

                  <h1
                    className="text-3xl font-bold leading-tight mb-2"
                    style={{ fontFamily: 'var(--font-playfair)', color: '#f5f5f0' }}
                  >
                    Welcome.
                  </h1>
                  <p className="text-sm mb-8 leading-relaxed" style={{ color: 'rgba(255,255,255,0.5)' }}>
                    Your personal OS for tasks, reflections, and everything in between.
                  </p>

                  <label className="text-xs font-medium mb-2 block" style={{ color: 'rgba(255,255,255,0.45)', letterSpacing: '0.08em' }}>
                    WHAT SHOULD WE CALL YOU?
                  </label>
                  <input
                    autoFocus
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleContinue()}
                    placeholder="Your name…"
                    className="w-full bg-transparent focus:outline-none text-xl font-medium pb-3 border-b transition-colors"
                    style={{
                      color: '#f5f5f0',
                      borderColor: name.trim() ? 'rgba(245,158,11,0.6)' : 'rgba(255,255,255,0.15)',
                      caretColor: '#f59e0b',
                    }}
                  />

                  <div className="flex-1" />

                  <ContinueButton onClick={handleContinue} disabled={false}>
                    Get started <ArrowRight className="w-4 h-4" />
                  </ContinueButton>
                </div>
              )}

              {/* ── Step 1: Appearance ── */}
              {step === 1 && (
                <div className="flex flex-col flex-1">
                  <h2
                    className="text-2xl font-bold mb-1"
                    style={{ fontFamily: 'var(--font-playfair)', color: '#f5f5f0' }}
                  >
                    Choose your aesthetic
                  </h2>
                  <p className="text-sm mb-6" style={{ color: 'rgba(255,255,255,0.45)' }}>
                    Pick the colour palette that feels like you.
                  </p>

                  <div className="grid grid-cols-5 gap-2 mb-auto">
                    {PALETTES.map((p) => {
                      const active = palette === p.value
                      return (
                        <button
                          key={p.value}
                          onClick={() => setPalette(p.value)}
                          className="flex flex-col items-center gap-2 focus:outline-none group cursor-pointer"
                        >
                          {/* Swatch */}
                          <div
                            className="w-full aspect-square rounded-xl overflow-hidden relative transition-all duration-200"
                            style={{
                              boxShadow: active
                                ? '0 0 0 2px #f59e0b, 0 4px 16px rgba(0,0,0,0.4)'
                                : '0 0 0 1px rgba(255,255,255,0.1)',
                              transform: active ? 'scale(1.06)' : 'scale(1)',
                            }}
                          >
                            <div className="h-1/2" style={{ background: p.light }} />
                            <div className="h-1/2" style={{ background: p.dark }} />
                            {active && (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="absolute inset-0 flex items-center justify-center"
                              >
                                <div
                                  className="w-5 h-5 rounded-full flex items-center justify-center"
                                  style={{ background: '#f59e0b' }}
                                >
                                  <Check className="w-3 h-3 text-white" strokeWidth={3} />
                                </div>
                              </motion.div>
                            )}
                          </div>
                          <span
                            className="text-[10px] font-medium transition-colors"
                            style={{ color: active ? '#f59e0b' : 'rgba(255,255,255,0.4)' }}
                          >
                            {p.label}
                          </span>
                        </button>
                      )
                    })}
                  </div>

                  <div className="mt-6">
                    <ContinueButton onClick={handleContinue}>
                      Continue <ArrowRight className="w-4 h-4" />
                    </ContinueButton>
                  </div>
                </div>
              )}

              {/* ── Step 2: Features ── */}
              {step === 2 && (
                <div className="flex flex-col flex-1">
                  <h2
                    className="text-2xl font-bold mb-1"
                    style={{ fontFamily: 'var(--font-playfair)', color: '#f5f5f0' }}
                  >
                    Everything you need
                  </h2>
                  <p className="text-sm mb-6" style={{ color: 'rgba(255,255,255,0.45)' }}>
                    Three powerful spaces, one elegant home.
                  </p>

                  <div className="flex flex-col gap-3 flex-1">
                    {FEATURES.map(({ Icon, color, bg, title, desc }, i) => (
                      <motion.div
                        key={title}
                        initial={{ opacity: 0, x: 24 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.08, ...transition }}
                        className="flex items-start gap-4 rounded-2xl p-4"
                        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.07)' }}
                      >
                        <div
                          className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                          style={{ background: bg }}
                        >
                          <Icon className="w-4.5 h-4.5" style={{ color, width: 18, height: 18 }} />
                        </div>
                        <div>
                          <p className="text-sm font-semibold mb-0.5" style={{ color: '#f5f5f0' }}>{title}</p>
                          <p className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.45)' }}>{desc}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  <div className="mt-6">
                    <ContinueButton onClick={handleContinue}>
                      Looks good <ArrowRight className="w-4 h-4" />
                    </ContinueButton>
                  </div>
                </div>
              )}

              {/* ── Step 3: Ready ── */}
              {step === 3 && (
                <div className="flex flex-col flex-1 items-center text-center">
                  <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.1 }}
                    className="w-16 h-16 rounded-3xl flex items-center justify-center mb-6 mt-2"
                    style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', boxShadow: '0 8px 32px rgba(245,158,11,0.35)' }}
                  >
                    <Sparkles className="w-8 h-8 text-white" />
                  </motion.div>

                  <h2
                    className="text-3xl font-bold mb-3 leading-tight"
                    style={{ fontFamily: 'var(--font-playfair)', color: '#f5f5f0' }}
                  >
                    You&apos;re all set,
                    <br />
                    <span style={{ background: 'linear-gradient(135deg, #f59e0b, #fbbf24)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                      {displayName}.
                    </span>
                  </h2>

                  <p className="text-sm leading-relaxed mb-8" style={{ color: 'rgba(255,255,255,0.45)' }}>
                    Your Folio is ready. Start with a task, a reflection, or simply explore. The rest will follow.
                  </p>

                  {/* Decorative divider */}
                  <div className="w-12 h-px mb-8" style={{ background: 'rgba(245,158,11,0.4)' }} />

                  <div className="flex-1" />

                  <motion.button
                    onClick={handleEnter}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-2xl text-sm font-bold cursor-pointer transition-all"
                    style={{
                      background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                      color: '#fff',
                      boxShadow: '0 8px 28px rgba(245,158,11,0.4)',
                      letterSpacing: '0.02em',
                    }}
                  >
                    Enter Folio
                    <ArrowRight className="w-4 h-4" />
                  </motion.button>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  )
}

/* ─── Reusable continue button ────────────────────────────── */
function ContinueButton({
  onClick,
  disabled = false,
  children,
}: {
  onClick: () => void
  disabled?: boolean
  children: React.ReactNode
}) {
  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      whileHover={!disabled ? { scale: 1.02 } : {}}
      whileTap={!disabled ? { scale: 0.97 } : {}}
      className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-semibold transition-all cursor-pointer"
      style={{
        background: disabled ? 'rgba(255,255,255,0.06)' : 'linear-gradient(135deg, #f59e0b, #d97706)',
        color: disabled ? 'rgba(255,255,255,0.3)' : '#fff',
        boxShadow: disabled ? 'none' : '0 4px 20px rgba(245,158,11,0.3)',
        cursor: disabled ? 'not-allowed' : 'pointer',
      }}
    >
      {children}
    </motion.button>
  )
}
