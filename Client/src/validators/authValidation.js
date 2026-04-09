// Login validation schema
export const loginValidation = {
  email: {
    required: 'Email is required',
    pattern: {
      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      message: 'Please enter a valid email address'
    }
  },
  password: {
    required: 'Password is required',
    minLength: {
      value: 6,
      message: 'Password must be at least 6 characters long'
    }
  }
};

// Registration validation schema (Better Auth signup)
export const registerValidation = {
  email: {
    required: 'Email is required',
    pattern: {
      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      message: 'Please enter a valid email address'
    }
  },
  password: {
    required: 'Password is required',
    minLength: {
      value: 6,
      message: 'Password must be at least 6 characters long'
    }
  },
  name: {
    // Optional field for Better Auth signup
    minLength: {
      value: 2,
      message: 'Name must be at least 2 characters long'
    }
  }
};

// Land listing validation schema
export const landListingValidation = {
  title: {
    required: 'Title is required',
    minLength: {
      value: 5,
      message: 'Title must be at least 5 characters long'
    },
    maxLength: {
      value: 100,
      message: 'Title cannot exceed 100 characters'
    }
  },
  description: {
    required: 'Description is required',
    minLength: {
      value: 20,
      message: 'Description must be at least 20 characters long'
    },
    maxLength: {
      value: 2000,
      message: 'Description cannot exceed 2000 characters'
    }
  },
  price: {
    required: 'Price is required',
    min: {
      value: 0,
      message: 'Price must be a positive number'
    }
  },
  area: {
    required: 'Area is required',
    min: {
      value: 0,
      message: 'Area must be a positive number'
    }
  },
  location: {
    required: 'Location is required',
    minLength: {
      value: 3,
      message: 'Location must be at least 3 characters long'
    }
  },
  landType: {
    required: 'Land type is required'
  },
  images: {
    required: 'At least one image is required',
    validate: (value) => {
      return value && value.length > 0 || 'Please upload at least one image';
    }
  }
};

// Profile update validation schema
export const profileUpdateValidation = {
  firstName: {
    required: 'First name is required',
    minLength: {
      value: 2,
      message: 'First name must be at least 2 characters long'
    }
  },
  lastName: {
    required: 'Last name is required',
    minLength: {
      value: 2,
      message: 'Last name must be at least 2 characters long'
    }
  },
  email: {
    required: 'Email is required',
    pattern: {
      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      message: 'Please enter a valid email address'
    }
  },
  phone: {
    pattern: {
      value: /^[+]?[\d\s\-\(\)]+$/,
      message: 'Please enter a valid phone number'
    }
  }
};

// Utility function to validate form data
export const validateForm = (formData, validationSchema) => {
  const errors = {};

  const validateField = (value, rules, fieldName, formData) => {
    // Run custom validate function first (for conditional validation)
    if (rules.validate) {
      const validateError = rules.validate(value, formData);
      if (validateError) {
        return validateError;
      }
    }

    if (rules.required && (!value || value.trim() === '')) {
      return rules.required;
    }

    if (rules.minLength && value && value.length < rules.minLength.value) {
      return rules.minLength.message;
    }

    if (rules.maxLength && value && value.length > rules.maxLength.value) {
      return rules.maxLength.message;
    }

    if (rules.min && value && Number(value) < rules.min.value) {
      return rules.min.message;
    }

    if (rules.pattern && value && !rules.pattern.value.test(value)) {
      return rules.pattern.message;
    }

    return null;
  };

  Object.keys(validationSchema).forEach(fieldName => {
    const fieldError = validateField(formData[fieldName], validationSchema[fieldName], fieldName, formData);
    if (fieldError) {
      errors[fieldName] = fieldError;
    }
  });

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};
