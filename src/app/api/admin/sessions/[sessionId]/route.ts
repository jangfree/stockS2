/**
 * 관리자용 개별 세션 관리 API
 * DELETE /api/admin/sessions/[sessionId] - 세션 강제 종료
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const ADMIN_API_KEY = process.env.ADMIN_API_KEY || 'admin-secret-key'

function verifyAdminKey(request: NextRequest): boolean {
  const apiKey = request.headers.get('x-admin-api-key')
  return apiKey === ADMIN_API_KEY
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  if (!verifyAdminKey(request)) {
    return NextResponse.json({
      success: false,
      error: { code: 'UNAUTHORIZED', message: '관리자 인증이 필요합니다.' }
    }, { status: 401 })
  }

  try {
    const { sessionId } = await params
    const supabase = await createClient()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await ((supabase as any)
      .from('active_sessions')
      .update({
        is_active: false,
        logout_at: new Date().toISOString()
      })
      .eq('id', sessionId))

    if (error) {
      console.error('Failed to terminate session:', error)
      return NextResponse.json({
        success: false,
        error: { code: 'DATABASE_ERROR', message: '세션 종료에 실패했습니다.' }
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: '세션이 종료되었습니다.'
    })
  } catch (error) {
    console.error('Admin session terminate API error:', error)
    return NextResponse.json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: '서버 오류가 발생했습니다.' }
    }, { status: 500 })
  }
}
