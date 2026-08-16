import { NextRequest, NextResponse } from 'next/server'
import { verifyReceipt, type GrowthReceipt } from '@/engine'
import { allowRequest, clientKey } from '@/lib/rateLimit'
import { logger } from '@/lib/logger'

export async function POST(request: NextRequest) {
  const gated = allowRequest(`verify:${clientKey(request.headers)}`, {
    capacity: 30,
    refillPerSec: 1,
  })
  if (!gated.ok) {
    return NextResponse.json({ ok: false, reason: 'rate limited' }, { status: 429 })
  }

  try {
    const body = (await request.json()) as { receipt?: GrowthReceipt; leaves?: string[] }
    if (!body.receipt || body.receipt.v !== 1) {
      return NextResponse.json({ ok: false, reason: 'receipt required' }, { status: 400 })
    }
    const result = await verifyReceipt(body.receipt, body.leaves)
    logger.info('receipt.verify', { ok: result.ok })
    return NextResponse.json(result)
  } catch (error) {
    logger.error('receipt.verify.fail', { err: error instanceof Error ? error.message : 'unknown' })
    return NextResponse.json({ ok: false, reason: 'malformed receipt' }, { status: 400 })
  }
}
