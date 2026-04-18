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

  // Get admin/public listings feed (supports recentlyApproved query)
  getAdminListings: async (params = {}) => {
    try {
      const response = await api.get('/list-lands/all-listings', { params });
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

  // Search properties around a map center using visible map radius
  exploreMap: async ({ latitude, longitude, radiusKm, page, limit, filters = {} }) => {
    try {
      const params = new URLSearchParams();
      if (Number.isFinite(page) && page > 0) {
        params.set('page', String(page));
      }

      if (Number.isFinite(limit) && limit > 0) {
        params.set('limit', String(limit));
      }

      Object.entries(filters || {}).forEach(([key, rawValue]) => {
        if (rawValue === undefined || rawValue === null || rawValue === '') {
          return;
        }

        if (Array.isArray(rawValue)) {
          rawValue
            .filter((item) => item !== undefined && item !== null && item !== '')
            .forEach((item) => params.append(key, String(item)));
          return;
        }

        params.append(key, String(rawValue));
      });

      const response = await api.post(
        '/list-lands/search/by-radius',
        { latitude, longitude, radiusKm },
        { params }
      );
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
