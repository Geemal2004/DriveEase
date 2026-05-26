import api from "./api";

export const getAllContracts = async () => {
  const response = await api.get("/contracts");
  return response.data;
};

export const createContract = async (contractData) => {
  const response = await api.post("/contracts", contractData);
  return response.data;
};

export const updateContract = async (id, contractData) => {
  const response = await api.put(`/contracts/${id}`, contractData);
  return response.data;
};

export const removeContract = async (id) => {
  const response = await api.delete(`/contracts/${id}`);
  return response.data;
};

export const uploadContractDocument = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await api.post("/uploads/contract-document", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};
