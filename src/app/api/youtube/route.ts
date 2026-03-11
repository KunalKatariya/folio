import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const channelId = searchParams.get('channelId')
  const apiKey = searchParams.get('apiKey')

  if (!channelId || !apiKey) {
    return NextResponse.json({ error: 'channelId and apiKey are required' }, { status: 400 })
  }

  try {
    const res = await fetch(
      `https://www.googleapis.com/youtube/v3/channels?part=statistics,snippet&id=${encodeURIComponent(channelId)}&key=${encodeURIComponent(apiKey)}`,
      { next: { revalidate: 0 } }
    )
    const data = await res.json()

    if (!res.ok) {
      const msg = data?.error?.message ?? 'YouTube API error'
      return NextResponse.json({ error: msg }, { status: res.status })
    }

    const channel = data?.items?.[0]
    if (!channel) {
      return NextResponse.json({ error: 'Channel not found' }, { status: 404 })
    }

    return NextResponse.json({
      subscriberCount: parseInt(channel.statistics?.subscriberCount ?? '0', 10),
      viewCount: parseInt(channel.statistics?.viewCount ?? '0', 10),
      videoCount: parseInt(channel.statistics?.videoCount ?? '0', 10),
      title: channel.snippet?.title ?? '',
      thumbnail: channel.snippet?.thumbnails?.default?.url ?? '',
    })
  } catch {
    return NextResponse.json({ error: 'Failed to reach YouTube API' }, { status: 500 })
  }
}
