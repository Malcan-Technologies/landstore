// Import all validation schemas first
import {
  loginValidation,
  registerValidation,
  landListingValidation,
  profileUpdateValidation,
  validateForm
} from './authValidation';

import {
  completeProfileValidation
} from './profileValidation';

// Re-export for named imports
export {
  loginValidation,
  registerValidation,
  landListingValidation,
  profileUpdateValidation,
  validateForm,
  completeProfileValidation
};

// Default export with all validators
const validators = {
  loginValidation,
  registerValidation,
  landListingValidation,
  profileUpdateValidation,
  completeProfileValidation,
  validateForm
};

export default validators;
