/**
 * API Client for Backend Integration
 * Handles all communication with Person 2 (AI & Voice) and Person 4 (Social Media) backends
 */

import axios from 'axios';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
const SOCIAL_BACKEND_URL = process.env.NEXT_PUBLIC_SOCIAL_BACKEND_URL || 'http://localhost:8787';

// Create axios instances
const backendApi = axios.create({
  baseURL: BACKEND_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

const socialApi = axios.create({
  baseURL: SOCIAL_BACKEND_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Types
export interface AlarmTriggerRequest {
  snooze_count: number;
  user_id?: string;
  wake_up_time?: string;
}

export interface AlarmTriggerResponse {
  audio_url: string;
  message: string;
  snooze_count: number;
  level: string;
}

export interface SnoozeRequest {
  excuse: string;
  snooze_count: number;
  user_id?: string;
  transcribed_audio?: string;
}

export interface SnoozeResponse {
  analysis: {
    legitimacy_score?: number;
    analysis?: string;
    recommended_intensity?: string;
  };
  roast: string;
  audio_url: string;
  snooze_count: number;
  level: string;
  sentiment?: any;
}

export interface UserStats {
  total_snoozes: number;
  longest_snooze_session: number;
  most_common_excuse: string;
  excuse_count: number;
}

export interface SocialMediaThreat {
  threat_message: string;
  snooze_count: number;
  wake_up_time: string;
  user_id?: string;
}

export interface UserSettings {
  user_id: string;
  email?: string;
  phone_number?: string;
  twitter_handle?: string;
  crush_twitter_handle?: string;
  snooze_tolerance?: number;
  enable_social_media_threats?: boolean;
  enable_sms_threats?: boolean;
}

/**
 * Trigger alarm (initial or after snooze)
 */
export async function triggerAlarm(request: AlarmTriggerRequest): Promise<AlarmTriggerResponse> {
  const response = await backendApi.post<AlarmTriggerResponse>('/alarm/trigger', request);
  return response.data;
}

/**
 * Handle snooze event with excuse
 */
export async function handleSnooze(request: SnoozeRequest): Promise<SnoozeResponse> {
  const response = await backendApi.post<SnoozeResponse>('/snooze', request);
  return response.data;
}

/**
 * Analyze excuse without triggering alarm
 */
export async function analyzeExcuse(
  excuse: string,
  snoozeCount: number,
  userId?: string
): Promise<SnoozeResponse> {
  const response = await backendApi.post<SnoozeResponse>('/excuse/analyze', {
    excuse,
    snooze_count: snoozeCount,
    user_id: userId,
  });
  return response.data;
}

/**
 * Get audio file URL
 */
export function getAudioUrl(filename: string): string {
  return `${BACKEND_URL}/audio/${filename}`;
}

/**
 * Send snooze event to social media backend
 */
export async function notifySocialBackend(
  userId: string,
  snoozeCount: number,
  wakeUpTime: string
): Promise<any> {
  try {
    const response = await socialApi.post('/snooze/event', {
      user_id: userId,
      snooze_count: snoozeCount,
      wake_up_time: wakeUpTime,
    });
    return response.data;
  } catch (error) {
    console.error('Error notifying social backend:', error);
    return { success: false, error: (error as any).message };
  }
}

/**
 * Get user stats from social backend
 */
export async function getUserStats(userId: string, date?: string): Promise<UserStats | null> {
  try {
    const params = new URLSearchParams({ user_id: userId });
    if (date) params.append('date', date);
    
    const response = await socialApi.get<{ success: boolean; stats: UserStats }>('/user/stats', {
      params,
    });
    return response.data.stats || null;
  } catch (error) {
    console.error('Error getting user stats:', error);
    return null;
  }
}

/**
 * Get user's top excuses
 */
export async function getUserExcuses(userId: string, limit: number = 5): Promise<any[]> {
  try {
    const response = await socialApi.get<{ success: boolean; excuses: any[] }>('/user/excuses', {
      params: { user_id: userId, limit },
    });
    return response.data.excuses || [];
  } catch (error) {
    console.error('Error getting user excuses:', error);
    return [];
  }
}

/**
 * Get snooze history
 */
export async function getSnoozeHistory(userId: string, limit: number = 10): Promise<any[]> {
  try {
    const response = await socialApi.get<{ success: boolean; history: any[] }>('/user/history', {
      params: { user_id: userId, limit },
    });
    return response.data.history || [];
  } catch (error) {
    console.error('Error getting snooze history:', error);
    return [];
  }
}

/**
 * Generate social media threat message
 */
export async function generateSocialMediaThreat(
  snoozeCount: number,
  userId?: string
): Promise<SocialMediaThreat> {
  const response = await backendApi.post<SocialMediaThreat>('/social-media/threat', {
    snooze_count: snoozeCount,
    user_id: userId,
  });
  return response.data;
}

/**
 * Health check for backend
 */
export async function checkBackendHealth(): Promise<boolean> {
  try {
    const response = await backendApi.get('/health');
    return response.status === 200;
  } catch (error) {
    return false;
  }
}

/**
 * Health check for social backend
 */
export async function checkSocialBackendHealth(): Promise<boolean> {
  try {
    const response = await socialApi.get('/health');
    return response.status === 200;
  } catch (error) {
    return false;
  }
}

