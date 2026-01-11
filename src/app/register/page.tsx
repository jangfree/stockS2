'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'

interface ReferralSource {
  code: string
  name: string
}

export default function RegisterPage() {
  const router = useRouter()
  const { isLoggedIn, isLoading } = useAuth()

  const [formData, setFormData] = useState({
    user_id: '',
    password: '',
    passwordConfirm: '',
    name: '',
    gender: '',
    birth_year: '',
    referrer_id: '',
    referral_source: ''
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [referralSources, setReferralSources] = useState<ReferralSource[]>([])
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, feedback: [] as string[] })

  // 이미 로그인된 경우 리다이렉트
  useEffect(() => {
    if (!isLoading && isLoggedIn) {
      router.push('/')
    }
  }, [isLoggedIn, isLoading, router])

  // 유입 경로 목록 로드
  useEffect(() => {
    const loadReferralSources = async () => {
      try {
        const response = await fetch('/api/auth/referral-sources')
        const data = await response.json()
        if (data.success) {
          setReferralSources(data.data || [])
        }
      } catch (error) {
        console.error('Failed to load referral sources:', error)
      }
    }
    loadReferralSources()
  }, [])

  // 비밀번호 강도 체크
  useEffect(() => {
    const checkStrength = () => {
      const { password } = formData
      const feedback: string[] = []
      let score = 0

      if (password.length >= 8) score += 1
      else if (password.length > 0) feedback.push('8자 이상 입력해주세요')

      if (password.length >= 12) score += 1

      if (/[a-z]/.test(password)) score += 1
      else if (password.length > 0) feedback.push('소문자를 포함해주세요')

      if (/[A-Z]/.test(password)) score += 1
      else if (password.length > 0) feedback.push('대문자를 포함해주세요')

      if (/[0-9]/.test(password)) score += 1
      else if (password.length > 0) feedback.push('숫자를 포함해주세요')

      if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 1
      else if (password.length > 0) feedback.push('특수문자를 포함해주세요')

      setPasswordStrength({ score, feedback })
    }
    checkStrength()
  }, [formData.password])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    // 에러 클리어
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    // 아이디 검증
    if (!/^[a-zA-Z0-9]{4,50}$/.test(formData.user_id)) {
      newErrors.user_id = '아이디는 4-50자의 영문자와 숫자만 사용할 수 있습니다.'
    }

    // 비밀번호 검증
    if (formData.password.length < 8) {
      newErrors.password = '비밀번호는 8자 이상이어야 합니다.'
    } else if (!/[a-zA-Z]/.test(formData.password) || !/[0-9]/.test(formData.password) || !/[!@#$%^&*(),.?":{}|<>]/.test(formData.password)) {
      newErrors.password = '비밀번호는 영문, 숫자, 특수문자를 모두 포함해야 합니다.'
    }

    // 비밀번호 확인
    if (formData.password !== formData.passwordConfirm) {
      newErrors.passwordConfirm = '비밀번호가 일치하지 않습니다.'
    }

    // 이름 검증
    if (formData.name.length < 2 || formData.name.length > 50) {
      newErrors.name = '이름은 2-50자 사이여야 합니다.'
    }

    // 성별 검증
    if (!['M', 'F'].includes(formData.gender)) {
      newErrors.gender = '성별을 선택해주세요.'
    }

    // 출생년도 검증
    const birthYear = parseInt(formData.birth_year)
    const currentYear = new Date().getFullYear()
    if (isNaN(birthYear) || birthYear < 1940 || birthYear > currentYear - 14) {
      newErrors.birth_year = '올바른 출생년도를 입력해주세요. (만 14세 이상)'
    }

    // 유입경로 검증
    if (!formData.referral_source) {
      newErrors.referral_source = '유입경로를 선택해주세요.'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          user_id: formData.user_id,
          password: formData.password,
          name: formData.name,
          gender: formData.gender,
          birth_year: parseInt(formData.birth_year),
          referrer_id: formData.referrer_id || undefined,
          referral_source: formData.referral_source
        })
      })

      const data = await response.json()

      if (data.success) {
        alert('회원가입이 완료되었습니다. 로그인해주세요.')
        router.push('/login')
      } else {
        if (data.error?.code === 'DUPLICATE_USER_ID') {
          setErrors({ user_id: '이미 사용 중인 아이디입니다.' })
        } else if (data.error?.code === 'INVALID_REFERRER') {
          setErrors({ referrer_id: '존재하지 않는 추천인 아이디입니다.' })
        } else {
          setErrors({ submit: data.error?.message || '회원가입에 실패했습니다.' })
        }
      }
    } catch (error) {
      console.error('Registration error:', error)
      setErrors({ submit: '회원가입 중 오류가 발생했습니다.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const getStrengthColor = (score: number) => {
    if (score <= 2) return 'bg-red-500'
    if (score <= 4) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  const getStrengthText = (score: number) => {
    if (score <= 2) return '약함'
    if (score <= 4) return '보통'
    return '강함'
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          회원가입
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          이미 계정이 있으신가요?{' '}
          <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500">
            로그인
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {errors.submit && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
                {errors.submit}
              </div>
            )}

            {/* 아이디 */}
            <div>
              <label htmlFor="user_id" className="block text-sm font-medium text-gray-700">
                아이디 <span className="text-red-500">*</span>
              </label>
              <div className="mt-1">
                <input
                  id="user_id"
                  name="user_id"
                  type="text"
                  required
                  value={formData.user_id}
                  onChange={handleChange}
                  className={`appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                    errors.user_id ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="영문, 숫자 4-50자"
                />
              </div>
              {errors.user_id && (
                <p className="mt-1 text-sm text-red-600">{errors.user_id}</p>
              )}
            </div>

            {/* 비밀번호 */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                비밀번호 <span className="text-red-500">*</span>
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className={`appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                    errors.password ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="영문, 숫자, 특수문자 포함 8자 이상"
                />
              </div>
              {formData.password && (
                <div className="mt-2">
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${getStrengthColor(passwordStrength.score)} transition-all`}
                        style={{ width: `${(passwordStrength.score / 6) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-500">{getStrengthText(passwordStrength.score)}</span>
                  </div>
                  {passwordStrength.feedback.length > 0 && (
                    <ul className="mt-1 text-xs text-gray-500">
                      {passwordStrength.feedback.map((msg, i) => (
                        <li key={i}>• {msg}</li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password}</p>
              )}
            </div>

            {/* 비밀번호 확인 */}
            <div>
              <label htmlFor="passwordConfirm" className="block text-sm font-medium text-gray-700">
                비밀번호 확인 <span className="text-red-500">*</span>
              </label>
              <div className="mt-1">
                <input
                  id="passwordConfirm"
                  name="passwordConfirm"
                  type="password"
                  required
                  value={formData.passwordConfirm}
                  onChange={handleChange}
                  className={`appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                    errors.passwordConfirm ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="비밀번호를 다시 입력하세요"
                />
              </div>
              {errors.passwordConfirm && (
                <p className="mt-1 text-sm text-red-600">{errors.passwordConfirm}</p>
              )}
            </div>

            {/* 이름 */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                이름 <span className="text-red-500">*</span>
              </label>
              <div className="mt-1">
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className={`appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                    errors.name ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="실명을 입력하세요"
                />
              </div>
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
              )}
            </div>

            {/* 성별 */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                성별 <span className="text-red-500">*</span>
              </label>
              <div className="mt-2 flex space-x-4">
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="gender"
                    value="M"
                    checked={formData.gender === 'M'}
                    onChange={handleChange}
                    className="form-radio h-4 w-4 text-blue-600"
                  />
                  <span className="ml-2 text-sm text-gray-700">남성</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="gender"
                    value="F"
                    checked={formData.gender === 'F'}
                    onChange={handleChange}
                    className="form-radio h-4 w-4 text-blue-600"
                  />
                  <span className="ml-2 text-sm text-gray-700">여성</span>
                </label>
              </div>
              {errors.gender && (
                <p className="mt-1 text-sm text-red-600">{errors.gender}</p>
              )}
            </div>

            {/* 출생년도 */}
            <div>
              <label htmlFor="birth_year" className="block text-sm font-medium text-gray-700">
                출생년도 <span className="text-red-500">*</span>
              </label>
              <div className="mt-1">
                <input
                  id="birth_year"
                  name="birth_year"
                  type="number"
                  required
                  min="1940"
                  max={new Date().getFullYear() - 14}
                  value={formData.birth_year}
                  onChange={handleChange}
                  className={`appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                    errors.birth_year ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="예: 1990"
                />
              </div>
              {errors.birth_year && (
                <p className="mt-1 text-sm text-red-600">{errors.birth_year}</p>
              )}
            </div>

            {/* 유입경로 */}
            <div>
              <label htmlFor="referral_source" className="block text-sm font-medium text-gray-700">
                유입경로 <span className="text-red-500">*</span>
              </label>
              <div className="mt-1">
                <select
                  id="referral_source"
                  name="referral_source"
                  required
                  value={formData.referral_source}
                  onChange={handleChange}
                  className={`appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                    errors.referral_source ? 'border-red-300' : 'border-gray-300'
                  }`}
                >
                  <option value="">선택하세요</option>
                  {referralSources.map(source => (
                    <option key={source.code} value={source.code}>
                      {source.name}
                    </option>
                  ))}
                </select>
              </div>
              {errors.referral_source && (
                <p className="mt-1 text-sm text-red-600">{errors.referral_source}</p>
              )}
            </div>

            {/* 추천인 아이디 */}
            <div>
              <label htmlFor="referrer_id" className="block text-sm font-medium text-gray-700">
                추천인 아이디 <span className="text-gray-400">(선택)</span>
              </label>
              <div className="mt-1">
                <input
                  id="referrer_id"
                  name="referrer_id"
                  type="text"
                  value={formData.referrer_id}
                  onChange={handleChange}
                  className={`appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                    errors.referrer_id ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="추천인이 있으면 입력하세요"
                />
              </div>
              {errors.referrer_id && (
                <p className="mt-1 text-sm text-red-600">{errors.referrer_id}</p>
              )}
            </div>

            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? '가입 처리 중...' : '회원가입'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
