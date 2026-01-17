/**
 * 등급 업그레이드 안내 페이지
 * 0단계(무료) 회원에게 프리미엄 서비스 가입 안내
 */

import Link from 'next/link'
import Header from '@/components/Header'

export default function UpgradePage() {
  // 등급별 정보
  const levels = [
    { level: 1, name: '1단계', price: '100,000', benefits: '단타 + 중장기 추천' },
    { level: 2, name: '2단계', price: '200,000', benefits: '+ 프리미엄 분석' },
    { level: 3, name: '3단계', price: '300,000', benefits: '+ VIP 리포트' },
    { level: 4, name: '4단계', price: '400,000', benefits: '+ 1:1 상담' },
    { level: 5, name: '5단계', price: '500,000', benefits: '+ 전체 서비스' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* 헤더 */}
      <Header />

      <div className="container mx-auto py-12 px-4">
        {/* 페이지 타이틀 */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            프리미엄 서비스 이용 안내
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            실시간 종목 추천 서비스를 이용하시려면<br />
            <span className="text-blue-600 font-semibold">1단계 이상</span> 회원 가입이 필요합니다.
          </p>
        </div>

        {/* 등급별 혜택 테이블 */}
        <div className="max-w-3xl mx-auto mb-12">
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="bg-blue-600 text-white px-6 py-4">
              <h2 className="text-xl font-bold">회원 등급별 혜택</h2>
            </div>
            <div className="p-6">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-gray-700">등급</th>
                    <th className="text-center py-3 px-4 text-gray-700">월 이용료</th>
                    <th className="text-left py-3 px-4 text-gray-700">혜택</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <td className="py-4 px-4">
                      <span className="inline-block bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                        0단계 (무료)
                      </span>
                    </td>
                    <td className="py-4 px-4 text-center text-gray-600">무료</td>
                    <td className="py-4 px-4 text-gray-600">기본 기능만 이용 가능</td>
                  </tr>
                  {levels.map((item) => (
                    <tr key={item.level} className="border-b border-gray-100 hover:bg-blue-50">
                      <td className="py-4 px-4">
                        <span className={`inline-block px-3 py-1 rounded-full text-sm ${
                          item.level === 1 ? 'bg-blue-100 text-blue-700' :
                          item.level === 2 ? 'bg-green-100 text-green-700' :
                          item.level === 3 ? 'bg-yellow-100 text-yellow-700' :
                          item.level === 4 ? 'bg-purple-100 text-purple-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {item.name}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-center font-semibold text-gray-900">
                        {item.price}원
                      </td>
                      <td className="py-4 px-4 text-gray-600">{item.benefits}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* 입금 안내 */}
        <div className="max-w-3xl mx-auto mb-12">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
              <svg className="w-6 h-6 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
              입금 안내
            </h2>

            <div className="bg-blue-50 rounded-lg p-6 mb-6">
              <div className="grid md:grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-sm text-gray-500 mb-1">은행명</p>
                  <p className="font-bold text-gray-900">OO은행</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">계좌번호</p>
                  <p className="font-bold text-gray-900">123-456-789012</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">예금주</p>
                  <p className="font-bold text-gray-900">홍길동</p>
                </div>
              </div>
            </div>

            <div className="space-y-3 text-gray-600">
              <p className="flex items-start">
                <svg className="w-5 h-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                입금 시 <span className="font-semibold text-gray-900">회원 아이디</span>를 입금자명에 기재해 주세요.
              </p>
              <p className="flex items-start">
                <svg className="w-5 h-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                입금 확인 후 <span className="font-semibold text-gray-900">24시간 이내</span> 등급이 업그레이드됩니다.
              </p>
              <p className="flex items-start">
                <svg className="w-5 h-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                문의사항은 마이페이지에서 확인해 주세요.
              </p>
            </div>
          </div>
        </div>

        {/* 하단 버튼 */}
        <div className="text-center space-y-4">
          <Link
            href="/mypage"
            className="inline-block px-8 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            마이페이지로 이동
          </Link>
          <p className="text-sm text-gray-500">
            아직 회원이 아니신가요?{' '}
            <Link href="/register" className="text-blue-600 hover:underline">
              회원가입하기
            </Link>
          </p>
        </div>
      </div>

      {/* 푸터 */}
      <footer className="bg-gray-900 text-gray-400 py-8 mt-12">
        <div className="container mx-auto px-4 text-center">
          <p>&copy; 2026 실시간 종목 추천 서비스. All rights reserved.</p>
          <p className="text-sm mt-2">투자에 대한 책임은 본인에게 있습니다.</p>
        </div>
      </footer>
    </div>
  )
}
