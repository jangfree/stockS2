/**
 * 페이지 접근 권한 확인 API
 * POST /api/pages/access - 특정 페이지 접근 권한 확인 및 방문 기록
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { verifyTokenFromRequest, getSessionToken } from '@/lib/auth'

interface PageData {
  id: number
  path: string
  required_level: number
  is_active: boolean
}

interface MemberData {
  id: number
  membership_level: number
  membership_expires_at: string | null
  status: string
}

export async function POST(request: NextRequest) {
  try {
    const { page_path } = await request.json()

    if (!page_path) {
      return NextResponse.json({
        success: false,
        error: { code: 'INVALID_REQUEST', message: '페이지 경로가 필요합니다.' }
      }, { status: 400 })
    }

    // 토큰 검증
    const tokenData = verifyTokenFromRequest(request)
    const sessionToken = getSessionToken(request)

    const supabase = await createClient()

    // 페이지 정보 조회
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: pageData, error: pageError } = await (supabase as any)
      .from('pages')
      .select('*')
      .eq('path', page_path)
      .eq('is_active', true)
      .single()

    const page = pageData as PageData | null

    if (pageError || !page) {
      // 페이지가 등록되지 않은 경우 기본적으로 접근 허용
      return NextResponse.json({
        success: true,
        data: {
          allowed: true,
          page: null,
          reason: 'unregistered_page'
        }
      })
    }

    // 비로그인 사용자
    if (!tokenData) {
      if (page.required_level > 0) {
        return NextResponse.json({
          success: true,
          data: {
            allowed: false,
            page,
            reason: 'login_required',
            required_level: page.required_level
          }
        })
      }

      return NextResponse.json({
        success: true,
        data: {
          allowed: true,
          page,
          reason: 'public_page'
        }
      })
    }

    // 로그인 사용자 - 회원 정보 조회
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: memberData, error: memberError } = await (supabase as any)
      .from('members')
      .select('id, membership_level, membership_expires_at, status')
      .eq('id', tokenData.userId)
      .single()

    const member = memberData as MemberData | null

    if (memberError || !member) {
      return NextResponse.json({
        success: false,
        error: { code: 'USER_NOT_FOUND', message: '회원 정보를 찾을 수 없습니다.' }
      }, { status: 401 })
    }

    // 계정 상태 확인
    if (member.status !== 'active') {
      return NextResponse.json({
        success: true,
        data: {
          allowed: false,
          page,
          reason: 'account_inactive',
          account_status: member.status
        }
      })
    }

    // 세션 유효성 확인
    if (sessionToken) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: session } = await (supabase as any)
        .from('active_sessions')
        .select('id')
        .eq('session_token', sessionToken)
        .eq('member_id', member.id)
        .eq('is_active', true)
        .single()

      if (!session) {
        return NextResponse.json({
          success: true,
          data: {
            allowed: false,
            page,
            reason: 'session_invalid'
          }
        })
      }
    }

    // 회원 등급 확인
    let effectiveLevel = member.membership_level

    // 멤버십 만료 확인
    if (member.membership_expires_at && new Date(member.membership_expires_at) < new Date()) {
      effectiveLevel = 0 // 만료 시 무료 회원으로 취급
    }

    // 접근 권한 확인
    if (effectiveLevel < page.required_level) {
      return NextResponse.json({
        success: true,
        data: {
          allowed: false,
          page,
          reason: 'insufficient_level',
          user_level: effectiveLevel,
          required_level: page.required_level
        }
      })
    }

    // 방문 기록 저장
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any)
      .from('page_visits')
      .insert({
        member_id: member.id,
        page_id: page.id
      })

    return NextResponse.json({
      success: true,
      data: {
        allowed: true,
        page,
        reason: 'access_granted',
        user_level: effectiveLevel
      }
    })
  } catch (error) {
    console.error('Page access check error:', error)
    return NextResponse.json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: '서버 오류가 발생했습니다.' }
    }, { status: 500 })
  }
}
