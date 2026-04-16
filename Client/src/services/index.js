import { authService } from './authService';
import { landService } from './landService';
import { userService } from './userService';
import { contactService } from './contactService';
import { enquiryService } from './enquiryService';
import { adminService } from './adminService';
import { folderService } from './folderService';

// Export all services for easy import
export { authService, landService, userService, contactService, enquiryService, adminService, folderService };

// Default export with all services
const services = {
  authService,
  landService,
  userService,
  contactService,
  enquiryService,
  adminService,
  folderService
};

export default services;
