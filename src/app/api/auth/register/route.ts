/**
 * 회원가입 API
 * POST /api/auth/register
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { hashPassword, validators } from '@/lib/auth'
import { RegisterRequest, ApiResponse } from '@/lib/types/member'

export async function POST(request: NextRequest) {
  try {
    const body: RegisterRequest = await request.json()
    const { user_id, password, name, gender, birth_year, referral_source, referral_source_etc, referrer_id } = body

    // 1. 입력 검증
    const errors: string[] = []

    if (!user_id || !validators.userId(user_id)) {
      errors.push('아이디는 영문+숫자 4-50자로 입력해주세요.')
    }

    if (!password || !validators.password(password)) {
      errors.push('비밀번호는 8자 이상, 영문+숫자+특수문자를 포함해야 합니다.')
    }

    if (!name || !validators.name(name)) {
      errors.push('이름은 2-50자로 입력해주세요.')
    }

    if (!gender || !validators.gender(gender)) {
      errors.push('성별을 선택해주세요.')
    }

    if (!birth_year || !validators.birthYear(birth_year)) {
      errors.push('올바른 출생연도를 입력해주세요.')
    }

    if (!referral_source) {
      errors.push('유입 경로를 선택해주세요.')
    }

    if (referral_source === 'etc' && !referral_source_etc) {
      errors.push('기타 유입 경로를 입력해주세요.')
    }

    if (errors.length > 0) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: errors[0],
          data: { errors }
        }
      }, { status: 400 })
    }

    const supabase = await createClient()

    // 2. 아이디 중복 확인
    const { data: existingUser } = await supabase
      .from('members')
      .select('id')
      .eq('user_id', user_id)
      .single()

    if (existingUser) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: {
          code: 'DUPLICATE_USER_ID',
          message: '이미 사용 중인 아이디입니다.'
        }
      }, { status: 409 })
    }

    // 3. 추천인 ID 검증 (입력된 경우)
    if (referrer_id) {
      const { data: referrer } = await supabase
        .from('members')
        .select('id')
        .eq('user_id', referrer_id)
        .eq('is_active', true)
        .single()

      if (!referrer) {
        return NextResponse.json<ApiResponse>({
          success: false,
          error: {
            code: 'INVALID_REFERRER',
            message: '존재하지 않는 추천인 ID입니다.'
          }
        }, { status: 400 })
      }
    }

    // 4. 유입 경로 검증
    const { data: validSource } = await supabase
      .from('referral_sources')
      .select('code')
      .eq('code', referral_source)
      .eq('is_active', true)
      .single()

    if (!validSource) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: {
          code: 'INVALID_REFERRAL_SOURCE',
          message: '유효하지 않은 유입 경로입니다.'
        }
      }, { status: 400 })
    }

    // 5. 비밀번호 해시
    const password_hash = await hashPassword(password)

    // 6. 회원 생성
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: newMember, error: insertError } = await ((supabase as any)
      .from('members')
      .insert({
        user_id,
        password_hash,
        name,
        gender,
        birth_year,
        referral_source,
        referral_source_etc: referral_source === 'etc' ? referral_source_etc : null,
        referrer_id: referrer_id || null,
        membership_level: 0,
        security_status: 'NORMAL',
        is_active: true
      })
      .select('id, user_id, name, birth_year, membership_level, created_at')
      .single())

    if (insertError) {
      console.error('Member insert error:', insertError)
      return NextResponse.json<ApiResponse>({
        success: false,
        error: {
          code: 'INSERT_ERROR',
          message: '회원가입 처리 중 오류가 발생했습니다.'
        }
      }, { status: 500 })
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      data: newMember,
      message: '회원가입이 완료되었습니다.'
    }, { status: 201 })

  } catch (error) {
    console.error('Register error:', error)
    return NextResponse.json<ApiResponse>({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: '서버 오류가 발생했습니다.'
      }
    }, { status: 500 })
  }
}
