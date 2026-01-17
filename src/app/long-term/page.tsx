/**
 * 중기 종목추천 페이지 (Server Component)
 * SSR로 초기 데이터 로드 후 Client Component에 전달
 * 1단계 이상 회원만 접근 가능
 */

import { createClient } from '@/lib/supabase/server'
import LongTermRecommendationList from '@/components/LongTermRecommendationList'
import Header from '@/components/Header'
import AccessControl from '@/components/AccessControl'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function LongTermPage() {
  const supabase = await createClient()

  // 초기 데이터 로드 (SSR) - 활성화된 중기 추천 종목
  const { data: initialRecommendations, error } = await supabase
    .from('long_term_recommendations')
    .select('*')
    .eq('is_active', true)
    .order('recommendation_time', { ascending: false })
    .limit(50)

  if (error) {
    console.error('Failed to fetch long-term recommendations:', error)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* 헤더 */}
      <Header />

      {/* 접근 제어 */}
      <AccessControl requiredLevel={1} pageName="중기 종목추천">
        <div className="container mx-auto py-8 px-4">
          {/* 페이지 타이틀 */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              중기 종목추천
            </h1>
            <p className="text-gray-600">
              패턴 분석 기반의 중기 투자 적합 종목을 실시간으로 확인하세요
            </p>
          </div>

          {/* 추천 목록 (Client Component) */}
          <LongTermRecommendationList initialData={initialRecommendations || []} />
        </div>
      </AccessControl>
    </div>
  )
}
