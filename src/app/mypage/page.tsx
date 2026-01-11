'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { ActiveSession } from '@/lib/types/member'

export default function MyPage() {
  const router = useRouter()
  const { user, token, isLoggedIn, isLoading, logout, refreshUser, sessionInfo } = useAuth()
  const [sessions, setSessions] = useState<ActiveSession[]>([])
  const [isLoadingSessions, setIsLoadingSessions] = useState(false)
  const [activeTab, setActiveTab] = useState<'info' | 'sessions' | 'security'>('info')

  // 로그인 안 된 경우 리다이렉트
  useEffect(() => {
    if (!isLoading && !isLoggedIn) {
      router.push('/login')
    }
  }, [isLoggedIn, isLoading, router])

  // 세션 목록 로드
  const loadSessions = useCallback(async () => {
    if (!token) return

    setIsLoadingSessions(true)
    try {
      const response = await fetch('/api/auth/sessions', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      const data = await response.json()
      if (data.success) {
        setSessions(data.data || [])
      }
    } catch (error) {
      console.error('Failed to load sessions:', error)
    } finally {
      setIsLoadingSessions(false)
    }
  }, [token])

  useEffect(() => {
    if (activeTab === 'sessions' && token) {
      loadSessions()
    }
  }, [activeTab, token, loadSessions])

  // 특정 세션 종료
  const terminateSession = async (sessionId: number) => {
    if (!token) return
    if (!confirm('이 세션을 종료하시겠습니까?')) return

    try {
      const response = await fetch(`/api/auth/sessions/${sessionId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      const data = await response.json()
      if (data.success) {
        await loadSessions()
        await refreshUser()
      } else {
        alert(data.error?.message || '세션 종료에 실패했습니다.')
      }
    } catch (error) {
      console.error('Failed to terminate session:', error)
      alert('세션 종료 중 오류가 발생했습니다.')
    }
  }

  // 다른 모든 세션 종료
  const terminateOtherSessions = async () => {
    if (!token) return
    if (!confirm('현재 기기를 제외한 모든 세션을 종료하시겠습니까?')) return

    try {
      const response = await fetch('/api/auth/sessions', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      const data = await response.json()
      if (data.success) {
        await loadSessions()
        await refreshUser()
        alert(`${data.data?.terminated_count || 0}개의 세션이 종료되었습니다.`)
      } else {
        alert(data.error?.message || '세션 종료에 실패했습니다.')
      }
    } catch (error) {
      console.error('Failed to terminate sessions:', error)
      alert('세션 종료 중 오류가 발생했습니다.')
    }
  }

  const handleLogout = async () => {
    await logout()
    router.push('/')
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getLevelBadgeColor = (level: number) => {
    switch (level) {
      case 0: return 'bg-gray-100 text-gray-800'
      case 1: return 'bg-blue-100 text-blue-800'
      case 2: return 'bg-green-100 text-green-800'
      case 3: return 'bg-yellow-100 text-yellow-800'
      case 4: return 'bg-purple-100 text-purple-800'
      case 5: return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getLevelName = (level: number) => {
    switch (level) {
      case 0: return '무료 회원'
      case 1: return '베이직'
      case 2: return '스탠다드'
      case 3: return '프리미엄'
      case 4: return 'VIP'
      case 5: return 'VVIP'
      default: return '알 수 없음'
    }
  }

  const getSecurityStatusBadge = (status: string) => {
    switch (status) {
      case 'NORMAL': return { color: 'bg-green-100 text-green-800', text: '정상' }
      case 'WARNING': return { color: 'bg-yellow-100 text-yellow-800', text: '주의' }
      case 'SUSPICIOUS': return { color: 'bg-orange-100 text-orange-800', text: '의심' }
      case 'BLOCKED': return { color: 'bg-red-100 text-red-800', text: '차단' }
      default: return { color: 'bg-gray-100 text-gray-800', text: status }
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const securityStatus = getSecurityStatusBadge(user.security_status)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="bg-white shadow">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-gray-900">
            실시간 종목 추천
          </Link>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">{user.name}님</span>
            <button
              onClick={handleLogout}
              className="text-sm text-red-600 hover:text-red-700"
            >
              로그아웃
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">마이페이지</h1>

        {/* 탭 네비게이션 */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('info')}
                className={`px-6 py-3 text-sm font-medium border-b-2 ${
                  activeTab === 'info'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                내 정보
              </button>
              <button
                onClick={() => setActiveTab('sessions')}
                className={`px-6 py-3 text-sm font-medium border-b-2 ${
                  activeTab === 'sessions'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                접속 기기 관리
              </button>
              <button
                onClick={() => setActiveTab('security')}
                className={`px-6 py-3 text-sm font-medium border-b-2 ${
                  activeTab === 'security'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                보안
              </button>
            </nav>
          </div>
        </div>

        {/* 내 정보 탭 */}
        {activeTab === 'info' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">회원 정보</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <span className="text-sm text-gray-500">아이디</span>
                <span className="text-sm font-medium text-gray-900">{user.user_id}</span>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <span className="text-sm text-gray-500">이름</span>
                <span className="text-sm font-medium text-gray-900">{user.name}</span>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <span className="text-sm text-gray-500">성별</span>
                <span className="text-sm font-medium text-gray-900">
                  {user.gender === 'M' ? '남성' : '여성'}
                </span>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <span className="text-sm text-gray-500">출생년도</span>
                <span className="text-sm font-medium text-gray-900">{user.birth_year}년</span>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <span className="text-sm text-gray-500">회원 등급</span>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getLevelBadgeColor(user.membership_level)}`}>
                  {getLevelName(user.membership_level)}
                </span>
              </div>
              {user.membership_expires_at && (
                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                  <span className="text-sm text-gray-500">멤버십 만료일</span>
                  <span className="text-sm font-medium text-gray-900">
                    {formatDate(user.membership_expires_at)}
                  </span>
                </div>
              )}
              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <span className="text-sm text-gray-500">가입일</span>
                <span className="text-sm font-medium text-gray-900">
                  {user.created_at ? formatDate(user.created_at) : '-'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* 접속 기기 관리 탭 */}
        {activeTab === 'sessions' && (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">접속 중인 기기</h2>
                {sessionInfo && (
                  <p className="text-sm text-gray-500 mt-1">
                    {sessionInfo.active_sessions}개 접속 중 / 최대 {sessionInfo.max_sessions}개 허용
                  </p>
                )}
              </div>
              {sessions.length > 1 && (
                <button
                  onClick={terminateOtherSessions}
                  className="text-sm text-red-600 hover:text-red-700"
                >
                  다른 기기 모두 로그아웃
                </button>
              )}
            </div>

            {isLoadingSessions ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
              </div>
            ) : (
              <div className="space-y-3">
                {sessions.map((session) => (
                  <div
                    key={session.id}
                    className={`p-4 border rounded-lg ${
                      session.is_current ? 'border-blue-200 bg-blue-50' : 'border-gray-200'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-gray-900">
                            {session.device_type === 'PC' && '💻'}
                            {session.device_type === 'Mobile' && '📱'}
                            {session.device_type === 'Tablet' && '📟'}
                            {' '}{session.browser} - {session.os}
                          </span>
                          {session.is_current && (
                            <span className="px-2 py-0.5 text-xs bg-blue-100 text-blue-800 rounded-full">
                              현재 기기
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500 mt-1">
                          IP: {session.ip_address}
                        </p>
                        <p className="text-sm text-gray-400 mt-1">
                          로그인: {formatDate(session.login_at)}
                        </p>
                        <p className="text-sm text-gray-400">
                          마지막 활동: {formatDate(session.last_activity_at)}
                        </p>
                      </div>
                      {!session.is_current && (
                        <button
                          onClick={() => terminateSession(session.id)}
                          className="text-sm text-red-600 hover:text-red-700"
                        >
                          로그아웃
                        </button>
                      )}
                    </div>
                  </div>
                ))}

                {sessions.length === 0 && (
                  <p className="text-center text-gray-500 py-4">
                    접속 중인 기기가 없습니다.
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* 보안 탭 */}
        {activeTab === 'security' && (
          <div className="space-y-6">
            {/* 보안 상태 */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">보안 상태</h2>
              <div className="flex items-center space-x-3">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${securityStatus.color}`}>
                  {securityStatus.text}
                </span>
                <p className="text-sm text-gray-600">
                  {user.security_status === 'NORMAL' && '계정이 안전하게 보호되고 있습니다.'}
                  {user.security_status === 'WARNING' && '보안에 주의가 필요합니다.'}
                  {user.security_status === 'SUSPICIOUS' && '의심스러운 활동이 감지되었습니다.'}
                  {user.security_status === 'BLOCKED' && '보안 문제로 계정이 제한되었습니다.'}
                </p>
              </div>
            </div>

            {/* 보안 팁 */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">보안 안내</h2>
              <ul className="space-y-3 text-sm text-gray-600">
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  정기적으로 비밀번호를 변경해주세요.
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  공용 기기에서 사용 후 반드시 로그아웃해주세요.
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  다른 지역에서의 로그인 시도가 감지되면 알림을 받습니다.
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  의심스러운 활동이 발생하면 즉시 고객센터에 문의하세요.
                </li>
              </ul>
            </div>

            {/* 동시 접속 안내 */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">동시 접속 안내</h2>
              <p className="text-sm text-gray-600 mb-4">
                회원 등급에 따라 동시에 접속 가능한 기기 수가 제한됩니다.
              </p>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">무료 회원</span>
                  <span className="text-gray-900">1대</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">베이직 ~ 프리미엄</span>
                  <span className="text-gray-900">2대</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">VIP ~ VVIP</span>
                  <span className="text-gray-900">3대</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
