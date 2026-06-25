/**
 * notifications.js — Daily mood reminder notification system
 *
 * Usage in any component or on app mount:
 *   import { scheduleDailyReminder, cancelReminder } from '../services/notifications.js';
 *   scheduleDailyReminder(9, 0); // remind at 9:00 AM
 */

const STORAGE_KEY = 'mindcare_reminder_time';
const INTERVAL_ID_KEY = 'mindcare_reminder_interval';

const MESSAGES = [
  { title: 'MindCare AI 💜', body: 'How are you feeling today? A 10-second check-in can change your whole day.' },
  { title: 'Wellness check-in 🌤️', body: 'Your mood log is waiting. One honest answer is all it takes.' },
  { title: 'MindCare AI 🌙', body: 'Take a breath. Log how you\'re feeling — it only takes a moment.' },
  { title: 'Daily reflection 📝', body: 'Your journal is open whenever you\'re ready. How was today?' },
  { title: 'MindCare AI ✨', body: 'A gentle reminder to check in with yourself. You\'ve got this.' },
];

function getRandomMessage() {
  return MESSAGES[Math.floor(Math.random() * MESSAGES.length)];
}

/**
 * Request notification permission. Returns true if granted.
 */
export async function requestPermission() {
  if (!('Notification' in window)) return false;
  if (Notification.permission === 'granted') return true;
  const result = await Notification.requestPermission();
  return result === 'granted';
}

/**
 * Show a notification immediately (for testing or on-demand).
 */
export function showNotification(title, body, options = {}) {
  if (!('Notification' in window) || Notification.permission !== 'granted') return;
  const msg = title ? { title, body } : getRandomMessage();
  new Notification(msg.title, {
    body: msg.body,
    icon: '/icons/icon-192.png',
    badge: '/icons/badge-72.png',
    tag: 'mindcare-daily',
    renotify: true,
    ...options,
  });
}

/**
 * Schedule a daily reminder at a specific hour/minute.
 * Checks every minute if it's time to fire.
 */
export function scheduleDailyReminder(hour = 9, minute = 0) {
  if (!('Notification' in window) || Notification.permission !== 'granted') return;

  localStorage.setItem(STORAGE_KEY, JSON.stringify({ hour, minute }));

  // Clear any existing interval
  cancelReminder();

  const id = setInterval(() => {
    const now = new Date();
    if (now.getHours() === hour && now.getMinutes() === minute) {
      // Only notify once per day
      const lastNotif = localStorage.getItem('mindcare_last_notif');
      const today = new Date().toISOString().slice(0, 10);
      if (lastNotif !== today) {
        showNotification();
        localStorage.setItem('mindcare_last_notif', today);
      }
    }
  }, 60 * 1000); // check every minute

  // Store interval ID in window (doesn't survive refresh, but that's fine)
  window.__mindcareReminderInterval = id;
}

/**
 * Cancel the scheduled daily reminder.
 */
export function cancelReminder() {
  if (window.__mindcareReminderInterval) {
    clearInterval(window.__mindcareReminderInterval);
    window.__mindcareReminderInterval = null;
  }
}

/**
 * Restore reminders from localStorage on app start.
 * Call this once in App.jsx useEffect.
 */
export function restoreReminder() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return;
  try {
    const { hour, minute } = JSON.parse(stored);
    scheduleDailyReminder(hour, minute);
  } catch {}
}