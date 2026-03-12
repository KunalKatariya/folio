'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, Trash2, ChevronDown, Repeat, Pencil } from 'lucide-react'
import { Task } from '@/store/useStore'
import { useStore } from '@/store/useStore'
import { cn, getPriorityBg, CATEGORY_COLORS } from '@/lib/utils'
import { Badge } from '@/components/ui/Badge'

interface TaskItemProps {
  task: Task
  onApplyToAll?: (id: string) => void
  onEdit?: (task: Task) => void
}

export function TaskItem({ task, onApplyToAll, onEdit }: TaskItemProps) {
  const { toggleTask, deleteTask } = useStore()
  const [expanded, setExpanded] = useState(false)
  const [showActions, setShowActions] = useState(false)

  const categoryColor = CATEGORY_COLORS[task.category] || '#6b7280'

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20, height: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="group relative rounded-xl border p-4 transition-all duration-200 hover:border-amber-500/30 glass-card"
      style={{ opacity: task.completed ? 0.65 : 1 }}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div className="flex items-start gap-3">
        {/* Checkbox */}
        <button
          onClick={() => toggleTask(task.id)}
          className={cn(
            'mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all duration-200 cursor-pointer',
            task.completed
              ? 'bg-amber-500 border-amber-500'
              : 'border-[hsl(var(--border))] hover:border-amber-500/50'
          )}
        >
          <AnimatePresence>
            {task.completed && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                transition={{ type: 'spring', stiffness: 500, damping: 25 }}
              >
                <Check className="w-3 h-3 text-white stroke-[3]" />
              </motion.div>
            )}
          </AnimatePresence>
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={cn(
                'text-sm font-medium leading-snug transition-all duration-200',
                task.completed && 'line-through opacity-50'
              )}
              style={{ color: 'hsl(var(--foreground))' }}
            >
              {task.title}
            </span>
            <div className="flex items-center gap-1.5 flex-wrap">
              <Badge label={task.priority} variant="priority" />
              <span
                className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
                style={{
                  background: `${categoryColor}18`,
                  color: categoryColor,
                }}
              >
                {task.category}
              </span>
              {task.recurring !== 'none' && (
                <span className="inline-flex items-center gap-1 text-xs" style={{ color: 'hsl(var(--muted-foreground))' }}>
                  <Repeat className="w-3 h-3" />
                  {task.recurring}
                </span>
              )}
            </div>
          </div>

          {task.description && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="flex items-center gap-1 mt-1 text-xs cursor-pointer"
              style={{ color: 'hsl(var(--muted-foreground))' }}
            >
              <ChevronDown className={cn('w-3 h-3 transition-transform', expanded && 'rotate-180')} />
              {expanded ? 'Hide' : 'Show'} details
            </button>
          )}

          <AnimatePresence>
            {expanded && task.description && (
              <motion.p
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="text-xs mt-2 leading-relaxed overflow-hidden"
                style={{ color: 'hsl(var(--muted-foreground))' }}
              >
                {task.description}
              </motion.p>
            )}
          </AnimatePresence>

          {task.timeEstimate && (
            <p className="text-xs mt-1" style={{ color: 'hsl(var(--muted-foreground))' }}>
              ⏱ {task.timeEstimate} min
            </p>
          )}
        </div>

        {/* Actions */}
        <AnimatePresence>
          {showActions && (
            <motion.div
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 8 }}
              transition={{ duration: 0.15 }}
              className="flex items-center gap-1"
            >
              {onEdit && (
                <button
                  onClick={() => onEdit(task)}
                  className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors hover:bg-amber-500/10 cursor-pointer"
                  title="Edit task"
                  style={{ color: '#f59e0b' }}
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
              )}
              {onApplyToAll && (
                <button
                  onClick={() => onApplyToAll(task.id)}
                  className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors hover:bg-[hsl(var(--muted))] cursor-pointer"
                  title="Apply to next 30 days"
                  style={{ color: 'hsl(var(--muted-foreground))' }}
                >
                  <Repeat className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                onClick={() => deleteTask(task.id)}
                className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors hover:bg-red-500/10 cursor-pointer"
                style={{ color: 'hsl(var(--muted-foreground))' }}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
