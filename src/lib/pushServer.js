import webpush from 'web-push';
import prisma from '@/lib/prisma';

const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const privateKey = process.env.VAPID_PRIVATE_KEY;
const subject = process.env.VAPID_SUBJECT || 'mailto:seramikbak@gmail.com';

if (publicKey && privateKey) {
  try {
    webpush.setVapidDetails(subject, publicKey, privateKey);
  } catch (err) {
    console.warn('VAPID setup warning:', err.message);
  }
}

/**
 * Sends a Web Push notification to specific user or user group (e.g. DEALER, ARCHITECT)
 * @param {Object} params
 * @param {string} params.userType - "DEALER", "ARCHITECT", "USER", "ALL"
 * @param {string} [params.userId] - Optional specific dealerId or architectId
 * @param {string} params.title - Notification title
 * @param {string} params.body - Notification body text
 * @param {string} [params.url] - Target click URL (e.g. '/bayi' or '/mimar')
 * @returns {Promise<{ success: boolean, sentCount: number }>}
 */
export async function sendPushNotification({ userType, userId, title, body, url = '/' }) {
  if (!publicKey || !privateKey) {
    console.warn('Cannot send push: VAPID keys not configured in environment.');
    return { success: false, error: 'VAPID keys missing' };
  }

  try {
    const where = {};
    if (userType && userType !== 'ALL') {
      where.userType = userType;
    }
    if (userId) {
      where.userId = userId;
    }

    const subscriptions = await prisma.pushSubscription.findMany({
      where
    });

    if (subscriptions.length === 0) {
      return { success: true, sentCount: 0, message: 'No active push subscriptions found' };
    }

    const payload = JSON.stringify({
      title,
      body,
      url,
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      timestamp: Date.now()
    });

    let sentCount = 0;
    const staleIds = [];

    await Promise.all(
      subscriptions.map(async (sub) => {
        const pushConfig = {
          endpoint: sub.endpoint,
          keys: {
            p256dh: sub.p256dh,
            auth: sub.auth
          }
        };

        try {
          await webpush.sendNotification(pushConfig, payload);
          sentCount++;
        } catch (err) {
          // If subscription has expired or is unsubscribed (HTTP 404 or 410)
          if (err.statusCode === 404 || err.statusCode === 410) {
            staleIds.push(sub.id);
          } else {
            console.error(`Push error for subscription ${sub.id}:`, err.message);
          }
        }
      })
    );

    // Clean up stale subscriptions from DB
    if (staleIds.length > 0) {
      try {
        await prisma.pushSubscription.deleteMany({
          where: { id: { in: staleIds } }
        });
      } catch (cleanErr) {
        console.warn('Failed to clean up stale push subscriptions:', cleanErr.message);
      }
    }

    return { success: true, sentCount };
  } catch (error) {
    console.error('sendPushNotification general error:', error);
    return { success: false, error: error.message };
  }
}
