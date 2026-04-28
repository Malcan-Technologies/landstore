export const mapNotificationToUiItem = (item, href = "/user-dashboard/notifications") => {
  if (!item?.id) {
    return null;
  }

  const apiType = item?.type;
  const createdAt = item?.createdAt ? new Date(item.createdAt) : null;
  const type = apiType === "urgent" ? "warning" : "success";

  return {
    id: item.id,
    title: apiType === "urgent" ? "Action needed" : "Notification",
    message: item?.content || "",
    timeLabel: createdAt && !Number.isNaN(createdAt.getTime()) ? createdAt.toLocaleString() : "",
    type,
    href,
    read: Boolean(item?.isRead),
    createdAt: item?.createdAt || "",
    updatedAt: item?.updatedAt || "",
    rawType: apiType || "",
    userId: item?.userId || "",
  };
};

export const mapNotificationsToUiItems = (items, href = "/user-dashboard/notifications") => {
  if (!Array.isArray(items)) {
    return [];
  }

  return items
    .map((item) => mapNotificationToUiItem(item, href))
    .filter(Boolean)
    .sort((left, right) => {
      const leftTime = new Date(left?.createdAt || 0).getTime();
      const rightTime = new Date(right?.createdAt || 0).getTime();
      return rightTime - leftTime;
    });
};

export const upsertNotificationItem = (currentItems, item, href = "/user-dashboard/notifications", limit) => {
  const mappedItem = mapNotificationToUiItem(item, href);

  if (!mappedItem) {
    return Array.isArray(currentItems) ? currentItems : [];
  }

  const nextItems = [...(Array.isArray(currentItems) ? currentItems : []).filter((entry) => entry.id !== mappedItem.id), mappedItem]
    .sort((left, right) => {
      const leftTime = new Date(left?.createdAt || 0).getTime();
      const rightTime = new Date(right?.createdAt || 0).getTime();
      return rightTime - leftTime;
    });

  if (typeof limit === "number" && limit > 0) {
    return nextItems.slice(0, limit);
  }

  return nextItems;
};

export const removeNotificationItem = (currentItems, notificationId) => {
  if (!Array.isArray(currentItems) || !notificationId) {
    return Array.isArray(currentItems) ? currentItems : [];
  }

  return currentItems.filter((item) => item.id !== notificationId);
};

export const markNotificationItemRead = (currentItems, notificationId) => {
  if (!Array.isArray(currentItems) || !notificationId) {
    return Array.isArray(currentItems) ? currentItems : [];
  }

  return currentItems.map((item) => (item.id === notificationId ? { ...item, read: true } : item));
};

export const markAllNotificationItemsRead = (currentItems) => {
  if (!Array.isArray(currentItems)) {
    return [];
  }

  return currentItems.map((item) => ({ ...item, read: true }));
};

export const getUnreadNotificationCount = (items) => {
  if (!Array.isArray(items)) {
    return 0;
  }

  return items.reduce((count, item) => count + (item?.read ? 0 : 1), 0);
};
