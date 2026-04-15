import { authService } from './authService';
import { landService } from './landService';
import { userService } from './userService';
import { contactService } from './contactService';
import { adminService } from './adminService';
import { folderService } from './folderService';

// Export all services for easy import
export { authService, landService, userService, contactService, adminService, folderService };

// Default export with all services
const services = {
  authService,
  landService,
  userService,
  contactService,
  adminService,
  folderService
};

export default services;
