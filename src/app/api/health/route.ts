import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    ok: true,
    service: 'hypotrophy-hce',
    protocol: 'hypotrophy-hce',
    version: 1,
    now: new Date().toISOString(),
  })
}
