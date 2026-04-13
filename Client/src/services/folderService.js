import api from '@/utils/axios';

// Shortlist folder service
export const folderService = {
  // Create folder
  createFolder: async (data) => {
    try {
      const response = await api.post('/folders/', data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get all folders
  getFolders: async (params = {}) => {
    try {
      const response = await api.get('/folders/', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get folder by ID
  getFolderById: async (id) => {
    try {
      const response = await api.get(`/folders/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Rename folder
  renameFolder: async (id, data) => {
    try {
      const response = await api.patch(`/folders/${id}`, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Delete folder
  deleteFolder: async (id) => {
    try {
      const response = await api.delete(`/folders/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Add property to folder shortlist
  addToFolder: async (id, propertyId) => {
    try {
      const response = await api.post(`/folders/${id}/shortlist`, { propertyId });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Remove property from folder shortlist
  removeFromFolder: async (id, propertyId) => {
    try {
      const response = await api.delete(`/folders/${id}/shortlist/${propertyId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};
