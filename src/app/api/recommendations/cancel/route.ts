/**
 * 추천 취소 API 엔드포인트
 * POST /api/recommendations/cancel
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import type { RecommendationUpdate } from '@/lib/supabase/types'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, password, reason } = body as {
      id: number
      password: string
      reason?: string
    }

    // 필수 파라미터 검증
    if (!id || !password) {
      return NextResponse.json(
        { error: 'ID와 비밀번호는 필수입니다' },
        { status: 400 }
      )
    }

    // 관리자 비밀번호 확인
    if (password !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json(
        { error: '비밀번호가 올바르지 않습니다' },
        { status: 401 }
      )
    }

    // Service Role 클라이언트로 업데이트 (RLS 우회)
    const supabase = createServiceClient()

    const updateData: RecommendationUpdate = {
      is_active: false,
      cancelled_at: new Date().toISOString(),
      cancelled_reason: reason ?? null,
    }

    const { data, error } = await ((supabase as any)
      .from('recommendations')
      .update(updateData)
      .eq('id', id)
      .eq('is_active', true) // 이미 취소된 것은 다시 취소 불가
      .select())
      

    if (error) {
      console.error('Failed to cancel recommendation:', error)
      return NextResponse.json(
        { error: '추천 취소에 실패했습니다' },
        { status: 500 }
      )
    }

    if (!data || data.length === 0) {
      return NextResponse.json(
        { error: '해당 추천을 찾을 수 없거나 이미 취소되었습니다' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, data: data[0] })
  } catch (error) {
    console.error('Error in cancel API:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}
