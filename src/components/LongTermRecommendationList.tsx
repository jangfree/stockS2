/**
 * 중기 추천 목록 컴포넌트 (Client Component)
 * Realtime 구독으로 실시간 업데이트 처리
 */

'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { LongTermRecommendationRow } from '@/lib/supabase/types'
import { formatDateTime, formatNumber, formatRate, getPriceChangeColor } from '@/lib/utils'
import { useAuth } from '@/contexts/AuthContext'
import LongTermCancelModal from './LongTermCancelModal'

interface Props {
  initialData: LongTermRecommendationRow[]
}

export default function LongTermRecommendationList({ initialData }: Props) {
  const [recommendations, setRecommendations] = useState<LongTermRecommendationRow[]>(initialData)
  const [isConnected, setIsConnected] = useState(false)
  const { user } = useAuth()
  const canDelete = user?.membership_level === 5

  useEffect(() => {
    const supabase = createClient()

    // Realtime 구독 설정
    const channel = supabase
      .channel('long_term_recommendations_changes')
      // INSERT 이벤트: 새 추천 추가 (is_active=true인 것만)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'long_term_recommendations',
          filter: 'is_active=eq.true',
        },
        (payload) => {
          console.log('LongTerm Realtime INSERT:', payload)
          const newRec = payload.new as LongTermRecommendationRow
          setRecommendations((prev) => [newRec, ...prev])
        }
      )
      // UPDATE 이벤트: 취소 처리 감지
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'long_term_recommendations',
        },
        (payload) => {
          console.log('LongTerm Realtime UPDATE:', payload)
          const updated = payload.new as LongTermRecommendationRow

          if (!updated.is_active) {
            setRecommendations((prev) => prev.filter((rec) => rec.id !== updated.id))
          } else {
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
          table: 'long_term_recommendations',
        },
        (payload) => {
          console.log('LongTerm Realtime DELETE:', payload)
          setRecommendations((prev) => prev.filter((rec) => rec.id !== payload.old.id))
        }
      )
      .subscribe((status) => {
        console.log('LongTerm Realtime status:', status)
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
            <LongTermRecommendationCard
              key={rec.id}
              recommendation={rec}
              canDelete={canDelete}
              onCancelSuccess={(cancelledId) => {
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
 * 개별 중기 추천 카드 컴포넌트
 */
function LongTermRecommendationCard({
  recommendation: rec,
  canDelete,
  onCancelSuccess,
}: {
  recommendation: LongTermRecommendationRow
  canDelete: boolean
  onCancelSuccess: (cancelledId: number) => void
}) {
  const [showCancelModal, setShowCancelModal] = useState(false)

  // 리스크 레벨에 따른 색상
  const getRiskColor = (risk: string | null) => {
    switch (risk?.toUpperCase()) {
      case 'LOW': return 'bg-green-100 text-green-700'
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-700'
      case 'HIGH': return 'bg-red-100 text-red-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  // 리스크 레벨 한글
  const getRiskLabel = (risk: string | null) => {
    switch (risk?.toUpperCase()) {
      case 'LOW': return '낮음'
      case 'MEDIUM': return '중간'
      case 'HIGH': return '높음'
      default: return risk || '-'
    }
  }

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

        {/* 추천일자 - 상단에 눈에 띄게 표시 */}
        {rec.recommendation_date && (
          <div className="mb-3 -mt-2">
            <span className="inline-block bg-blue-600 text-white text-sm font-bold px-3 py-1 rounded-full">
              {rec.recommendation_date}
            </span>
          </div>
        )}

        {/* 종목명 및 코드 */}
        <div className="mb-4 pr-8">
          <h3 className="text-xl font-bold text-gray-900">{rec.stock_name}</h3>
          <p className="text-sm text-gray-500">{rec.stock_code}</p>
        </div>

        {/* 네이버주식 링크 */}
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
          </div>
        )}

        {/* 추천 정보 - 레벨 5만 표시 */}
        {canDelete && (
          <div className="space-y-2 mb-4 text-sm">
            {rec.recommendation_strength !== null && (
              <div className="flex justify-between">
                <span className="text-gray-500">추천강도</span>
                <span className="font-medium text-blue-600">{rec.recommendation_strength}</span>
              </div>
            )}
            {rec.expected_return !== null && (
              <div className="flex justify-between">
                <span className="text-gray-500">예상수익률</span>
                <span className={`font-medium ${rec.expected_return > 0 ? 'text-red-600' : 'text-blue-600'}`}>
                  {rec.expected_return > 0 ? '+' : ''}{rec.expected_return}%
                </span>
              </div>
            )}
            {rec.risk_level && (
              <div className="flex justify-between items-center">
                <span className="text-gray-500">리스크</span>
                <span className={`px-2 py-0.5 text-xs rounded-full ${getRiskColor(rec.risk_level)}`}>
                  {getRiskLabel(rec.risk_level)}
                </span>
              </div>
            )}
          </div>
        )}

        {/* 주요 패턴 - 레벨 5만 표시 */}
        {canDelete && rec.main_pattern && (
          <div className="mb-4">
            <span className="inline-block bg-green-100 text-green-800 text-xs px-3 py-1 rounded-full">
              {rec.main_pattern}
            </span>
          </div>
        )}

        {/* 추천 시간 */}
        <div className="pt-4 border-t border-gray-200">
          <p className="text-sm font-medium text-gray-700">
            추천시간 : {formatDateTime(rec.recommendation_time)}
          </p>
        </div>
      </div>

      {/* 취소 모달 - 레벨 5만 표시 */}
      {canDelete && showCancelModal && (
        <LongTermCancelModal
          recommendation={rec}
          onClose={() => setShowCancelModal(false)}
          onSuccess={onCancelSuccess}
        />
      )}
    </>
  )
}
