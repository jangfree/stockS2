/**
 * 내 정보 조회 API
 * GET /api/auth/me
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { verifyTokenFromRequest } from '@/lib/auth'
import { ApiResponse, MemberPublic } from '@/lib/types/member'

export async function GET(request: NextRequest) {
  try {
    const tokenData = verifyTokenFromRequest(request)
    if (!tokenData) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: '인증이 필요합니다.'
        }
      }, { status: 401 })
    }

    const supabase = await createClient()

    // 세션 유효성 확인
    const { data: session } = await supabase
      .from('active_sessions')
      .select('id')
      .eq('session_token', tokenData.session_token)
      .eq('is_active', true)
      .gt('expires_at', new Date().toISOString())
      .single()

    if (!session) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: {
          code: 'SESSION_EXPIRED',
          message: '세션이 만료되었거나 다른 위치에서 종료되었습니다.'
        }
      }, { status: 401 })
    }

    // 회원 정보 조회
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: memberData, error } = await (supabase as any)
      .from('members')
      .select('id, user_id, name, gender, birth_year, membership_level, membership_end_date, security_status, created_at')
      .eq('id', tokenData.userId)
      .eq('is_active', true)
      .single()

    const member = memberData as MemberPublic | null

    if (!member || error) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: '사용자 정보를 찾을 수 없습니다.'
        }
      }, { status: 404 })
    }

    // 활성 세션 수 조회
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: sessionCheck } = await (supabase as any)
      .rpc('check_concurrent_sessions', { p_member_id: member.id })

    const userPublic: MemberPublic = {
      id: member.id,
      user_id: member.user_id,
      name: member.name,
      gender: member.gender,
      birth_year: member.birth_year,
      membership_level: member.membership_level,
      membership_end_date: member.membership_end_date,
      security_status: member.security_status,
      created_at: member.created_at
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      data: {
        user: userPublic,
        session_info: {
          active_sessions: sessionCheck?.[0]?.active_count || 1,
          max_sessions: sessionCheck?.[0]?.max_allowed || 1
        }
      }
    })

  } catch (error) {
    console.error('Get me error:', error)
    return NextResponse.json<ApiResponse>({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: '서버 오류가 발생했습니다.'
      }
    }, { status: 500 })
  }
}
