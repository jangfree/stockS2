/**
 * 개인정보처리방침 페이지
 */

import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export const metadata = {
  title: '개인정보처리방침 - 실시간 종목 추천',
  description: '실시간 종목 추천 서비스 개인정보처리방침',
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Header />

      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">개인정보처리방침</h1>

        <div className="bg-white rounded-lg shadow-md p-8 space-y-8 text-gray-700 leading-relaxed">

          <p className="text-sm text-gray-500">시행일자: 2026년 1월 30일</p>

          {/* 제1조 */}
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">제1조 (목적)</h2>
            <p>
              &ldquo;실시간 종목 추천 서비스&rdquo;(이하 &ldquo;서비스&rdquo;)는 이용자의 개인정보를 중요시하며,
              「개인정보 보호법」, 「정보통신망 이용촉진 및 정보보호 등에 관한 법률」 등 관련 법령을 준수합니다.
              본 개인정보처리방침은 서비스가 수집하는 개인정보의 항목, 수집 목적, 보유 기간, 이용자의 권리 및
              보호 조치에 대해 안내합니다.
            </p>
          </section>

          {/* 제2조 */}
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">제2조 (수집하는 개인정보 항목)</h2>
            <p className="mb-2">서비스는 회원가입 및 서비스 이용을 위해 아래의 개인정보를 수집합니다.</p>
            <div className="bg-gray-50 rounded-lg p-4">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 pr-4 text-gray-900">구분</th>
                    <th className="text-left py-2 text-gray-900">항목</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-100">
                    <td className="py-2 pr-4 font-medium">필수 항목</td>
                    <td className="py-2">아이디(이메일), 비밀번호, 이름(닉네임)</td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-2 pr-4 font-medium">자동 수집</td>
                    <td className="py-2">접속 IP, 접속 시간, 브라우저 정보, 기기 정보</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-4 font-medium">선택 항목</td>
                    <td className="py-2">가입 경로(추천인)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* 제3조 */}
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">제3조 (개인정보의 수집 및 이용 목적)</h2>
            <ul className="list-disc list-inside space-y-1">
              <li>회원 가입 및 본인 확인</li>
              <li>서비스 제공 및 회원 등급별 콘텐츠 접근 관리</li>
              <li>부정 이용 방지 및 비인가 접근 탐지</li>
              <li>서비스 개선 및 통계 분석</li>
              <li>공지사항 및 서비스 관련 안내</li>
            </ul>
          </section>

          {/* 제4조 */}
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">제4조 (개인정보의 보유 및 이용 기간)</h2>
            <p className="mb-2">
              이용자의 개인정보는 수집 목적이 달성된 후 지체 없이 파기합니다.
              단, 관련 법령에 의해 보존할 필요가 있는 경우 해당 기간 동안 보관합니다.
            </p>
            <div className="bg-gray-50 rounded-lg p-4">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 pr-4 text-gray-900">보존 항목</th>
                    <th className="text-left py-2 pr-4 text-gray-900">보존 기간</th>
                    <th className="text-left py-2 text-gray-900">근거 법령</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-100">
                    <td className="py-2 pr-4">로그인 기록</td>
                    <td className="py-2 pr-4">3개월</td>
                    <td className="py-2">통신비밀보호법</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-4">서비스 이용 기록</td>
                    <td className="py-2 pr-4">3개월</td>
                    <td className="py-2">통신비밀보호법</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* 제5조 */}
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">제5조 (개인정보의 제3자 제공)</h2>
            <p>
              서비스는 이용자의 개인정보를 제3자에게 제공하지 않습니다.
              다만, 법령에 의해 요구되는 경우 또는 이용자가 사전에 동의한 경우는 예외로 합니다.
            </p>
          </section>

          {/* 제6조 */}
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">제6조 (개인정보 처리 위탁)</h2>
            <p className="mb-2">서비스는 원활한 서비스 제공을 위해 아래와 같이 개인정보 처리를 위탁합니다.</p>
            <div className="bg-gray-50 rounded-lg p-4">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 pr-4 text-gray-900">수탁업체</th>
                    <th className="text-left py-2 text-gray-900">위탁 업무</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-100">
                    <td className="py-2 pr-4">Supabase Inc.</td>
                    <td className="py-2">데이터베이스 호스팅 및 인증 서비스</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-4">Vercel Inc.</td>
                    <td className="py-2">웹 애플리케이션 호스팅</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* 제7조 */}
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">제7조 (이용자의 권리 및 행사 방법)</h2>
            <p className="mb-2">이용자는 언제든지 다음의 권리를 행사할 수 있습니다.</p>
            <ul className="list-disc list-inside space-y-1">
              <li>개인정보 열람 요구</li>
              <li>개인정보 정정 및 삭제 요구</li>
              <li>개인정보 처리 정지 요구</li>
              <li>회원 탈퇴 (마이페이지에서 직접 처리 가능)</li>
            </ul>
            <p className="mt-2">
              위 요구사항은 서비스 내 마이페이지 또는 아래 연락처를 통해 처리할 수 있습니다.
            </p>
          </section>

          {/* 제8조 */}
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">제8조 (개인정보의 안전성 확보 조치)</h2>
            <p className="mb-2">서비스는 개인정보의 안전성 확보를 위해 다음과 같은 조치를 취하고 있습니다.</p>
            <ul className="list-disc list-inside space-y-1">
              <li>비밀번호 암호화 저장 (bcrypt 해시)</li>
              <li>HTTPS(SSL/TLS) 암호화 통신</li>
              <li>접근 권한 관리 및 제한</li>
              <li>비정상 접근 탐지 및 차단</li>
              <li>세션 관리 및 다중 기기 로그인 제한</li>
            </ul>
          </section>

          {/* 제9조 */}
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">제9조 (쿠키 및 자동 수집 장치)</h2>
            <p>
              서비스는 로그인 세션 유지를 위해 쿠키(Cookie)를 사용합니다.
              이용자는 브라우저 설정을 통해 쿠키 저장을 거부할 수 있으나,
              이 경우 로그인이 필요한 서비스 이용에 제한이 있을 수 있습니다.
            </p>
          </section>

          {/* 제10조 */}
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">제10조 (광고성 정보 및 제3자 서비스)</h2>
            <p>
              서비스는 Google AdSense를 통해 광고를 게재할 수 있습니다.
              Google AdSense는 사용자의 관심사에 기반한 광고를 표시하기 위해
              쿠키를 사용할 수 있으며, 이에 대한 자세한 내용은{' '}
              <a
                href="https://policies.google.com/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                Google 개인정보처리방침
              </a>
              을 참고하시기 바랍니다.
              이용자는{' '}
              <a
                href="https://www.google.com/settings/ads"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                Google 광고 설정
              </a>
              에서 맞춤 광고를 비활성화할 수 있습니다.
            </p>
          </section>

          {/* 제11조 */}
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">제11조 (개인정보 보호책임자)</h2>
            <div className="bg-gray-50 rounded-lg p-4">
              <p>서비스 이용 중 개인정보 관련 문의사항이 있으시면 아래로 연락해 주시기 바랍니다.</p>
              <ul className="mt-2 space-y-1">
                <li>담당: 개인정보 보호책임자</li>
                <li>이메일: privacy@example.com</li>
              </ul>
            </div>
            <p className="mt-3 text-sm text-gray-500">
              기타 개인정보 침해에 대한 신고나 상담이 필요하신 경우 아래 기관에 문의하실 수 있습니다.
            </p>
            <ul className="mt-1 text-sm text-gray-500 space-y-1">
              <li>- 개인정보침해신고센터 (privacy.kisa.or.kr / 118)</li>
              <li>- 대검찰청 사이버수사과 (spo.go.kr / 1301)</li>
              <li>- 경찰청 사이버안전국 (cyberbureau.police.go.kr / 182)</li>
            </ul>
          </section>

          {/* 제12조 */}
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">제12조 (면책 조항)</h2>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="font-medium text-yellow-800">
                본 서비스에서 제공하는 종목 추천 정보는 투자 권유가 아니며, 참고 자료로만 활용하시기 바랍니다.
                투자에 따른 모든 손실과 책임은 투자자 본인에게 있습니다.
              </p>
            </div>
          </section>

          {/* 제13조 */}
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">제13조 (방침 변경)</h2>
            <p>
              본 개인정보처리방침은 법령, 정책 또는 서비스 변경에 따라 수정될 수 있으며,
              변경 시 서비스 내 공지를 통해 안내합니다.
            </p>
          </section>

          <div className="pt-4 border-t border-gray-200 text-sm text-gray-500">
            <p>본 방침은 2026년 1월 30일부터 시행됩니다.</p>
          </div>
        </div>

        {/* 홈으로 돌아가기 */}
        <div className="mt-8 text-center">
          <Link
            href="/"
            className="text-blue-600 hover:underline font-medium"
          >
            홈으로 돌아가기
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  )
}
