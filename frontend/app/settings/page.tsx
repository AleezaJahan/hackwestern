'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { saveSettings, getSettings, clearSettings, clearAlarmHistory } from '@/lib/storage'
import { isValidEmail, isValidPhone, formatPhoneNumber } from '@/lib/utils'
import { toast } from 'react-hot-toast'
import { getTranslations, type LanguageCode } from '@/lib/translations'

export default function SettingsPage() {
  const router = useRouter()
  const [settings, setSettings] = useState(() => {
    // Only access localStorage on client side
    if (typeof window !== 'undefined') {
      return getSettings()
    }
    return { user_id: '' }
  })
  const [isSaving, setIsSaving] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    setSettings(getSettings())
  }, [])

  // Get translations based on text language
  const textLang = (settings.text_language || 'en') as LanguageCode
  const t = getTranslations(textLang)

  const handleChange = (field: string, value: any) => {
    setSettings((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSave = () => {
    // Validate email if provided
    if (settings.email && !isValidEmail(settings.email)) {
      toast.error('Please enter a valid email address')
      return
    }

    // Validate phone if provided
    if (settings.phone_number && !isValidPhone(settings.phone_number)) {
      toast.error('Please enter a valid phone number (10 digits)')
      return
    }

    // Validate Twitter handle if social media threats are enabled
    if (settings.enable_social_media_threats !== false && !settings.twitter_handle) {
      toast.error('Please enter your Twitter handle to enable social media threats')
      return
    }

    // Validate phone number if SMS threats are enabled
    if (settings.enable_sms_threats !== false && !settings.phone_number) {
      toast.error('Please enter your phone number to enable SMS threats')
      return
    }

    setIsSaving(true)
    saveSettings(settings)
    toast.success('Settings saved!')
    setTimeout(() => {
      setIsSaving(false)
    }, 1000)
  }

  const handleClear = () => {
    if (confirm('Are you sure you want to clear all settings? This will reset your alarms, sleep stats, and take you back to the onboarding screen. This cannot be undone.')) {
      clearSettings()
      // Also clear alarm history and sleep stats
      clearAlarmHistory()
      if (typeof window !== 'undefined') {
        localStorage.removeItem('sleep_sessions')
      }
      setSettings(getSettings())
      toast.success('All data cleared! Redirecting to onboarding...')
      // Redirect to home page which will show onboarding
      setTimeout(() => {
        router.push('/')
      }, 1000)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#1a0a2e] via-[#2d1b3d] to-[#1a0a2e] p-3 sm:p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <button
            onClick={() => router.push('/')}
            className="mb-3 sm:mb-4 px-3 py-2 sm:px-4 sm:py-2.5 bg-white/20 backdrop-blur-sm text-white rounded-xl hover:bg-white/30 active:bg-white/40 transition-colors border border-white/30 text-sm sm:text-base min-h-[44px]"
          >
            {t.backToAlarm}
          </button>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-2">{t.settings}</h1>
          <p className="text-white/80 text-sm sm:text-base">
            {t.configurePreferences}
          </p>
        </div>

        {/* Settings Form */}
        <div className="bg-purple-900/40 backdrop-blur-md rounded-2xl sm:rounded-3xl shadow-2xl p-4 sm:p-6 space-y-4 sm:space-y-6 border border-purple-300/30">
          {/* User ID (Read-only) */}
          <div>
            <label className="block text-sm font-medium text-white/90 mb-2">
              User ID
            </label>
            <input
              type="text"
              value={settings.user_id}
              disabled
              className="w-full px-4 py-2 border border-white/30 rounded-xl bg-white/5 text-white/60 cursor-not-allowed"
            />
            <p className="mt-1 text-xs text-white/60">
              {t.uniqueIdentifier}
            </p>
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-white/90 mb-2">
              {t.name}
            </label>
            <input
              type="text"
              value={settings.name || ''}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="Enter your name"
              className="w-full px-4 py-3 sm:py-3.5 border border-white/30 rounded-xl focus:ring-2 focus:ring-purple-400 focus:border-transparent text-base sm:text-lg text-gray-900 bg-white/90 backdrop-blur-sm min-h-[44px]"
            />
            <p className="mt-1 text-xs text-white/60">
              {t.usedForPersonalizedMessages}
            </p>
          </div>

          {/* Gender */}
          <div>
            <label className="block text-sm font-medium text-white/90 mb-2">
              {t.gender}
            </label>
            <select
              value={settings.gender || ''}
              onChange={(e) => handleChange('gender', e.target.value)}
              className="w-full px-4 py-3 sm:py-3.5 border border-white/30 rounded-xl focus:ring-2 focus:ring-purple-400 focus:border-transparent text-base sm:text-lg text-gray-900 bg-white/90 backdrop-blur-sm min-h-[44px]"
            >
              <option value="">Select gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="non-binary">Non-binary</option>
              <option value="other">Other</option>
              <option value="prefer-not-to-say">Prefer not to say</option>
            </select>
            <p className="mt-1 text-xs text-white/60">
              {t.usedForSleepStats}
            </p>
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-white/90 mb-2">
              {t.email}
            </label>
            <input
              type="email"
              value={settings.email || ''}
              onChange={(e) => handleChange('email', e.target.value)}
              placeholder="your.email@example.com"
              className="w-full px-4 py-3 sm:py-3.5 border border-white/30 rounded-xl focus:ring-2 focus:ring-purple-400 focus:border-transparent text-base sm:text-lg text-gray-900 bg-white/90 backdrop-blur-sm min-h-[44px]"
            />
            <p className="mt-1 text-xs text-white/60">
              {t.usedForAccountId}
            </p>
          </div>

          {/* Phone Number */}
          <div>
            <label className="block text-sm font-medium text-white/90 mb-2">
              {t.phoneNumber}
            </label>
            <input
              type="tel"
              value={settings.phone_number || ''}
              onChange={(e) => {
                const cleaned = e.target.value.replace(/\D/g, '')
                handleChange('phone_number', cleaned)
              }}
              placeholder="1234567890"
              className="w-full px-4 py-3 sm:py-3.5 border border-white/30 rounded-xl focus:ring-2 focus:ring-purple-400 focus:border-transparent text-base sm:text-lg text-gray-900 bg-white/90 backdrop-blur-sm min-h-[44px]"
            />
            {mounted && settings.phone_number && (
              <p className="mt-1 text-xs text-white/60">
                {t.formatted}: {formatPhoneNumber(settings.phone_number)}
              </p>
            )}
          </div>

          {/* Crush's Phone Number */}
          <div>
            <label className="block text-sm font-medium text-white/90 mb-2">
              {t.crushPhoneNumber}
            </label>
            <input
              type="tel"
              value={settings.crush_phone_number || ''}
              onChange={(e) => {
                const cleaned = e.target.value.replace(/\D/g, '')
                handleChange('crush_phone_number', cleaned)
              }}
              placeholder="1234567890"
              className="w-full px-4 py-3 sm:py-3.5 border border-white/30 rounded-xl focus:ring-2 focus:ring-purple-400 focus:border-transparent text-base sm:text-lg text-gray-900 bg-white/90 backdrop-blur-sm min-h-[44px]"
            />
            <p className="mt-1 text-xs text-white/60">
              Will receive romantic text at snooze 3
              {mounted && settings.crush_phone_number && (
                <span className="block mt-1">
                  {t.formatted}: {formatPhoneNumber(settings.crush_phone_number)}
                </span>
              )}
            </p>
          </div>

          {/* Twitter Handle */}
          <div>
            <label className="block text-sm font-medium text-white/90 mb-2">
              {t.yourTwitterHandle}
            </label>
            <div className="flex items-center gap-2">
              <span className="text-white/70 text-lg sm:text-xl">@</span>
              <input
                type="text"
                value={settings.twitter_handle || ''}
                onChange={(e) => {
                  const cleaned = e.target.value.replace(/[^a-zA-Z0-9_]/g, '')
                  handleChange('twitter_handle', cleaned)
                }}
                placeholder="your_handle"
                className="flex-1 px-4 py-3 sm:py-3.5 border border-white/30 rounded-xl focus:ring-2 focus:ring-purple-400 focus:border-transparent text-base sm:text-lg text-gray-900 bg-white/90 backdrop-blur-sm min-h-[44px]"
              />
            </div>
            <p className="mt-1 text-xs text-white/60">
              {t.twitterUsernameHint}
            </p>
          </div>

          {/* Voice Language Selection */}
          <div>
            <label className="block text-sm font-medium text-white/90 mb-2">
              {t.voiceLanguage}
            </label>
            <select
              value={settings.language || 'en'}
              onChange={(e) => handleChange('language', e.target.value)}
              className="w-full px-4 py-3 sm:py-3.5 border border-white/30 rounded-xl focus:ring-2 focus:ring-purple-400 focus:border-transparent text-base sm:text-lg text-gray-900 bg-white/90 backdrop-blur-sm min-h-[44px]"
            >
              <option value="en">English</option>
              <option value="es">Spanish (Español)</option>
              <option value="fr">French (Français)</option>
              <option value="de">German (Deutsch)</option>
              <option value="it">Italian (Italiano)</option>
              <option value="pt">Portuguese (Português)</option>
              <option value="pl">Polish (Polski)</option>
              <option value="tr">Turkish (Türkçe)</option>
              <option value="ru">Russian (Русский)</option>
              <option value="nl">Dutch (Nederlands)</option>
              <option value="cs">Czech (Čeština)</option>
              <option value="ar">Arabic (العربية)</option>
              <option value="zh">Chinese (中文)</option>
              <option value="ja">Japanese (日本語)</option>
              <option value="hu">Hungarian (Magyar)</option>
              <option value="ko">Korean (한국어)</option>
            </select>
            <p className="mt-1 text-xs text-white/60">
              {t.selectVoiceLanguage}
            </p>
          </div>

          {/* Text Language Selection */}
          <div>
            <label className="block text-sm font-medium text-white/90 mb-2">
              {t.textLanguage}
            </label>
            <select
              value={settings.text_language || 'en'}
              onChange={(e) => handleChange('text_language', e.target.value)}
              className="w-full px-4 py-3 sm:py-3.5 border border-white/30 rounded-xl focus:ring-2 focus:ring-purple-400 focus:border-transparent text-base sm:text-lg text-gray-900 bg-white/90 backdrop-blur-sm min-h-[44px]"
            >
              <option value="en">English</option>
              <option value="es">Spanish (Español)</option>
              <option value="fr">French (Français)</option>
              <option value="de">German (Deutsch)</option>
              <option value="it">Italian (Italiano)</option>
              <option value="pt">Portuguese (Português)</option>
            </select>
            <p className="mt-1 text-xs text-white/60">
              {t.selectTextLanguage}
            </p>
          </div>

          {/* Enable Social Media Threats */}
          <div className="flex items-center justify-between p-4 bg-purple-800/30 backdrop-blur-sm rounded-2xl border border-purple-300/20">
            <div>
              <label className="block text-sm font-medium text-white">
                {t.enableSocialMediaThreats}
              </label>
              <p className="text-xs text-white/70 mt-1">
                {t.socialMediaThreatsDescription}
              </p>
            </div>
            <input
              type="checkbox"
              checked={settings.enable_social_media_threats !== false}
              onChange={(e) => handleChange('enable_social_media_threats', e.target.checked)}
              className="w-5 h-5 text-purple-500 rounded focus:ring-purple-400"
            />
          </div>

          {/* Enable SMS Threats */}
          <div className="flex items-center justify-between p-4 bg-purple-800/30 backdrop-blur-sm rounded-2xl border border-purple-300/20">
            <div>
              <label className="block text-sm font-medium text-white">
                {t.enableSmsThreats}
              </label>
              <p className="text-xs text-white/70 mt-1">
                {t.smsThreatsDescription}
              </p>
            </div>
            <input
              type="checkbox"
              checked={settings.enable_sms_threats !== false}
              onChange={(e) => handleChange('enable_sms_threats', e.target.checked)}
              className="w-5 h-5 text-purple-500 rounded focus:ring-purple-400"
              disabled={!settings.phone_number}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4 border-t border-white/20">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex-1 px-6 py-3 sm:py-3.5 bg-gradient-to-r from-purple-800 to-indigo-800 text-white rounded-xl hover:from-purple-700 hover:to-indigo-700 active:from-purple-900 active:to-indigo-900 disabled:bg-gray-700 disabled:cursor-not-allowed transition-all font-semibold shadow-lg text-base sm:text-lg min-h-[48px]"
            >
              {isSaving ? 'Saving...' : `💾 ${t.saveSettings}`}
            </button>
            <button
              onClick={handleClear}
              className="px-6 py-3 sm:py-3.5 bg-gradient-to-r from-purple-800 to-indigo-800 text-white rounded-xl hover:from-purple-700 hover:to-indigo-700 active:from-purple-900 active:to-indigo-900 transition-all font-semibold shadow-lg text-base sm:text-lg min-h-[48px] w-full sm:w-auto"
            >
              🗑️ {t.clear}
            </button>
          </div>
        </div>

        {/* Info Box */}
        <div className="mt-4 sm:mt-6 bg-purple-900/40 backdrop-blur-md border-2 border-purple-300/30 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-2xl">
          <h3 className="font-semibold text-white mb-2 text-base sm:text-lg">{t.howItWorks}</h3>
          <ul className="text-xs sm:text-sm text-white/90 space-y-1 list-disc list-inside">
            <li>{t.howItWorksStep1}</li>
            <li>{t.howItWorksStep2}</li>
            <li>{t.howItWorksStep3}</li>
            <li>{t.howItWorksStep4}</li>
          </ul>
        </div>
      </div>
    </main>
  )
}

