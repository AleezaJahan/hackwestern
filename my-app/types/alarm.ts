// TypeScript types for the Passive-Aggressive Alarm Clock

export interface AlarmState {
  alarmTime: string | null;
  snoozeCount: number;
  isAlarmActive: boolean;
  crushName: string;
  twitterHandle: string;
}

export interface GenerateMessageRequest {
  snoozeCount: number;
  alarmTime: string;
}

export interface GenerateMessageResponse {
  message: string;
  audioUrl?: string;
}

export interface AnalyzeExcuseRequest {
  excuse: string;
  snoozeCount: number;
}

export interface AnalyzeExcuseResponse {
  roast: string;
}

export interface PostStatsRequest {
  snoozeCount: number;
  alarmTime: string;
  crushName?: string;
  twitterHandle?: string;
}

export interface PostStatsResponse {
  message: string;
  posted: boolean;
}
