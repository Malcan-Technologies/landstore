import api from '@/utils/axios';

// Admin/reference-data service
export const adminService = {
  // Categories
  createCategory: async (data) => {
    try {
      const response = await api.post('/categories/', data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getCategories: async (params = {}) => {
    try {
      const response = await api.get('/categories/', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getCategoryById: async (id) => {
    try {
      const response = await api.get(`/categories/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  updateCategory: async (id, data) => {
    try {
      const response = await api.patch(`/categories/${id}`, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  deleteCategory: async (id) => {
    try {
      const response = await api.delete(`/categories/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Ownership types
  createOwnershipType: async (data) => {
    try {
      const response = await api.post('/ownership-types/', data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getOwnershipTypes: async (params = {}) => {
    try {
      const response = await api.get('/ownership-types/', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getOwnershipTypeById: async (id) => {
    try {
      const response = await api.get(`/ownership-types/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  updateOwnershipType: async (id, data) => {
    try {
      const response = await api.patch(`/ownership-types/${id}`, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  deleteOwnershipType: async (id) => {
    try {
      const response = await api.delete(`/ownership-types/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Title types
  createTitleType: async (data) => {
    try {
      const response = await api.post('/title-types/', data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getTitleTypes: async (params = {}) => {
    try {
      const response = await api.get('/title-types/', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getTitleTypeById: async (id) => {
    try {
      const response = await api.get(`/title-types/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  updateTitleType: async (id, data) => {
    try {
      const response = await api.patch(`/title-types/${id}`, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  deleteTitleType: async (id) => {
    try {
      const response = await api.delete(`/title-types/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Utilizations
  createUtilization: async (data) => {
    try {
      const response = await api.post('/utilizations/', data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getUtilizations: async (params = {}) => {
    try {
      const response = await api.get('/utilizations/', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getUtilizationById: async (id) => {
    try {
      const response = await api.get(`/utilizations/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  updateUtilization: async (id, data) => {
    try {
      const response = await api.patch(`/utilizations/${id}`, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  deleteUtilization: async (id) => {
    try {
      const response = await api.delete(`/utilizations/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Entity types
  createEntityType: async (data) => {
    try {
      const response = await api.post('/entity-types/', data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getEntityTypes: async (params = {}) => {
    try {
      const response = await api.get('/entity-types/', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getEntityTypeById: async (id) => {
    try {
      const response = await api.get(`/entity-types/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  updateEntityType: async (id, data) => {
    try {
      const response = await api.patch(`/entity-types/${id}`, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  deleteEntityType: async (id) => {
    try {
      const response = await api.delete(`/entity-types/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Interest types
  createInterestType: async (data) => {
    try {
      const response = await api.post('/interest-types/', data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getInterestTypes: async (params = {}) => {
    try {
      const response = await api.get('/interest-types/', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getInterestTypeById: async (id) => {
    try {
      const response = await api.get(`/interest-types/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  updateInterestType: async (id, data) => {
    try {
      const response = await api.patch(`/interest-types/${id}`, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  deleteInterestType: async (id) => {
    try {
      const response = await api.delete(`/interest-types/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};
