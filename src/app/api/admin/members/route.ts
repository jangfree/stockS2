/**
 * 관리자용 회원 관리 API
 * GET /api/admin/members - 회원 목록 조회
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// 간단한 API 키 인증 (관리자 앱용)
const ADMIN_API_KEY = process.env.ADMIN_API_KEY || 'admin-secret-key'

function verifyAdminKey(request: NextRequest): boolean {
  const apiKey = request.headers.get('x-admin-api-key')
  return apiKey === ADMIN_API_KEY
}

export async function GET(request: NextRequest) {
  // API 키 검증
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
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || ''
    const level = searchParams.get('level')
    const security_status = searchParams.get('security_status') || ''

    const offset = (page - 1) * limit
    const supabase = await createClient()

    let query = supabase
      .from('members')
      .select(`
        id, user_id, name, gender, birth_year,
        membership_level, membership_expires_at,
        status, security_status,
        referrer_id, referral_source_id,
        created_at, updated_at,
        referral_sources (name)
      `, { count: 'exact' })

    // 검색 필터
    if (search) {
      query = query.or(`user_id.ilike.%${search}%,name.ilike.%${search}%`)
    }

    // 상태 필터
    if (status) {
      query = query.eq('status', status)
    }

    // 등급 필터
    if (level !== null && level !== '') {
      query = query.eq('membership_level', parseInt(level))
    }

    // 보안 상태 필터
    if (security_status) {
      query = query.eq('security_status', security_status)
    }

    // 페이지네이션
    query = query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    const { data: members, error, count } = await query

    if (error) {
      console.error('Failed to fetch members:', error)
      return NextResponse.json({
        success: false,
        error: { code: 'DATABASE_ERROR', message: '회원 목록 조회에 실패했습니다.' }
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data: {
        members,
        pagination: {
          page,
          limit,
          total: count || 0,
          total_pages: Math.ceil((count || 0) / limit)
        }
      }
    })
  } catch (error) {
    console.error('Admin members API error:', error)
    return NextResponse.json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: '서버 오류가 발생했습니다.' }
    }, { status: 500 })
  }
}
