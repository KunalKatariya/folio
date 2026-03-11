import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  let body: {
    apiKey: string
    stats: {
      totalTasks: number
      completedTasks: number
      overallRate: number
      weekAvg: number
      bestDay: string
      streak: number
      categories: { name: string; score: number; total: number }[]
      recentDays: { date: string; score: number }[]
    }
  }

  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const { apiKey, stats } = body
  if (!apiKey) return NextResponse.json({ error: 'Gemini API key required' }, { status: 400 })

  const categories = stats.categories ?? []
  const recentDays = stats.recentDays ?? []

  const categoryLines = categories
    .map((c) => `  - ${c.name}: ${c.score}% completion (${c.total} tasks)`)
    .join('\n')

  const recentLines = recentDays
    .map((d) => `  - ${d.date}: ${d.score}%`)
    .join('\n')

  const prompt = `You are a personal productivity coach analysing someone's task completion data.

DATA:
- Overall completion rate: ${stats.overallRate}%
- This week's average: ${stats.weekAvg}%
- Current streak: ${stats.streak} days
- Best day this week: ${stats.bestDay || 'n/a'}
- Total tasks tracked: ${stats.totalTasks} (${stats.completedTasks} completed)

Category breakdown:
${categoryLines || '  (no category data yet)'}

Recent 7 days:
${recentLines || '  (no recent data)'}

Respond with ONLY a JSON object in this exact format, no other text:
{"insights":[{"title":"...","body":"...","type":"strength"},{"title":"...","body":"...","type":"warning"},{"title":"...","body":"...","type":"tip"},{"title":"...","body":"...","type":"pattern"}]}

Rules: type must be one of: strength, warning, tip, pattern. Be specific to the numbers. Keep each body under 60 words.`

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 8192,
            thinkingConfig: { thinkingBudget: 0 },
          },
        }),
      }
    )

    const data = await res.json()

    if (!res.ok) {
      const msg = data?.error?.message ?? `Gemini API error (${res.status})`
      return NextResponse.json({ error: msg }, { status: res.status })
    }

    // gemini-2.5-flash thinking model marks thinking parts with thought:true
    // Only use the actual response parts
    const parts: { text?: string; thought?: boolean }[] = data?.candidates?.[0]?.content?.parts ?? []
    const raw: string = parts
      .filter((p) => !p.thought && typeof p.text === 'string' && p.text.trim())
      .map((p) => p.text as string)
      .join('')
      .trim()

    if (!raw) {
      const reason = data?.candidates?.[0]?.finishReason ?? 'unknown'
      const blocked = data?.promptFeedback?.blockReason ?? ''
      return NextResponse.json(
        { error: `No content from Gemini. finishReason=${reason}${blocked ? `, blocked=${blocked}` : ''}` },
        { status: 500 }
      )
    }

    // Strip markdown fences if the model added them anywhere in the response
    const cleaned = raw
      .replace(/```(?:json)?\s*/gi, '')
      .replace(/```/g, '')
      .trim()

    // Extract the first JSON object from the cleaned text
    const objStart = cleaned.indexOf('{')
    const objEnd = cleaned.lastIndexOf('}')
    if (objStart === -1 || objEnd === -1) {
      console.error('No JSON object found in Gemini response:', raw)
      return NextResponse.json({ error: 'Could not parse Gemini response', raw }, { status: 500 })
    }
    const jsonStr = cleaned.slice(objStart, objEnd + 1)

    let parsed: { insights?: unknown[] }
    try {
      parsed = JSON.parse(jsonStr)
    } catch {
      console.error('JSON.parse failed on:', jsonStr)
      return NextResponse.json({ error: 'Could not parse Gemini response', raw }, { status: 500 })
    }

    const insights = Array.isArray(parsed)
      ? parsed
      : (parsed as { insights?: unknown[] }).insights ?? []

    return NextResponse.json({ insights })
  } catch (e: unknown) {
    console.error('Insights route error:', e)
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Request failed' }, { status: 500 })
  }
}
