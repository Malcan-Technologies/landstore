// Complete profile validation schema
export const completeProfileValidation = {
  email: {
    required: 'Email is required',
    pattern: {
      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      message: 'Please enter a valid email address'
    }
  },
  profileType: {
    required: 'Profile type is required',
    validate: (value) => {
      return ['individual', 'company', 'koperasi'].includes(value) || 'Please select a valid profile type';
    }
  },
  
  // Individual profile fields
  fullName: {
    validate: (value, formData) => {
      if (formData.profileType === 'individual' && (!value || value.trim() === '')) {
        return 'Full name is required for individual profiles';
      }
      return null;
    }
  },
  firstName: {
    validate: (value, formData) => {
      if (formData.profileType === 'individual' && (!value || value.trim() === '')) {
        return 'First name is required for individual profiles';
      }
      return null;
    }
  },
  lastName: {
    validate: (value, formData) => {
      if (formData.profileType === 'individual' && (!value || value.trim() === '')) {
        return 'Last name is required for individual profiles';
      }
      return null;
    }
  },
  identityNo: {
    validate: (value, formData) => {
      if (formData.profileType === 'individual' && (!value || value.trim() === '')) {
        return 'Identity number is required for individual profiles';
      }
      return null;
    }
  },
  
  // Company profile fields
  companyName: {
    validate: (value, formData) => {
      if (formData.profileType === 'company' && (!value || value.trim() === '')) {
        return 'Company name is required for company profiles';
      }
      return null;
    }
  },
  
  // Koperasi profile fields
  koperasiName: {
    validate: (value, formData) => {
      if (formData.profileType === 'koperasi' && (!value || value.trim() === '')) {
        return 'Koperasi name is required for koperasi profiles';
      }
      return null;
    }
  },
  
  // Shared fields
  registrationNo: {
    validate: (value, formData) => {
      if ((formData.profileType === 'company' || formData.profileType === 'koperasi') && (!value || value.trim() === '')) {
        return 'Registration number is required for company and koperasi profiles';
      }
      return null;
    }
  },
  
  phone: {
    pattern: {
      value: /^[+]?[\d\s\-\(\)]+$/,
      message: 'Please enter a valid phone number'
    }
  },
  
  userType: {
    validate: (value) => {
      return !value || ['admin', 'user'].includes(value) || 'User type must be either admin or user';
    }
  }
};
