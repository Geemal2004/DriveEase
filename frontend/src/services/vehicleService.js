import api from "./api";

export const getAllVehicles = async () => {
  const response = await api.get("/vehicles");
  return response.data;
};

export const createVehicle = async (vehicleData) => {
  const response = await api.post("/vehicles", vehicleData);
  return response.data;
};

export const updateVehicle = async (id, vehicleData) => {
  const response = await api.put(`/vehicles/${id}`, vehicleData);
  return response.data;
};

export const deactivateVehicle = async (id) => {
  const response = await api.delete(`/vehicles/${id}`);
  return response.data;
};

export const searchVehicles = async (searchData) => {
  const response = await api.post("/vehicles/search", searchData);
  return response.data;
};

export const uploadVehicleImage = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await api.post("/uploads/vehicle-image", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};
