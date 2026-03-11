'use client'

import { useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { useStore, Priority, RecurringType } from '@/store/useStore'
import { CATEGORIES, getTodayString } from '@/lib/utils'
import { Flag, Clock, Calendar } from 'lucide-react'

interface AddTaskModalProps {
  open: boolean
  onClose: () => void
  defaultDate?: string
}

const priorities: Priority[] = ['high', 'medium', 'low']
const recurringOptions: { value: RecurringType; label: string }[] = [
  { value: 'none', label: 'One-time' },
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
]

export function AddTaskModal({ open, onClose, defaultDate }: AddTaskModalProps) {
  const { addTask } = useStore()
  const [form, setForm] = useState({
    title: '',
    description: '',
    date: defaultDate || getTodayString(),
    priority: 'medium' as Priority,
    category: 'Personal',
    recurring: 'none' as RecurringType,
    timeEstimate: '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title.trim()) return
    addTask({
      title: form.title.trim(),
      description: form.description.trim() || undefined,
      date: form.date,
      priority: form.priority,
      category: form.category,
      recurring: form.recurring,
      completed: false,
      timeEstimate: form.timeEstimate ? parseInt(form.timeEstimate) : undefined,
    })
    setForm({
      title: '',
      description: '',
      date: defaultDate || getTodayString(),
      priority: 'medium',
      category: 'Personal',
      recurring: 'none',
      timeEstimate: '',
    })
    onClose()
  }

  const inputClass = 'w-full px-3 py-2.5 rounded-xl text-sm border transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500/30 bg-[hsl(var(--muted))] border-[hsl(var(--border))] text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))]'
  const labelClass = 'block text-xs font-medium mb-1.5 text-[hsl(var(--muted-foreground))]'

  return (
    <Modal open={open} onClose={onClose} title="New Task">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className={labelClass}>Task title *</label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="What do you want to accomplish?"
            className={inputClass}
            autoFocus
          />
        </div>

        <div>
          <label className={labelClass}>Description</label>
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Add some context..."
            className={inputClass + ' resize-none'}
            rows={2}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>
              <Calendar className="inline w-3 h-3 mr-1" />Date
            </label>
            <input
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>
              <Clock className="inline w-3 h-3 mr-1" />Time (min)
            </label>
            <input
              type="number"
              value={form.timeEstimate}
              onChange={(e) => setForm({ ...form, timeEstimate: e.target.value })}
              placeholder="e.g. 30"
              min="1"
              className={inputClass}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>
              <Flag className="inline w-3 h-3 mr-1" />Priority
            </label>
            <div className="flex gap-2">
              {priorities.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setForm({ ...form, priority: p })}
                  className="flex-1 py-2 rounded-xl text-xs font-medium border transition-all cursor-pointer"
                  style={{
                    borderColor: form.priority === p ? '#f59e0b' : 'hsl(var(--border))',
                    background: form.priority === p ? '#f59e0b18' : 'hsl(var(--muted))',
                    color: form.priority === p ? '#f59e0b' : 'hsl(var(--muted-foreground))',
                  }}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className={labelClass}>Recurring</label>
            <select
              value={form.recurring}
              onChange={(e) => setForm({ ...form, recurring: e.target.value as RecurringType })}
              className={inputClass}
            >
              {recurringOptions.map((r) => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className={labelClass}>Category</label>
          <div className="flex flex-wrap gap-1.5">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setForm({ ...form, category: cat })}
                className="px-2.5 py-1 rounded-full text-xs font-medium border transition-all cursor-pointer"
                style={{
                  borderColor: form.category === cat ? '#f59e0b' : 'hsl(var(--border))',
                  background: form.category === cat ? '#f59e0b18' : 'hsl(var(--muted))',
                  color: form.category === cat ? '#f59e0b' : 'hsl(var(--muted-foreground))',
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl text-sm font-medium border transition-colors cursor-pointer hover:bg-[hsl(var(--muted))]"
            style={{
              borderColor: 'hsl(var(--border))',
              color: 'hsl(var(--muted-foreground))',
            }}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer hover:opacity-90 active:scale-95"
            style={{
              background: 'linear-gradient(135deg, #f59e0b, #d97706)',
              color: '#fff',
            }}
          >
            Create Task
          </button>
        </div>
      </form>
    </Modal>
  )
}
