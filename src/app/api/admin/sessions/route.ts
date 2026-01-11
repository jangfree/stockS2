/**
 * 관리자용 세션 관리 API
 * GET /api/admin/sessions - 활성 세션 목록
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const ADMIN_API_KEY = process.env.ADMIN_API_KEY || 'admin-secret-key'

function verifyAdminKey(request: NextRequest): boolean {
  const apiKey = request.headers.get('x-admin-api-key')
  return apiKey === ADMIN_API_KEY
}

export async function GET(request: NextRequest) {
  if (!verifyAdminKey(request)) {
    return NextResponse.json({
      success: false,
      error: { code: 'UNAUTHORIZED', message: '관리자 인증이 필요합니다.' }
    }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const member_id = searchParams.get('member_id')

    const offset = (page - 1) * limit
    const supabase = await createClient()

    let query = supabase
      .from('active_sessions')
      .select(`
        *,
        members (user_id, name, membership_level)
      `, { count: 'exact' })
      .eq('is_active', true)

    // 회원 필터
    if (member_id) {
      query = query.eq('member_id', member_id)
    }

    // 페이지네이션
    query = query
      .order('login_at', { ascending: false })
      .range(offset, offset + limit - 1)

    const { data: sessions, error, count } = await query

    if (error) {
      console.error('Failed to fetch sessions:', error)
      return NextResponse.json({
        success: false,
        error: { code: 'DATABASE_ERROR', message: '세션 조회에 실패했습니다.' }
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data: {
        sessions,
        pagination: {
          page,
          limit,
          total: count || 0,
          total_pages: Math.ceil((count || 0) / limit)
        }
      }
    })
  } catch (error) {
    console.error('Admin sessions API error:', error)
    return NextResponse.json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: '서버 오류가 발생했습니다.' }
    }, { status: 500 })
  }
}
