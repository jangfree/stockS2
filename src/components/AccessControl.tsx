'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

interface AccessControlProps {
  children: React.ReactNode
  requiredLevel: number
  pageName?: string
}

export default function AccessControl({ children, requiredLevel, pageName = '이 서비스' }: AccessControlProps) {
  const { user, isLoggedIn, isLoading } = useAuth()
  const router = useRouter()
  const [showModal, setShowModal] = useState(false)
  const [accessDenied, setAccessDenied] = useState(false)

  useEffect(() => {
    if (isLoading) return

    // 비로그인 사용자
    if (!isLoggedIn || !user) {
      setShowModal(true)
      setAccessDenied(true)
      return
    }

    // 등급 미달 사용자
    if (user.membership_level < requiredLevel) {
      setAccessDenied(true)
      router.push('/upgrade')
      return
    }

    // 정상 접근
    setAccessDenied(false)
  }, [isLoggedIn, user, isLoading, requiredLevel, router])

  const handleModalConfirm = () => {
    setShowModal(false)
    router.push('/register')
  }

  const handleModalCancel = () => {
    setShowModal(false)
    router.push('/')
  }

  // 로딩 중
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  // 회원가입 유도 모달
  if (showModal) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
          <h3 className="text-lg font-bold text-gray-900 mb-2">회원가입이 필요합니다</h3>
          <p className="text-gray-600 mb-6">
            {pageName}는 {requiredLevel}단계 이상 회원만 이용 가능합니다.<br />
            회원가입 후 프리미엄 서비스를 이용해 보세요.
          </p>
          <div className="flex space-x-3">
            <button
              onClick={handleModalCancel}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              취소
            </button>
            <button
              onClick={handleModalConfirm}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              회원가입하기
            </button>
          </div>
        </div>
      </div>
    )
  }

  // 접근 거부 (리다이렉트 중)
  if (accessDenied) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">페이지 이동 중...</p>
        </div>
      </div>
    )
  }

  // 정상 접근 - 자식 컴포넌트 렌더링
  return <>{children}</>
}
