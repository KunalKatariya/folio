'use client'

import { useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { useStore } from '@/store/useStore'
import { Repeat } from 'lucide-react'

interface ApplyToAllModalProps {
  open: boolean
  onClose: () => void
  taskId: string | null
}

const presets = [
  { label: '7 days', value: 7 },
  { label: '14 days', value: 14 },
  { label: '30 days', value: 30 },
  { label: '90 days', value: 90 },
]

export function ApplyToAllModal({ open, onClose, taskId }: ApplyToAllModalProps) {
  const { applyTaskToAllDays, tasks } = useStore()
  const [selected, setSelected] = useState(30)
  const task = tasks.find((t) => t.id === taskId)

  const handleApply = () => {
    if (taskId) {
      applyTaskToAllDays(taskId, selected)
      onClose()
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Apply to Future Days" size="sm">
      <div className="space-y-5">
        <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: 'hsl(var(--muted))' }}>
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: '#f59e0b18' }}>
            <Repeat className="w-4 h-4 text-amber-500" />
          </div>
          <div>
            <p className="text-sm font-medium" style={{ color: 'hsl(var(--foreground))' }}>
              {task?.title}
            </p>
            <p className="text-xs" style={{ color: 'hsl(var(--muted-foreground))' }}>
              Will be copied to future days
            </p>
          </div>
        </div>

        <div>
          <p className="text-xs font-medium mb-2" style={{ color: 'hsl(var(--muted-foreground))' }}>
            How many days ahead?
          </p>
          <div className="grid grid-cols-2 gap-2">
            {presets.map((p) => (
              <button
                key={p.value}
                onClick={() => setSelected(p.value)}
                className="py-3 rounded-xl text-sm font-medium border transition-all cursor-pointer"
                style={{
                  borderColor: selected === p.value ? '#f59e0b' : 'hsl(var(--border))',
                  background: selected === p.value ? '#f59e0b18' : 'hsl(var(--muted))',
                  color: selected === p.value ? '#f59e0b' : 'hsl(var(--muted-foreground))',
                }}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl text-sm border transition-colors cursor-pointer hover:bg-[hsl(var(--muted))]"
            style={{ borderColor: 'hsl(var(--border))', color: 'hsl(var(--muted-foreground))' }}
          >
            Cancel
          </button>
          <button
            onClick={handleApply}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer hover:opacity-90"
            style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', color: '#fff' }}
          >
            Apply
          </button>
        </div>
      </div>
    </Modal>
  )
}
