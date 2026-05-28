import api from "./api";

const login = async (email, password) => {
  const response = await api.post("/auth/login", {
    email,
    password,
  });

  if (!response.data?.token) {
    throw new Error("Login failed. Please check your credentials.");
  }

  localStorage.setItem("user", JSON.stringify(response.data));
  return response.data;
};

const logout = () => {
  localStorage.removeItem("user");
};

const registerUser = async (userData) => {
  const response = await api.post("/admin/users/register", userData);
  return response.data;
};

const getAllUsers = async () => {
  const response = await api.get("/admin/users");
  return response.data;
};

const getCurrentUser = () => {
  return JSON.parse(localStorage.getItem("user"));
};

const authService = {
  login,
  logout,
  registerUser,
  getAllUsers,
  getCurrentUser,
};

export default authService;
