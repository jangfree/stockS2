/**
 * 관리자용 이상 접속 로그 API
 * GET /api/admin/suspicious-logs - 이상 접속 로그 목록
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
    const detection_type = searchParams.get('detection_type') || ''
    const severity = searchParams.get('severity') || ''
    const resolved = searchParams.get('resolved')

    const offset = (page - 1) * limit
    const supabase = await createClient()

    let query = supabase
      .from('suspicious_access_logs')
      .select(`
        *,
        members (user_id, name)
      `, { count: 'exact' })

    // 탐지 유형 필터
    if (detection_type) {
      query = query.eq('detection_type', detection_type)
    }

    // 심각도 필터
    if (severity) {
      query = query.eq('severity', severity)
    }

    // 해결 여부 필터
    if (resolved !== null && resolved !== '') {
      query = query.eq('resolved', resolved === 'true')
    }

    // 페이지네이션
    query = query
      .order('detected_at', { ascending: false })
      .range(offset, offset + limit - 1)

    const { data: logs, error, count } = await query

    if (error) {
      console.error('Failed to fetch suspicious logs:', error)
      return NextResponse.json({
        success: false,
        error: { code: 'DATABASE_ERROR', message: '로그 조회에 실패했습니다.' }
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data: {
        logs,
        pagination: {
          page,
          limit,
          total: count || 0,
          total_pages: Math.ceil((count || 0) / limit)
        }
      }
    })
  } catch (error) {
    console.error('Admin suspicious logs API error:', error)
    return NextResponse.json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: '서버 오류가 발생했습니다.' }
    }, { status: 500 })
  }
}
