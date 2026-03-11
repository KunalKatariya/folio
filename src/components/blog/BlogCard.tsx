'use client'

import { BlogPost } from '@/store/useStore'
import { useStore } from '@/store/useStore'
import { motion } from 'framer-motion'
import { Clock, Tag, Trash2, Edit, Globe, Lock } from 'lucide-react'
import { timeAgo } from '@/lib/utils'
import Link from 'next/link'

interface BlogCardProps {
  post: BlogPost
  index?: number
}

export function BlogCard({ post, index = 0 }: BlogCardProps) {
  const { deletePost, publishPost } = useStore()

  const plainText = post.content.replace(/<[^>]*>/g, '').slice(0, 180)

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, type: 'spring', stiffness: 300, damping: 30 }}
      className="group relative rounded-2xl border p-6 transition-all duration-300 hover:border-amber-500/30 hover:shadow-lg hover:shadow-amber-500/5 glass-card"
    >
      {/* Status pill */}
      <div className="flex items-center justify-between mb-4">
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
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Link href={`/blog/${post.slug}`}>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors hover:bg-[hsl(var(--muted))] cursor-pointer"
              style={{ color: 'hsl(var(--muted-foreground))' }}
            >
              <Edit className="w-3.5 h-3.5" />
            </motion.button>
          </Link>
          {!post.published && (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => publishPost(post.id)}
              className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors hover:bg-green-500/10 cursor-pointer"
              style={{ color: '#22c55e' }}
              title="Publish"
            >
              <Globe className="w-3.5 h-3.5" />
            </motion.button>
          )}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => deletePost(post.id)}
            className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors hover:bg-red-500/10 cursor-pointer"
            style={{ color: 'hsl(var(--muted-foreground))' }}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </motion.button>
        </div>
      </div>

      <Link href={`/blog/${post.slug}`} className="block group/link">
        <h2
          className="text-xl font-semibold leading-tight mb-2 group-hover/link:text-amber-500 transition-colors"
          style={{ fontFamily: 'var(--font-playfair)', color: 'hsl(var(--foreground))' }}
        >
          {post.title}
        </h2>
        {post.subtitle && (
          <p className="text-sm mb-3 leading-relaxed" style={{ color: 'hsl(var(--muted-foreground))' }}>
            {post.subtitle}
          </p>
        )}
        {plainText && (
          <p className="text-sm leading-relaxed line-clamp-3" style={{ color: 'hsl(var(--muted-foreground))' }}>
            {plainText}…
          </p>
        )}
      </Link>

      <div className="flex items-center gap-4 mt-4 pt-4 border-t" style={{ borderColor: 'hsl(var(--border))' }}>
        <span className="flex items-center gap-1.5 text-xs" style={{ color: 'hsl(var(--muted-foreground))' }}>
          <Clock className="w-3 h-3" />
          {post.readTime} min read
        </span>
        <span className="text-xs" style={{ color: 'hsl(var(--muted-foreground))' }}>
          {timeAgo(post.updatedAt)}
        </span>
        {post.tags.length > 0 && (
          <div className="flex items-center gap-1 ml-auto">
            <Tag className="w-3 h-3" style={{ color: 'hsl(var(--muted-foreground))' }} />
            {post.tags.slice(0, 2).map((tag) => (
              <span
                key={tag}
                className="text-xs px-2 py-0.5 rounded-full"
                style={{ background: 'hsl(var(--muted))', color: 'hsl(var(--muted-foreground))' }}
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </motion.article>
  )
}
