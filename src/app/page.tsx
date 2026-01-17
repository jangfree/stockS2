/**
 * 메인 랜딩 페이지
 * 서비스 소개 및 메뉴 안내
 */

import Link from 'next/link'
import Header from '@/components/Header'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* 헤더 */}
      <Header />

      {/* 히어로 섹션 */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            실시간 종목 추천 서비스
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            전문 분석가의 실시간 추천 종목을 확인하세요.<br />
            단타부터 중장기까지, 다양한 투자 전략을 제공합니다.
          </p>
        </div>

        {/* 서비스 카드 */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* 오늘의 단타 종목 카드 */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
            <div className="h-2 bg-blue-500"></div>
            <div className="p-8">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900">오늘의 단타 종목</h2>
              </div>
              <p className="text-gray-600 mb-6">
                거래량 상위 종목과 테마주를 실시간으로 분석하여 추천합니다.
                빠른 매매를 원하시는 분들께 적합합니다.
              </p>
              <ul className="text-sm text-gray-500 mb-6 space-y-2">
                <li className="flex items-center">
                  <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  실시간 거래량 분석
                </li>
                <li className="flex items-center">
                  <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  테마주 실시간 추천
                </li>
                <li className="flex items-center">
                  <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  네이버 금융 바로가기
                </li>
              </ul>
              <Link
                href="/today"
                className="block w-full text-center px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                바로가기
              </Link>
            </div>
          </div>

          {/* 중장기 종목추천 카드 */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
            <div className="h-2 bg-green-500"></div>
            <div className="p-8">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900">중장기 종목추천</h2>
              </div>
              <p className="text-gray-600 mb-6">
                패턴 분석과 기술적 지표를 기반으로 중장기 투자에 적합한 종목을 추천합니다.
              </p>
              <ul className="text-sm text-gray-500 mb-6 space-y-2">
                <li className="flex items-center">
                  <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  추천강도 및 예상수익률
                </li>
                <li className="flex items-center">
                  <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  리스크 레벨 분석
                </li>
                <li className="flex items-center">
                  <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  주요 패턴 정보
                </li>
              </ul>
              <Link
                href="/long-term"
                className="block w-full text-center px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
              >
                바로가기
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 안내 섹션 */}
      <section className="bg-white py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">이용 안내</h2>
            <p className="text-gray-600">프리미엄 서비스를 이용하려면 1단계 이상 회원 가입이 필요합니다.</p>
          </div>

          <div className="max-w-2xl mx-auto">
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="font-bold text-gray-900 mb-4">회원 등급별 혜택</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                  <span className="text-gray-600">0단계 (무료)</span>
                  <span className="text-gray-500">기본 기능</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                  <span className="text-blue-600 font-medium">1단계 ~ 5단계</span>
                  <span className="text-blue-600 font-medium">단타 + 중장기 추천</span>
                </div>
              </div>
              <div className="mt-6 text-center">
                <Link
                  href="/register"
                  className="inline-block px-8 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  회원가입하기
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 푸터 */}
      <footer className="bg-gray-900 text-gray-400 py-8">
        <div className="container mx-auto px-4 text-center">
          <p>&copy; 2026 실시간 종목 추천 서비스. All rights reserved.</p>
          <p className="text-sm mt-2">투자에 대한 책임은 본인에게 있습니다.</p>
        </div>
      </footer>
    </div>
  )
}
