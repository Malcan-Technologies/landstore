import { authService } from './authService';
import { landService } from './landService';
import { userService } from './userService';
import { contactService } from './contactService';
import { adminService } from './adminService';

// Export all services for easy import
export { authService, landService, userService, contactService, adminService };

// Default export with all services
const services = {
  authService,
  landService,
  userService,
  contactService,
  adminService
};

export default services;
