/**
 * 추천 목록 컴포넌트 (Client Component)
 * Realtime 구독으로 실시간 업데이트 처리
 */

'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { RecommendationRow } from '@/lib/supabase/types'
import { formatDateTime, formatNumber, formatRate, getPriceChangeColor } from '@/lib/utils'
import { useAuth } from '@/contexts/AuthContext'
import CancelModal from './CancelModal'

interface Props {
  initialData: RecommendationRow[]
}

// 오늘 날짜인지 확인 (한국 시간 기준)
function isTodayKST(dateString: string | null): boolean {
  if (!dateString) return false

  const date = new Date(dateString)
  const now = new Date()

  // 한국 시간으로 변환
  const kstOffset = 9 * 60 * 60 * 1000
  const kstDate = new Date(date.getTime() + kstOffset)
  const kstNow = new Date(now.getTime() + kstOffset)

  return kstDate.getFullYear() === kstNow.getFullYear() &&
         kstDate.getMonth() === kstNow.getMonth() &&
         kstDate.getDate() === kstNow.getDate()
}

export default function RecommendationList({ initialData }: Props) {
  const [recommendations, setRecommendations] = useState<RecommendationRow[]>(initialData)
  const [isConnected, setIsConnected] = useState(false)
  const { user } = useAuth()
  const canDelete = user?.membership_level === 5

  useEffect(() => {
    const supabase = createClient()

    // Realtime 구독 설정
    const channel = supabase
      .channel('recommendations_changes')
      // INSERT 이벤트: 새 추천 추가 (is_active=true인 것만)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'recommendations',
          filter: 'is_active=eq.true',
        },
        (payload) => {
          console.log('Realtime INSERT:', payload)
          const newRec = payload.new as RecommendationRow
          // 오늘 추천된 종목만 추가
          if (isTodayKST(newRec.recommendation_time)) {
            setRecommendations((prev) => [newRec, ...prev])
          }
        }
      )
      // UPDATE 이벤트: 취소 처리 감지 (필터 없이 모든 UPDATE 감지)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'recommendations',
        },
        (payload) => {
          console.log('Realtime UPDATE:', payload)
          const updated = payload.new as RecommendationRow

          if (!updated.is_active) {
            // is_active가 false가 되면 목록에서 제거 (취소됨)
            setRecommendations((prev) => prev.filter((rec) => rec.id !== updated.id))
          } else {
            // 그 외 업데이트는 데이터 갱신
            setRecommendations((prev) =>
              prev.map((rec) => (rec.id === updated.id ? updated : rec))
            )
          }
        }
      )
      // DELETE 이벤트: 물리적 삭제 처리
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'recommendations',
        },
        (payload) => {
          console.log('Realtime DELETE:', payload)
          setRecommendations((prev) => prev.filter((rec) => rec.id !== payload.old.id))
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
            <RecommendationCard
              key={rec.id}
              recommendation={rec}
              canDelete={canDelete}
              onCancelSuccess={(cancelledId) => {
                // 취소 성공 시 로컬 상태에서 즉시 제거 (Realtime보다 빠른 UX)
                setRecommendations((prev) => prev.filter((r) => r.id !== cancelledId))
              }}
            />
          ))}
        </div>
      )}
    </div>
  )
}

/**
 * 개별 추천 카드 컴포넌트
 */
function RecommendationCard({
  recommendation: rec,
  canDelete,
  onCancelSuccess,
}: {
  recommendation: RecommendationRow
  canDelete: boolean
  onCancelSuccess: (cancelledId: number) => void
}) {
  const priceChangeColor = getPriceChangeColor(rec.change_rate || 0)
  const [showCancelModal, setShowCancelModal] = useState(false)

  return (
    <>
      <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 relative">
        {/* 취소 버튼 - 레벨 5만 표시 */}
        {canDelete && (
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
        )}

        {/* 종목명 및 코드 */}
        <div className="mb-4 pr-8">
          <h3 className="text-xl font-bold text-gray-900">{rec.stock_name}</h3>
          <p className="text-sm text-gray-500">{rec.stock_code}</p>
        </div>

        {/* 주식링크 */}
        <div className="mb-4">
          <a
            href={`https://finance.naver.com/item/main.naver?code=${rec.stock_code}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 hover:underline font-medium"
          >
            네이버주식
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>

        {/* 가격 정보 - 레벨 5만 표시 */}
        {canDelete && (
          <div className="space-y-2 mb-4 text-sm border-b border-gray-100 pb-4">
            {rec.current_price !== null && (
              <div className="flex justify-between">
                <span className="text-gray-500">현재가</span>
                <span className="font-medium text-gray-900">{formatNumber(rec.current_price)}원</span>
              </div>
            )}
            {rec.change_rate !== null && (
              <div className="flex justify-between">
                <span className="text-gray-500">등락률</span>
                <span className={getPriceChangeColor(rec.change_rate)}>
                  {formatRate(rec.change_rate)}
                </span>
              </div>
            )}
            {rec.change_amount !== null && (
              <div className="flex justify-between">
                <span className="text-gray-500">전일대비</span>
                <span className={getPriceChangeColor(rec.change_amount)}>
                  {formatNumber(rec.change_amount, true)}원
                </span>
              </div>
            )}
            {rec.volume !== null && (
              <div className="flex justify-between">
                <span className="text-gray-500">거래량</span>
                <span className="font-medium text-gray-900">{formatNumber(rec.volume)}</span>
              </div>
            )}
            {rec.trading_value !== null && (
              <div className="flex justify-between">
                <span className="text-gray-500">거래대금</span>
                <span className="font-medium text-gray-900">{formatNumber(Math.floor(rec.trading_value / 100000000))}억</span>
              </div>
            )}
            {rec.volume_rank !== null && (
              <div className="flex justify-between">
                <span className="text-gray-500">거래량순위</span>
                <span className="font-medium text-gray-900">{rec.volume_rank}위</span>
              </div>
            )}
          </div>
        )}

        {/* 테마 */}
        {rec.theme_name && (
          <div className="mb-4">
            <span className="inline-block bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full">
              {rec.theme_name}
            </span>
          </div>
        )}

        {/* 종목 클릭 시간 */}
        <div className="pt-4 border-t border-gray-200">
          <p className="text-sm font-medium text-gray-700">
            추천시간 : {formatDateTime(rec.recommendation_time)}
          </p>
        </div>
      </div>

      {/* 취소 모달 - 레벨 5만 표시 */}
      {canDelete && showCancelModal && (
        <CancelModal
          recommendation={rec}
          onClose={() => setShowCancelModal(false)}
          onSuccess={onCancelSuccess}
        />
      )}
    </>
  )
}
