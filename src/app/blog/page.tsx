'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useStore } from '@/store/useStore'
import { BlogCard } from '@/components/blog/BlogCard'
import Link from 'next/link'
import { PenLine, Globe, FileText, Search } from 'lucide-react'

const TABS = ['All', 'Published', 'Drafts']

export default function BlogPage() {
  const { posts } = useStore()
  const [tab, setTab] = useState('All')
  const [search, setSearch] = useState('')

  const filtered = posts.filter((p) => {
    const matchesTab =
      tab === 'All' ||
      (tab === 'Published' && p.published) ||
      (tab === 'Drafts' && !p.published)
    const matchesSearch =
      !search ||
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()))
    return matchesTab && matchesSearch
  })

  const published = posts.filter((p) => p.published).length
  const drafts = posts.filter((p) => !p.published).length

  return (
    <div className="min-h-full px-4 md:px-8 pt-6 md:pt-10 pb-16 max-w-3xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-start justify-between mb-8"
      >
        <div>
          <h1
            className="text-3xl font-bold mb-1"
            style={{ fontFamily: 'var(--font-playfair)', color: 'hsl(var(--foreground))' }}
          >
            Write
          </h1>
          <p className="text-sm" style={{ color: 'hsl(var(--muted-foreground))' }}>
            Your thoughts, stories, and reflections — published in style.
          </p>
        </div>
        <Link href="/blog/new">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer"
            style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', color: '#fff' }}
          >
            <PenLine className="w-4 h-4" />
            Write
          </motion.button>
        </Link>
      </motion.div>

      {/* Stats bar */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="flex items-center gap-4 mb-6"
      >
        {[
          { icon: FileText, label: 'Total', value: posts.length, color: '#f59e0b' },
          { icon: Globe, label: 'Published', value: published, color: '#22c55e' },
          { icon: PenLine, label: 'Drafts', value: drafts, color: '#8b5cf6' },
        ].map((s) => (
          <div
            key={s.label}
            className="flex items-center gap-3 flex-1 rounded-2xl border px-4 py-3 glass-card"
          >
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${s.color}18` }}>
              <s.icon style={{ color: s.color, width: 16, height: 16 }} />
            </div>
            <div>
              <p className="text-lg font-bold" style={{ color: s.color }}>{s.value}</p>
              <p className="text-xs" style={{ color: 'hsl(var(--muted-foreground))' }}>{s.label}</p>
            </div>
          </div>
        ))}
      </motion.div>

      {/* Tabs + Search */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="flex items-center gap-3 mb-6"
      >
        <div className="flex items-center gap-1 p-1 rounded-xl" style={{ background: 'hsl(var(--muted))' }}>
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer"
              style={{
                background: tab === t ? 'hsl(var(--card))' : 'transparent',
                color: tab === t ? 'hsl(var(--foreground))' : 'hsl(var(--muted-foreground))',
                boxShadow: tab === t ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              }}
            >
              {t}
            </button>
          ))}
        </div>
        <div
          className="flex items-center gap-2 flex-1 px-3 py-2 rounded-xl border"
          style={{ background: 'hsl(var(--muted))', borderColor: 'hsl(var(--border))' }}
        >
          <Search className="w-4 h-4 flex-shrink-0" style={{ color: 'hsl(var(--muted-foreground))' }} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search posts..."
            className="flex-1 bg-transparent text-sm focus:outline-none"
            style={{ color: 'hsl(var(--foreground))' }}
          />
        </div>
      </motion.div>

      {/* Posts */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center py-16 gap-4 rounded-2xl border border-dashed"
            style={{ borderColor: 'hsl(var(--border))' }}
          >
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: 'hsl(var(--muted))' }}>
              <PenLine className="w-7 h-7" style={{ color: 'hsl(var(--muted-foreground))' }} />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium" style={{ color: 'hsl(var(--foreground))' }}>
                {search || tab !== 'All' ? 'No posts match your filter' : 'Your story begins here'}
              </p>
              {!search && tab === 'All' && (
                <p className="text-xs mt-1" style={{ color: 'hsl(var(--muted-foreground))' }}>
                  Write your first post and share your journey.
                </p>
              )}
            </div>
            {!search && tab === 'All' && (
              <Link href="/blog/new">
                <button
                  className="text-sm font-medium px-5 py-2.5 rounded-xl cursor-pointer hover:opacity-90 transition-opacity"
                  style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', color: '#fff' }}
                >
                  Write a Post
                </button>
              </Link>
            )}
          </motion.div>
        ) : (
          filtered.map((post, i) => <BlogCard key={post.id} post={post} index={i} />)
        )}
      </div>
    </div>
  )
}
