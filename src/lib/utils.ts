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
 * ISO 8601 형식 → "2025-12-15 15:28:40"
 */
export function formatDateTime(isoString: string | null): string {
  if (!isoString) return '-'

  try {
    const date = new Date(isoString)

    if (isNaN(date.getTime())) {
      return '-'
    }

    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    const seconds = String(date.getSeconds()).padStart(2, '0')

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
