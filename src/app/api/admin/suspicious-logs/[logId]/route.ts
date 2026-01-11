/**
 * 관리자용 이상 접속 로그 처리 API
 * PATCH /api/admin/suspicious-logs/[logId] - 로그 해결 처리
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const ADMIN_API_KEY = process.env.ADMIN_API_KEY || 'admin-secret-key'

function verifyAdminKey(request: NextRequest): boolean {
  const apiKey = request.headers.get('x-admin-api-key')
  return apiKey === ADMIN_API_KEY
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ logId: string }> }
) {
  if (!verifyAdminKey(request)) {
    return NextResponse.json({
      success: false,
      error: { code: 'UNAUTHORIZED', message: '관리자 인증이 필요합니다.' }
    }, { status: 401 })
  }

  try {
    const { logId } = await params
    const body = await request.json()
    const { resolution_type, resolution_note } = body

    if (!resolution_type) {
      return NextResponse.json({
        success: false,
        error: { code: 'INVALID_REQUEST', message: '처리 유형이 필요합니다.' }
      }, { status: 400 })
    }

    const supabase = await createClient()

    // 로그 해결 처리
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: log, error } = await ((supabase as any)
      .from('suspicious_access_logs')
      .update({
        resolved: true,
        resolution_type,
        resolution_note,
        resolved_at: new Date().toISOString()
      })
      .eq('id', logId)
      .select(`
        *,
        members (id, user_id, name, security_status)
      `)
      .single())

    if (error) {
      console.error('Failed to update suspicious log:', error)
      return NextResponse.json({
        success: false,
        error: { code: 'DATABASE_ERROR', message: '로그 처리에 실패했습니다.' }
      }, { status: 500 })
    }

    // 회원 보안 상태 업데이트 (필요한 경우)
    if (resolution_type === 'cleared' && log.members?.security_status !== 'NORMAL') {
      // 해결된 것으로 처리 시 보안 상태를 NORMAL로 변경할지 확인
      const { count: unresolvedCount } = await supabase
        .from('suspicious_access_logs')
        .select('id', { count: 'exact', head: true })
        .eq('member_id', log.member_id)
        .eq('resolved', false)

      if (unresolvedCount === 0) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await ((supabase as any)
          .from('members')
          .update({ security_status: 'NORMAL' })
          .eq('id', log.member_id))
      }
    }

    return NextResponse.json({
      success: true,
      data: log
    })
  } catch (error) {
    console.error('Admin suspicious log update API error:', error)
    return NextResponse.json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: '서버 오류가 발생했습니다.' }
    }, { status: 500 })
  }
}
