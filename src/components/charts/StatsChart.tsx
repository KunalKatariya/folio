'use client'

import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts'
import { useTheme } from 'next-themes'
import { getDayOfWeek, formatDateShort, getScoreColor } from '@/lib/utils'

interface DayData {
  date: string
  score: number
  total: number
  completed: number
}

interface ChartProps {
  data: DayData[]
  type?: 'area' | 'bar' | 'line'
  height?: number
  showGrid?: boolean
}

function CustomTooltip({ active, payload, label }: {
  active?: boolean
  payload?: { value: number; payload: DayData }[]
  label?: string
}) {
  if (!active || !payload?.length) return null
  const item = payload[0].payload
  return (
    <div
      className="rounded-xl border px-3 py-2.5 shadow-xl text-xs glass-card"
      style={{ color: 'hsl(var(--foreground))' }}
    >
      <p className="font-semibold mb-1">{formatDateShort(item.date)}</p>
      <p style={{ color: getScoreColor(item.score) }}>Score: {item.score}%</p>
      <p style={{ color: 'hsl(var(--muted-foreground))' }}>
        {item.completed}/{item.total} tasks
      </p>
    </div>
  )
}

export function StatsChart({ data, type = 'area', height = 200, showGrid = false }: ChartProps) {
  const { theme } = useTheme()

  const axisColor = theme === 'dark' ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)'
  const gridColor = theme === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'

  const chartData = data.map((d) => ({
    ...d,
    label: getDayOfWeek(d.date),
  }))

  const commonProps = {
    data: chartData,
  }

  const axisProps = {
    tick: { fontSize: 11, fill: axisColor },
    axisLine: false,
    tickLine: false,
  }

  if (type === 'bar') {
    return (
      <ResponsiveContainer width="100%" height={height}>
        <BarChart {...commonProps} barSize={16} barCategoryGap="30%">
          {showGrid && <CartesianGrid stroke={gridColor} strokeDasharray="3 3" vertical={false} />}
          <XAxis dataKey="label" {...axisProps} />
          <YAxis {...axisProps} domain={[0, 100]} tickFormatter={(v) => `${v}%`} width={36} />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(245,158,11,0.06)' }} />
          <Bar dataKey="score" fill="url(#barGradient)" radius={[6, 6, 0, 0]} />
          <defs>
            <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.9} />
              <stop offset="100%" stopColor="#d97706" stopOpacity={0.6} />
            </linearGradient>
          </defs>
        </BarChart>
      </ResponsiveContainer>
    )
  }

  if (type === 'line') {
    return (
      <ResponsiveContainer width="100%" height={height}>
        <LineChart {...commonProps}>
          {showGrid && <CartesianGrid stroke={gridColor} strokeDasharray="3 3" vertical={false} />}
          <XAxis dataKey="label" {...axisProps} />
          <YAxis {...axisProps} domain={[0, 100]} tickFormatter={(v) => `${v}%`} width={36} />
          <Tooltip content={<CustomTooltip />} />
          <Line
            type="monotone"
            dataKey="score"
            stroke="#f59e0b"
            strokeWidth={2.5}
            dot={{ fill: '#f59e0b', strokeWidth: 0, r: 3 }}
            activeDot={{ r: 5, fill: '#f59e0b', strokeWidth: 0 }}
          />
        </LineChart>
      </ResponsiveContainer>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart {...commonProps}>
        <defs>
          <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.3} />
            <stop offset="100%" stopColor="#f59e0b" stopOpacity={0.0} />
          </linearGradient>
        </defs>
        {showGrid && <CartesianGrid stroke={gridColor} strokeDasharray="3 3" vertical={false} />}
        <XAxis dataKey="label" {...axisProps} />
        <YAxis {...axisProps} domain={[0, 100]} tickFormatter={(v) => `${v}%`} width={36} />
        <Tooltip content={<CustomTooltip />} />
        <Area
          type="monotone"
          dataKey="score"
          stroke="#f59e0b"
          strokeWidth={2.5}
          fill="url(#areaGradient)"
          dot={{ fill: '#f59e0b', strokeWidth: 0, r: 3 }}
          activeDot={{ r: 5, fill: '#f59e0b', strokeWidth: 0 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
