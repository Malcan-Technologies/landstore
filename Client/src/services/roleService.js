import api from "@/utils/axios";

export const roleService = {
  getRoles: async (params = {}) => {
    const response = await api.get("/roles/", { params });
    return response.data;
  },

  getRoleById: async (id) => {
    const response = await api.get(`/roles/${id}`);
    return response.data;
  },
};
