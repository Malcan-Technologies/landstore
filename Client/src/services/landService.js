import api from '@/utils/axios';

// Land/Property service
export const landService = {
  // Create listing (multipart/form-data supported)
  createListing: async (listingData, config = {}) => {
    try {
      const response = await api.post('/list-lands/', listingData, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get all listings
  getAllListings: async (params = {}) => {
    try {
      const response = await api.get('/list-lands/', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get listing by ID
  getListingById: async (id) => {
    try {
      const response = await api.get(`/list-lands/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Update listing
  updateListing: async (id, listingData, config = {}) => {
    try {
      const response = await api.patch(`/list-lands/${id}`, listingData, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Delete listing
  deleteListing: async (id) => {
    try {
      const response = await api.delete(`/list-lands/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Upload/replace listing media using update endpoint
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

  // Backward-compatible aliases
  createLand: async (landData, config = {}) => {
    return landService.createListing(landData, config);
  },

  getAllLands: async (params = {}) => {
    return landService.getAllListings(params);
  },

  getLandById: async (id) => {
    return landService.getListingById(id);
  },

  updateLand: async (id, landData, config = {}) => {
    return landService.updateListing(id, landData, config);
  },

  deleteLand: async (id) => {
    return landService.deleteListing(id);
  }
};
