/**
 * Utility Functions
 */

import { format, formatDistanceToNow, isBefore, differenceInMinutes } from 'date-fns';

/**
 * Format time for display
 */
export function formatTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return format(d, 'h:mm a');
}

/**
 * Format date for display
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return format(d, 'MMM d, yyyy');
}

/**
 * Format date and time for display
 */
export function formatDateTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return format(d, 'MMM d, yyyy h:mm a');
}

/**
 * Format date for datetime-local input (YYYY-MM-DDTHH:mm)
 */
export function formatDateTimeLocal(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  // Get local date/time components
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

/**
 * Get relative time (e.g., "5 minutes ago")
 */
export function getRelativeTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return formatDistanceToNow(d, { addSuffix: true });
}

/**
 * Check if alarm time has passed
 */
export function isAlarmTimePassed(alarmTime: Date | string): boolean {
  const alarm = typeof alarmTime === 'string' ? new Date(alarmTime) : alarmTime;
  return isBefore(alarm, new Date());
}

/**
 * Get minutes until alarm
 */
export function getMinutesUntilAlarm(alarmTime: Date | string): number {
  const alarm = typeof alarmTime === 'string' ? new Date(alarmTime) : alarmTime;
  return Math.max(0, differenceInMinutes(alarm, new Date()));
}

/**
 * Get snooze level display info
 */
export function getSnoozeLevelInfo(snoozeCount: number): {
  level: string;
  color: string;
  bgColor: string;
  emoji: string;
  message: string;
} {
  if (snoozeCount <= 2) {
    return {
      level: 'Mild',
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      emoji: '😊',
      message: 'You\'re doing okay!',
    };
  } else if (snoozeCount <= 4) {
    return {
      level: 'Moderate',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
      emoji: '😐',
      message: 'Getting a bit excessive...',
    };
  } else if (snoozeCount <= 6) {
    return {
      level: 'Aggressive',
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      emoji: '😠',
      message: 'This is getting ridiculous!',
    };
  } else {
    return {
      level: 'Nuclear',
      color: 'text-red-600',
      bgColor: 'bg-red-100',
      emoji: '💀',
      message: 'NUCLEAR OPTION ENGAGED!',
    };
  }
}

/**
 * Get next escalation threshold
 */
export function getNextThreshold(snoozeCount: number): {
  threshold: number;
  snoozesUntil: number;
  message: string;
} | null {
  const thresholds = [3, 5, 7, 10];
  const next = thresholds.find((t) => snoozeCount < t);
  
  if (!next) {
    return null;
  }

  return {
    threshold: next,
    snoozesUntil: next - snoozeCount,
    message: getThresholdMessage(next),
  };
}

function getThresholdMessage(threshold: number): string {
  switch (threshold) {
    case 3:
      return 'Next: SMS threat at 3 snoozes';
    case 5:
      return 'Next: Social media threat at 5 snoozes';
    case 7:
      return 'Next: Twitter post at 7 snoozes';
    case 10:
      return 'Next: Nuclear option at 10 snoozes';
    default:
      return 'All thresholds passed!';
  }
}

/**
 * Format phone number for display
 */
export function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  return phone;
}

/**
 * Validate email
 */
export function isValidEmail(email: string): boolean {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

/**
 * Validate phone number
 */
export function isValidPhone(phone: string): boolean {
  const cleaned = phone.replace(/\D/g, '');
  return cleaned.length === 10 || cleaned.length === 11;
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };
    
    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}

