/**
 * 특정 세션 관리 API
 * DELETE /api/auth/sessions/:sessionId - 특정 세션 종료
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { verifyTokenFromRequest } from '@/lib/auth'
import { ApiResponse } from '@/lib/types/member'

// DELETE: 특정 세션 종료
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
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

    const { sessionId } = await params
    const sessionIdNum = parseInt(sessionId)

    if (isNaN(sessionIdNum)) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: {
          code: 'INVALID_SESSION_ID',
          message: '유효하지 않은 세션 ID입니다.'
        }
      }, { status: 400 })
    }

    const supabase = await createClient()

    // 특정 세션 종료
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: terminated } = await (supabase as any)
      .rpc('terminate_session', {
        p_member_id: tokenData.userId,
        p_session_id: sessionIdNum
      })

    if (!terminated) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: {
          code: 'SESSION_NOT_FOUND',
          message: '세션을 찾을 수 없습니다.'
        }
      }, { status: 404 })
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      message: '세션이 종료되었습니다.'
    })

  } catch (error) {
    console.error('Terminate session error:', error)
    return NextResponse.json<ApiResponse>({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: '서버 오류가 발생했습니다.'
      }
    }, { status: 500 })
  }
}
