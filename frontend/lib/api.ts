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
 * Get random image from camera roll automatically
 * Prompts user to select a folder containing photos, then randomly picks one
 */
export async function getRandomImageFromCameraRoll(): Promise<File | null> {
  try {
    // Method 1: Try File System Access API (Chrome/Edge) - allows folder selection
    if ('showDirectoryPicker' in window) {
      try {
        const directoryHandle = await (window as any).showDirectoryPicker({
          mode: 'read',
        });
        
        // Get all image files from the directory recursively
        const imageFiles: File[] = [];
        
        async function scanDirectory(handle: any) {
          for await (const entry of handle.values()) {
            if (entry.kind === 'file') {
              const file = await entry.getFile();
              if (file.type.startsWith('image/')) {
                imageFiles.push(file);
              }
            } else if (entry.kind === 'directory') {
              // Recursively scan subdirectories
              await scanDirectory(entry);
            }
          }
        }
        
        await scanDirectory(directoryHandle);
        
        // Return a random image
        if (imageFiles.length > 0) {
          const randomIndex = Math.floor(Math.random() * imageFiles.length);
          console.log(`Found ${imageFiles.length} images, selected random image #${randomIndex + 1}`);
          return imageFiles[randomIndex];
        } else {
          console.warn('No images found in selected directory');
          return null;
        }
      } catch (error: any) {
        // User cancelled or error occurred
        if (error.name !== 'AbortError') {
          console.log('File System Access API error:', error);
        }
        // Fall through to fallback method
      }
    }
    
    // Method 2: Fallback - Use file input with directory selection (webkitdirectory)
    return new Promise((resolve) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.multiple = true; // Allow multiple files
      input.webkitdirectory = true; // Allow directory selection
      input.directory = true; // Alternative attribute
      input.style.display = 'none';
      
      input.onchange = async (e: any) => {
        const files = Array.from(e.target.files || []) as File[];
        const imageFiles = files.filter(file => file.type.startsWith('image/'));
        
        if (imageFiles.length > 0) {
          // Select a random image
          const randomIndex = Math.floor(Math.random() * imageFiles.length);
          console.log(`Found ${imageFiles.length} images, selected random image #${randomIndex + 1}`);
          document.body.removeChild(input);
          resolve(imageFiles[randomIndex]);
        } else {
          console.warn('No images found in selected folder');
          document.body.removeChild(input);
          resolve(null);
        }
      };
      
      // Handle cancellation
      const handleBlur = () => {
        setTimeout(() => {
          if (document.body.contains(input) && (!input.files || input.files.length === 0)) {
            document.body.removeChild(input);
            window.removeEventListener('blur', handleBlur);
            resolve(null);
          }
        }, 100);
      };
      
      window.addEventListener('blur', handleBlur);
      
      // Add to DOM and trigger file picker
      document.body.appendChild(input);
      input.click();
      
      // Timeout after 60 seconds
      setTimeout(() => {
        if (document.body.contains(input)) {
          document.body.removeChild(input);
          window.removeEventListener('blur', handleBlur);
          resolve(null);
        }
      }, 60000);
    });
  } catch (error) {
    console.error('Error accessing camera roll:', error);
    return null;
  }
}

/**
 * Send snooze event to social media backend
 */
export async function notifySocialBackend(
  userId: string,
  snoozeCount: number,
  wakeUpTime: string,
  imageData?: File | null,
  momPhoneNumber?: string
): Promise<any> {
  try {
    const basePayload: any = {
      user_id: userId,
      snooze_count: snoozeCount,
      wake_up_time: wakeUpTime,
    };

    // Include mom's phone number if provided
    if (momPhoneNumber) {
      basePayload.mom_phone_number = momPhoneNumber;
    }

    // If snooze 5, we need to send image data
    if (snoozeCount >= 5 && imageData) {
      // Convert image to base64 for sending
      const base64Image = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          // Remove data URL prefix
          const base64 = result.split(',')[1];
          resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(imageData);
      });

      const response = await socialApi.post('/snooze/event', {
        ...basePayload,
        image_data: base64Image,
        image_type: imageData.type,
      });
      return response.data;
    } else {
      const response = await socialApi.post('/snooze/event', basePayload);
      return response.data;
    }
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

