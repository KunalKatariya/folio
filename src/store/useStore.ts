import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Priority = 'high' | 'medium' | 'low'
export type RecurringType = 'none' | 'daily' | 'weekly' | 'monthly'

export interface Task {
  id: string
  title: string
  description?: string
  completed: boolean
  date: string // YYYY-MM-DD
  priority: Priority
  category: string
  recurring: RecurringType
  createdAt: string
  completedAt?: string
  timeEstimate?: number // in minutes
}

export interface BlogPost {
  id: string
  slug: string
  title: string
  subtitle?: string
  content: string
  coverImage?: string
  tags: string[]
  published: boolean
  createdAt: string
  updatedAt: string
  readTime: number // in minutes
}

export interface DayStats {
  date: string
  total: number
  completed: number
  score: number // 0-100
}

export type BgStyle = 'default' | 'warm' | 'cool' | 'midnight' | 'forest'

export interface AppSettings {
  userName: string
  bgStyle: BgStyle
  glassEffect: boolean
  customBgImage: string
  youtubeChannelId: string
  youtubeApiKey: string
  youtubeSubscribers: number
  youtubeLastFetched: number
  instagramHandle: string
  instagramFollowers: number
  geminiApiKey: string
  onboarded: boolean
}

const DEFAULT_SETTINGS: AppSettings = {
  userName: '',
  bgStyle: 'default',
  glassEffect: false,
  customBgImage: '',
  youtubeChannelId: '',
  youtubeApiKey: '',
  youtubeSubscribers: 0,
  youtubeLastFetched: 0,
  instagramHandle: '',
  instagramFollowers: 0,
  geminiApiKey: '',
  onboarded: false,
}

interface AppStore {
  // Tasks
  tasks: Task[]
  addTask: (task: Omit<Task, 'id' | 'createdAt'>) => void
  updateTask: (id: string, updates: Partial<Task>) => void
  toggleTask: (id: string) => void
  deleteTask: (id: string) => void
  applyTaskToAllDays: (id: string, daysAhead: number) => void

  // Blog
  posts: BlogPost[]
  addPost: (post: Omit<BlogPost, 'id' | 'slug' | 'createdAt' | 'updatedAt' | 'readTime'>) => void
  updatePost: (id: string, updates: Partial<BlogPost>) => void
  deletePost: (id: string) => void
  publishPost: (id: string) => void

  // Settings
  settings: AppSettings
  updateSettings: (updates: Partial<AppSettings>) => void

  // Data import
  importData: (data: { tasks?: Task[]; posts?: BlogPost[]; settings?: Partial<AppSettings> }) => void

  // Stats helpers
  getTasksForDate: (date: string) => Task[]
  getCompletionRate: (date: string) => number
  getDayStats: (days: number) => DayStats[]
  getWeeklyStats: (weeks: number) => DayStats[]
  getMonthlyStats: (months: number) => { month: string; score: number; total: number; completed: number }[]
}

function generateId(): string {
  return Math.random().toString(36).substring(2, 11) + Date.now().toString(36)
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 60) + '-' + Date.now().toString(36)
}

function calculateReadTime(content: string): number {
  const wordCount = content.replace(/<[^>]*>/g, '').split(/\s+/).length
  return Math.max(1, Math.round(wordCount / 200))
}

export const useStore = create<AppStore>()(
  persist(
    (set, get) => ({
      tasks: [],
      posts: [],
      settings: DEFAULT_SETTINGS,

      updateSettings: (updates) => {
        set((state) => ({ settings: { ...state.settings, ...updates } }))
      },

      importData: ({ tasks, posts, settings }) => {
        set((state) => ({
          ...(tasks !== undefined ? { tasks } : {}),
          ...(posts !== undefined ? { posts } : {}),
          settings: settings ? { ...state.settings, ...settings } : state.settings,
        }))
      },

      addTask: (task) => {
        const newTask: Task = {
          ...task,
          id: generateId(),
          createdAt: new Date().toISOString(),
        }
        set((state) => ({ tasks: [...state.tasks, newTask] }))
      },

      updateTask: (id, updates) => {
        set((state) => ({
          tasks: state.tasks.map((t) => (t.id === id ? { ...t, ...updates } : t)),
        }))
      },

      toggleTask: (id) => {
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === id
              ? {
                  ...t,
                  completed: !t.completed,
                  completedAt: !t.completed ? new Date().toISOString() : undefined,
                }
              : t
          ),
        }))
      },

      deleteTask: (id) => {
        set((state) => ({ tasks: state.tasks.filter((t) => t.id !== id) }))
      },

      applyTaskToAllDays: (id, daysAhead) => {
        const task = get().tasks.find((t) => t.id === id)
        if (!task) return
        const newTasks: Task[] = []
        for (let i = 1; i <= daysAhead; i++) {
          const date = new Date()
          date.setDate(date.getDate() + i)
          const dateStr = date.toISOString().split('T')[0]
          // Don't duplicate if already exists
          const exists = get().tasks.some(
            (t) => t.title === task.title && t.date === dateStr
          )
          if (!exists) {
            newTasks.push({
              ...task,
              id: generateId(),
              date: dateStr,
              completed: false,
              completedAt: undefined,
              createdAt: new Date().toISOString(),
            })
          }
        }
        set((state) => ({ tasks: [...state.tasks, ...newTasks] }))
      },

      addPost: (post) => {
        const newPost: BlogPost = {
          ...post,
          id: generateId(),
          slug: slugify(post.title),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          readTime: calculateReadTime(post.content),
        }
        set((state) => ({ posts: [newPost, ...state.posts] }))
      },

      updatePost: (id, updates) => {
        set((state) => ({
          posts: state.posts.map((p) =>
            p.id === id
              ? {
                  ...p,
                  ...updates,
                  updatedAt: new Date().toISOString(),
                  readTime: updates.content ? calculateReadTime(updates.content) : p.readTime,
                  slug: updates.title ? slugify(updates.title) : p.slug,
                }
              : p
          ),
        }))
      },

      deletePost: (id) => {
        set((state) => ({ posts: state.posts.filter((p) => p.id !== id) }))
      },

      publishPost: (id) => {
        set((state) => ({
          posts: state.posts.map((p) =>
            p.id === id ? { ...p, published: true, updatedAt: new Date().toISOString() } : p
          ),
        }))
      },

      getTasksForDate: (date) => {
        return get().tasks.filter((t) => t.date === date)
      },

      getCompletionRate: (date) => {
        const tasks = get().getTasksForDate(date)
        if (tasks.length === 0) return 0
        return Math.round((tasks.filter((t) => t.completed).length / tasks.length) * 100)
      },

      getDayStats: (days) => {
        const stats: DayStats[] = []
        for (let i = days - 1; i >= 0; i--) {
          const date = new Date()
          date.setDate(date.getDate() - i)
          const dateStr = date.toISOString().split('T')[0]
          const tasks = get().getTasksForDate(dateStr)
          const completed = tasks.filter((t) => t.completed).length
          stats.push({
            date: dateStr,
            total: tasks.length,
            completed,
            score: tasks.length === 0 ? 0 : Math.round((completed / tasks.length) * 100),
          })
        }
        return stats
      },

      getWeeklyStats: (weeks) => {
        return get().getDayStats(weeks * 7)
      },

      getMonthlyStats: (months) => {
        const result: { month: string; score: number; total: number; completed: number }[] = []
        for (let i = months - 1; i >= 0; i--) {
          const date = new Date()
          date.setMonth(date.getMonth() - i)
          const year = date.getFullYear()
          const month = date.getMonth()
          const monthStr = date.toLocaleString('default', { month: 'short', year: '2-digit' })
          const monthTasks = get().tasks.filter((t) => {
            const d = new Date(t.date)
            return d.getFullYear() === year && d.getMonth() === month
          })
          const completed = monthTasks.filter((t) => t.completed).length
          result.push({
            month: monthStr,
            total: monthTasks.length,
            completed,
            score: monthTasks.length === 0 ? 0 : Math.round((completed / monthTasks.length) * 100),
          })
        }
        return result
      },
    }),
    { name: 'folio-store' }
  )
)
