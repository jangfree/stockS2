/**
 * 중장기 추천 취소 모달 컴포넌트
 */

'use client'

import { useState } from 'react'
import { LongTermRecommendationRow } from '@/lib/supabase/types'

interface Props {
  recommendation: LongTermRecommendationRow
  onClose: () => void
  onSuccess: (cancelledId: number) => void
}

export default function LongTermCancelModal({ recommendation, onClose, onSuccess }: Props) {
  const [password, setPassword] = useState('')
  const [reason, setReason] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch('/api/long-term-recommendations/cancel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: recommendation.id,
          password,
          reason: reason.trim() || null,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || '취소에 실패했습니다')
      }

      onSuccess(recommendation.id)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : '오류가 발생했습니다')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        {/* 헤더 */}
        <div className="mb-4">
          <h2 className="text-xl font-bold text-gray-900">추천 취소</h2>
          <p className="text-sm text-gray-600 mt-1">
            {recommendation.stock_name} ({recommendation.stock_code})
          </p>
        </div>

        {/* 폼 */}
        <form onSubmit={handleSubmit}>
          {/* 비밀번호 */}
          <div className="mb-4">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              관리자 비밀번호 <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="비밀번호 입력"
              required
              autoFocus
            />
          </div>

          {/* 취소 사유 */}
          <div className="mb-4">
            <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-1">
              취소 사유 (선택)
            </label>
            <textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              placeholder="취소 사유를 입력하세요"
              rows={3}
            />
          </div>

          {/* 에러 메시지 */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* 버튼 */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={loading || !password}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '처리 중...' : '확인'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
