/**
 * Local Storage Utilities
 * Handles user settings and preferences storage
 */

export interface StoredSettings {
  user_id: string;
  name?: string; // User's name
  gender?: string; // User's gender
  email?: string;
  phone_number?: string;
  mom_phone_number?: string;
  crush_phone_number?: string;
  twitter_handle?: string;
  enable_social_media_threats?: boolean;
  enable_sms_threats?: boolean;
  language?: string; // Voice language code (e.g., 'en', 'es', 'fr', 'de', etc.)
  text_language?: string; // UI text language code (e.g., 'en', 'es', 'fr', 'de', etc.)
}

const SETTINGS_KEY = 'alarm_clock_settings';
const USER_ID_KEY = 'alarm_clock_user_id';
const ALARM_HISTORY_KEY = 'alarm_clock_history';
const SLEEP_SESSIONS_KEY = 'sleep_sessions';

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
    language: 'en', // Default voice language to English
    text_language: 'en', // Default text language to English
  };
}

/**
 * Clear all settings
 */
export function clearSettings(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(SETTINGS_KEY);
  localStorage.removeItem(USER_ID_KEY);
  // Also clear alarm history and sleep stats
  clearAlarmHistory();
  localStorage.removeItem(SLEEP_SESSIONS_KEY);
}

/**
 * Alarm History Types
 */
export interface AlarmHistoryItem {
  id: string;
  time: string; // Time in HH:mm format
  date: string; // ISO date string when it was set
}

/**
 * Save alarm to history
 */
export function saveAlarmToHistory(time: string): void {
  if (typeof window === 'undefined') return;

  try {
    const history = getAlarmHistory();
    const alarmId = `alarm-${Date.now()}`;
    
    // Check if this time already exists
    const existingIndex = history.findIndex(alarm => alarm.time === time);
    
    if (existingIndex >= 0) {
      // Remove existing and add to top (most recent)
      history.splice(existingIndex, 1);
    }
    
    // Add new alarm to the beginning
    const newAlarm: AlarmHistoryItem = {
      id: alarmId,
      time: time,
      date: new Date().toISOString(),
    };
    
    history.unshift(newAlarm);
    
    // Keep only last 10 alarms
    const limitedHistory = history.slice(0, 10);
    
    localStorage.setItem(ALARM_HISTORY_KEY, JSON.stringify(limitedHistory));
  } catch (error) {
    console.error('Error saving alarm to history:', error);
  }
}

/**
 * Get alarm history
 */
export function getAlarmHistory(): AlarmHistoryItem[] {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const stored = localStorage.getItem(ALARM_HISTORY_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error reading alarm history:', error);
  }

  return [];
}

/**
 * Remove alarm from history
 */
export function removeAlarmFromHistory(alarmId: string): void {
  if (typeof window === 'undefined') return;

  try {
    const history = getAlarmHistory();
    const filtered = history.filter(alarm => alarm.id !== alarmId);
    localStorage.setItem(ALARM_HISTORY_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('Error removing alarm from history:', error);
  }
}

/**
 * Clear all alarm history
 */
export function clearAlarmHistory(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(ALARM_HISTORY_KEY);
}

/**
 * Sleep Session Types
 */
export interface SleepSession {
  date: string; // ISO date string
  hoursSlept: number;
  alarmTime: string; // HH:mm format
  wakeTime: string; // ISO date string
  snoozeCount: number;
}

/**
 * Save a sleep session
 */
export function saveSleepSession(session: SleepSession): void {
  if (typeof window === 'undefined') return;

  try {
    const sessions = getSleepSessions();
    sessions.push(session);
    
    // Keep only last 30 sessions
    const limitedSessions = sessions.slice(-30);
    
    localStorage.setItem(SLEEP_SESSIONS_KEY, JSON.stringify(limitedSessions));
  } catch (error) {
    console.error('Error saving sleep session:', error);
  }
}

/**
 * Get all sleep sessions
 */
export function getSleepSessions(): SleepSession[] {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const stored = localStorage.getItem(SLEEP_SESSIONS_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error reading sleep sessions:', error);
  }

  return [];
}

