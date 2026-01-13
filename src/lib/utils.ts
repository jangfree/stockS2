import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Tailwind CSS 클래스 병합 유틸리티
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * 날짜/시간 포맷팅
 * ISO 8601 형식 → "2025-12-15 15:28:40" (한국 시간 KST 고정)
 */
export function formatDateTime(isoString: string | null): string {
  if (!isoString) return '-'

  try {
    const date = new Date(isoString)

    if (isNaN(date.getTime())) {
      return '-'
    }

    // 한국 시간대(KST, UTC+9)로 고정 표시
    const kstFormatter = new Intl.DateTimeFormat('ko-KR', {
      timeZone: 'Asia/Seoul',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    })

    const parts = kstFormatter.formatToParts(date)
    const getPart = (type: string) => parts.find(p => p.type === type)?.value || ''

    const year = getPart('year')
    const month = getPart('month')
    const day = getPart('day')
    const hours = getPart('hour')
    const minutes = getPart('minute')
    const seconds = getPart('second')

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
  } catch {
    return '-'
  }
}

/**
 * 숫자 포맷팅 (천단위 콤마)
 * 1234567 → "1,234,567"
 */
export function formatNumber(
  value: number | null | undefined,
  showSign: boolean = false
): string {
  if (value === null || value === undefined) return '-'

  const formatted = value.toLocaleString('ko-KR')

  if (showSign && value > 0) {
    return `+${formatted}`
  }

  return formatted
}

/**
 * 등락률 포맷팅
 * 2.35 → "+2.35%"
 * -1.20 → "-1.20%"
 */
export function formatRate(rate: number | null | undefined): string {
  if (rate === null || rate === undefined) return '-'

  const sign = rate > 0 ? '+' : ''
  return `${sign}${rate.toFixed(2)}%`
}

/**
 * 가격 변동 색상 결정
 * 양수: red (상승)
 * 음수: blue (하락)
 * 0: 기본
 */
export function getPriceChangeColor(value: number | null | undefined): string {
  if (value === null || value === undefined) return ''
  if (value > 0) return 'text-red-600 font-semibold'
  if (value < 0) return 'text-blue-600 font-semibold'
  return ''
}
