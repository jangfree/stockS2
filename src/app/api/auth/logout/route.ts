/**
 * 로그아웃 API
 * POST /api/auth/logout
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { verifyTokenFromRequest, getSessionToken } from '@/lib/auth'
import { ApiResponse } from '@/lib/types/member'

export async function POST(request: NextRequest) {
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

    const sessionToken = tokenData.session_token
    if (!sessionToken) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: {
          code: 'INVALID_SESSION',
          message: '유효하지 않은 세션입니다.'
        }
      }, { status: 400 })
    }

    const supabase = await createClient()

    // 세션 비활성화
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await ((supabase as any)
      .from('active_sessions')
      .update({ is_active: false })
      .eq('session_token', sessionToken))

    if (error) {
      console.error('Logout error:', error)
      return NextResponse.json<ApiResponse>({
        success: false,
        error: {
          code: 'LOGOUT_ERROR',
          message: '로그아웃 처리 중 오류가 발생했습니다.'
        }
      }, { status: 500 })
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      message: '로그아웃되었습니다.'
    })

  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json<ApiResponse>({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: '서버 오류가 발생했습니다.'
      }
    }, { status: 500 })
  }
}
