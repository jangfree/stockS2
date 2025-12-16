/**
 * Supabase 연결 테스트 페이지
 * 개발 중에만 사용, 배포 시 삭제 권장
 */

import { createClient } from '@/lib/supabase/server'
import type { RecommendationRow } from '@/lib/supabase/types'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function TestPage() {
  const supabase = await createClient()

  // Supabase 연결 테스트
  let connectionStatus = '연결 실패'
  let recommendations: RecommendationRow[] = []
  let error: string | null = null

  try {
    const { data, error: fetchError } = await supabase
      .from('recommendations')
      .select('*')
      .eq('is_active', true)
      .order('recommendation_time', { ascending: false })
      .limit(5)

    if (fetchError) {
      throw fetchError
    }

    connectionStatus = '연결 성공'
    recommendations = data || []
  } catch (err) {
    error = err instanceof Error ? err.message : String(err)
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Supabase 연결 테스트</h1>

      {/* 연결 상태 */}
      <div className="mb-8 p-4 border rounded-lg">
        <h2 className="text-xl font-semibold mb-2">연결 상태</h2>
        <p className={`text-lg ${error ? 'text-red-600' : 'text-green-600'}`}>
          {connectionStatus}
        </p>
        {error && (
          <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded">
            <p className="text-sm text-red-800">에러: {error}</p>
          </div>
        )}
      </div>

      {/* 환경 변수 확인 */}
      <div className="mb-8 p-4 border rounded-lg">
        <h2 className="text-xl font-semibold mb-2">환경 변수</h2>
        <div className="space-y-1 text-sm">
          <p>
            SUPABASE_URL:{' '}
            {process.env.NEXT_PUBLIC_SUPABASE_URL ? (
              <span className="text-green-600">✓ 설정됨</span>
            ) : (
              <span className="text-red-600">✗ 없음</span>
            )}
          </p>
          <p>
            SUPABASE_ANON_KEY:{' '}
            {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? (
              <span className="text-green-600">✓ 설정됨</span>
            ) : (
              <span className="text-red-600">✗ 없음</span>
            )}
          </p>
          <p>
            SERVICE_ROLE_KEY:{' '}
            {process.env.SUPABASE_SERVICE_ROLE_KEY ? (
              <span className="text-green-600">✓ 설정됨</span>
            ) : (
              <span className="text-red-600">✗ 없음</span>
            )}
          </p>
        </div>
      </div>

      {/* 샘플 데이터 */}
      <div className="p-4 border rounded-lg">
        <h2 className="text-xl font-semibold mb-4">샘플 추천 종목 (최근 5개)</h2>

        {recommendations.length === 0 ? (
          <p className="text-gray-500">데이터가 없습니다.</p>
        ) : (
          <div className="space-y-2">
            {recommendations.map((rec) => (
              <div key={rec.id} className="p-3 bg-gray-50 rounded">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold">
                      {rec.stock_name} ({rec.stock_code})
                    </p>
                    <p className="text-sm text-gray-600">
                      추천시간: {new Date(rec.recommendation_time).toLocaleString('ko-KR')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">
                      {rec.current_price?.toLocaleString()}원
                    </p>
                    {rec.change_rate !== null && (
                      <p
                        className={`text-sm ${
                          rec.change_rate > 0
                            ? 'text-red-600'
                            : rec.change_rate < 0
                            ? 'text-blue-600'
                            : ''
                        }`}
                      >
                        {rec.change_rate > 0 ? '+' : ''}
                        {rec.change_rate}%
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 안내 메시지 */}
      <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded">
        <p className="text-sm text-blue-800">
          ℹ️ 이 페이지는 개발용 테스트 페이지입니다. 배포 전에 삭제하세요.
        </p>
        <p className="text-sm text-blue-800 mt-1">
          메인 페이지: <a href="/" className="underline">홈으로 이동</a>
        </p>
      </div>
    </div>
  )
}
