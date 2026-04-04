// Export all services for easy import
export { authService } from './authService';
export { landService } from './landService';
export { userService } from './userService';
export { contactService } from './contactService';
export { adminService } from './adminService';

// Default export with all services
const services = {
  authService,
  landService,
  userService,
  contactService,
  adminService
};

export default services;
