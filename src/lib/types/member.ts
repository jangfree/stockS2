/**
 * 회원 시스템 타입 정의
 */

// 보안 상태 타입
export type SecurityStatus = 'NORMAL' | 'WARNING' | 'SUSPICIOUS' | 'BLOCKED'

// 이상 접속 감지 타입
export type DetectionType = 'MULTIPLE_IP' | 'DIFFERENT_REGION' | 'RAPID_CHANGE'
export type SeverityLevel = 'WARNING' | 'SUSPICIOUS' | 'BLOCKED'
export type ResolutionType = 'CONFIRMED_OWNER' | 'BLOCKED' | 'FALSE_POSITIVE' | 'TERMINATE_OTHERS'

// 회원 인터페이스
export interface Member {
  id: number
  user_id: string
  password_hash: string
  name: string
  gender: 'M' | 'F'
  birth_year: number
  referral_source: string
  referral_source_etc: string | null
  referrer_id: string | null
  membership_level: 0 | 1 | 2 | 3 | 4 | 5
  membership_start_date: string | null
  membership_end_date: string | null
  grace_period_end_date: string | null
  security_status: SecurityStatus
  suspicious_count: number
  last_suspicious_at: string | null
  blocked_at: string | null
  blocked_reason: string | null
  is_active: boolean
  created_at: string
  updated_at: string
  last_login_at: string | null
  withdrawn_at: string | null
  withdrawn_reason: string | null
  withdrawn_by: string | null
}

// 공개 회원 정보 (민감 정보 제외)
export interface MemberPublic {
  id: number
  user_id: string
  name: string
  gender: 'M' | 'F'
  birth_year: number
  membership_level: number
  membership_expires_at?: string | null
  membership_end_date?: string | null
  security_status: SecurityStatus
  created_at?: string
}

// 유입 경로
export interface ReferralSource {
  code: string
  name: string
  sort_order: number
  is_active: boolean
}

// 회원 등급
export interface MembershipLevel {
  level: number
  name: string
  price: number
  max_sessions: number
  description: string | null
  is_active: boolean
}

// 회원가입 요청
export interface RegisterRequest {
  user_id: string
  password: string
  name: string
  gender: 'M' | 'F'
  birth_year: number
  referral_source: string
  referral_source_etc?: string
  referrer_id?: string
}

// 로그인 요청
export interface LoginRequest {
  user_id: string
  password: string
  force_login?: boolean
  terminate_session_id?: number
}

// 로그인 응답
export interface LoginResponse {
  user: MemberPublic
  token: string
  expires_at: string
  session_info: {
    active_sessions: number
    max_sessions: number
  }
  security_alert?: SecurityAlert | null
}

// 활성 세션
export interface ActiveSession {
  id: number
  member_id: number
  session_token: string
  login_at: string
  created_at: string
  last_activity_at: string
  expires_at: string
  ip_address: string | null
  user_agent: string | null
  device_type: 'PC' | 'Mobile' | 'Tablet' | null
  browser: string | null
  browser_version: string | null
  os: string | null
  os_version: string | null
  is_active: boolean
  is_current?: boolean
}

// 세션 정보 (클라이언트용)
export interface SessionInfo {
  id: number
  device_type: string | null
  browser: string | null
  browser_version: string | null
  os: string | null
  os_version: string | null
  ip_address: string
  created_at: string
  last_activity_at: string
  is_current: boolean
}

// 세션 제한 초과 오류
export interface SessionLimitExceededError {
  code: 'SESSION_LIMIT_EXCEEDED'
  message: string
  data: {
    max_sessions: number
    active_sessions: SessionInfo[]
  }
}

// 이상 접속 로그
export interface SuspiciousAccessLog {
  id: number
  member_id: number
  detection_type: DetectionType
  severity: SeverityLevel
  current_ip: string
  current_region: string | null
  current_latitude: number | null
  current_longitude: number | null
  previous_ip: string | null
  previous_region: string | null
  previous_latitude: number | null
  previous_longitude: number | null
  distance_km: number | null
  time_diff_minutes: number | null
  detected_at: string
  is_resolved: boolean
  resolved_at: string | null
  resolved_by: string | null
  resolution_type: ResolutionType | null
  resolution_note: string | null
  user_agent: string | null
  device_type: string | null
}

// 보안 알림
export interface SecurityAlert {
  id: number
  detection_type: DetectionType
  severity: SeverityLevel
  current_ip: string
  current_region: string | null
  previous_ip: string | null
  previous_region: string | null
  distance_km: number | null
  detected_at: string
  is_resolved: boolean
}

// 보안 알림 응답
export interface SecurityAlertResponse {
  alerts: SecurityAlert[]
  unresolved_count: number
}

// 결제
export interface Payment {
  id: number
  member_id: number
  amount: number
  membership_level: number
  period_start: string
  period_end: string
  depositor_name: string | null
  payment_date: string
  memo: string | null
  created_by: string
  created_at: string
}

// 페이지
export interface Page {
  id: number
  page_id: string
  name: string
  url: string
  min_level: number
  description: string | null
  sort_order: number
  is_active: boolean
  created_at: string
  updated_at: string
}

// 로그인 이력
export interface LoginHistory {
  id: number
  member_id: number
  login_at: string
  ip_address: string | null
  user_agent: string | null
  device_type: string | null
  browser: string | null
  browser_version: string | null
  os: string | null
  os_version: string | null
  is_success: boolean
  failure_reason: string | null
  region: string | null
  latitude: number | null
  longitude: number | null
}

// 페이지 방문 이력
export interface PageVisit {
  id: number
  member_id: number
  page_id: string
  visited_at: string
  ip_address: string | null
  user_agent: string | null
  device_type: string | null
}

// 종목 클릭 이력
export interface StockClick {
  id: number
  member_id: number
  stock_code: string
  stock_name: string
  page_id: string | null
  clicked_at: string
  ip_address: string | null
  device_type: string | null
}

// JWT 페이로드
export interface JWTPayload {
  userId: number
  user_id: string
  membership_level: number
  session_token: string
  iat?: number
  exp?: number
}

// API 응답 타입
export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
    data?: unknown
  }
  message?: string
}

// 내 정보 조회 응답
export interface MeResponse {
  user: MemberPublic
  session_info: {
    active_sessions: number
    max_sessions: number
  }
}
