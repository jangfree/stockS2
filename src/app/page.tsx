/**
 * 메인 페이지 (Server Component)
 * SSR로 초기 데이터 로드 후 Client Component에 전달
 */

import { createClient } from '@/lib/supabase/server'
import RecommendationList from '@/components/RecommendationList'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function HomePage() {
  const supabase = await createClient()

  // 초기 데이터 로드 (SSR)
  const { data: initialRecommendations, error } = await supabase
    .from('recommendations')
    .select('*')
    .eq('is_active', true)
    .order('recommendation_time', { ascending: false })
    .limit(50)

  if (error) {
    console.error('Failed to fetch recommendations:', error)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto py-8 px-4">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            실시간 종목 추천
          </h1>
          <p className="text-gray-600">
            데스크톱 앱에서 전송된 추천 종목을 실시간으로 확인하세요
          </p>
        </div>

        {/* 추천 목록 (Client Component) */}
        <RecommendationList initialData={initialRecommendations || []} />
      </div>
    </div>
  )
}
