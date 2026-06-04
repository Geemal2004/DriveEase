import { useEffect, useState } from "react";
import {
  getAllBookings,
  createBooking,
  cancelBooking,
  completeBooking,
  updateVehicleReturnMileage,
} from "../services/bookingService";
import { getAllCustomers } from "../services/customerService";
import { getAllDrivers } from "../services/driverService";
import { searchVehicles } from "../services/vehicleService";

function Bookings() {
  const [bookings, setBookings] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [availableVehicles, setAvailableVehicles] = useState([]);
  const [selectedVehicles, setSelectedVehicles] = useState({});
  const [returnMileageInputs, setReturnMileageInputs] = useState({});

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    customerId: "",
    createdByUserId: 1,
    pickupDate: "",
    rentalDays: 1,
    numberOfVehicles: 1,
    vehicleType: "SUV",
    status: "CONFIRMED",
  });

  useEffect(() => {
    loadBookings();
    loadCustomers();
    loadDrivers();
  }, []);

  const loadBookings = async () => {
    try {
      const data = await getAllBookings();
      setBookings(data);
    } catch (err) {
      setError("Failed to load bookings.");
    }
  };

  const loadCustomers = async () => {
    try {
      const data = await getAllCustomers();
      setCustomers(data);
    } catch (err) {
      setError("Failed to load customers.");
    }
  };

  const loadDrivers = async () => {
    try {
      const data = await getAllDrivers();
      setDrivers(data.filter((driver) => driver.status === "ACTIVE"));
    } catch (err) {
      setError("Failed to load drivers.");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]:
        name === "customerId" ||
        name === "createdByUserId" ||
        name === "rentalDays" ||
        name === "numberOfVehicles"
          ? Number(value)
          : value,
    });
  };

  const handleSearchVehicles = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");
    setAvailableVehicles([]);
    setSelectedVehicles({});

    try {
      const searchPayload = {
        pickupDate: formData.pickupDate,
        rentalDays: Number(formData.rentalDays),
        numberOfVehicles: Number(formData.numberOfVehicles),
        vehicleType: formData.vehicleType,
      };

      const data = await searchVehicles(searchPayload);
      setAvailableVehicles(data);

      if (data.length === 0) {
        setMessage("No available vehicles found for the selected criteria.");
      } else {
        setMessage(`${data.length} available vehicle(s) found.`);
      }
    } catch (err) {
      const backendMessage = err.response?.data?.message;
      setError(backendMessage || "Failed to search available vehicles.");
    }
  };

  const isVehicleSelected = (vehicleId) => {
    return Boolean(selectedVehicles[vehicleId]);
  };

  const handleVehicleSelect = (vehicle) => {
    const vehicleId = vehicle.vehicleId;

    if (selectedVehicles[vehicleId]) {
      const updatedSelectedVehicles = { ...selectedVehicles };
      delete updatedSelectedVehicles[vehicleId];
      setSelectedVehicles(updatedSelectedVehicles);
      return;
    }

    if (Object.keys(selectedVehicles).length >= Number(formData.numberOfVehicles)) {
      setError(`You can only select ${formData.numberOfVehicles} vehicle(s).`);
      return;
    }

    setError("");

    setSelectedVehicles({
      ...selectedVehicles,
      [vehicleId]: {
        vehicleId,
        driverId: "",
        startMileage: "",
      },
    });
  };

  const handleSelectedVehicleChange = (vehicleId, field, value) => {
    setSelectedVehicles({
      ...selectedVehicles,
      [vehicleId]: {
        ...selectedVehicles[vehicleId],
        [field]: value,
      },
    });
  };

  const handleCreateBooking = async () => {
    setMessage("");
    setError("");

    if (!formData.customerId) {
      setError("Please select a customer.");
      return;
    }

    const selectedVehicleList = Object.values(selectedVehicles);

    if (selectedVehicleList.length === 0) {
      setError("Please select at least one vehicle.");
      return;
    }

    const invalidStartMileage = selectedVehicleList.some(
      (vehicle) => vehicle.startMileage === "" || vehicle.startMileage === null
    );

    if (invalidStartMileage) {
      setError("Please enter start mileage for all selected vehicles.");
      return;
    }

    try {
      const payload = {
        customerId: Number(formData.customerId),
        createdByUserId: Number(formData.createdByUserId),
        pickupDate: formData.pickupDate,
        rentalDays: Number(formData.rentalDays),
        status: formData.status,
        vehicles: selectedVehicleList.map((vehicle) => ({
          vehicleId: Number(vehicle.vehicleId),
          driverId: vehicle.driverId ? Number(vehicle.driverId) : null,
          startMileage: Number(vehicle.startMileage),
        })),
      };

      await createBooking(payload);

      setMessage("Booking created successfully.");
      setAvailableVehicles([]);
      setSelectedVehicles({});

      setFormData({
        customerId: "",
        createdByUserId: 1,
        pickupDate: "",
        rentalDays: 1,
        numberOfVehicles: 1,
        vehicleType: "SUV",
        status: "CONFIRMED",
      });

      loadBookings();
    } catch (err) {
      const backendMessage = err.response?.data?.message;
      setError(backendMessage || "Failed to create booking.");
    }
  };

  const handleCancelBooking = async (id) => {
    const confirmCancel = window.confirm(
      "Are you sure you want to cancel this booking?"
    );

    if (!confirmCancel) {
      return;
    }

    setMessage("");
    setError("");

    try {
      await cancelBooking(id);
      setMessage("Booking cancelled successfully.");
      loadBookings();
    } catch (err) {
      setError("Failed to cancel booking.");
    }
  };

  const handleCompleteBooking = async (id) => {
    const confirmComplete = window.confirm(
      "Are you sure you want to mark this booking as completed?"
    );

    if (!confirmComplete) {
      return;
    }

    setMessage("");
    setError("");

    try {
      await completeBooking(id);
      setMessage("Booking completed successfully.");
      loadBookings();
    } catch (err) {
      setError("Failed to complete booking.");
    }
  };

  const handleReturnMileageChange = (bookingVehicleId, value) => {
    setReturnMileageInputs({
      ...returnMileageInputs,
      [bookingVehicleId]: value,
    });
  };

  const handleUpdateReturnMileage = async (bookingVehicleId) => {
    setMessage("");
    setError("");

    const endMileage = returnMileageInputs[bookingVehicleId];

    if (!endMileage) {
      setError("Please enter end mileage.");
      return;
    }

    try {
      await updateVehicleReturnMileage(bookingVehicleId, {
        endMileage: Number(endMileage),
      });

      setMessage("Return mileage updated successfully.");

      setReturnMileageInputs({
        ...returnMileageInputs,
        [bookingVehicleId]: "",
      });

      loadBookings();
    } catch (err) {
      const backendMessage = err.response?.data?.message;
      setError(backendMessage || "Failed to update return mileage.");
    }
  };

  const selectedTotal = availableVehicles
    .filter((vehicle) => selectedVehicles[vehicle.vehicleId])
    .reduce((sum, vehicle) => sum + Number(vehicle.totalPrice), 0);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Bookings</h1>
          <p>Create and manage customer vehicle rental bookings.</p>
        </div>
      </div>

      {message && <div className="success-message">{message}</div>}
      {error && <div className="error-message">{error}</div>}

      <div className="booking-grid">
        <div className="form-card">
          <h2>Create Booking</h2>

          <form onSubmit={handleSearchVehicles}>
            <div className="form-group">
              <label>Customer</label>
              <select
                name="customerId"
                value={formData.customerId}
                onChange={handleChange}
                required
              >
                <option value="">Select Customer</option>
                {customers.map((customer) => (
                  <option key={customer.customerId} value={customer.customerId}>
                    {customer.fullName} - {customer.phone || "No phone"}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Pickup Date</label>
              <input
                type="date"
                name="pickupDate"
                value={formData.pickupDate}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Rental Days</label>
              <input
                type="number"
                name="rentalDays"
                min="1"
                value={formData.rentalDays}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Number of Vehicles</label>
              <input
                type="number"
                name="numberOfVehicles"
                min="1"
                value={formData.numberOfVehicles}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Vehicle Type</label>
              <select
                name="vehicleType"
                value={formData.vehicleType}
                onChange={handleChange}
              >
                <option value="SUV">SUV</option>
                <option value="SEDAN">SEDAN</option>
                <option value="HATCHBACK">HATCHBACK</option>
                <option value="VAN">VAN</option>
                <option value="OTHER">OTHER</option>
              </select>
            </div>

            <div className="form-group">
              <label>Booking Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
              >
                <option value="CONFIRMED">CONFIRMED</option>
                <option value="SIMULATED">SIMULATED</option>
              </select>
            </div>

            <div className="form-actions">
              <button type="submit" className="primary-button">
                Search Available Vehicles
              </button>
            </div>
          </form>

          {Object.keys(selectedVehicles).length > 0 && (
            <div className="summary-box">
              <h3>Selected Booking Summary</h3>

              <p>
                <strong>Selected Vehicles:</strong>{" "}
                {Object.keys(selectedVehicles).length}
              </p>

              <p>
                <strong>Estimated Total:</strong> Rs. {selectedTotal.toFixed(2)}
              </p>

              <button
                type="button"
                className="primary-button"
                onClick={handleCreateBooking}
              >
                Create Booking
              </button>
            </div>
          )}
        </div>

        <div className="table-card">
          <h2>Available Vehicles</h2>

          <table className="data-table">
            <thead>
              <tr>
                <th>Select</th>
                <th>Image</th>
                <th>Provider</th>
                <th>Type</th>
                <th>Reg No</th>
                <th>Model</th>
                <th>Daily Rate</th>
                <th>Total</th>
                <th>Driver</th>
                <th>Start Mileage</th>
              </tr>
            </thead>

            <tbody>
              {availableVehicles.length === 0 ? (
                <tr>
                  <td colSpan="10" className="empty-table">
                    Search vehicles to create a booking.
                  </td>
                </tr>
              ) : (
                availableVehicles.map((vehicle) => (
                  <tr key={vehicle.vehicleId}>
                    <td>
                      <input
                        type="checkbox"
                        checked={isVehicleSelected(vehicle.vehicleId)}
                        onChange={() => handleVehicleSelect(vehicle)}
                      />
                    </td>

                    <td>
                      {vehicle.imageUrl ? (
                        <img
                          src={vehicle.imageUrl}
                          alt={vehicle.model}
                          className="vehicle-thumb"
                        />
                      ) : (
                        "No image"
                      )}
                    </td>

                    <td>{vehicle.providerName}</td>
                    <td>{vehicle.vehicleType}</td>
                    <td>{vehicle.registrationNo}</td>
                    <td>{vehicle.model}</td>
                    <td>Rs. {Number(vehicle.finalDailyRate).toFixed(2)}</td>
                    <td>
                      <strong>
                        Rs. {Number(vehicle.totalPrice).toFixed(2)}
                      </strong>
                    </td>

                    <td>
                      {isVehicleSelected(vehicle.vehicleId) ? (
                        <select
                          value={
                            selectedVehicles[vehicle.vehicleId]?.driverId || ""
                          }
                          onChange={(e) =>
                            handleSelectedVehicleChange(
                              vehicle.vehicleId,
                              "driverId",
                              e.target.value
                            )
                          }
                        >
                          <option value="">No Driver</option>
                          {drivers.map((driver) => (
                            <option
                              key={driver.driverId}
                              value={driver.driverId}
                            >
                              {driver.fullName}
                            </option>
                          ))}
                        </select>
                      ) : (
                        "-"
                      )}
                    </td>

                    <td>
                      {isVehicleSelected(vehicle.vehicleId) ? (
                        <input
                          type="number"
                          className="small-input"
                          value={
                            selectedVehicles[vehicle.vehicleId]?.startMileage ||
                            ""
                          }
                          onChange={(e) =>
                            handleSelectedVehicleChange(
                              vehicle.vehicleId,
                              "startMileage",
                              e.target.value
                            )
                          }
                          placeholder="Start km"
                        />
                      ) : (
                        "-"
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="table-card booking-list-card">
        <h2>Booking List</h2>

        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Customer</th>
              <th>Pickup</th>
              <th>Return</th>
              <th>Total</th>
              <th>Status</th>
              <th>Vehicles</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {bookings.length === 0 ? (
              <tr>
                <td colSpan="8" className="empty-table">
                  No bookings found.
                </td>
              </tr>
            ) : (
              bookings.map((booking) => (
                <tr key={booking.bookingId}>
                  <td>{booking.bookingId}</td>
                  <td>{booking.customerName}</td>
                  <td>{booking.pickupDate}</td>
                  <td>{booking.returnDate}</td>
                  <td>
                    <strong>
                      Rs. {Number(booking.totalAmount).toFixed(2)}
                    </strong>
                  </td>
                  <td>
                    <span
                      className={
                        booking.status === "CONFIRMED" ||
                        booking.status === "COMPLETED"
                          ? "status-active"
                          : "status-inactive"
                      }
                    >
                      {booking.status}
                    </span>
                  </td>

                  <td>
                    {booking.vehicles?.map((vehicle) => (
                      <div
                        key={vehicle.bookingVehicleId}
                        className="booking-vehicle-box"
                      >
                        <div>
                          <strong>
                            {vehicle.registrationNo} - {vehicle.vehicleType}
                          </strong>
                        </div>

                        <div className="muted-text">
                          Driver: {vehicle.driverName || "No driver"}
                        </div>

                        <div className="muted-text">
                          Start: {vehicle.startMileage || "N/A"} km | End:{" "}
                          {vehicle.endMileage || "N/A"} km
                        </div>

                        <div className="muted-text">
                          Extra: {vehicle.extraMileage || 0} km | Charge: Rs.{" "}
                          {Number(vehicle.extraMileageCharge || 0).toFixed(2)}
                        </div>

                        {booking.status === "CONFIRMED" &&
                          vehicle.endMileage === null && (
                            <div className="return-mileage-row">
                              <input
                                type="number"
                                className="small-input"
                                placeholder="End mileage"
                                value={
                                  returnMileageInputs[
                                    vehicle.bookingVehicleId
                                  ] || ""
                                }
                                onChange={(e) =>
                                  handleReturnMileageChange(
                                    vehicle.bookingVehicleId,
                                    e.target.value
                                  )
                                }
                              />

                              <button
                                className="small-button"
                                onClick={() =>
                                  handleUpdateReturnMileage(
                                    vehicle.bookingVehicleId
                                  )
                                }
                              >
                                Update Return
                              </button>
                            </div>
                          )}
                      </div>
                    ))}
                  </td>

                  <td>
                    {booking.status === "CONFIRMED" && (
                      <>
                        <button
                          className="danger-button"
                          onClick={() => handleCancelBooking(booking.bookingId)}
                        >
                          Cancel
                        </button>

                        <button
                          className="small-button"
                          onClick={() =>
                            handleCompleteBooking(booking.bookingId)
                          }
                        >
                          Complete
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Bookings;