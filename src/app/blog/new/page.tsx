'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useStore } from '@/store/useStore'
import { BlogEditor } from '@/components/blog/BlogEditor'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Globe, Save, Tag, X } from 'lucide-react'
import Link from 'next/link'

export default function NewPostPage() {
  const { addPost } = useStore()
  const router = useRouter()
  const [form, setForm] = useState({
    title: '',
    subtitle: '',
    content: '',
    tags: [] as string[],
    published: false,
  })
  const [tagInput, setTagInput] = useState('')
  const [saved, setSaved] = useState(false)

  const addTag = (e: React.KeyboardEvent) => {
    if ((e.key === 'Enter' || e.key === ',') && tagInput.trim()) {
      e.preventDefault()
      const tag = tagInput.trim().replace(',', '')
      if (!form.tags.includes(tag) && form.tags.length < 5) {
        setForm({ ...form, tags: [...form.tags, tag] })
      }
      setTagInput('')
    }
  }

  const removeTag = (tag: string) => {
    setForm({ ...form, tags: form.tags.filter((t) => t !== tag) })
  }

  const handleSave = (publish: boolean) => {
    if (!form.title.trim()) return
    addPost({
      title: form.title,
      subtitle: form.subtitle,
      content: form.content,
      tags: form.tags,
      published: publish,
    })
    router.push('/blog')
  }

  const inputClass =
    'w-full bg-transparent focus:outline-none text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))]'

  return (
    <div className="min-h-full pb-16">
      {/* Sticky header */}
      <div
        className="sticky top-0 z-30 border-b px-4 md:px-8 py-4 flex items-center justify-between gap-4"
        style={{
          background: 'hsl(var(--background) / 0.8)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderColor: 'hsl(var(--border))',
        }}
      >
        <Link href="/blog">
          <button
            className="flex items-center gap-2 text-sm transition-colors cursor-pointer hover:opacity-70"
            style={{ color: 'hsl(var(--muted-foreground))' }}
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
        </Link>
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleSave(false)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border transition-all cursor-pointer hover:bg-[hsl(var(--muted))]"
            style={{
              borderColor: 'hsl(var(--border))',
              color: 'hsl(var(--muted-foreground))',
            }}
          >
            <Save className="w-4 h-4" />
            Save Draft
          </button>
          <button
            onClick={() => handleSave(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer hover:opacity-90"
            style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', color: '#fff' }}
          >
            <Globe className="w-4 h-4" />
            Publish
          </button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 pt-10">
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <textarea
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="Your title here…"
            className="w-full bg-transparent focus:outline-none resize-none text-4xl font-bold leading-tight placeholder:opacity-30"
            style={{
              color: 'hsl(var(--foreground))',
              fontFamily: 'var(--font-playfair)',
            }}
            rows={2}
          />
        </motion.div>

        {/* Subtitle */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
        >
          <input
            value={form.subtitle}
            onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
            placeholder="A short subtitle or tagline…"
            className="w-full bg-transparent focus:outline-none text-lg py-2 border-b"
            style={{
              color: 'hsl(var(--muted-foreground))',
              borderColor: 'hsl(var(--border))',
            }}
          />
        </motion.div>

        {/* Tags */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="flex items-center flex-wrap gap-2 py-4 border-b mb-8"
          style={{ borderColor: 'hsl(var(--border))' }}
        >
          <Tag className="w-4 h-4 flex-shrink-0" style={{ color: 'hsl(var(--muted-foreground))' }} />
          {form.tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full"
              style={{ background: '#f59e0b18', color: '#f59e0b' }}
            >
              {tag}
              <button onClick={() => removeTag(tag)} className="cursor-pointer hover:opacity-70">
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
          {form.tags.length < 5 && (
            <input
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={addTag}
              placeholder="Add tag…"
              className="bg-transparent text-sm focus:outline-none"
              style={{ color: 'hsl(var(--muted-foreground))' }}
            />
          )}
        </motion.div>

        {/* Editor */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
        >
          <BlogEditor
            content={form.content}
            onChange={(html) => setForm({ ...form, content: html })}
          />
        </motion.div>
      </div>
    </div>
  )
}
