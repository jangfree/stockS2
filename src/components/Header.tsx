'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

// 메뉴 구조 정의 (향후 확장 가능)
const menuItems = [
  { name: '오늘의 단타 종목', path: '/today', requiredLevel: 1 },
  { name: '중기 종목추천', path: '/long-term', requiredLevel: 1 },
]

export default function Header() {
  const { user, isLoggedIn, isLoading, logout } = useAuth()
  const pathname = usePathname()
  const router = useRouter()
  const [showModal, setShowModal] = useState(false)
  const [pendingPath, setPendingPath] = useState<string | null>(null)

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

  const handleMenuClick = (item: typeof menuItems[0], e: React.MouseEvent) => {
    e.preventDefault()

    // 비로그인 사용자
    if (!isLoggedIn || !user) {
      setPendingPath(item.path)
      setShowModal(true)
      return
    }

    // 등급 미달 사용자
    if (user.membership_level < item.requiredLevel) {
      router.push('/upgrade')
      return
    }

    // 정상 접근
    router.push(item.path)
  }

  const handleModalConfirm = () => {
    setShowModal(false)
    router.push('/register')
  }

  const handleModalCancel = () => {
    setShowModal(false)
    setPendingPath(null)
  }

  return (
    <>
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* 로고 */}
            <Link href="/" className="text-xl font-bold text-gray-900">
              실시간 종목 추천
            </Link>

            {/* 메뉴 */}
            <nav className="hidden md:flex items-center space-x-3">
              {menuItems.map((item, index) => (
                <a
                  key={item.path}
                  href={item.path}
                  onClick={(e) => handleMenuClick(item, e)}
                  className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                    pathname === item.path
                      ? index === 0
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-green-600 text-white shadow-md'
                      : index === 0
                        ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                        : 'bg-green-100 text-green-700 hover:bg-green-200'
                  }`}
                >
                  {item.name}
                </a>
              ))}
            </nav>

            {/* 사용자 영역 */}
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

          {/* 모바일 메뉴 */}
          <nav className="md:hidden mt-3 pt-3 border-t border-gray-100 flex space-x-2">
            {menuItems.map((item, index) => (
              <a
                key={item.path}
                href={item.path}
                onClick={(e) => handleMenuClick(item, e)}
                className={`px-3 py-1.5 rounded-lg text-sm font-semibold ${
                  pathname === item.path
                    ? index === 0
                      ? 'bg-blue-600 text-white'
                      : 'bg-green-600 text-white'
                    : index === 0
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-green-100 text-green-700'
                }`}
              >
                {item.name}
              </a>
            ))}
          </nav>
        </div>
      </header>

      {/* 회원가입 유도 모달 */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={handleModalCancel}></div>
          <div className="relative bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold text-gray-900 mb-2">회원가입이 필요합니다</h3>
            <p className="text-gray-600 mb-6">
              이 서비스는 1단계 이상 회원만 이용 가능합니다.<br />
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
      )}
    </>
  )
}
