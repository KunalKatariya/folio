'use client'

import { useStore } from '@/store/useStore'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowLeft, Clock, Tag, Globe, Lock, Edit, Trash2 } from 'lucide-react'
import { formatDateFull, timeAgo } from '@/lib/utils'
import { BlogEditor } from '@/components/blog/BlogEditor'
import { useState } from 'react'

export default function BlogPostPage() {
  const { slug } = useParams()
  const { posts, updatePost, deletePost, publishPost } = useStore()
  const router = useRouter()
  const post = posts.find((p) => p.slug === slug)
  const [editing, setEditing] = useState(false)
  const [editContent, setEditContent] = useState('')
  const [editTitle, setEditTitle] = useState('')

  if (!post) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 px-8">
        <p className="text-lg" style={{ color: 'hsl(var(--muted-foreground))' }}>Post not found</p>
        <Link href="/blog">
          <button className="text-sm text-amber-500 hover:opacity-70 transition-opacity cursor-pointer">
            ← Back to blog
          </button>
        </Link>
      </div>
    )
  }

  const handleDelete = () => {
    deletePost(post.id)
    router.push('/blog')
  }

  const handleStartEdit = () => {
    setEditTitle(post.title)
    setEditContent(post.content)
    setEditing(true)
  }

  const handleSaveEdit = () => {
    updatePost(post.id, { title: editTitle, content: editContent })
    setEditing(false)
  }

  return (
    <div className="min-h-full pb-20">
      {/* Sticky nav */}
      <div
        className="sticky top-0 z-30 border-b px-4 md:px-8 py-4 flex items-center justify-between"
        style={{
          background: 'hsl(var(--background) / 0.8)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderColor: 'hsl(var(--border))',
        }}
      >
        <Link href="/blog">
          <button className="flex items-center gap-2 text-sm cursor-pointer hover:opacity-70 transition-opacity"
            style={{ color: 'hsl(var(--muted-foreground))' }}>
            <ArrowLeft className="w-4 h-4" />
            All posts
          </button>
        </Link>
        <div className="flex items-center gap-2">
          {!post.published && (
            <button
              onClick={() => publishPost(post.id)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-all hover:opacity-90"
              style={{ background: '#22c55e18', color: '#22c55e' }}
            >
              <Globe className="w-3.5 h-3.5" />
              Publish
            </button>
          )}
          <button
            onClick={editing ? handleSaveEdit : handleStartEdit}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-all hover:opacity-90"
            style={{ background: '#f59e0b18', color: '#f59e0b' }}
          >
            <Edit className="w-3.5 h-3.5" />
            {editing ? 'Save' : 'Edit'}
          </button>
          <button
            onClick={handleDelete}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-all hover:bg-red-500/10"
            style={{ color: 'hsl(var(--muted-foreground))' }}
          >
            <Trash2 className="w-3.5 h-3.5" />
            Delete
          </button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 pt-12">
        {/* Status */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-3 mb-6"
        >
          <span
            className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium"
            style={{
              background: post.published ? '#22c55e18' : 'hsl(var(--muted))',
              color: post.published ? '#22c55e' : 'hsl(var(--muted-foreground))',
            }}
          >
            {post.published ? <Globe className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
            {post.published ? 'Published' : 'Draft'}
          </span>
          <span className="flex items-center gap-1 text-xs" style={{ color: 'hsl(var(--muted-foreground))' }}>
            <Clock className="w-3 h-3" />
            {post.readTime} min read
          </span>
          <span className="text-xs" style={{ color: 'hsl(var(--muted-foreground))' }}>
            {timeAgo(post.updatedAt)}
          </span>
        </motion.div>

        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
        >
          {editing ? (
            <textarea
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="w-full bg-transparent focus:outline-none resize-none text-4xl font-bold leading-tight mb-4"
              style={{
                color: 'hsl(var(--foreground))',
                fontFamily: 'var(--font-playfair)',
              }}
              rows={2}
            />
          ) : (
            <h1
              className="text-4xl font-bold leading-tight mb-4"
              style={{
                fontFamily: 'var(--font-playfair)',
                color: 'hsl(var(--foreground))',
              }}
            >
              {post.title}
            </h1>
          )}

          {post.subtitle && !editing && (
            <p className="text-xl mb-6 leading-relaxed" style={{ color: 'hsl(var(--muted-foreground))' }}>
              {post.subtitle}
            </p>
          )}
        </motion.div>

        {/* Meta */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="flex items-center gap-3 py-5 border-y mb-8"
          style={{ borderColor: 'hsl(var(--border))' }}
        >
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold"
            style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', color: '#fff' }}
          >
            K
          </div>
          <div>
            <p className="text-sm font-medium" style={{ color: 'hsl(var(--foreground))' }}>Kunal</p>
            <p className="text-xs" style={{ color: 'hsl(var(--muted-foreground))' }}>
              {formatDateFull(post.createdAt)}
            </p>
          </div>
        </motion.div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          {editing ? (
            <BlogEditor
              content={editContent}
              onChange={(html) => setEditContent(html)}
            />
          ) : (
            <div
              className="blog-content leading-relaxed"
              style={{ color: 'hsl(var(--foreground))', fontSize: '1.125rem', lineHeight: '1.85' }}
              dangerouslySetInnerHTML={{ __html: post.content || `<p style="color:hsl(var(--muted-foreground))">This post has no content yet.</p>` }}
            />
          )}
        </motion.div>

        {/* Tags */}
        {post.tags.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex items-center flex-wrap gap-2 mt-12 pt-6 border-t"
            style={{ borderColor: 'hsl(var(--border))' }}
          >
            <Tag className="w-4 h-4" style={{ color: 'hsl(var(--muted-foreground))' }} />
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="text-xs px-3 py-1 rounded-full"
                style={{ background: 'hsl(var(--muted))', color: 'hsl(var(--muted-foreground))' }}
              >
                {tag}
              </span>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  )
}
