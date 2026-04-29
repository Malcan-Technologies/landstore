import { io } from "socket.io-client";
import { API_BASE_URL } from "@/utils/axios";
import { getStoredUser } from "@/utils/auth";

export const SOCKET_EVENTS = {
  SYSTEM: {
    ERROR: "system:error",
  },
  USER: {
    CONNECTED: "user:connected",
    DISCONNECTED: "user:disconnected",
  },
  NOTIFICATION: {
    SUBSCRIBE: "notification:subscribe",
    CREATED: "notification:created",
    UPDATED: "notification:updated",
    DELETED: "notification:deleted",
    MARK_READ: "notification:mark-read",
    MARK_ALL_READ: "notification:mark-all-read",
    UNREAD_COUNT: "notification:unread-count",
  },
  CHAT: {
    JOIN_ENQUIRY: "chat:join-enquiry",
    LEAVE_ENQUIRY: "chat:leave-enquiry",
    SEND_MESSAGE: "chat:send-message",
    UPDATE_MESSAGE: "chat:update-message",
    DELETE_MESSAGE: "chat:delete-message",
    NEW_MESSAGE: "chat:new-message",
    UPDATED_MESSAGE: "chat:message-updated",
    DELETED_MESSAGE: "chat:message-deleted",
    HISTORY: "chat:history",
  },
};

const SOCKET_ACK_TIMEOUT_MS = 10000;
const SOCKET_DISCONNECT_DELAY_MS = 750;
let socketInstance = null;
let activeSocketConsumers = 0;
let disconnectTimerId = null;
let notificationSubscriberCount = 0;
let latestUnreadCount = 0;
let shouldRestoreStateOnReconnect = false;
const joinedEnquiryCounts = new Map();

const getStoredSocketToken = () => {
  const storedUser = getStoredUser();
  return typeof storedUser?.token === "string" && storedUser.token.trim() ? storedUser.token.trim() : "";
};

const resolveSocketServerUrl = () => {
  const configuredApiUrl = API_BASE_URL;

  if (!configuredApiUrl) {
    return "";
  }

  try {
    const parsedUrl = new URL(configuredApiUrl, typeof window !== "undefined" ? window.location.origin : undefined);
    const normalizedPath = parsedUrl.pathname.replace(/\/api\/?$/, "").replace(/\/$/, "");
    return `${parsedUrl.origin}${normalizedPath}`;
  } catch {
    return configuredApiUrl.replace(/\/api\/?$/, "").replace(/\/$/, "");
  }
};

const clearPendingDisconnect = () => {
  if (disconnectTimerId) {
    window.clearTimeout(disconnectTimerId);
    disconnectTimerId = null;
  }
};

const syncSocketAuth = (socket) => {
  const token = getStoredSocketToken();
  socket.auth = token ? { token } : {};
};

const emitSocketEventWithAck = (socket, eventName, payload) => {
  return new Promise((resolve, reject) => {
    const timeoutId = window.setTimeout(() => {
      reject(new Error(`${eventName} timed out`));
    }, SOCKET_ACK_TIMEOUT_MS);

    const handleResponse = (response) => {
      window.clearTimeout(timeoutId);

      if (response?.success === false) {
        reject(new Error(response?.message || `Socket event failed: ${eventName}`));
        return;
      }

      resolve(response);
    };

    if (typeof payload === "undefined") {
      socket.emit(eventName, handleResponse);
      return;
    }

    socket.emit(eventName, payload, handleResponse);
  });
};

const resubscribeSocketState = async (socket) => {
  if (!socket) {
    return;
  }

  if (notificationSubscriberCount > 0) {
    try {
      const response = await emitSocketEventWithAck(socket, SOCKET_EVENTS.NOTIFICATION.SUBSCRIBE);
      if (typeof response?.data?.unreadCount === "number") {
        latestUnreadCount = response.data.unreadCount;
      }
    } catch {
    }
  }

  for (const [enquiryId, count] of joinedEnquiryCounts.entries()) {
    if (!enquiryId || count <= 0) {
      continue;
    }

    try {
      await emitSocketEventWithAck(socket, SOCKET_EVENTS.CHAT.JOIN_ENQUIRY, { enquiryId });
    } catch {
    }
  }
};

const ensureSocketInstance = () => {
  if (typeof window === "undefined") {
    return null;
  }

  const socketServerUrl = resolveSocketServerUrl();

  if (!socketServerUrl) {
    return null;
  }

  if (!socketInstance) {
    socketInstance = io(socketServerUrl, {
      autoConnect: false,
      withCredentials: true,
      auth: getStoredSocketToken() ? { token: getStoredSocketToken() } : {},
    });

    socketInstance.on(SOCKET_EVENTS.NOTIFICATION.UNREAD_COUNT, (payload) => {
      if (typeof payload?.unreadCount === "number") {
        latestUnreadCount = payload.unreadCount;
      }
    });

    socketInstance.on("disconnect", (reason) => {
      shouldRestoreStateOnReconnect = reason !== "io client disconnect";
    });

    socketInstance.on("connect", () => {
      if (!shouldRestoreStateOnReconnect) {
        return;
      }

      shouldRestoreStateOnReconnect = false;
      void resubscribeSocketState(socketInstance);
    });

    socketInstance.on("connect_error", (err) => {
    });

    socketInstance.on(SOCKET_EVENTS.CHAT.NEW_MESSAGE, (payload) => {
    });
  }

  syncSocketAuth(socketInstance);
  return socketInstance;
};

export const acquireSocketConnection = () => {
  const socket = ensureSocketInstance();

  if (!socket) {
    return null;
  }

  clearPendingDisconnect();
  activeSocketConsumers += 1;

  if (!socket.connected) {
    socket.connect();
  }

  return socket;
};

export const releaseSocketConnection = () => {
  if (typeof window === "undefined") {
    return;
  }

  activeSocketConsumers = Math.max(0, activeSocketConsumers - 1);

  if (activeSocketConsumers > 0) {
    return;
  }

  clearPendingDisconnect();
  disconnectTimerId = window.setTimeout(() => {
    if (activeSocketConsumers === 0 && socketInstance?.connected) {
      socketInstance.disconnect();
    }
  }, SOCKET_DISCONNECT_DELAY_MS);
};

export const resetSocketConnection = () => {
  notificationSubscriberCount = 0;
  latestUnreadCount = 0;
  shouldRestoreStateOnReconnect = false;
  joinedEnquiryCounts.clear();
  activeSocketConsumers = 0;

  if (typeof window !== "undefined") {
    clearPendingDisconnect();
  }

  if (socketInstance) {
    socketInstance.disconnect();
  }
};

export const onSocketEvent = (eventName, handler) => {
  const socket = ensureSocketInstance();

  if (!socket || typeof handler !== "function") {
    return;
  }

  socket.on(eventName, handler);
};

export const offSocketEvent = (eventName, handler) => {
  if (!socketInstance || typeof handler !== "function") {
    return;
  }

  socketInstance.off(eventName, handler);
};

export const subscribeToNotifications = async () => {
  const socket = ensureSocketInstance();

  if (!socket) {
    return { success: false, message: "Socket connection is unavailable" };
  }

  if (!socket.connected) {
    socket.connect();
  }

  notificationSubscriberCount += 1;

  if (notificationSubscriberCount > 1) {
    return {
      success: true,
      data: {
        unreadCount: latestUnreadCount,
      },
    };
  }

  return emitSocketEventWithAck(socket, SOCKET_EVENTS.NOTIFICATION.SUBSCRIBE);
};

export const unsubscribeFromNotifications = () => {
  notificationSubscriberCount = Math.max(0, notificationSubscriberCount - 1);
};

export const markNotificationAsReadWithSocket = async (notificationId) => {
  const socket = ensureSocketInstance();

  if (!socket) {
    throw new Error("Socket connection is unavailable");
  }

  if (!socket.connected) {
    socket.connect();
  }

  return emitSocketEventWithAck(socket, SOCKET_EVENTS.NOTIFICATION.MARK_READ, {
    notificationId,
  });
};

export const markAllNotificationsAsReadWithSocket = async () => {
  const socket = ensureSocketInstance();

  if (!socket) {
    throw new Error("Socket connection is unavailable");
  }

  if (!socket.connected) {
    socket.connect();
  }

  return emitSocketEventWithAck(socket, SOCKET_EVENTS.NOTIFICATION.MARK_ALL_READ);
};

export const joinChatEnquiryRoom = async (enquiryId) => {
  const normalizedEnquiryId = typeof enquiryId === "string" ? enquiryId.trim() : "";
  const socket = ensureSocketInstance();

  if (!socket || !normalizedEnquiryId) {
    return { success: false, message: "Enquiry ID is required" };
  }

  if (!socket.connected) {
    socket.connect();
  }

  const nextCount = (joinedEnquiryCounts.get(normalizedEnquiryId) || 0) + 1;
  joinedEnquiryCounts.set(normalizedEnquiryId, nextCount);

  if (nextCount > 1) {
    return {
      success: true,
      data: {
        enquiryId: normalizedEnquiryId,
      },
    };
  }

  return emitSocketEventWithAck(socket, SOCKET_EVENTS.CHAT.JOIN_ENQUIRY, {
    enquiryId: normalizedEnquiryId,
  });
};

export const leaveChatEnquiryRoom = async (enquiryId) => {
  const normalizedEnquiryId = typeof enquiryId === "string" ? enquiryId.trim() : "";

  if (!socketInstance || !normalizedEnquiryId) {
    return { success: true };
  }

  const currentCount = joinedEnquiryCounts.get(normalizedEnquiryId) || 0;
  const nextCount = Math.max(0, currentCount - 1);

  if (nextCount > 0) {
    joinedEnquiryCounts.set(normalizedEnquiryId, nextCount);
    return {
      success: true,
      data: {
        enquiryId: normalizedEnquiryId,
      },
    };
  }

  joinedEnquiryCounts.delete(normalizedEnquiryId);
  return emitSocketEventWithAck(socketInstance, SOCKET_EVENTS.CHAT.LEAVE_ENQUIRY, {
    enquiryId: normalizedEnquiryId,
  });
};
