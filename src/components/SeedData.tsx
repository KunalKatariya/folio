'use client'

import { useEffect } from 'react'
import { useStore } from '@/store/useStore'

function getTodayString(): string {
  return new Date().toISOString().split('T')[0]
}

function getDateOffset(days: number): string {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return d.toISOString().split('T')[0]
}

const SEED_KEY = 'folio-seeded'

export function SeedData() {
  const { tasks, posts, addTask, addPost } = useStore()

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (localStorage.getItem(SEED_KEY)) return
    if (tasks.length > 0 || posts.length > 0) {
      localStorage.setItem(SEED_KEY, '1')
      return
    }

    const today = getTodayString()
    const yesterday = getDateOffset(-1)
    const twoDaysAgo = getDateOffset(-2)
    const threeDaysAgo = getDateOffset(-3)

    // Seed tasks for today
    const todayTasks = [
      { title: 'Morning meditation', description: '10 minutes of mindful breathing', priority: 'high' as const, category: 'Mindfulness', timeEstimate: 10, completed: true },
      { title: 'Read for 30 minutes', description: 'Continue Atomic Habits', priority: 'medium' as const, category: 'Learning', timeEstimate: 30, completed: true },
      { title: 'Gym session', description: 'Upper body — chest, shoulders, triceps', priority: 'high' as const, category: 'Exercise', timeEstimate: 60, completed: false },
      { title: 'Deep work block', description: 'No distractions. Work on main project.', priority: 'high' as const, category: 'Work', timeEstimate: 120, completed: false },
      { title: 'Walk outside', description: 'At least 20 minutes', priority: 'low' as const, category: 'Health', timeEstimate: 25, completed: false },
      { title: 'Journal — evening reflection', description: 'What went well? What to improve?', priority: 'medium' as const, category: 'Mindfulness', timeEstimate: 15, completed: false },
    ]
    todayTasks.forEach((t) =>
      addTask({ ...t, date: today, recurring: 'none' as const })
    )

    // Historical tasks for charts
    const historicalDays = [yesterday, twoDaysAgo, threeDaysAgo]
    historicalDays.forEach((date, idx) => {
      const completionRates = [0.8, 1.0, 0.6]
      const rate = completionRates[idx]
      const tasks = [
        { title: 'Morning meditation', priority: 'high' as const, category: 'Mindfulness', completed: true },
        { title: 'Read for 30 minutes', priority: 'medium' as const, category: 'Learning', completed: true },
        { title: 'Gym session', priority: 'high' as const, category: 'Exercise', completed: rate > 0.7 },
        { title: 'Deep work block', priority: 'high' as const, category: 'Work', completed: rate > 0.5 },
        { title: 'Walk outside', priority: 'low' as const, category: 'Health', completed: rate > 0.75 },
      ]
      tasks.forEach((t) => addTask({ ...t, date, recurring: 'none' as const }))
    })

    // Seed blog posts
    addPost({
      title: 'On building better habits — one day at a time',
      subtitle: 'Reflections on what actually moves the needle',
      content: `<h2>The paradox of improvement</h2><p>We often overestimate what we can accomplish in a week and catastrophically underestimate what we can build in a year.</p><p>The secret? Consistency over intensity. A 1% better day, compounded over 365 days, is 37x better than where you started. That's the math. But the practice is far harder.</p><h2>What I've learned</h2><p>This tool — this Folio — is my attempt to bridge that gap. To take the nebulous idea of "self-improvement" and give it <em>structure</em>, <em>visibility</em>, and <em>momentum</em>.</p><blockquote>The goal is not to have a perfect score every day. The goal is to show up every day.</blockquote><p>When you can see your progress in a chart, something shifts. Abstract intention becomes concrete evidence. And evidence is the most powerful motivator there is.</p><h2>Moving forward</h2><p>Start with three tasks tomorrow. Just three. Make them small enough that skipping feels embarrassing. Then do them. Then repeat.</p><p>That's the whole system.</p>`,
      tags: ['habits', 'productivity', 'mindset'],
      published: true,
    })

    addPost({
      title: 'The art of the deep work block',
      subtitle: 'How I reclaimed my focus in a distracted world',
      content: `<p>Cal Newport calls it "deep work." I call it <em>the only time I feel alive at my desk</em>.</p><p>Most of us spend our working hours in a constant state of shallow busyness — emails, Slack notifications, context switching. We confuse motion with progress.</p><h2>My protocol</h2><p>Phone on Do Not Disturb. Headphones on. One task. A two-hour block. No exceptions.</p><p>It sounds obvious. Most transformative things do. The difficulty is in the execution — in choosing depth over the dopamine hit of the endless feed.</p>`,
      tags: ['focus', 'deep work', 'productivity'],
      published: false,
    })

    localStorage.setItem(SEED_KEY, '1')
  }, [])

  return null
}
