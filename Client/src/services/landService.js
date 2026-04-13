import api from '@/utils/axios';

// Land/Property service
export const landService = {
  // Get all land listings with pagination and filters
  // Get all land listings with pagination and filters
  getAllLands: async (params = {}) => {
    try {
      const response = await api.get('/list-lands/', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get land by ID
  getLandById: async (id) => {
    try {
      const response = await api.get(`/list-lands/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Create new land listing (formdata supported)
  createLand: async (landData, config = {}) => {
    try {
      const response = await api.post('/list-lands/', landData, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Update land listing (PATCH per Postman)
  updateLand: async (id, landData, config = {}) => {
    try {
      const response = await api.patch(`/list-lands/${id}`, landData, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Delete land listing
  deleteLand: async (id) => {
    try {
      const response = await api.delete(`/list-lands/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Upload land images (attach while creating/updating using formdata)
  uploadLandImages: async (id, formData) => {
    try {
      const response = await api.patch(`/list-lands/${id}`, formData, {
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
      const response = await api.get(`/list-lands/user/${userId}`, { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Search lands
  searchLands: async (searchParams) => {
    try {
      const response = await api.get('/list-lands/search', { params: searchParams });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get featured lands
  getFeaturedLands: async () => {
    try {
      const response = await api.get('/list-lands/featured');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get lands by location
  getLandsByLocation: async (location, params = {}) => {
    try {
      const response = await api.get(`/list-lands/location/${location}`, { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get lands by price range
  getLandsByPriceRange: async (minPrice, maxPrice, params = {}) => {
    try {
      const response = await api.get('/list-lands/price-range', {
        params: { minPrice, maxPrice, ...params }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};
