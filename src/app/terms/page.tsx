/**
 * 이용약관 및 면책조항 페이지
 */

import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export const metadata = {
  title: '이용약관 - 실시간 종목 추천',
  description: '실시간 종목 추천 서비스 이용약관 및 면책조항',
}

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Header />

      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">이용약관</h1>

        <div className="bg-white rounded-lg shadow-md p-8 space-y-8 text-gray-700 leading-relaxed">

          <p className="text-sm text-gray-500">시행일자: 2026년 1월 30일</p>

          {/* 제1조 */}
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">제1조 (목적)</h2>
            <p>
              본 약관은 &ldquo;실시간 종목 추천 서비스&rdquo;(이하 &ldquo;서비스&rdquo;)의 이용과 관련하여
              서비스 제공자와 이용자 간의 권리, 의무 및 책임사항을 규정함을 목적으로 합니다.
            </p>
          </section>

          {/* 제2조 */}
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">제2조 (서비스의 내용)</h2>
            <p className="mb-2">서비스는 다음과 같은 정보를 제공합니다.</p>
            <ul className="list-disc list-inside space-y-1">
              <li>패턴 분석 기반의 단기 매매 종목 정보 (오늘의 단타 종목)</li>
              <li>중기 투자 적합 종목 정보 (중기 종목추천)</li>
              <li>종목별 기술적 분석 데이터 (현재가, 등락률, 거래량, 패턴 등)</li>
            </ul>
          </section>

          {/* 제3조 - 이용 자격 */}
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">제3조 (이용 자격)</h2>
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 space-y-2">
              <p>
                본 서비스는 <strong>만 18세 이상</strong>의 이용자만 가입 및 이용이 가능합니다.
              </p>
              <p>
                금융 투자 정보를 다루는 서비스 특성상, 미성년자의 이용을 제한하며,
                만 18세 미만의 이용자가 가입한 사실이 확인될 경우 사전 통보 없이
                계정이 해지될 수 있습니다.
              </p>
              <p>
                이용자는 회원가입 시 만 18세 이상임을 확인하며, 이에 대한 책임은
                이용자 본인에게 있습니다.
              </p>
            </div>
          </section>

          {/* 제4조 - 핵심 면책조항 */}
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">제4조 (투자 관련 면책조항)</h2>
            <div className="bg-red-50 border-2 border-red-300 rounded-lg p-5 space-y-3">
              <p className="font-bold text-red-800 text-lg">
                본 서비스에서 제공하는 모든 정보는 투자 권유가 아닙니다.
              </p>
              <ul className="list-disc list-inside space-y-2 text-red-900">
                <li>
                  서비스에서 제공하는 종목 추천, 패턴 분석, 수익률 정보 등은
                  기술적 분석에 기반한 <strong>참고 자료</strong>이며, 특정 종목의 매수 또는 매도를
                  권유하는 것이 아닙니다.
                </li>
                <li>
                  투자에 따른 <strong>모든 판단과 결정은 이용자 본인</strong>의 책임 하에 이루어져야 하며,
                  투자 손실에 대해 서비스 제공자는 어떠한 법적 책임도 지지 않습니다.
                </li>
                <li>
                  과거의 패턴이나 수익률이 미래의 수익을 보장하지 않습니다.
                </li>
                <li>
                  서비스에서 제공하는 정보의 정확성, 완전성, 적시성을 보장하지 않으며,
                  데이터 오류, 시스템 장애 등으로 인한 손실에 대해 책임지지 않습니다.
                </li>
                <li>
                  이용자는 투자 결정 전 반드시 전문 투자 상담사와 상의하시기 바랍니다.
                </li>
              </ul>
            </div>
          </section>

          {/* 제5조 */}
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">제5조 (서비스 이용)</h2>
            <ul className="list-disc list-inside space-y-1">
              <li>서비스 이용을 위해서는 회원가입이 필요하며, 등급에 따라 이용 가능한 콘텐츠가 다릅니다.</li>
              <li>이용자는 본인의 계정 정보를 안전하게 관리할 책임이 있습니다.</li>
              <li>타인의 계정을 도용하거나 부정한 방법으로 서비스를 이용하는 행위를 금지합니다.</li>
              <li>서비스에서 제공하는 정보를 무단으로 복제, 배포, 상업적으로 이용하는 행위를 금지합니다.</li>
            </ul>
          </section>

          {/* 제6조 */}
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">제6조 (서비스 변경 및 중단)</h2>
            <ul className="list-disc list-inside space-y-1">
              <li>서비스 제공자는 운영상, 기술상의 필요에 따라 서비스의 전부 또는 일부를 변경하거나 중단할 수 있습니다.</li>
              <li>서비스 중단 시 사전에 공지하며, 불가피한 경우 사후 공지할 수 있습니다.</li>
              <li>무료로 제공되는 서비스의 변경 또는 중단에 대해 별도의 보상을 하지 않습니다.</li>
            </ul>
          </section>

          {/* 제7조 */}
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">제7조 (지적재산권)</h2>
            <p>
              서비스에서 제공하는 분석 알고리즘, 추천 로직, 화면 디자인 및 콘텐츠에 대한 지적재산권은
              서비스 제공자에게 귀속됩니다. 이용자는 서비스를 통해 얻은 정보를
              서비스 제공자의 사전 동의 없이 상업적으로 이용하거나 제3자에게 제공할 수 없습니다.
            </p>
          </section>

          {/* 제8조 */}
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">제8조 (손해배상의 제한)</h2>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <ul className="list-disc list-inside space-y-2">
                <li>
                  서비스 제공자는 무료로 제공하는 서비스의 이용과 관련하여 이용자에게
                  발생한 어떠한 손해에 대해서도 책임을 지지 않습니다.
                </li>
                <li>
                  서비스 제공자는 천재지변, 시스템 장애, 통신 장애 등 불가항력적 사유로 인한
                  서비스 중단 및 이로 인한 손해에 대해 책임을 지지 않습니다.
                </li>
                <li>
                  이용자가 서비스에서 제공한 정보를 바탕으로 행한 투자 행위에 대한
                  결과(이익 또는 손실)는 전적으로 이용자 본인에게 귀속됩니다.
                </li>
              </ul>
            </div>
          </section>

          {/* 제9조 */}
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">제9조 (회원 탈퇴 및 자격 상실)</h2>
            <ul className="list-disc list-inside space-y-1">
              <li>회원은 언제든지 마이페이지를 통해 탈퇴를 요청할 수 있습니다.</li>
              <li>다음의 경우 사전 통보 없이 이용 자격을 제한 또는 상실시킬 수 있습니다.
                <ul className="list-disc list-inside ml-6 mt-1 space-y-1 text-gray-600">
                  <li>타인의 정보를 도용한 경우</li>
                  <li>서비스 운영을 방해하는 행위를 한 경우</li>
                  <li>서비스 정보를 무단으로 외부에 유포한 경우</li>
                </ul>
              </li>
            </ul>
          </section>

          {/* 제10조 */}
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">제10조 (분쟁 해결)</h2>
            <p>
              서비스 이용과 관련하여 분쟁이 발생한 경우, 서비스 제공자와 이용자는
              원만한 해결을 위해 성실히 협의합니다. 협의가 이루어지지 않는 경우,
              관련 법령에 따른 관할 법원에서 해결합니다.
            </p>
          </section>

          {/* 제11조 */}
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">제11조 (약관의 변경)</h2>
            <p>
              본 약관은 관련 법령 변경 또는 서비스 정책 변경에 따라 수정될 수 있으며,
              변경 시 서비스 내 공지를 통해 안내합니다.
              변경된 약관에 동의하지 않는 경우 회원 탈퇴를 통해 이용 계약을 해지할 수 있습니다.
            </p>
          </section>

          <div className="pt-4 border-t border-gray-200 text-sm text-gray-500">
            <p>본 약관은 2026년 1월 30일부터 시행됩니다.</p>
          </div>
        </div>

        {/* 하단 링크 */}
        <div className="mt-8 text-center space-x-6">
          <Link href="/privacy" className="text-blue-600 hover:underline font-medium">
            개인정보처리방침
          </Link>
          <Link href="/" className="text-blue-600 hover:underline font-medium">
            홈으로 돌아가기
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  )
}
