import api from "./api";

export const getAllProviders = async () => {
  const response = await api.get("/providers");
  return response.data;
};

export const createProvider = async (providerData) => {
  const response = await api.post("/providers", providerData);
  return response.data;
};

export const updateProvider = async (id, providerData) => {
  const response = await api.put(`/providers/${id}`, providerData);
  return response.data;
};

export const deactivateProvider = async (id) => {
  const response = await api.delete(`/providers/${id}`);
  return response.data;
};