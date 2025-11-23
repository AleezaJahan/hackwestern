'use client'

import { useState } from 'react'
import { saveSettings, StoredSettings } from '@/lib/storage'
import { isValidEmail, isValidPhone, formatPhoneNumber } from '@/lib/utils'
import { toast } from 'react-hot-toast'

interface OnboardingPopupProps {
  onComplete: () => void
}

export default function OnboardingPopup({ onComplete }: OnboardingPopupProps) {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState<Partial<StoredSettings>>({
    language: 'en',
    text_language: 'en',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const totalSteps = 6

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
    // Clear error when user types
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  const validateStep = (currentStep: number): boolean => {
    const newErrors: Record<string, string> = {}

    if (currentStep === 1) {
      if (!formData.name || formData.name.trim().length === 0) {
        newErrors.name = 'Name is required'
      }
      if (!formData.gender) {
        newErrors.gender = 'Gender is required'
      }
    }

    if (currentStep === 2) {
      if (formData.email && !isValidEmail(formData.email)) {
        newErrors.email = 'Please enter a valid email address'
      }
      if (formData.phone_number && !isValidPhone(formData.phone_number)) {
        newErrors.phone_number = 'Please enter a valid phone number (10 digits)'
      }
    }

    if (currentStep === 4) {
      // If SMS threats are enabled, phone number is required
      if (formData.enable_sms_threats !== false) {
        if (!formData.phone_number || !isValidPhone(formData.phone_number)) {
          newErrors.phone_number = 'Phone number is required when SMS threats are enabled'
          newErrors.enable_sms_threats = 'Please enter your phone number or disable SMS threats'
        }
        // Also check crush phone number (from step 3)
        if (!formData.crush_phone_number || !isValidPhone(formData.crush_phone_number)) {
          newErrors.crush_phone_number = 'Required when SMS threats are enabled'
          newErrors.enable_sms_threats = 'Please enter crush phone number or disable SMS threats'
        }
      }
      
      // If social media threats are enabled, Twitter handle is required
      if (formData.enable_social_media_threats !== false) {
        if (!formData.twitter_handle || formData.twitter_handle.trim().length === 0) {
          newErrors.twitter_handle = 'Twitter handle is required when social media threats are enabled'
          newErrors.enable_social_media_threats = 'Please enter your Twitter handle or disable social media threats'
        }
      }
    }

    if (currentStep === 3) {
      if (formData.crush_phone_number && !isValidPhone(formData.crush_phone_number)) {
        newErrors.crush_phone_number = 'Please enter a valid phone number (10 digits)'
      }
      // If SMS threats are enabled, crush phone number is required
      if (formData.enable_sms_threats !== false) {
        if (!formData.crush_phone_number || !isValidPhone(formData.crush_phone_number)) {
          newErrors.crush_phone_number = 'Required when SMS threats are enabled'
        }
      }
    }

    if (currentStep === 4) {
      // If social media threats are enabled, Twitter handle is required
      if (formData.enable_social_media_threats !== false) {
        if (!formData.twitter_handle || formData.twitter_handle.trim().length === 0) {
          newErrors.twitter_handle = 'Twitter handle is required when social media threats are enabled'
          newErrors.enable_social_media_threats = 'Please enter your Twitter handle or disable social media threats'
        }
      }
      if (formData.twitter_handle && formData.twitter_handle.trim().length === 0) {
        newErrors.twitter_handle = 'Please enter a valid Twitter handle'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateStep(step)) {
      if (step < totalSteps) {
        setStep(step + 1)
      } else {
        handleComplete()
      }
    } else {
      // Show toast error for validation failures
      if (step === 3 && formData.enable_sms_threats !== false && (!formData.crush_phone_number || !isValidPhone(formData.crush_phone_number))) {
        toast.error('Please enter crush phone number or disable SMS threats to continue')
      }
      if (step === 4) {
        if (formData.enable_sms_threats !== false) {
          if (!formData.phone_number || !isValidPhone(formData.phone_number)) {
            toast.error('Please enter your phone number or disable SMS threats to continue')
          } else if (!formData.crush_phone_number || !isValidPhone(formData.crush_phone_number)) {
            toast.error('Please enter crush phone number or disable SMS threats to continue')
          }
        }
        if (formData.enable_social_media_threats !== false && !formData.twitter_handle) {
          toast.error('Please enter your Twitter handle or disable social media threats to continue')
        }
      }
    }
  }

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1)
    }
  }

  const handleComplete = () => {
    // Final validation
    if (!formData.name || !formData.gender) {
      toast.error('Please complete all required fields')
      setStep(1)
      return
    }

    // Validate SMS threats require phone number and crush phone number
    if (formData.enable_sms_threats !== false) {
      if (!formData.phone_number || !isValidPhone(formData.phone_number)) {
        toast.error('Please enter your phone number or disable SMS threats')
        setStep(2)
        return
      }
      if (!formData.crush_phone_number || !isValidPhone(formData.crush_phone_number)) {
        toast.error('Please enter crush phone number or disable SMS threats')
        setStep(3)
        return
      }
    }

    // Validate social media threats require Twitter handle
    if (formData.enable_social_media_threats !== false && !formData.twitter_handle) {
      toast.error('Please enter your Twitter handle or disable social media threats')
      setStep(4)
      return
    }

    // Save all settings
    const settingsToSave: Partial<StoredSettings> = {
      ...formData,
      enable_social_media_threats: formData.enable_social_media_threats !== false,
      enable_sms_threats: formData.enable_sms_threats !== false,
    }

    saveSettings(settingsToSave)
    toast.success('Welcome! Your settings have been saved.')
    onComplete()
  }

  const handleSkip = () => {
    // Save minimal settings and continue
    saveSettings({
      name: formData.name || 'User',
      gender: formData.gender || 'other',
      language: formData.language || 'en',
      text_language: formData.text_language || 'en',
    })
    onComplete()
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4">
      <div className="bg-purple-950/95 backdrop-blur-md rounded-2xl sm:rounded-3xl shadow-2xl p-4 sm:p-6 md:p-8 max-w-2xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto border-4 border-purple-800/80">
        {/* Header */}
        <div className="text-center mb-4 sm:mb-6">
          <div className="text-4xl sm:text-5xl md:text-6xl mb-3 sm:mb-4">🌙</div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">Welcome to Rise & Roast!</h2>
          <p className="text-white/70 text-sm sm:text-base">
            Let's set up your profile ({step}/{totalSteps})
          </p>
          {/* Progress bar */}
          <div className="mt-4 w-full bg-white/20 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-purple-500 to-indigo-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(step / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        {/* Step 1: Basic Info */}
        {step === 1 && (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-white mb-4">Basic Information</h3>
            
            <div>
              <label className="block text-sm font-medium text-white/90 mb-2">
                Your Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={formData.name || ''}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="Enter your name"
                className="w-full px-4 py-3 sm:py-3.5 border border-white/30 rounded-xl focus:ring-2 focus:ring-purple-400 focus:border-transparent text-base sm:text-lg text-gray-900 bg-white/90 backdrop-blur-sm min-h-[44px]"
              />
              {errors.name && <p className="mt-1 text-sm text-red-400">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-white/90 mb-2">
                Gender <span className="text-red-400">*</span>
              </label>
              <select
                value={formData.gender || ''}
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
              {errors.gender && <p className="mt-1 text-sm text-red-400">{errors.gender}</p>}
            </div>
          </div>
        )}

        {/* Step 2: Contact Info */}
        {step === 2 && (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-white mb-4">Contact Information</h3>
            
            <div>
              <label className="block text-sm font-medium text-white/90 mb-2">
                Email
              </label>
              <input
                type="email"
                value={formData.email || ''}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="your.email@example.com"
                className="w-full px-4 py-3 border border-white/30 rounded-xl focus:ring-2 focus:ring-purple-400 focus:border-transparent text-gray-900 bg-white/90 backdrop-blur-sm"
              />
              {errors.email && <p className="mt-1 text-sm text-red-400">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-white/90 mb-2">
                Phone Number
                {formData.enable_sms_threats !== false && (
                  <span className="text-red-400 ml-1">*</span>
                )}
              </label>
              <input
                type="tel"
                value={formData.phone_number || ''}
                onChange={(e) => {
                  const cleaned = e.target.value.replace(/\D/g, '')
                  handleChange('phone_number', cleaned)
                }}
                placeholder="1234567890"
                maxLength={10}
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-400 focus:border-transparent text-gray-900 bg-white/90 backdrop-blur-sm ${
                  errors.phone_number ? 'border-red-400' : 'border-white/30'
                }`}
              />
              {formData.phone_number && (
                <p className="mt-1 text-xs text-white/60">
                  Formatted: {formatPhoneNumber(formData.phone_number)}
                </p>
              )}
              <p className="mt-1 text-xs text-white/60">
                {formData.enable_sms_threats !== false && (
                  <span className="text-red-400">Required when SMS threats are enabled</span>
                )}
              </p>
              {errors.phone_number && <p className="mt-1 text-sm text-red-400">{errors.phone_number}</p>}
            </div>
          </div>
        )}

        {/* Step 3: Crush Info */}
        {step === 3 && (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-white mb-4">Crush Information</h3>
            <p className="text-white/70 text-sm mb-4">
              We'll text your crush if you snooze too much! 😈
            </p>
            
            <div>
              <label className="block text-sm font-medium text-white/90 mb-2">
                Crush's Phone Number
                {formData.enable_sms_threats !== false && (
                  <span className="text-red-400 ml-1">*</span>
                )}
              </label>
              <input
                type="tel"
                value={formData.crush_phone_number || ''}
                onChange={(e) => {
                  const cleaned = e.target.value.replace(/\D/g, '')
                  handleChange('crush_phone_number', cleaned)
                }}
                placeholder="1234567890"
                maxLength={10}
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-400 focus:border-transparent text-gray-900 bg-white/90 backdrop-blur-sm ${
                  errors.crush_phone_number ? 'border-red-400' : 'border-white/30'
                }`}
              />
              {formData.crush_phone_number && (
                <p className="mt-1 text-xs text-white/60">
                  Formatted: {formatPhoneNumber(formData.crush_phone_number)}
                </p>
              )}
              <p className="mt-1 text-xs text-white/60">
                {formData.enable_sms_threats !== false && (
                  <span className="text-red-400">Required when SMS threats are enabled</span>
                )}
              </p>
              {errors.crush_phone_number && <p className="mt-1 text-sm text-red-400">{errors.crush_phone_number}</p>}
            </div>
          </div>
        )}

        {/* Step 4: Social Media */}
        {step === 4 && (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-white mb-4">Social Media</h3>
            
            <div>
              <label className="block text-sm font-medium text-white/90 mb-2">
                Your Twitter Handle
                {formData.enable_social_media_threats !== false && (
                  <span className="text-red-400 ml-1">*</span>
                )}
              </label>
              <div className="flex items-center gap-2">
                <span className="text-white/70">@</span>
                <input
                  type="text"
                  value={formData.twitter_handle || ''}
                  onChange={(e) => {
                    const cleaned = e.target.value.replace(/[^a-zA-Z0-9_]/g, '')
                    handleChange('twitter_handle', cleaned)
                  }}
                  placeholder="your_handle"
                  className={`flex-1 px-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-400 focus:border-transparent text-gray-900 bg-white/90 backdrop-blur-sm ${
                    errors.twitter_handle ? 'border-red-400' : 'border-white/30'
                  }`}
                />
              </div>
              <p className="mt-1 text-xs text-white/60">
                Your Twitter/X username (without @)
                {formData.enable_social_media_threats !== false && (
                  <span className="text-red-400 ml-1">Required when social media threats are enabled</span>
                )}
              </p>
              {errors.twitter_handle && <p className="mt-1 text-sm text-red-400">{errors.twitter_handle}</p>}
            </div>

            <div className="flex items-center justify-between p-4 bg-purple-800/30 backdrop-blur-sm rounded-2xl border border-purple-300/20">
              <div>
                <label className="block text-sm font-medium text-white">
                  Enable Social Media Threats
                </label>
                <p className="text-xs text-white/70 mt-1">
                  Allow the alarm to post to Twitter/X when thresholds are reached
                </p>
                {errors.enable_social_media_threats && (
                  <p className="text-xs text-red-400 mt-1">{errors.enable_social_media_threats}</p>
                )}
              </div>
              <input
                type="checkbox"
                checked={formData.enable_social_media_threats !== false}
                onChange={(e) => {
                  handleChange('enable_social_media_threats', e.target.checked)
                  // Clear error when toggled off
                  if (!e.target.checked && errors.enable_social_media_threats) {
                    setErrors((prev) => {
                      const newErrors = { ...prev }
                      delete newErrors.enable_social_media_threats
                      delete newErrors.twitter_handle
                      return newErrors
                    })
                  }
                }}
                className="w-5 h-5 text-purple-500 rounded focus:ring-purple-400"
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-purple-800/30 backdrop-blur-sm rounded-2xl border border-purple-300/20">
              <div>
                <label className="block text-sm font-medium text-white">
                  Enable SMS Threats
                </label>
                <p className="text-xs text-white/70 mt-1">
                  Receive threatening SMS messages via Twilio
                </p>
                {errors.enable_sms_threats && (
                  <p className="text-xs text-red-400 mt-1">{errors.enable_sms_threats}</p>
                )}
              </div>
              <input
                type="checkbox"
                checked={formData.enable_sms_threats !== false}
                onChange={(e) => {
                  handleChange('enable_sms_threats', e.target.checked)
                  // Clear error when toggled off
                  if (!e.target.checked && errors.enable_sms_threats) {
                    setErrors((prev) => {
                      const newErrors = { ...prev }
                      delete newErrors.enable_sms_threats
                      delete newErrors.phone_number
                      delete newErrors.crush_phone_number
                      return newErrors
                    })
                  }
                }}
                className="w-5 h-5 text-purple-500 rounded focus:ring-purple-400"
              />
            </div>
          </div>
        )}

        {/* Step 5: Voice Language */}
        {step === 5 && (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-white mb-4">Voice Language</h3>
            <p className="text-white/70 text-sm mb-4">
              Select the language for voice messages and roasts
            </p>
            
            <div>
              <label className="block text-sm font-medium text-white/90 mb-2">
                Voice Language
              </label>
              <select
                value={formData.language || 'en'}
                onChange={(e) => handleChange('language', e.target.value)}
                className="w-full px-4 py-3 border border-white/30 rounded-xl focus:ring-2 focus:ring-purple-400 focus:border-transparent text-gray-900 bg-white/90 backdrop-blur-sm"
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
            </div>
          </div>
        )}

        {/* Step 6: Text Language */}
        {step === 6 && (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-white mb-4">Text Language</h3>
            <p className="text-white/70 text-sm mb-4">
              Select the language for all UI text and interface elements
            </p>
            
            <div>
              <label className="block text-sm font-medium text-white/90 mb-2">
                Text Language
              </label>
              <select
                value={formData.text_language || 'en'}
                onChange={(e) => handleChange('text_language', e.target.value)}
                className="w-full px-4 py-3 border border-white/30 rounded-xl focus:ring-2 focus:ring-purple-400 focus:border-transparent text-gray-900 bg-white/90 backdrop-blur-sm"
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
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center mt-8 pt-6 border-t border-white/20">
          <div>
            {step > 1 && (
              <button
                onClick={handleBack}
                className="px-6 py-2 bg-white/10 backdrop-blur-sm text-white border-2 border-purple-700 rounded-lg font-semibold hover:bg-white/20 hover:border-purple-600 transition-colors"
              >
                ← Back
              </button>
            )}
          </div>
          
          <div className="flex gap-3">
            {step < totalSteps ? (
              <>
                <button
                  onClick={handleSkip}
                  className="px-6 py-2 text-white/70 hover:text-white transition-colors"
                >
                  Skip
                </button>
                <button
                  onClick={handleNext}
                  className="px-6 py-3 sm:py-3.5 bg-gradient-to-r from-purple-800 to-indigo-800 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-indigo-700 active:from-purple-900 active:to-indigo-900 transition-all shadow-lg text-base sm:text-lg min-h-[48px] w-full sm:w-auto"
                >
                  Next →
                </button>
              </>
            ) : (
              <button
                onClick={handleComplete}
                className="px-6 sm:px-8 py-3 sm:py-3.5 bg-gradient-to-r from-purple-800 to-indigo-800 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-indigo-700 active:from-purple-900 active:to-indigo-900 transition-all shadow-lg text-base sm:text-lg min-h-[48px] w-full sm:w-auto"
              >
                Complete Setup ✨
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

