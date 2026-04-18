import api from '@/utils/axios';

const timeRangeMap = {
  "12 months": "12months",
  "30 days": "30days",
  "7 days": "7days",
  "24 hours": "24hours",
};

export const analyticsService = {
  getUserGrowth: async (params = {}) => {
    try {
      const timeRange = timeRangeMap[params.timeRange] ?? params.timeRange;
      const response = await api.get('/users/analytics/growth', {
        params: { ...(timeRange ? { timeRange } : {}), ...(params.profileType ? { profileType: params.profileType } : {}) },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getUserBreakdown: async (params = {}) => {
    try {
      const timeRange = timeRangeMap[params.timeRange] ?? params.timeRange;
      const response = await api.get('/users/analytics/breakdown', {
        params: { ...(timeRange ? { timeRange } : {}) },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getActiveListings: async (params = {}) => {
    try {
      const timeRange = timeRangeMap[params.timeRange] ?? params.timeRange;
      const response = await api.get('/list-lands/analytics/active-listings', {
        params: { ...(timeRange ? { timeRange } : {}) },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};
