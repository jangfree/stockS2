/**
 * 유입 경로 목록 조회 API
 * GET /api/auth/referral-sources
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { ApiResponse } from '@/lib/types/member'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    const { data: sources, error } = await supabase
      .from('referral_sources')
      .select('code, name')
      .eq('is_active', true)
      .order('sort_order', { ascending: true })

    if (error) {
      console.error('Fetch referral sources error:', error)
      return NextResponse.json<ApiResponse>({
        success: false,
        error: {
          code: 'FETCH_ERROR',
          message: '유입 경로 목록을 조회할 수 없습니다.'
        }
      }, { status: 500 })
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      data: sources || []
    })

  } catch (error) {
    console.error('Get referral sources error:', error)
    return NextResponse.json<ApiResponse>({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: '서버 오류가 발생했습니다.'
      }
    }, { status: 500 })
  }
}
