import api from '@/utils/axios';

// Land/Property service
export const landService = {
  // Get all land listings with pagination and filters
  getAllLands: async (params = {}) => {
    try {
      const response = await api.get('/lands', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get land by ID
  getLandById: async (id) => {
    try {
      const response = await api.get(`/lands/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Create new land listing
  createLand: async (landData) => {
    try {
      const response = await api.post('/lands', landData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Update land listing
  updateLand: async (id, landData) => {
    try {
      const response = await api.put(`/lands/${id}`, landData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Delete land listing
  deleteLand: async (id) => {
    try {
      const response = await api.delete(`/lands/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Upload land images
  uploadLandImages: async (id, formData) => {
    try {
      const response = await api.post(`/lands/${id}/images`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Delete land image
  deleteLandImage: async (landId, imageId) => {
    try {
      const response = await api.delete(`/lands/${landId}/images/${imageId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get user's land listings
  getUserLands: async (userId, params = {}) => {
    try {
      const response = await api.get(`/lands/user/${userId}`, { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Search lands
  searchLands: async (searchParams) => {
    try {
      const response = await api.get('/lands/search', { params: searchParams });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get featured lands
  getFeaturedLands: async () => {
    try {
      const response = await api.get('/lands/featured');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get lands by location
  getLandsByLocation: async (location, params = {}) => {
    try {
      const response = await api.get(`/lands/location/${location}`, { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get lands by price range
  getLandsByPriceRange: async (minPrice, maxPrice, params = {}) => {
    try {
      const response = await api.get('/lands/price-range', {
        params: { minPrice, maxPrice, ...params }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};
