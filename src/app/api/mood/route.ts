import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  let body: {
    apiKey: string
    posts: { title: string; content: string; publishedAt: string; published: boolean }[]
  }

  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const { apiKey, posts } = body
  if (!apiKey) return NextResponse.json({ error: 'Gemini API key required' }, { status: 400 })
  if (!posts?.length) return NextResponse.json({ error: 'No posts to analyse' }, { status: 400 })

  const postLines = posts
    .map((p, i) => {
      const plainText = p.content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 600)
      return `Post ${i + 1} — "${p.title}" (${p.publishedAt}):\n${plainText}`
    })
    .join('\n\n---\n\n')

  const prompt = `You are an empathetic personal journal coach with expertise in emotional psychology. Analyse the emotional tone and mood patterns across these personal blog posts written by the same person over time.

BLOG POSTS:
${postLines}

Respond with ONLY a JSON object in this exact format, no markdown, no extra text:
{
  "overallMood": "A 2-4 word label like 'Reflective and Motivated' or 'Anxious but Hopeful'",
  "moodScore": 72,
  "emoji": "🌤",
  "summary": "2-3 sentence paragraph describing the emotional landscape across all posts. Be warm and personal.",
  "themes": [
    { "label": "Resilience", "strength": 80 },
    { "label": "Self-doubt", "strength": 45 }
  ],
  "insights": [
    { "type": "observation", "title": "...", "body": "..." },
    { "type": "concern", "title": "...", "body": "..." },
    { "type": "strength", "title": "...", "body": "..." }
  ],
  "suggestions": [
    { "icon": "🧘", "text": "Short actionable suggestion" },
    { "icon": "📖", "text": "Short actionable suggestion" },
    { "icon": "🚶", "text": "Short actionable suggestion" }
  ]
}

Rules:
- moodScore is 0-100 (0=very distressed, 50=neutral, 100=thriving)
- emoji should match the overall mood (weather/nature metaphors work well)
- themes: 3-5 emotional themes detected, strength 0-100
- insights: exactly 3, types must be one of: observation, concern, strength
- suggestions: exactly 3 concrete, gentle, actionable steps to maintain or improve wellbeing
- Keep each body/text under 55 words
- Be warm, non-judgmental, and specific to what was actually written`

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.6,
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

    // Extract text from parts, filtering out thoughts
    const parts = data?.candidates?.[0]?.content?.parts ?? []
    const text = parts
      .filter((p: { thought?: boolean }) => !p.thought)
      .map((p: { text?: string }) => p.text ?? '')
      .join('')

    if (!text) return NextResponse.json({ error: 'Empty response from Gemini' }, { status: 500 })

    // Strip markdown fences globally
    const cleaned = text.replace(/```json\s*/gi, '').replace(/```\s*/gi, '').trim()

    // Extract JSON
    const start = cleaned.indexOf('{')
    const end = cleaned.lastIndexOf('}')
    if (start === -1 || end === -1) {
      return NextResponse.json({ error: 'Could not parse Gemini response' }, { status: 500 })
    }

    const parsed = JSON.parse(cleaned.slice(start, end + 1))
    return NextResponse.json(parsed)
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Internal error' },
      { status: 500 }
    )
  }
}
