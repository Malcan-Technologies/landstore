// Shared deduplication utility for socket message toasts
// Prevents duplicate toasts when multiple components listen to the same events

const recentToastIds = new Set();
const DEDUP_WINDOW_MS = 5000;

/**
 * Check if a message ID has been toasted recently
 * @param {string} msgId - The message ID to check
 * @returns {boolean} - True if already toasted (should skip)
 */
export const isRecentlyToasted = (msgId) => {
  if (!msgId) return false;
  return recentToastIds.has(msgId);
};

/**
 * Mark a message ID as toasted
 * @param {string} msgId - The message ID to track
 */
export const markAsToasted = (msgId) => {
  if (!msgId) return;
  recentToastIds.add(msgId);
  setTimeout(() => recentToastIds.delete(msgId), DEDUP_WINDOW_MS);
};
