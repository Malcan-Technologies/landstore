let toasts = [];

const listeners = new Set();
const timers = new Map();

const emitChange = () => {
  listeners.forEach((listener) => listener());
};

const createToastId = () => `toast-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

const clearToastTimer = (id) => {
  const timer = timers.get(id);
  if (timer) {
    clearTimeout(timer);
    timers.delete(id);
  }
};

const scheduleToastDismiss = (id, duration) => {
  clearToastTimer(id);

  if (typeof window === "undefined" || !Number.isFinite(duration) || duration <= 0) {
    return;
  }

  const timer = window.setTimeout(() => {
    dismissToast(id);
  }, duration);

  timers.set(id, timer);
};

export const subscribeToToasts = (listener) => {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
};

export const getToastSnapshot = () => toasts;

export const showToast = ({ id, type = "info", title = "", message = "", duration = 4000, onClick, data } = {}) => {
  const toast = {
    id: id || createToastId(),
    type,
    title,
    message,
    duration,
    onClick,
    data,
  };

  toasts = [...toasts, toast];
  emitChange();
  scheduleToastDismiss(toast.id, toast.duration);

  return toast.id;
};

export const updateToast = (id, updates = {}) => {
  const existingToast = toasts.find((toast) => toast.id === id);

  if (!existingToast) {
    return showToast({ id, ...updates });
  }

  const nextToast = {
    ...existingToast,
    ...updates,
    id,
    duration: updates.duration ?? existingToast.duration,
    onClick: updates.onClick ?? existingToast.onClick,
    data: updates.data ?? existingToast.data,
  };

  toasts = toasts.map((toast) => (toast.id === id ? nextToast : toast));
  emitChange();
  scheduleToastDismiss(id, nextToast.duration);

  return id;
};

export const dismissToast = (id) => {
  clearToastTimer(id);
  toasts = toasts.filter((toast) => toast.id !== id);
  emitChange();
};

export const clearToasts = () => {
  Array.from(timers.keys()).forEach((id) => clearToastTimer(id));
  toasts = [];
  emitChange();
};
