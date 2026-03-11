'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useStore } from '@/store/useStore'
import { TaskItem } from '@/components/tasks/TaskItem'
import { AddTaskModal } from '@/components/tasks/AddTaskModal'
import { ApplyToAllModal } from '@/components/tasks/ApplyToAllModal'
import { ProgressRing } from '@/components/ui/ProgressRing'
import { format, addDays, subDays } from 'date-fns'
import {
  getTodayString,
  getDateString,
  formatDate,
  getScoreColor,
  CATEGORY_COLORS,
} from '@/lib/utils'
import {
  Plus,
  ChevronLeft,
  ChevronRight,
  Filter,
  Search,
  Calendar,
} from 'lucide-react'

const FILTER_OPTIONS = ['All', 'Active', 'Completed', 'High', 'Medium', 'Low']

export default function TasksPage() {
  const { getTasksForDate, getCompletionRate } = useStore()
  const [selectedDate, setSelectedDate] = useState(getTodayString())
  const [addOpen, setAddOpen] = useState(false)
  const [applyTaskId, setApplyTaskId] = useState<string | null>(null)
  const [filter, setFilter] = useState('All')
  const [search, setSearch] = useState('')

  const allTasks = getTasksForDate(selectedDate)
  const completionRate = getCompletionRate(selectedDate)

  const tasks = useMemo(() => {
    return allTasks.filter((t) => {
      const matchesSearch =
        !search ||
        t.title.toLowerCase().includes(search.toLowerCase()) ||
        t.category.toLowerCase().includes(search.toLowerCase())
      if (!matchesSearch) return false
      if (filter === 'All') return true
      if (filter === 'Active') return !t.completed
      if (filter === 'Completed') return t.completed
      if (filter === 'High') return t.priority === 'high'
      if (filter === 'Medium') return t.priority === 'medium'
      if (filter === 'Low') return t.priority === 'low'
      return true
    })
  }, [allTasks, filter, search])

  const prevDay = () => {
    const d = new Date(selectedDate)
    setSelectedDate(getDateString(subDays(d, 1)))
  }

  const nextDay = () => {
    const d = new Date(selectedDate)
    setSelectedDate(getDateString(addDays(d, 1)))
  }

  const isToday = selectedDate === getTodayString()

  // Week strip
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = subDays(new Date(), 3 - i)
    return getDateString(d)
  })

  return (
    <div className="min-h-full px-4 md:px-8 pt-6 md:pt-10 pb-16 max-w-3xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1
          className="text-3xl font-bold mb-1"
          style={{ fontFamily: 'var(--font-playfair)', color: 'hsl(var(--foreground))' }}
        >
          My Day
        </h1>
        <p className="text-sm" style={{ color: 'hsl(var(--muted-foreground))' }}>
          Manage your daily intentions and track progress.
        </p>
      </motion.div>

      {/* Date navigator */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="rounded-2xl border p-5 mb-6 glass-card"
      >
        {/* Week strip */}
        <div className="flex items-center justify-between gap-2 mb-4">
          {weekDays.map((date) => {
            const d = new Date(date)
            const active = date === selectedDate
            return (
              <button
                key={date}
                onClick={() => setSelectedDate(date)}
                className="flex-1 flex flex-col items-center py-2.5 rounded-xl transition-all cursor-pointer"
                style={{
                  background: active ? 'linear-gradient(135deg, #f59e0b, #d97706)' : 'hsl(var(--muted))',
                  color: active ? '#fff' : 'hsl(var(--muted-foreground))',
                }}
              >
                <span className="text-xs font-medium">{format(d, 'EEE')}</span>
                <span className={`text-base font-bold mt-0.5 ${active ? 'text-white' : ''}`}>
                  {format(d, 'd')}
                </span>
              </button>
            )
          })}
        </div>

        {/* Date controls */}
        <div className="flex items-center justify-between">
          <button
            onClick={prevDay}
            className="w-8 h-8 rounded-xl flex items-center justify-center transition-colors cursor-pointer hover:bg-[hsl(var(--muted))]"
            style={{ color: 'hsl(var(--muted-foreground))' }}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-amber-500" />
            <span className="text-sm font-semibold" style={{ color: 'hsl(var(--foreground))' }}>
              {formatDate(selectedDate)}
              {isToday && (
                <span className="ml-2 text-xs px-2 py-0.5 rounded-full" style={{ background: '#f59e0b18', color: '#f59e0b' }}>
                  Today
                </span>
              )}
            </span>
          </div>
          <button
            onClick={nextDay}
            className="w-8 h-8 rounded-xl flex items-center justify-center transition-colors cursor-pointer hover:bg-[hsl(var(--muted))]"
            style={{ color: 'hsl(var(--muted-foreground))' }}
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </motion.div>

      {/* Progress + Stats bar */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex items-center gap-4 rounded-2xl border p-5 mb-6 glass-card"
      >
        <ProgressRing
          value={completionRate}
          size={64}
          strokeWidth={6}
          color={getScoreColor(completionRate)}
          label={`${completionRate}%`}
        />
        <div className="flex-1">
          <p className="text-sm font-semibold" style={{ color: 'hsl(var(--foreground))' }}>
            {allTasks.filter((t) => t.completed).length} of {allTasks.length} completed
          </p>
          <div className="mt-2 h-1.5 rounded-full overflow-hidden" style={{ background: 'hsl(var(--muted))' }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${completionRate}%` }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className="h-full rounded-full"
              style={{ background: 'linear-gradient(90deg, #f59e0b, #d97706)' }}
            />
          </div>
        </div>
        <button
          onClick={() => setAddOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer hover:opacity-90"
          style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', color: '#fff' }}
        >
          <Plus className="w-4 h-4" /> Add Task
        </button>
      </motion.div>

      {/* Search + Filter */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15 }}
        className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-5"
      >
        <div
          className="flex items-center gap-2 flex-1 px-3 py-2 rounded-xl border"
          style={{ background: 'hsl(var(--muted))', borderColor: 'hsl(var(--border))' }}
        >
          <Search className="w-4 h-4 flex-shrink-0" style={{ color: 'hsl(var(--muted-foreground))' }} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tasks..."
            className="flex-1 bg-transparent text-sm focus:outline-none"
            style={{ color: 'hsl(var(--foreground))' }}
          />
        </div>
        <div className="flex items-center gap-1 flex-wrap sm:flex-nowrap">
          {FILTER_OPTIONS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer"
              style={{
                background: filter === f ? '#f59e0b18' : 'hsl(var(--muted))',
                color: filter === f ? '#f59e0b' : 'hsl(var(--muted-foreground))',
                border: `1px solid ${filter === f ? '#f59e0b40' : 'transparent'}`,
              }}
            >
              {f}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Task list */}
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={filter + search}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.15 }}
          className="space-y-2"
        >
          {tasks.length === 0 ? (
            <div
              className="flex flex-col items-center py-14 gap-3 rounded-2xl border border-dashed"
              style={{ borderColor: 'hsl(var(--border))' }}
            >
              <p className="text-sm" style={{ color: 'hsl(var(--muted-foreground))' }}>
                {search || filter !== 'All' ? 'No tasks match your filter' : 'No tasks for this day'}
              </p>
              {!search && filter === 'All' && (
                <button
                  onClick={() => setAddOpen(true)}
                  className="text-sm font-medium px-4 py-2 rounded-xl cursor-pointer hover:opacity-80 transition-opacity"
                  style={{ background: '#f59e0b18', color: '#f59e0b' }}
                >
                  Add a task
                </button>
              )}
            </div>
          ) : (
            tasks.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                onApplyToAll={(id) => setApplyTaskId(id)}
              />
            ))
          )}
        </motion.div>
      </AnimatePresence>

      <AddTaskModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        defaultDate={selectedDate}
      />
      <ApplyToAllModal
        open={!!applyTaskId}
        onClose={() => setApplyTaskId(null)}
        taskId={applyTaskId}
      />
    </div>
  )
}
