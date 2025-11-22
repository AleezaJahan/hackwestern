'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { saveSettings, getSettings, clearSettings } from '@/lib/storage'
import { isValidEmail, isValidPhone, formatPhoneNumber } from '@/lib/utils'
import { toast } from 'react-hot-toast'

export default function SettingsPage() {
  const router = useRouter()
  const [settings, setSettings] = useState(getSettings())
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    setSettings(getSettings())
  }, [])

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

    setIsSaving(true)
    saveSettings(settings)
    toast.success('Settings saved!')
    setTimeout(() => {
      setIsSaving(false)
    }, 1000)
  }

  const handleClear = () => {
    if (confirm('Are you sure you want to clear all settings? This cannot be undone.')) {
      clearSettings()
      setSettings(getSettings())
      toast.success('Settings cleared!')
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-red-50 p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/')}
            className="mb-4 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            ← Back to Alarm
          </button>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">⚙️ Settings</h1>
          <p className="text-gray-600">
            Configure your alarm preferences and social media connections
          </p>
        </div>

        {/* Settings Form */}
        <div className="bg-white rounded-lg shadow-lg p-6 space-y-6">
          {/* User ID (Read-only) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              User ID
            </label>
            <input
              type="text"
              value={settings.user_id}
              disabled
              className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed"
            />
            <p className="mt-1 text-xs text-gray-500">
              This is your unique identifier. It cannot be changed.
            </p>
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email (Optional)
            </label>
            <input
              type="email"
              value={settings.email || ''}
              onChange={(e) => handleChange('email', e.target.value)}
              placeholder="your.email@example.com"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900 bg-white"
            />
            <p className="mt-1 text-xs text-gray-500">
              Used for account identification (optional)
            </p>
          </div>

          {/* Phone Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number (Optional)
            </label>
            <input
              type="tel"
              value={settings.phone_number || ''}
              onChange={(e) => {
                const cleaned = e.target.value.replace(/\D/g, '')
                handleChange('phone_number', cleaned)
              }}
              placeholder="1234567890"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900 bg-white"
            />
            <p className="mt-1 text-xs text-gray-500">
              Used for SMS threats. Format: 10 digits (no dashes or spaces)
              {settings.phone_number && (
                <span className="block mt-1">
                  Formatted: {formatPhoneNumber(settings.phone_number)}
                </span>
              )}
            </p>
          </div>

          {/* Mom's Phone Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mom's Phone Number (Optional)
            </label>
            <input
              type="tel"
              value={settings.mom_phone_number || ''}
              onChange={(e) => {
                const cleaned = e.target.value.replace(/\D/g, '')
                handleChange('mom_phone_number', cleaned)
              }}
              placeholder="1234567890"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900 bg-white"
            />
            <p className="mt-1 text-xs text-gray-500">
              Will receive text at snooze 4: "degenerate is not waking up"
              {settings.mom_phone_number && (
                <span className="block mt-1">
                  Formatted: {formatPhoneNumber(settings.mom_phone_number)}
                </span>
              )}
            </p>
          </div>

          {/* Twitter Handle */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Twitter Handle (Optional)
            </label>
            <div className="flex items-center gap-2">
              <span className="text-gray-500">@</span>
              <input
                type="text"
                value={settings.twitter_handle || ''}
                onChange={(e) => {
                  const cleaned = e.target.value.replace(/[^a-zA-Z0-9_]/g, '')
                  handleChange('twitter_handle', cleaned)
                }}
                placeholder="your_handle"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900 bg-white"
              />
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Your Twitter/X username (without @)
            </p>
          </div>

          {/* Crush's Twitter Handle */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Crush's Twitter Handle (Optional)
            </label>
            <div className="flex items-center gap-2">
              <span className="text-gray-500">@</span>
              <input
                type="text"
                value={settings.crush_twitter_handle || ''}
                onChange={(e) => {
                  const cleaned = e.target.value.replace(/[^a-zA-Z0-9_]/g, '')
                  handleChange('crush_twitter_handle', cleaned)
                }}
                placeholder="their_handle"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900 bg-white"
              />
            </div>
            <p className="mt-1 text-xs text-gray-500">
              The Twitter handle of the person you don't want to see your snooze stats 😏
            </p>
          </div>

          {/* Snooze Tolerance */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Snooze Tolerance: {settings.snooze_tolerance || 5} snoozes
            </label>
            <input
              type="range"
              min="1"
              max="10"
              value={settings.snooze_tolerance || 5}
              onChange={(e) => handleChange('snooze_tolerance', parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Lenient (1)</span>
              <span>Moderate (5)</span>
              <span>Strict (10)</span>
            </div>
            <p className="mt-2 text-xs text-gray-500">
              Maximum snoozes before serious escalation kicks in
            </p>
          </div>

          {/* Enable Social Media Threats */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Enable Social Media Threats
              </label>
              <p className="text-xs text-gray-500 mt-1">
                Allow the alarm to post to Twitter/X when thresholds are reached
              </p>
            </div>
            <input
              type="checkbox"
              checked={settings.enable_social_media_threats !== false}
              onChange={(e) => handleChange('enable_social_media_threats', e.target.checked)}
              className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500"
            />
          </div>

          {/* Enable SMS Threats */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Enable SMS Threats
              </label>
              <p className="text-xs text-gray-500 mt-1">
                Receive threatening SMS messages via Twilio (requires phone number)
              </p>
            </div>
            <input
              type="checkbox"
              checked={settings.enable_sms_threats !== false}
              onChange={(e) => handleChange('enable_sms_threats', e.target.checked)}
              className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500"
              disabled={!settings.phone_number}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4 border-t">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex-1 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-semibold"
            >
              {isSaving ? 'Saving...' : '💾 Save Settings'}
            </button>
            <button
              onClick={handleClear}
              className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-semibold"
            >
              🗑️ Clear
            </button>
          </div>
        </div>

        {/* Info Box */}
        <div className="mt-6 bg-blue-100 border-2 border-blue-300 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">ℹ️ How It Works</h3>
          <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
            <li>Set your alarm time and preferences</li>
            <li>When the alarm goes off, provide an excuse to snooze</li>
            <li>AI analyzes your excuse and generates a roast</li>
            <li>Multiple snoozes trigger escalating threats (SMS → Social Media → Nuclear)</li>
            <li>Your crush's Twitter handle makes threats more embarrassing 😈</li>
          </ul>
        </div>
      </div>
    </main>
  )
}

