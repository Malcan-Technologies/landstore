import api from '@/utils/axios';

// Contact and messaging service
export const contactService = {
  // Send contact message
  sendContactMessage: async (messageData) => {
    try {
      const response = await api.post('/contact', messageData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get user's conversations
  getConversations: async (userId, params = {}) => {
    try {
      const response = await api.get(`/conversations/user/${userId}`, { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get conversation by ID
  getConversationById: async (id) => {
    try {
      const response = await api.get(`/conversations/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Send message in conversation
  sendMessage: async (conversationId, messageData) => {
    try {
      const response = await api.post(`/conversations/${conversationId}/messages`, messageData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Create new conversation
  createConversation: async (conversationData) => {
    try {
      const response = await api.post('/conversations', conversationData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Mark messages as read
  markMessagesAsRead: async (conversationId, userId) => {
    try {
      const response = await api.put(`/conversations/${conversationId}/read`, { userId });
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};
