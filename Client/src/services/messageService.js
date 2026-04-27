import api from "@/utils/axios";

export const messageService = {
  createMessage: async (data) => {
    const response = await api.post("/messages/", data);
    return response.data;
  },

  getMessagesByEnquiry: async (enquiryId, params = {}) => {
    const response = await api.get(`/messages/enquiry/${enquiryId}`, { params });
    return response.data;
  },

  getMessageById: async (id) => {
    const response = await api.get(`/messages/${id}`);
    return response.data;
  },

  updateMessage: async (id, data) => {
    const response = await api.patch(`/messages/${id}`, data);
    return response.data;
  },

  deleteMessage: async (id) => {
    const response = await api.delete(`/messages/${id}`);
    return response.data;
  },
};
