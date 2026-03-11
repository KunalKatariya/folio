# Folio

Your personal OS — a minimalist, elegant dashboard for daily tasks, writing, and self-insight.

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js) ![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript) ![Tailwind](https://img.shields.io/badge/Tailwind-v4-38bdf8?logo=tailwindcss)

<img width="1440" height="700" alt="image" src="https://github.com/user-attachments/assets/b338fab3-5370-437c-bd70-1c142817003b" />


## Features

- **My Day** — task planning with priorities, categories, streaks, and recurring tasks
- **Write** — distraction-free blog editor (TipTap) with drafts, tags, and publish flow
- **Insights** — charts and completion trends powered by Recharts
- **AI Insights** — Gemini 2.5 Flash analyses your patterns and surfaces observations
- **Onboarding** — smooth 4-step welcome flow for new users
- **Theming** — light / dark + 5 colour palettes + custom background image
- **Data** — full JSON export / import for backup and portability

## Stack

| Layer | Tech |
|---|---|
| Framework | Next.js 16 App Router |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| State | Zustand (persisted) |
| Animation | Framer Motion |
| Editor | TipTap |
| AI | Google Gemini 2.5 Flash |
| Charts | Recharts |

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment Variables (optional)

```env
GEMINI_API_KEY=your_key_here
```

> The Gemini API key can also be entered inside the app under **Settings → AI**.

## License

MIT
