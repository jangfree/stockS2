/**
 * 로그인 API
 * POST /api/auth/login
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  verifyPassword,
  generateToken,
  generateSessionToken,
  getClientIp,
  parseUserAgent,
  maskIpAddress
} from '@/lib/auth'
import { LoginRequest, ApiResponse, Member, MemberPublic } from '@/lib/types/member'

export async function POST(request: NextRequest) {
  try {
    const body: LoginRequest = await request.json()
    const { user_id, password, force_login, terminate_session_id } = body

    if (!user_id || !password) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: {
          code: 'MISSING_FIELDS',
          message: '아이디와 비밀번호를 입력해주세요.'
        }
      }, { status: 400 })
    }

    const supabase = await createClient()
    const deviceInfo = parseUserAgent(request)
    const clientIp = getClientIp(request)

    // 1. 회원 조회
    const { data: memberData, error: memberError } = await supabase
      .from('members')
      .select('*')
      .eq('user_id', user_id)
      .single()

    const member = memberData as Member | null

    if (!member || memberError) {
      await recordLoginHistory(supabase, null, request, false, '존재하지 않는 아이디')
      return NextResponse.json<ApiResponse>({
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: '아이디 또는 비밀번호가 올바르지 않습니다.'
        }
      }, { status: 401 })
    }

    // 2. 계정 상태 확인
    if (!member.is_active) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: {
          code: 'ACCOUNT_INACTIVE',
          message: '비활성화된 계정입니다.'
        }
      }, { status: 403 })
    }

    // 3. 계정 차단 확인
    if (member.security_status === 'BLOCKED') {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: {
          code: 'ACCOUNT_BLOCKED',
          message: '계정이 차단되었습니다. 관리자에게 문의해주세요.',
          data: {
            blocked_at: member.blocked_at,
            reason: member.blocked_reason
          }
        }
      }, { status: 403 })
    }

    // 4. 비밀번호 검증
    const isValidPassword = await verifyPassword(password, member.password_hash)
    if (!isValidPassword) {
      await recordLoginHistory(supabase, member.id, request, false, '비밀번호 불일치')
      return NextResponse.json<ApiResponse>({
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: '아이디 또는 비밀번호가 올바르지 않습니다.'
        }
      }, { status: 401 })
    }

    // 5. 동시 접속 제한 확인
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: sessionCheck } = await (supabase as any)
      .rpc('check_concurrent_sessions', { p_member_id: member.id })

    const activeCount = sessionCheck?.[0]?.active_count || 0
    const maxSessions = sessionCheck?.[0]?.max_allowed || 1
    const canLogin = sessionCheck?.[0]?.can_login ?? true

    // 6. 세션 제한 초과 처리
    if (!canLogin) {
      if (force_login) {
        // 가장 오래된 세션 자동 종료
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase as any).rpc('terminate_oldest_session', { p_member_id: member.id })
      } else if (terminate_session_id) {
        // 특정 세션 종료
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: terminated } = await (supabase as any)
          .rpc('terminate_session', {
            p_member_id: member.id,
            p_session_id: terminate_session_id
          })
        if (!terminated) {
          return NextResponse.json<ApiResponse>({
            success: false,
            error: {
              code: 'SESSION_NOT_FOUND',
              message: '세션을 찾을 수 없습니다.'
            }
          }, { status: 400 })
        }
      } else {
        // 활성 세션 목록 반환
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: activeSessions } = await (supabase as any)
          .rpc('get_active_sessions', { p_member_id: member.id })

        return NextResponse.json<ApiResponse>({
          success: false,
          error: {
            code: 'SESSION_LIMIT_EXCEEDED',
            message: '동시 접속 제한을 초과했습니다.',
            data: {
              max_sessions: maxSessions,
              active_sessions: activeSessions?.map((s: any) => ({
                id: s.session_id,
                device_type: s.device_type,
                browser: s.browser,
                ip_address: maskIpAddress(s.ip_address || ''),
                created_at: s.created_at
              })) || []
            }
          }
        }, { status: 409 })
      }
    }

    // 7. 이상 접속 감지 (다른 IP에서 활성 세션 존재 확인)
    let securityAlert = null
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: otherSessionsData } = await (supabase as any)
      .from('active_sessions')
      .select('ip_address')
      .eq('member_id', member.id)
      .eq('is_active', true)
      .neq('ip_address', clientIp)
      .gt('expires_at', new Date().toISOString())
      .limit(1)

    const otherSessions = otherSessionsData as Array<{ ip_address: string }> | null

    if (otherSessions && otherSessions.length > 0) {
      // 다른 IP에서 활성 세션 존재 - 의심 로그 기록
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: suspiciousLog } = await ((supabase as any)
        .from('suspicious_access_logs')
        .insert({
          member_id: member.id,
          detection_type: 'DIFFERENT_REGION',
          severity: member.suspicious_count >= 2 ? 'SUSPICIOUS' : 'WARNING',
          current_ip: clientIp,
          previous_ip: otherSessions[0].ip_address,
          user_agent: deviceInfo.userAgent,
          device_type: deviceInfo.deviceType
        })
        .select('id, detection_type, severity, current_ip, previous_ip, detected_at')
        .single())

      // 의심 횟수 증가
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await ((supabase as any)
        .from('members')
        .update({
          suspicious_count: member.suspicious_count + 1,
          last_suspicious_at: new Date().toISOString(),
          security_status: member.suspicious_count >= 2 ? 'SUSPICIOUS' : 'WARNING'
        })
        .eq('id', member.id))

      if (suspiciousLog) {
        securityAlert = {
          id: suspiciousLog.id,
          detection_type: suspiciousLog.detection_type,
          severity: suspiciousLog.severity,
          current_ip: maskIpAddress(suspiciousLog.current_ip),
          previous_ip: maskIpAddress(suspiciousLog.previous_ip || ''),
          detected_at: suspiciousLog.detected_at,
          is_resolved: false
        }
      }

      // 3회 이상 의심 패턴 - 차단
      if (member.suspicious_count >= 2) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await ((supabase as any)
          .from('members')
          .update({
            security_status: 'BLOCKED',
            blocked_at: new Date().toISOString(),
            blocked_reason: '반복적인 이상 접속 감지로 인한 자동 차단'
          })
          .eq('id', member.id))

        return NextResponse.json<ApiResponse>({
          success: false,
          error: {
            code: 'ACCOUNT_BLOCKED',
            message: '반복적인 이상 접속이 감지되어 계정이 차단되었습니다. 관리자에게 문의해주세요.'
          }
        }, { status: 403 })
      }
    }

    // 8. JWT 토큰 생성
    const sessionToken = generateSessionToken()
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000)

    const token = generateToken({
      userId: member.id,
      user_id: member.user_id,
      membership_level: member.membership_level,
      session_token: sessionToken
    })

    // 9. 활성 세션 등록
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any).from('active_sessions').insert({
      member_id: member.id,
      session_token: sessionToken,
      expires_at: expiresAt.toISOString(),
      ip_address: clientIp,
      user_agent: deviceInfo.userAgent,
      device_type: deviceInfo.deviceType,
      browser: deviceInfo.browser,
      browser_version: deviceInfo.browserVersion,
      os: deviceInfo.os,
      os_version: deviceInfo.osVersion
    })

    // 10. 마지막 로그인 시간 업데이트
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await ((supabase as any)
      .from('members')
      .update({ last_login_at: new Date().toISOString() })
      .eq('id', member.id))

    // 11. 로그인 이력 저장
    await recordLoginHistory(supabase, member.id, request, true)

    // 12. 현재 활성 세션 수 조회
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: updatedSessionCheck } = await (supabase as any)
      .rpc('check_concurrent_sessions', { p_member_id: member.id })

    const userPublic: MemberPublic = {
      id: member.id,
      user_id: member.user_id,
      name: member.name,
      gender: member.gender,
      birth_year: member.birth_year,
      membership_level: member.membership_level,
      membership_end_date: member.membership_end_date,
      security_status: member.security_status
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      data: {
        user: userPublic,
        token,
        expires_at: expiresAt.toISOString(),
        session_info: {
          active_sessions: updatedSessionCheck?.[0]?.active_count || 1,
          max_sessions: maxSessions
        },
        security_alert: securityAlert
      }
    })

  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json<ApiResponse>({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: '서버 오류가 발생했습니다.'
      }
    }, { status: 500 })
  }
}

// 로그인 이력 기록 함수
async function recordLoginHistory(
  supabase: any,
  memberId: number | null,
  request: NextRequest,
  isSuccess: boolean,
  failureReason?: string
) {
  if (!memberId) return

  const deviceInfo = parseUserAgent(request)
  const clientIp = getClientIp(request)

  try {
    await supabase.from('login_history').insert({
      member_id: memberId,
      ip_address: clientIp,
      user_agent: deviceInfo.userAgent,
      device_type: deviceInfo.deviceType,
      browser: deviceInfo.browser,
      browser_version: deviceInfo.browserVersion,
      os: deviceInfo.os,
      os_version: deviceInfo.osVersion,
      is_success: isSuccess,
      failure_reason: failureReason
    })
  } catch (error) {
    console.error('Failed to record login history:', error)
  }
}
