/**
 * Local Storage Utilities
 * Handles user settings and preferences storage
 */

export interface StoredSettings {
  user_id: string;
  email?: string;
  phone_number?: string;
  twitter_handle?: string;
  crush_twitter_handle?: string;
  snooze_tolerance?: number;
  enable_social_media_threats?: boolean;
  enable_sms_threats?: boolean;
}

const SETTINGS_KEY = 'alarm_clock_settings';
const USER_ID_KEY = 'alarm_clock_user_id';

/**
 * Get user ID from storage or generate a new one
 */
export function getUserId(): string {
  if (typeof window === 'undefined') {
    return 'anonymous-' + Date.now();
  }

  let userId = localStorage.getItem(USER_ID_KEY);
  if (!userId) {
    userId = 'user-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem(USER_ID_KEY, userId);
  }
  return userId;
}

/**
 * Save user settings
 */
export function saveSettings(settings: Partial<StoredSettings>): void {
  if (typeof window === 'undefined') return;

  const existing = getSettings();
  const updated = {
    ...existing,
    ...settings,
    user_id: settings.user_id || existing.user_id || getUserId(),
  };

  localStorage.setItem(SETTINGS_KEY, JSON.stringify(updated));
}

/**
 * Get user settings
 */
export function getSettings(): StoredSettings {
  if (typeof window === 'undefined') {
    return {
      user_id: 'anonymous',
    };
  }

  try {
    const stored = localStorage.getItem(SETTINGS_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error reading settings:', error);
  }

  return {
    user_id: getUserId(),
    enable_social_media_threats: true,
    enable_sms_threats: true,
    snooze_tolerance: 5,
  };
}

/**
 * Clear all settings
 */
export function clearSettings(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(SETTINGS_KEY);
  localStorage.removeItem(USER_ID_KEY);
}

