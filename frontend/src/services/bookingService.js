import api from "./api";

export const getAllBookings = async () => {
  const response = await api.get("/bookings");
  return response.data;
};

export const createBooking = async (bookingData) => {
  const response = await api.post("/bookings", bookingData);
  return response.data;
};

export const cancelBooking = async (id) => {
  const response = await api.put(`/bookings/${id}/cancel`);
  return response.data;
};

export const completeBooking = async (id) => {
  const response = await api.put(`/bookings/${id}/complete`);
  return response.data;
};