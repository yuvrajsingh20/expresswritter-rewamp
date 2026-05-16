// lib/notifications/links.js
// Role-aware link resolution at RENDER time

const LINK_MAP = {
  order: {
    STUDENT: (id) => `/student?tab=orders&orderId=${id}`,
    FREELANCER: (id) => `/freelancer?tab=orders&orderId=${id}`,
    ADMIN: (id) => `/admin?tab=orders&orderId=${id}`,
    SUB_ADMIN: (id) => `/subadmin?tab=orders&orderId=${id}`,
  },
  ticket: {
    STUDENT: (id) => `/student?tab=tickets`,
    FREELANCER: (id) => `/freelancer?tab=tickets`,
    ADMIN: (id) => `/admin?tab=tickets`,
    SUB_ADMIN: (id) => `/subadmin?tab=tickets`,
  },
  payout: {
    FREELANCER: (id) => `/freelancer?tab=earnings`,
    ADMIN: (id) => `/admin?tab=payments`,
  },
  message: {
    STUDENT: (id) => `/student?tab=messages&orderId=${id}`,
    FREELANCER: (id) => `/freelancer?tab=messages&orderId=${id}`,
    ADMIN: (id) => `/admin?tab=orders&orderId=${id}`,
  },
};

/**
 * Resolves entity reference into role-specific URL at render time
 * @param {string} entityType - 'order', 'ticket', 'payout', 'message'
 * @param {string} entityId - The ID of the entity
 * @param {string} userRole - User's role (STUDENT, FREELANCER, ADMIN, SUB_ADMIN)
 * @returns {string|null} - Resolved URL or null if can't resolve
 */
export function resolveNotificationLink(entityType, entityId, userRole) {
  if (!entityType || !entityId) return null;
  
  const resolver = LINK_MAP[entityType]?.[userRole];
  return resolver ? resolver(entityId) : null;
}

/**
 * Get link with fallback - tries to use provided link first, then resolves from entity
 * @param {string} providedLink - The link stored in notification (legacy)
 * @param {string} entityType - Entity type for resolution
 * @param {string} entityId - Entity ID for resolution
 * @param {string} userRole - User's role
 * @returns {string} - Best available link
 */
export function getNotificationLink(providedLink, entityType, entityId, userRole) {
  // If we have a valid provided link (not legacy dashboard path), use it
  if (providedLink && !providedLink.includes('/dashboard/')) {
    // Convert old format to new format
    if (providedLink.includes('/student/orders/')) {
      const id = providedLink.split('/student/orders/')[1];
      return `/student?tab=orders&orderId=${id}`;
    }
    if (providedLink.includes('/freelancer/orders/')) {
      const id = providedLink.split('/freelancer/orders/')[1];
      return `/freelancer?tab=orders&orderId=${id}`;
    }
    if (providedLink.includes('/admin/orders/')) {
      const id = providedLink.split('/admin/orders/')[1];
      return `/admin?tab=orders&orderId=${id}`;
    }
    return providedLink;
  }
  
  // Otherwise resolve from entity
  return resolveNotificationLink(entityType, entityId, userRole);
}

export default { resolveNotificationLink, getNotificationLink };