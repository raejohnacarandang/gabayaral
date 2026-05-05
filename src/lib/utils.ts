import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const STORAGE_KEYS = {
  students: 'gabayaral_students',
  grades: 'gabayaral_grades',
  feedback: 'gabayaral_feedback',
  alerts: 'gabayaral_alerts',
  acknowledged: 'gabayaral_acknowledged',
  isAuthenticated: 'gabayaral_auth',
  role: 'gabayaral_role',
}

export function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS[key] || key)
    return stored ? JSON.parse(stored) : fallback
  } catch {
    return fallback
  }
}

export function saveToStorage(key: string, data: unknown): void {
  try {
    localStorage.setItem(STORAGE_KEYS[key] || key, JSON.stringify(data))
  } catch (e) {
    console.error('localStorage save error:', e)
  }
}

export function clearStorage(): void {
  Object.values(STORAGE_KEYS).forEach(k => localStorage.removeItem(k))
}
