/**
 * 추천 목록 컴포넌트 (Client Component)
 * Realtime 구독으로 실시간 업데이트 처리
 */

'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { RecommendationRow } from '@/lib/supabase/types'
import { formatDateTime, formatNumber, formatRate, getPriceChangeColor } from '@/lib/utils'
import CancelModal from './CancelModal'

interface Props {
  initialData: RecommendationRow[]
}

export default function RecommendationList({ initialData }: Props) {
  const [recommendations, setRecommendations] = useState<RecommendationRow[]>(initialData)
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    const supabase = createClient()

    // Realtime 구독 설정
    const channel = supabase
      .channel('recommendations_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'recommendations',
          filter: 'is_active=eq.true',
        },
        (payload) => {
          console.log('Realtime event:', payload)

          if (payload.eventType === 'INSERT') {
            // 새 추천 추가
            setRecommendations((prev) => [payload.new as RecommendationRow, ...prev])
          } else if (payload.eventType === 'UPDATE') {
            // 추천 업데이트
            setRecommendations((prev) =>
              prev.map((rec) =>
                rec.id === payload.new.id ? (payload.new as RecommendationRow) : rec
              )
            )
          } else if (payload.eventType === 'DELETE') {
            // 추천 삭제 (취소)
            setRecommendations((prev) => prev.filter((rec) => rec.id !== payload.old.id))
          }
        }
      )
      .subscribe((status) => {
        console.log('Realtime status:', status)
        setIsConnected(status === 'SUBSCRIBED')
      })

    // 클린업
    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  return (
    <div>
      {/* 연결 상태 표시 */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className={`w-3 h-3 rounded-full ${
              isConnected ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
            }`}
          />
          <span className="text-sm text-gray-600">
            {isConnected ? '실시간 연결됨' : '연결 중...'}
          </span>
        </div>
        <div className="text-sm text-gray-500">
          총 {recommendations.length}개 추천
        </div>
      </div>

      {/* 추천 목록 */}
      {recommendations.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <p className="text-gray-500 text-lg">아직 추천된 종목이 없습니다</p>
          <p className="text-gray-400 text-sm mt-2">
            데스크톱 앱에서 종목을 더블클릭하여 추천하세요
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {recommendations.map((rec) => (
            <RecommendationCard key={rec.id} recommendation={rec} />
          ))}
        </div>
      )}
    </div>
  )
}

/**
 * 개별 추천 카드 컴포넌트
 */
function RecommendationCard({ recommendation: rec }: { recommendation: RecommendationRow }) {
  const priceChangeColor = getPriceChangeColor(rec.change_rate || 0)
  const [showCancelModal, setShowCancelModal] = useState(false)

  return (
    <>
      <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 relative">
        {/* 취소 버튼 */}
        <button
          onClick={() => setShowCancelModal(true)}
          className="absolute top-4 right-4 text-gray-400 hover:text-red-600 transition-colors"
          title="추천 취소"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>

        {/* 종목명 및 코드 */}
        <div className="mb-4 pr-8">
          <h3 className="text-xl font-bold text-gray-900">{rec.stock_name}</h3>
          <p className="text-sm text-gray-500">{rec.stock_code}</p>
        </div>

        {/* 가격 정보 */}
        <div className="mb-4">
          <div className="flex items-end gap-2">
            <span className="text-2xl font-bold text-gray-900">
              {formatNumber(rec.current_price)}
            </span>
            <span className="text-sm text-gray-500">원</span>
          </div>
          {rec.change_rate !== null && rec.change_amount !== null && (
            <div className={`flex items-center gap-2 mt-1 ${priceChangeColor}`}>
              <span className="font-semibold">{formatRate(rec.change_rate)}</span>
              <span className="text-sm">
                ({rec.change_amount > 0 ? '+' : ''}
                {formatNumber(rec.change_amount)})
              </span>
            </div>
          )}
        </div>

        {/* 거래 정보 */}
        <div className="space-y-2 mb-4 text-sm">
          {rec.volume !== null && (
            <div className="flex justify-between">
              <span className="text-gray-500">거래량</span>
              <span className="font-medium">{formatNumber(rec.volume)}</span>
            </div>
          )}
          {rec.trading_value !== null && (
            <div className="flex justify-between">
              <span className="text-gray-500">거래대금</span>
              <span className="font-medium">{formatNumber(Math.floor(rec.trading_value / 100000000))}억</span>
            </div>
          )}
          {rec.volume_rank !== null && (
            <div className="flex justify-between">
              <span className="text-gray-500">거래량순위</span>
              <span className="font-medium">{rec.volume_rank}위</span>
            </div>
          )}
        </div>

        {/* 테마 */}
        {rec.theme_name && (
          <div className="mb-4">
            <span className="inline-block bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full">
              {rec.theme_name}
            </span>
          </div>
        )}

        {/* 추천 시간 */}
        <div className="pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-400">
            {formatDateTime(rec.recommendation_time)}
          </p>
        </div>
      </div>

      {/* 취소 모달 */}
      {showCancelModal && (
        <CancelModal
          recommendation={rec}
          onClose={() => setShowCancelModal(false)}
          onSuccess={() => {
            // 성공 시 Realtime으로 자동 업데이트되므로 별도 처리 불필요
          }}
        />
      )}
    </>
  )
}
