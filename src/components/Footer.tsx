import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 py-8">
      <div className="container mx-auto px-4 text-center">
        <p>&copy; 2026 실시간 종목 추천 서비스. All rights reserved.</p>
        <p className="text-sm mt-2 text-yellow-500">
          본 서비스는 투자 권유가 아니며, 투자에 대한 판단과 책임은 본인에게 있습니다.
        </p>
        <div className="mt-3 space-x-4">
          <Link href="/terms" className="text-sm text-gray-500 hover:text-gray-300 transition-colors">
            이용약관
          </Link>
          <Link href="/privacy" className="text-sm text-gray-500 hover:text-gray-300 transition-colors">
            개인정보처리방침
          </Link>
        </div>
      </div>
    </footer>
  )
}
