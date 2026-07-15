import AsyncStorage from '@react-native-async-storage/async-storage';
import { DailyLog, UserProfile } from '@/types';

const KEYS = {
  profile: 'bloom:profile',
  logs: 'bloom:logs', // Record<dateString, DailyLog>
};

export async function loadProfile(): Promise<UserProfile | null> {
  const raw = await AsyncStorage.getItem(KEYS.profile);
  return raw ? JSON.parse(raw) : null;
}

export async function saveProfile(profile: UserProfile): Promise<void> {
  await AsyncStorage.setItem(KEYS.profile, JSON.stringify(profile));
}

export async function loadAllLogs(): Promise<Record<string, DailyLog>> {
  const raw = await AsyncStorage.getItem(KEYS.logs);
  return raw ? JSON.parse(raw) : {};
}

export async function saveAllLogs(logs: Record<string, DailyLog>): Promise<void> {
  await AsyncStorage.setItem(KEYS.logs, JSON.stringify(logs));
}

export function todayKey(date: Date = new Date()): string {
  return date.toISOString().slice(0, 10);
}
