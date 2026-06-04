import api from "./api";

export const getAllServiceLogs = async () => {
  const response = await api.get("/service-logs");
  return response.data;
};

export const createServiceLog = async (serviceLogData) => {
  const response = await api.post("/service-logs", serviceLogData);
  return response.data;
};

export const updateServiceLog = async (id, serviceLogData) => {
  const response = await api.put(`/service-logs/${id}`, serviceLogData);
  return response.data;
};

export const deleteServiceLog = async (id) => {
  const response = await api.delete(`/service-logs/${id}`);
  return response.data;
};

export const getServiceLogsByVehicleId = async (vehicleId) => {
  const response = await api.get(`/service-logs/vehicle/${vehicleId}`);
  return response.data;
};