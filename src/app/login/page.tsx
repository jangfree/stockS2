'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { ActiveSession } from '@/lib/types/member'

export default function LoginPage() {
  const router = useRouter()
  const { login, isLoggedIn, isLoading } = useAuth()

  const [userId, setUserId] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // 세션 제한 모달 상태
  const [showSessionModal, setShowSessionModal] = useState(false)
  const [activeSessions, setActiveSessions] = useState<ActiveSession[]>([])
  const [maxSessions, setMaxSessions] = useState(1)
  const [selectedSessionId, setSelectedSessionId] = useState<number | null>(null)

  // 이미 로그인된 경우 리다이렉트
  useEffect(() => {
    if (!isLoading && isLoggedIn) {
      router.push('/')
    }
  }, [isLoggedIn, isLoading, router])

  const handleSubmit = async (e: React.FormEvent, options?: { force_login?: boolean; terminate_session_id?: number }) => {
    e.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      await login(userId, password, options)
      router.push('/')
    } catch (err: unknown) {
      const error = err as { code?: string; message?: string; active_sessions?: ActiveSession[]; max_sessions?: number }

      if (error.code === 'SESSION_LIMIT_EXCEEDED') {
        // 세션 제한 초과 - 모달 표시
        setActiveSessions(error.active_sessions || [])
        setMaxSessions(error.max_sessions || 1)
        setShowSessionModal(true)
      } else {
        setError(error.message || '로그인에 실패했습니다.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleForceLogin = async () => {
    setShowSessionModal(false)
    setIsSubmitting(true)

    try {
      if (selectedSessionId) {
        // 특정 세션 종료 후 로그인
        await login(userId, password, { terminate_session_id: selectedSessionId })
      } else {
        // 강제 로그인 (가장 오래된 세션 종료)
        await login(userId, password, { force_login: true })
      }
      router.push('/')
    } catch (err: unknown) {
      const error = err as { message?: string }
      setError(error.message || '로그인에 실패했습니다.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          로그인
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          아직 계정이 없으신가요?{' '}
          <Link href="/register" className="font-medium text-blue-600 hover:text-blue-500">
            회원가입
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="userId" className="block text-sm font-medium text-gray-700">
                아이디
              </label>
              <div className="mt-1">
                <input
                  id="userId"
                  name="userId"
                  type="text"
                  autoComplete="username"
                  required
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="아이디를 입력하세요"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                비밀번호
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="비밀번호를 입력하세요"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? '로그인 중...' : '로그인'}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">또는</span>
              </div>
            </div>

            <div className="mt-6">
              <Link
                href="/"
                className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                홈으로 돌아가기
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* 세션 제한 모달 */}
      {showSessionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              동시 접속 제한
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              현재 {activeSessions.length}개의 기기에서 접속 중입니다.
              (최대 {maxSessions}개 허용)
            </p>
            <p className="text-sm text-gray-600 mb-4">
              계속하려면 기존 세션 중 하나를 종료해야 합니다.
            </p>

            <div className="space-y-2 mb-6 max-h-60 overflow-y-auto">
              {activeSessions.map((session) => (
                <div
                  key={session.id}
                  onClick={() => setSelectedSessionId(session.id)}
                  className={`p-3 border rounded-md cursor-pointer transition-colors ${
                    selectedSessionId === session.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {session.device_type} - {session.browser}
                      </p>
                      <p className="text-xs text-gray-500">
                        {session.os} | IP: {session.ip_address}
                      </p>
                      <p className="text-xs text-gray-400">
                        로그인: {formatDate(session.login_at)}
                      </p>
                    </div>
                    {selectedSessionId === session.id && (
                      <span className="text-blue-500">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowSessionModal(false)
                  setSelectedSessionId(null)
                }}
                className="flex-1 py-2 px-4 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                취소
              </button>
              <button
                onClick={handleForceLogin}
                className="flex-1 py-2 px-4 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                {selectedSessionId ? '선택 세션 종료 후 로그인' : '가장 오래된 세션 종료'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
