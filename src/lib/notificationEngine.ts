/**
 * notificationEngine.ts
 * Helper functions to trigger automated Email & SMS login alerts
 * and 7-day chat inactivity email alerts.
 */

export async function sendAuthAlert(
  email: string,
  name: string,
  loginMethod: 'Google' | 'Email' = 'Email',
  phone?: string
) {
  if (!email) return;
  try {
    await fetch('/api/notify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'auth_alert',
        email,
        name,
        loginMethod,
        phone
      })
    });
  } catch (err) {
    console.error('[NotificationEngine] sendAuthAlert failed:', err);
  }
}

export async function send7DayInactivityAlert(
  email: string,
  name: string,
  threadTitle: string,
  daysOld = 7
) {
  if (!email) return;
  try {
    await fetch('/api/notify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'inactivity_alert',
        email,
        name,
        threadTitle,
        daysOld
      })
    });
  } catch (err) {
    console.error('[NotificationEngine] send7DayInactivityAlert failed:', err);
  }
}
