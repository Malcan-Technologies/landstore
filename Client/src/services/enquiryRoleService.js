import api from "@/utils/axios";

export const enquiryRoleService = {
  createEnquiryRole: async (data) => {
    const response = await api.post("/enquiry-roles/", data);
    return response.data;
  },

  getEnquiryRoles: async (params = {}) => {
    const response = await api.get("/enquiry-roles/", { params });
    return response.data;
  },
};
