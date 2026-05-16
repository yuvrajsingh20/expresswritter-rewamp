// lib/notifications/index.js
// Unified exports for notification system

export { NOTIFICATION_REGISTRY } from './registry';
export { emitNotificationEvent, createNotification } from './engine';
export { resolveNotificationLink, getNotificationLink } from './links';