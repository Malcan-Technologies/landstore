const RESOURCE_LABELS = {
  admins: 'Admin',
  categories: 'Category',
  'entity-types': 'Entity type',
  enquiries: 'Enquiry',
  folders: 'Folder',
  'interest-types': 'Interest type',
  'list-lands': 'Listing',
  messages: 'Message',
  notifications: 'Notification',
  'notification-preferences': 'Preferences',
  'ownership-types': 'Ownership type',
  'title-types': 'Title type',
  users: 'User',
  utilizations: 'Utilization',
  'enquiry-roles': 'Enquiry role',
};

const MUTATION_TOAST_RULES = [
  {
    match: ({ method, segments }) => method === 'post' && segments[0] === 'auth' && segments[1] === 'sign-out',
    successTitle: 'Logged out',
    errorTitle: 'Logout failed',
  },
  {
    match: ({ method, segments }) => method === 'post' && segments[0] === 'users' && segments[1] === 'login',
    successTitle: 'Logged in',
    errorTitle: 'Login failed',
  },
  {
    match: ({ method, segments }) => method === 'post' && segments[0] === 'users' && ['register', 'register-complete'].includes(segments[1]),
    successTitle: 'Account created',
    errorTitle: 'Signup failed',
  },
  {
    match: ({ method, segments }) => method === 'post' && segments[0] === 'users' && segments[1] === 'complete-profile',
    successTitle: 'Profile completed',
    errorTitle: 'Profile failed',
  },
  {
    match: ({ method, segments }) => method === 'post' && segments[0] === 'users' && segments[1] === 'forgot-password',
    successTitle: 'Reset email sent',
    errorTitle: 'Email not sent',
  },
  {
    match: ({ method, segments }) => method === 'post' && segments[0] === 'users' && segments[1] === 'reset-password',
    successTitle: 'Password reset',
    errorTitle: 'Reset failed',
  },
  {
    match: ({ method, segments }) => method === 'post' && segments[0] === 'users' && segments[1] === 'verify-email',
    successTitle: 'Email verified',
    errorTitle: 'Verify failed',
  },
  {
    match: ({ method, segments }) => method === 'post' && segments[0] === 'auth' && segments[1] === 'change-password',
    successTitle: 'Password changed',
    errorTitle: 'Change failed',
  },
  {
    match: ({ method, segments }) => method === 'post' && segments[0] === 'folders' && segments[1] === 'shortlist',
    successTitle: 'Added to folder',
    errorTitle: 'Add failed',
  },
  {
    match: ({ method, segments }) => method === 'delete' && segments[0] === 'folders' && segments[1] === 'shortlist',
    successTitle: 'Removed from folder',
    errorTitle: 'Remove failed',
  },
  {
    match: ({ method, segments }) => method === 'patch' && segments[0] === 'notifications' && segments[1] === 'mark-as-read',
    successTitle: 'Marked as read',
    errorTitle: 'Read failed',
  },
  {
    match: ({ method, segments }) => method === 'patch' && segments[0] === 'notifications' && segments[1] === 'user' && segments[2] === 'mark-all-as-read',
    successTitle: 'All marked read',
    errorTitle: 'Update failed',
  },
  {
    match: ({ method, segments }) => method === 'post' && segments[0] === 'messages',
    successTitle: 'Message sent',
    errorTitle: 'Send failed',
  },
  {
    match: ({ method, segments }) => method === 'patch' && segments[0] === 'messages',
    successTitle: 'Message updated',
    errorTitle: 'Update failed',
  },
  {
    match: ({ method, segments }) => method === 'delete' && segments[0] === 'messages',
    successTitle: 'Message deleted',
    errorTitle: 'Delete failed',
  },
  {
    match: ({ method, segments }) => method === 'patch' && segments[0] === 'enquiries' && segments[1] === 'status',
    successTitle: 'Status updated',
    errorTitle: 'Update failed',
  },
  {
    match: ({ method, segments }) => method === 'post' && segments[0] === 'list-lands' && segments[1] === 'request-changes',
    successTitle: 'Changes requested',
    errorTitle: 'Request failed',
  },
  {
    match: ({ method, segments }) => method === 'post' && segments[0] === 'list-lands' && segments[1] === 'reject',
    successTitle: 'Listing rejected',
    errorTitle: 'Reject failed',
  },
  {
    match: ({ method, segments }) => method === 'post' && segments[0] === 'list-lands' && segments[1] === 'soft-delete',
    successTitle: 'Listing removed',
    errorTitle: 'Delete failed',
  },
];

const extractPathname = (url = '') =>
  String(url || '')
    .replace(/^https?:\/\/[^/]+/i, '')
    .split('?')[0]
    .trim();

const isIdSegment = (segment = '') => {
  if (!segment) return false;

  return /^\d+$/.test(segment) || /^[0-9a-f]{24}$/i.test(segment) || /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(segment);
};

const getMeaningfulSegments = (url = '') =>
  extractPathname(url)
    .replace(/^\/+|\/+$/g, '')
    .split('/')
    .filter(Boolean)
    .filter((segment) => !isIdSegment(segment));

const toTitleCase = (value = '') =>
  String(value || '')
    .replace(/[-_]+/g, ' ')
    .replace(/\b\w/g, (character) => character.toUpperCase());

const getResourceLabel = (segments = []) => {
  const resourceSegment = segments[0];

  if (!resourceSegment) {
    return 'Item';
  }

  if (RESOURCE_LABELS[resourceSegment]) {
    return RESOURCE_LABELS[resourceSegment];
  }

  const normalized = toTitleCase(resourceSegment);
  if (normalized.endsWith('ies')) {
    return `${normalized.slice(0, -3)}y`;
  }

  if (normalized.endsWith('s')) {
    return normalized.slice(0, -1);
  }

  return normalized;
};

const getDefaultMutationTitles = (method, segments) => {
  const resourceLabel = getResourceLabel(segments);
  const actionLabels = {
    post: { success: 'created', error: 'not created' },
    put: { success: 'updated', error: 'not updated' },
    patch: { success: 'updated', error: 'not updated' },
    delete: { success: 'deleted', error: 'not deleted' },
  };

  const labels = actionLabels[method] || actionLabels.post;
  return {
    successTitle: `${resourceLabel} ${labels.success}`,
    errorTitle: `${resourceLabel} ${labels.error}`,
  };
};

export const resolveMutationToastMessages = (config = {}) => {
  if (config?.disableToast || config?.toastMessages === false) {
    return null;
  }

  const customMessages = typeof config?.toastMessages === 'object' && config?.toastMessages !== null ? config.toastMessages : {};
  const method = String(config?.method || '').toLowerCase();
  const pathname = extractPathname(config?.url);
  const segments = getMeaningfulSegments(pathname);

  if (pathname.startsWith('/list-lands/search/') || pathname === '/auth/refresh-token') {
    return null;
  }

  const matchedRule = MUTATION_TOAST_RULES.find((rule) => rule.match({ method, pathname, segments }));
  const defaultTitles = matchedRule || getDefaultMutationTitles(method, segments);

  return {
    successTitle: defaultTitles.successTitle,
    successMessage: '',
    errorTitle: defaultTitles.errorTitle,
    errorMessage: '',
    ...customMessages,
  };
};
