import api from "./api";

export const getAllDrivers = async () => {
    const response = await api.get("/drivers");
    return response.data;
}
export const createDriver = async (driverData) => {
    const response = await api.post("/drivers", driverData);
    return response.data;
}

export const updateDriver = async (id, driverData) => {
    const response = await api.put(`/drivers/${id}`, driverData);
    return response.data;
}

export const deleteDriver = async (id) => {
    const response = await api.delete(`/drivers/${id}`);
    return response.data;
}