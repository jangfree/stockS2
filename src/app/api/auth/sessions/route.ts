/**
 * 세션 관리 API
 * GET /api/auth/sessions - 내 활성 세션 목록 조회
 * DELETE /api/auth/sessions - 다른 모든 세션 종료
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { verifyTokenFromRequest, maskIpAddress } from '@/lib/auth'
import { ApiResponse, SessionInfo } from '@/lib/types/member'

// GET: 내 활성 세션 목록 조회
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
    const currentSessionToken = tokenData.session_token

    // 등급별 최대 세션 수 조회
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: levelDataRaw } = await (supabase as any)
      .from('membership_levels')
      .select('max_sessions')
      .eq('level', tokenData.membership_level)
      .single()
    const levelData = levelDataRaw as { max_sessions: number } | null

    // 활성 세션 목록 조회
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: sessionsData, error } = await (supabase as any)
      .from('active_sessions')
      .select('*')
      .eq('member_id', tokenData.userId)
      .eq('is_active', true)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: true })

    interface SessionRow {
      id: number
      device_type: string
      browser: string
      browser_version: string
      os: string
      os_version: string
      ip_address: string
      created_at: string
      last_activity_at: string
      session_token: string
    }
    const sessions = sessionsData as SessionRow[] | null

    if (error) {
      console.error('Get sessions error:', error)
      return NextResponse.json<ApiResponse>({
        success: false,
        error: {
          code: 'FETCH_ERROR',
          message: '세션 목록을 조회할 수 없습니다.'
        }
      }, { status: 500 })
    }

    const sessionInfos: SessionInfo[] = (sessions || []).map(s => ({
      id: s.id,
      device_type: s.device_type,
      browser: s.browser,
      browser_version: s.browser_version,
      os: s.os,
      os_version: s.os_version,
      ip_address: maskIpAddress(s.ip_address || ''),
      created_at: s.created_at,
      last_activity_at: s.last_activity_at,
      is_current: s.session_token === currentSessionToken
    }))

    return NextResponse.json<ApiResponse>({
      success: true,
      data: {
        max_sessions: levelData?.max_sessions || 1,
        sessions: sessionInfos
      }
    })

  } catch (error) {
    console.error('Get sessions error:', error)
    return NextResponse.json<ApiResponse>({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: '서버 오류가 발생했습니다.'
      }
    }, { status: 500 })
  }
}

// DELETE: 다른 모든 세션 종료
export async function DELETE(request: NextRequest) {
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
    const currentSessionToken = tokenData.session_token

    // 다른 모든 세션 종료
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: terminatedCount } = await (supabase as any)
      .rpc('terminate_other_sessions', {
        p_member_id: tokenData.userId,
        p_current_session_token: currentSessionToken
      })

    return NextResponse.json<ApiResponse>({
      success: true,
      data: {
        terminated_count: terminatedCount || 0
      },
      message: `${terminatedCount || 0}개의 세션이 종료되었습니다.`
    })

  } catch (error) {
    console.error('Terminate other sessions error:', error)
    return NextResponse.json<ApiResponse>({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: '서버 오류가 발생했습니다.'
      }
    }, { status: 500 })
  }
}
