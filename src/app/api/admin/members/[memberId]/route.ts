/**
 * 관리자용 개별 회원 관리 API
 * GET /api/admin/members/[memberId] - 회원 상세 조회
 * PATCH /api/admin/members/[memberId] - 회원 정보 수정
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const ADMIN_API_KEY = process.env.ADMIN_API_KEY || 'admin-secret-key'

function verifyAdminKey(request: NextRequest): boolean {
  const apiKey = request.headers.get('x-admin-api-key')
  return apiKey === ADMIN_API_KEY
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ memberId: string }> }
) {
  if (!verifyAdminKey(request)) {
    return NextResponse.json({
      success: false,
      error: { code: 'UNAUTHORIZED', message: '관리자 인증이 필요합니다.' }
    }, { status: 401 })
  }

  try {
    const { memberId } = await params
    const supabase = await createClient()

    // 회원 정보 조회
    const { data: member, error } = await supabase
      .from('members')
      .select(`
        *,
        referral_sources (name)
      `)
      .eq('id', memberId)
      .single()

    if (error || !member) {
      return NextResponse.json({
        success: false,
        error: { code: 'NOT_FOUND', message: '회원을 찾을 수 없습니다.' }
      }, { status: 404 })
    }

    // 최근 로그인 기록
    const { data: loginHistory } = await supabase
      .from('login_history')
      .select('*')
      .eq('member_id', memberId)
      .order('login_at', { ascending: false })
      .limit(10)

    // 활성 세션
    const { data: activeSessions } = await supabase
      .from('active_sessions')
      .select('*')
      .eq('member_id', memberId)
      .eq('is_active', true)

    // 결제 내역
    const { data: payments } = await supabase
      .from('payments')
      .select('*')
      .eq('member_id', memberId)
      .order('created_at', { ascending: false })
      .limit(10)

    // 의심스러운 접속 로그
    const { data: suspiciousLogs } = await supabase
      .from('suspicious_access_logs')
      .select('*')
      .eq('member_id', memberId)
      .order('detected_at', { ascending: false })
      .limit(10)

    // 비밀번호 해시 제거
    const memberObj = member as Record<string, unknown>
    const { password_hash, ...memberPublic } = memberObj

    return NextResponse.json({
      success: true,
      data: {
        member: memberPublic,
        login_history: loginHistory || [],
        active_sessions: activeSessions || [],
        payments: payments || [],
        suspicious_logs: suspiciousLogs || []
      }
    })
  } catch (error) {
    console.error('Admin member detail API error:', error)
    return NextResponse.json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: '서버 오류가 발생했습니다.' }
    }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ memberId: string }> }
) {
  if (!verifyAdminKey(request)) {
    return NextResponse.json({
      success: false,
      error: { code: 'UNAUTHORIZED', message: '관리자 인증이 필요합니다.' }
    }, { status: 401 })
  }

  try {
    const { memberId } = await params
    const body = await request.json()

    // 허용된 필드만 업데이트
    interface MemberUpdate {
      name?: string
      membership_level?: number
      membership_expires_at?: string
      status?: string
      security_status?: string
    }

    const updateData: MemberUpdate = {}
    if (body.name !== undefined) updateData.name = body.name
    if (body.membership_level !== undefined) updateData.membership_level = body.membership_level
    if (body.membership_expires_at !== undefined) updateData.membership_expires_at = body.membership_expires_at
    if (body.status !== undefined) updateData.status = body.status
    if (body.security_status !== undefined) updateData.security_status = body.security_status

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({
        success: false,
        error: { code: 'INVALID_REQUEST', message: '수정할 필드가 없습니다.' }
      }, { status: 400 })
    }

    const supabase = await createClient()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: member, error } = await ((supabase as any)
      .from('members')
      .update(updateData)
      .eq('id', memberId)
      .select()
      .single())

    if (error) {
      console.error('Failed to update member:', error)
      return NextResponse.json({
        success: false,
        error: { code: 'DATABASE_ERROR', message: '회원 정보 수정에 실패했습니다.' }
      }, { status: 500 })
    }

    // 계정 차단 시 모든 세션 종료
    if (updateData.status === 'blocked') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await ((supabase as any)
        .from('active_sessions')
        .update({ is_active: false, logout_at: new Date().toISOString() })
        .eq('member_id', memberId))
    }

    // 비밀번호 해시 제거
    const memberObj = member as Record<string, unknown>
    const { password_hash: _, ...memberPublic } = memberObj

    return NextResponse.json({
      success: true,
      data: memberPublic
    })
  } catch (error) {
    console.error('Admin member update API error:', error)
    return NextResponse.json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: '서버 오류가 발생했습니다.' }
    }, { status: 500 })
  }
}
