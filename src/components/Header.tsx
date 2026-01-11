'use client'

import React from 'react'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'

export default function Header() {
  const { user, isLoggedIn, isLoading, logout } = useAuth()

  const handleLogout = async () => {
    await logout()
  }

  const getLevelBadgeColor = (level: number) => {
    switch (level) {
      case 0: return 'bg-gray-100 text-gray-700'
      case 1: return 'bg-blue-100 text-blue-700'
      case 2: return 'bg-green-100 text-green-700'
      case 3: return 'bg-yellow-100 text-yellow-700'
      case 4: return 'bg-purple-100 text-purple-700'
      case 5: return 'bg-red-100 text-red-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getLevelName = (level: number) => {
    switch (level) {
      case 0: return '무료'
      case 1: return '베이직'
      case 2: return '스탠다드'
      case 3: return '프리미엄'
      case 4: return 'VIP'
      case 5: return 'VVIP'
      default: return ''
    }
  }

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-gray-900">
            실시간 종목 추천
          </Link>

          <div className="flex items-center space-x-4">
            {isLoading ? (
              <div className="animate-pulse bg-gray-200 h-8 w-24 rounded"></div>
            ) : isLoggedIn && user ? (
              <>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">{user.name}님</span>
                  <span className={`px-2 py-0.5 text-xs rounded-full ${getLevelBadgeColor(user.membership_level)}`}>
                    {getLevelName(user.membership_level)}
                  </span>
                </div>
                <Link
                  href="/mypage"
                  className="text-sm text-gray-600 hover:text-gray-900"
                >
                  마이페이지
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-sm text-red-600 hover:text-red-700"
                >
                  로그아웃
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-sm text-gray-600 hover:text-gray-900"
                >
                  로그인
                </Link>
                <Link
                  href="/register"
                  className="text-sm px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  회원가입
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
