/**
 * 메인 페이지 (Server Component)
 * SSR로 초기 데이터 로드 후 Client Component에 전달
 */

import { createClient } from '@/lib/supabase/server'
import RecommendationList from '@/components/RecommendationList'
import Header from '@/components/Header'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function HomePage() {
  const supabase = await createClient()

  // 오늘 날짜 (한국 시간 기준) 계산
  const now = new Date()
  const kstOffset = 9 * 60 * 60 * 1000 // UTC+9
  const kstNow = new Date(now.getTime() + kstOffset)
  const todayStart = new Date(kstNow.getFullYear(), kstNow.getMonth(), kstNow.getDate())
  const todayStartUTC = new Date(todayStart.getTime() - kstOffset).toISOString()

  // 초기 데이터 로드 (SSR) - 오늘 추천된 종목만
  const { data: initialRecommendations, error } = await supabase
    .from('recommendations')
    .select('*')
    .eq('is_active', true)
    .gte('recommendation_time', todayStartUTC)
    .order('recommendation_time', { ascending: false })
    .limit(50)

  if (error) {
    console.error('Failed to fetch recommendations:', error)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* 헤더 */}
      <Header />

      <div className="container mx-auto py-8 px-4">
        {/* 페이지 타이틀 */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            오늘의 단타 종목
          </h1>
        </div>

        {/* 추천 목록 (Client Component) */}
        <RecommendationList initialData={initialRecommendations || []} />
      </div>
    </div>
  )
}
