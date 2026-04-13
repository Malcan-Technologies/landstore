import api from '@/utils/axios';

// Enquiry service
export const contactService = {
  // Create enquiry
  createEnquiry: async (data) => {
    try {
      const response = await api.post('/enquiries/', data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Update enquiry
  updateEnquiry: async (id, data) => {
    try {
      const response = await api.patch(`/enquiries/${id}`, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Update enquiry status
  updateEnquiryStatus: async (id, data) => {
    try {
      const response = await api.patch(`/enquiries/${id}/status`, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get all enquiries
  getAllEnquiries: async (params = {}) => {
    try {
      const response = await api.get('/enquiries/', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get enquiry by ID
  getEnquiryById: async (id) => {
    try {
      const response = await api.get(`/enquiries/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Delete enquiry
  deleteEnquiry: async (id) => {
    try {
      const response = await api.delete(`/enquiries/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get enquiries by property ID
  getEnquiryByPropertyId: async (propertyId, params = {}) => {
    try {
      const response = await api.get(`/enquiries/property/${propertyId}`, { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get enquiries by user ID
  getEnquiryByUserId: async (userId, params = {}) => {
    try {
      const response = await api.get(`/enquiries/user/${userId}`, { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Backward-compatible aliases
  sendContactMessage: async (messageData) => {
    return contactService.createEnquiry(messageData);
  },

  getConversations: async (_userId, params = {}) => {
    return contactService.getAllEnquiries(params);
  },

  getConversationById: async (id) => {
    return contactService.getEnquiryById(id);
  },

  sendMessage: async (enquiryId, messageData) => {
    return contactService.updateEnquiry(enquiryId, messageData);
  },

  createConversation: async (conversationData) => {
    return contactService.createEnquiry(conversationData);
  },

  markMessagesAsRead: async (enquiryId, _userId) => {
    return contactService.updateEnquiryStatus(enquiryId, { status: 'read' });
  }
};
