import { useEffect, useState } from "react";
import {
  getAllBookings,
  createBooking,
  cancelBooking,
  completeBooking,
} from "../services/bookingService";
import { getAllCustomers } from "../services/customerService";
import { searchVehicles } from "../services/vehicleService";
import authService from "../services/authService";
import EmptyState from "../components/EmptyState";
import SegmentedTabs from "../components/SegmentedTabs";
import SkeletonRows from "../components/SkeletonRows";

function Bookings() {
  const [bookings, setBookings] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [availableVehicles, setAvailableVehicles] = useState([]);
  const [selectedVehicleIds, setSelectedVehicleIds] = useState([]);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isLoadingBookings, setIsLoadingBookings] = useState(true);
  const [isLoadingCustomers, setIsLoadingCustomers] = useState(true);
  const [isSearchingVehicles, setIsSearchingVehicles] = useState(false);
  const [activeTab, setActiveTab] = useState("workspace");

  const [formData, setFormData] = useState({
    customerId: "",
    createdByUserId: authService.getCurrentUser()?.id || 1,
    pickupDate: "",
    rentalDays: 1,
    numberOfVehicles: 1,
    vehicleType: "SUV",
    status: "CONFIRMED",
  });

  const loadBookings = async () => {
    setIsLoadingBookings(true);
    try {
      const data = await getAllBookings();
      setBookings(data);
    } catch {
      setError("Failed to load bookings.");
    } finally {
      setIsLoadingBookings(false);
    }
  };

  const loadCustomers = async () => {
    setIsLoadingCustomers(true);
    try {
      const data = await getAllCustomers();
      setCustomers(data);
    } catch {
      setError("Failed to load customers.");
    } finally {
      setIsLoadingCustomers(false);
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
    setSelectedVehicleIds([]);
    setIsSearchingVehicles(true);

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
        setMessage(`${data.length} available vehicle(s) found. Select vehicles and create booking.`);
      }
    } catch (err) {
      const backendMessage = err.response?.data?.message;
      setError(backendMessage || "Failed to search available vehicles.");
    } finally {
      setIsSearchingVehicles(false);
    }
  };

  const handleVehicleSelect = (vehicleId) => {
    if (selectedVehicleIds.includes(vehicleId)) {
      setSelectedVehicleIds(
        selectedVehicleIds.filter((id) => id !== vehicleId)
      );
    } else {
      if (selectedVehicleIds.length >= Number(formData.numberOfVehicles)) {
        setError(`You can only select ${formData.numberOfVehicles} vehicle(s).`);
        return;
      }

      setError("");
      setSelectedVehicleIds([...selectedVehicleIds, vehicleId]);
    }
  };

  const handleCreateBooking = async () => {
    setMessage("");
    setError("");

    if (!formData.customerId) {
      setError("Please select a customer.");
      return;
    }

    if (selectedVehicleIds.length === 0) {
      setError("Please select at least one vehicle.");
      return;
    }

    try {
      const payload = {
        customerId: Number(formData.customerId),
        createdByUserId: Number(formData.createdByUserId),
        pickupDate: formData.pickupDate,
        rentalDays: Number(formData.rentalDays),
        vehicleIds: selectedVehicleIds,
        status: formData.status,
      };

      await createBooking(payload);

      setMessage("Booking created successfully.");
      setAvailableVehicles([]);
      setSelectedVehicleIds([]);

      setFormData({
        customerId: "",
        createdByUserId: authService.getCurrentUser()?.id || 1,
        pickupDate: "",
        rentalDays: 1,
        numberOfVehicles: 1,
        vehicleType: "SUV",
        status: "CONFIRMED",
      });

      void loadBookings();
      setActiveTab("bookings");
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
      void loadBookings();
    } catch {
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
      void loadBookings();
    } catch {
      setError("Failed to complete booking.");
    }
  };

  const selectedTotal = availableVehicles
    .filter((vehicle) => selectedVehicleIds.includes(vehicle.vehicleId))
    .reduce((sum, vehicle) => sum + Number(vehicle.totalPrice), 0);

  useEffect(() => {
    queueMicrotask(() => {
      void loadBookings();
      void loadCustomers();
    });
  }, []);

  return (
    <div>
      <div className="sticky-page-header">
        <div className="page-header">
          <div>
            <h1>Bookings</h1>
            <p>Create bookings from availability and monitor all reservation states.</p>
          </div>
          <SegmentedTabs
            tabs={[
              { key: "workspace", label: "Booking Workspace" },
              { key: "bookings", label: "Booking List" },
            ]}
            activeKey={activeTab}
            onChange={setActiveTab}
          />
        </div>
      </div>

      {message && <div className="success-message">{message}</div>}
      {error && <div className="error-message">{error}</div>}

      {activeTab === "workspace" && (
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
                {!isLoadingCustomers && customers.map((customer) => (
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
              <button type="submit" className="primary-button" disabled={isSearchingVehicles}>
                Search Available Vehicles
              </button>
            </div>
          </form>

          {selectedVehicleIds.length > 0 && (
            <div className="summary-box">
              <h3>Selected Booking Summary</h3>
              <p>
                <strong>Selected Vehicles:</strong> {selectedVehicleIds.length}
              </p>
              <p>
                <strong>Total Amount:</strong> Rs. {selectedTotal.toFixed(2)}
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
                <th>Provider</th>
                <th>Type</th>
                <th>Reg No</th>
                <th>Model</th>
                <th>Daily Rate</th>
                <th>Total Price</th>
              </tr>
            </thead>

            <tbody>
              {isSearchingVehicles ? (
                <SkeletonRows rows={5} columns={7} />
              ) : availableVehicles.length === 0 ? (
                <tr>
                  <td colSpan="7" className="empty-table">
                    <EmptyState
                      title="No Vehicles Loaded"
                      description="Search with pickup date and rental details to load available vehicles."
                    />
                  </td>
                </tr>
              ) : (
                availableVehicles.map((vehicle) => (
                  <tr key={vehicle.vehicleId}>
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedVehicleIds.includes(vehicle.vehicleId)}
                        onChange={() => handleVehicleSelect(vehicle.vehicleId)}
                      />
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
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      )}

      <div className="table-card booking-list-card" style={{ display: activeTab === "bookings" ? "block" : "none" }}>
        <h2>Booking List</h2>

        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Customer</th>
              <th>Pickup</th>
              <th>Return</th>
              <th>Days</th>
              <th>Total</th>
              <th>Status</th>
              <th>Vehicles</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {isLoadingBookings ? (
              <SkeletonRows rows={6} columns={9} />
            ) : bookings.length === 0 ? (
              <tr>
                <td colSpan="9" className="empty-table">
                  <EmptyState
                    title="No Bookings Yet"
                    description="Create bookings from the workspace tab once vehicles are selected."
                  />
                </td>
              </tr>
            ) : (
              bookings.map((booking) => (
                <tr key={booking.bookingId}>
                  <td>{booking.bookingId}</td>
                  <td>{booking.customerName}</td>
                  <td>{booking.pickupDate}</td>
                  <td>{booking.returnDate}</td>
                  <td>{booking.rentalDays}</td>
                  <td>
                    <strong>Rs. {Number(booking.totalAmount).toFixed(2)}</strong>
                  </td>
                  <td>
                    <span
                      className={
                        booking.status === "CONFIRMED"
                          ? "status-active"
                          : "status-inactive"
                      }
                    >
                      {booking.status}
                    </span>
                  </td>
                  <td>
                    {booking.vehicles?.map((vehicle) => (
                      <div key={vehicle.bookingVehicleId} className="vehicle-chip">
                        {vehicle.registrationNo} - {vehicle.vehicleType}
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
                          onClick={() => handleCompleteBooking(booking.bookingId)}
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
