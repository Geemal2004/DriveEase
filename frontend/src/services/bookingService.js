import api from "./api";

export const DRIVER_DAILY_FEE = 2500;

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

export const completeBooking = async (id, completionData) => {
  const response = await api.put(`/bookings/${id}/complete`, completionData);
  return response.data;
};

export const completeBookingsBulk = async (bookings) => {
  const response = await api.put("/bookings/complete-bulk", { bookings });
  return response.data;
};
