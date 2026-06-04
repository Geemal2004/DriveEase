import { useEffect, useState } from "react";
import {
  DRIVER_DAILY_FEE,
  getAllBookings,
  createBooking,
  cancelBooking,
  completeBooking,
  completeBookingsBulk,
} from "../services/bookingService";
import { getAllCustomers } from "../services/customerService";
import { getAllDrivers } from "../services/driverService";
import { searchVehicles } from "../services/vehicleService";
import SegmentedTabs from "../components/SegmentedTabs";

function Bookings() {
  const [bookings, setBookings] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [availableVehicles, setAvailableVehicles] = useState([]);
  const [selectedVehicles, setSelectedVehicles] = useState({});
  const [returnMileageInputs, setReturnMileageInputs] = useState({});
  const [selectedBookingIds, setSelectedBookingIds] = useState([]);
  const [receiptBookings, setReceiptBookings] = useState([]);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("create");
  const [sortConfig, setSortConfig] = useState({
    key: "createdAt",
    direction: "desc",
  });

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

  const sortBookingsNewestFirst = (bookingList) => {
    return [...bookingList].sort((a, b) => {
      const aCreatedTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const bCreatedTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;

      if (aCreatedTime !== bCreatedTime) {
        return bCreatedTime - aCreatedTime;
      }

      return Number(b.bookingId || 0) - Number(a.bookingId || 0);
    });
  };

  const getSortableBookingValue = (booking, key) => {
    switch (key) {
      case "bookingId":
        return Number(booking.bookingId || 0);
      case "customerName":
        return booking.customerName || "";
      case "pickupDate":
        return booking.pickupDate ? new Date(booking.pickupDate).getTime() : 0;
      case "returnDate":
        return booking.returnDate ? new Date(booking.returnDate).getTime() : 0;
      case "totalAmount":
        return Number(booking.totalAmount || 0);
      case "status":
        return booking.status || "";
      case "vehicles":
        return booking.vehicles?.length || 0;
      case "createdAt":
        return booking.createdAt ? new Date(booking.createdAt).getTime() : 0;
      default:
        return "";
    }
  };

  const handleBookingSort = (key) => {
    setSortConfig((currentSort) => {
      if (currentSort.key === key) {
        return {
          key,
          direction: currentSort.direction === "asc" ? "desc" : "asc",
        };
      }

      return {
        key,
        direction: key === "bookingId" ? "desc" : "asc",
      };
    });
  };

  const getSortIndicator = (key) => {
    if (sortConfig.key !== key) {
      return "";
    }

    return sortConfig.direction === "asc" ? "▲" : "▼";
  };

  const formatCurrency = (value) => {
    return Number(value || 0).toFixed(2);
  };

  const loadBookings = async () => {
    try {
      const data = await getAllBookings();
      setBookings(sortBookingsNewestFirst(data));
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
      setActiveTab("list");

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

  const getReturnMileageValue = (bookingVehicle) => {
    return (
      returnMileageInputs[bookingVehicle.bookingVehicleId] ??
      bookingVehicle.endMileage ??
      ""
    );
  };

  const buildCompletionPayload = (booking) => {
    return {
      bookingId: booking.bookingId,
      returnedVehicles: (booking.vehicles || []).map((vehicle) => ({
        vehicleId: Number(vehicle.vehicleId),
        endMileage: Number(getReturnMileageValue(vehicle)),
      })),
    };
  };

  const validateReturnMileages = (bookingsToComplete) => {
    for (const booking of bookingsToComplete) {
      for (const vehicle of booking.vehicles || []) {
        const endMileage = getReturnMileageValue(vehicle);

        if (endMileage === "" || endMileage === null || Number.isNaN(Number(endMileage))) {
          return `Please enter end mileage for booking ${booking.bookingId}, vehicle ${vehicle.registrationNo}.`;
        }

        if (Number(endMileage) < Number(vehicle.startMileage || 0)) {
          return `End mileage cannot be lower than start mileage for vehicle ${vehicle.registrationNo}.`;
        }
      }
    }

    return "";
  };

  const handleCompleteBooking = async (id) => {
    const booking = bookings.find((item) => item.bookingId === id);

    if (!booking) {
      setError("Booking not found.");
      return;
    }

    const validationError = validateReturnMileages([booking]);

    if (validationError) {
      setError(validationError);
      return;
    }

    const confirmComplete = window.confirm(
      "Complete this booking and calculate final payment?"
    );

    if (!confirmComplete) {
      return;
    }

    setMessage("");
    setError("");

    try {
      const completedBooking = await completeBooking(id, {
        returnedVehicles: buildCompletionPayload(booking).returnedVehicles,
      });
      setMessage("Booking completed successfully.");
      setReceiptBookings([completedBooking]);
      setSelectedBookingIds([]);
      await loadBookings();
    } catch (err) {
      const backendMessage = err.response?.data?.message;
      setError(backendMessage || "Failed to complete booking.");
    }
  };

  const handleReturnMileageChange = (bookingVehicleId, value) => {
    setReturnMileageInputs({
      ...returnMileageInputs,
      [bookingVehicleId]: value,
    });
  };

  const handleBookingSelection = (bookingId) => {
    setSelectedBookingIds((currentSelectedIds) =>
      currentSelectedIds.includes(bookingId)
        ? currentSelectedIds.filter((id) => id !== bookingId)
        : [...currentSelectedIds, bookingId]
    );
  };

  const handleCompleteSelectedBookings = async () => {
    const bookingsToComplete = bookings.filter(
      (booking) =>
        selectedBookingIds.includes(booking.bookingId) &&
        booking.status === "CONFIRMED"
    );

    if (bookingsToComplete.length === 0) {
      setError("Please select at least one confirmed booking.");
      return;
    }

    const validationError = validateReturnMileages(bookingsToComplete);

    if (validationError) {
      setError(validationError);
      return;
    }

    const confirmComplete = window.confirm(
      `Complete ${bookingsToComplete.length} selected booking(s) and calculate bulk payment?`
    );

    if (!confirmComplete) {
      return;
    }

    setMessage("");
    setError("");

    try {
      const completedBookings = await completeBookingsBulk(
        bookingsToComplete.map(buildCompletionPayload)
      );
      setMessage("Selected bookings completed successfully.");
      setReceiptBookings(completedBookings);
      setSelectedBookingIds([]);
      await loadBookings();
    } catch (err) {
      const backendMessage = err.response?.data?.message;
      setError(backendMessage || "Failed to complete selected bookings.");
    }
  };

  const handlePrintReceipt = () => {
    window.print();
  };

  const getDriverCost = (vehicleId) => {
    return selectedVehicles[vehicleId]?.driverId
      ? DRIVER_DAILY_FEE * Number(formData.rentalDays)
      : 0;
  };

  const selectedTotal = availableVehicles
    .filter((vehicle) => selectedVehicles[vehicle.vehicleId])
    .reduce(
      (sum, vehicle) =>
        sum + Number(vehicle.totalPrice) + getDriverCost(vehicle.vehicleId),
      0
    );

  const sortedBookings = [...bookings].sort((a, b) => {
    const aValue = getSortableBookingValue(a, sortConfig.key);
    const bValue = getSortableBookingValue(b, sortConfig.key);

    if (typeof aValue === "number" && typeof bValue === "number") {
      return sortConfig.direction === "asc"
        ? aValue - bValue
        : bValue - aValue;
    }

    const comparison = String(aValue).localeCompare(String(bValue));
    return sortConfig.direction === "asc" ? comparison : -comparison;
  });

  const getBookingBaseTotal = (booking) => {
    return (booking.vehicles || []).reduce(
      (sum, vehicle) => sum + Number(vehicle.lineTotal || 0),
      0
    );
  };

  const getBookingExtraMileageTotal = (booking) => {
    return (booking.vehicles || []).reduce(
      (sum, vehicle) => sum + Number(vehicle.extraMileageCharge || 0),
      0
    );
  };

  const receiptGrandTotal = receiptBookings.reduce(
    (sum, booking) => sum + Number(booking.totalAmount || 0),
    0
  );

  return (
    <div className={receiptBookings.length > 0 ? "bookings-page has-receipt" : "bookings-page"}>
      <div className="sticky-page-header">
        <div className="page-header">
          <div>
            <h1>Bookings</h1>
            <p>Create and manage customer vehicle rental bookings.</p>
          </div>
          <SegmentedTabs
            tabs={[
              { key: "create", label: "Create Booking" },
              { key: "list", label: "Booking List" },
            ]}
            activeKey={activeTab}
            onChange={setActiveTab}
          />
        </div>
      </div>

      {message && <div className="success-message">{message}</div>}
      {error && <div className="error-message">{error}</div>}

      {activeTab === "create" && (
        <div className="booking-stack">
          <div className="form-card">
            <h2>Create Booking</h2>

            <form onSubmit={handleSearchVehicles}>
              <div className="horizontal-form-grid">
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
                      <option
                        key={customer.customerId}
                        value={customer.customerId}
                      >
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
                  <strong>Estimated Total:</strong> Rs.{" "}
                  {selectedTotal.toFixed(2)}
                </p>

                <p>
                  <strong>Driver Fee:</strong> Rs. {DRIVER_DAILY_FEE.toFixed(2)} per
                  day per selected driver
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
                          Rs.{" "}
                          {(
                            Number(vehicle.totalPrice) +
                            getDriverCost(vehicle.vehicleId)
                          ).toFixed(2)}
                        </strong>
                      </td>

                      <td>
                        {isVehicleSelected(vehicle.vehicleId) ? (
                          <select
                            value={
                              selectedVehicles[vehicle.vehicleId]?.driverId ||
                              ""
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
                              selectedVehicles[vehicle.vehicleId]
                                ?.startMileage || ""
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
      )}

      {activeTab === "list" && (
        <div className="booking-stack">
        <div className="table-card">
          <div className="results-header">
            <h2>Booking List</h2>
            <div className="results-actions">
              <button
                type="button"
                className="primary-button"
                onClick={handleCompleteSelectedBookings}
                disabled={selectedBookingIds.length === 0}
              >
                Complete Selected ({selectedBookingIds.length})
              </button>
            </div>
          </div>

          <table className="data-table">
            <thead>
              <tr>
                <th>Select</th>
                <th>
                  <button
                    type="button"
                    className="sortable-header"
                    onClick={() => handleBookingSort("bookingId")}
                  >
                    ID {getSortIndicator("bookingId")}
                  </button>
                </th>
                <th>
                  <button
                    type="button"
                    className="sortable-header"
                    onClick={() => handleBookingSort("customerName")}
                  >
                    Customer {getSortIndicator("customerName")}
                  </button>
                </th>
                <th>
                  <button
                    type="button"
                    className="sortable-header"
                    onClick={() => handleBookingSort("pickupDate")}
                  >
                    Pickup {getSortIndicator("pickupDate")}
                  </button>
                </th>
                <th>
                  <button
                    type="button"
                    className="sortable-header"
                    onClick={() => handleBookingSort("returnDate")}
                  >
                    Return {getSortIndicator("returnDate")}
                  </button>
                </th>
                <th>
                  <button
                    type="button"
                    className="sortable-header"
                    onClick={() => handleBookingSort("totalAmount")}
                  >
                    Total {getSortIndicator("totalAmount")}
                  </button>
                </th>
                <th>
                  <button
                    type="button"
                    className="sortable-header"
                    onClick={() => handleBookingSort("status")}
                  >
                    Status {getSortIndicator("status")}
                  </button>
                </th>
                <th>
                  <button
                    type="button"
                    className="sortable-header"
                    onClick={() => handleBookingSort("vehicles")}
                  >
                    Vehicles {getSortIndicator("vehicles")}
                  </button>
                </th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {bookings.length === 0 ? (
                <tr>
                  <td colSpan="9" className="empty-table">
                    No bookings found.
                  </td>
                </tr>
              ) : (
                sortedBookings.map((booking) => (
                  <tr key={booking.bookingId}>
                    <td>
                      {booking.status === "CONFIRMED" ? (
                        <input
                          type="checkbox"
                          checked={selectedBookingIds.includes(booking.bookingId)}
                          onChange={() =>
                            handleBookingSelection(booking.bookingId)
                          }
                        />
                      ) : (
                        "-"
                      )}
                    </td>
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
                            {vehicle.endMileage || "Pending"} km
                          </div>

                          <div className="muted-text">
                            Allowed: {vehicle.allowedMileage || 0} km | Actual:{" "}
                            {vehicle.actualMileage || 0} km
                          </div>

                          <div className="muted-text">
                            Extra: {vehicle.extraMileage || 0} km | Charge: Rs.{" "}
                            {formatCurrency(vehicle.extraMileageCharge)}
                          </div>

                          {booking.status === "CONFIRMED" && (
                            <div className="return-mileage-row">
                              <input
                                type="number"
                                className="small-input"
                                placeholder="End mileage"
                                value={getReturnMileageValue(vehicle)}
                                onChange={(e) =>
                                  handleReturnMileageChange(
                                    vehicle.bookingVehicleId,
                                    e.target.value
                                  )
                                }
                              />
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
                            onClick={() =>
                              handleCancelBooking(booking.bookingId)
                            }
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

        {receiptBookings.length > 0 && (
          <div className="table-card receipt-card">
            <div className="results-header">
              <div>
                <h2>Payment Receipt</h2>
                <p className="muted-text">
                  Detailed receipt for {receiptBookings.length} completed booking(s).
                </p>
              </div>
              <button
                type="button"
                className="secondary-button"
                onClick={handlePrintReceipt}
              >
                Print Receipt
              </button>
            </div>

            <div className="print-report-header">
              <h2>DriveEase Payment Receipt</h2>
              <p>Generated: {new Date().toLocaleString()}</p>
            </div>

            {receiptBookings.map((booking) => (
              <div key={booking.bookingId} className="receipt-booking">
                <div className="receipt-booking-header">
                  <div>
                    <h3>Booking #{booking.bookingId}</h3>
                    <p className="muted-text">{booking.customerName}</p>
                  </div>
                  <strong>Rs. {formatCurrency(booking.totalAmount)}</strong>
                </div>

                <div className="receipt-meta">
                  <span>Pickup: {booking.pickupDate}</span>
                  <span>Return: {booking.returnDate}</span>
                  <span>Days: {booking.rentalDays}</span>
                </div>

                <table className="data-table receipt-table">
                  <thead>
                    <tr>
                      <th>Vehicle</th>
                      <th>Start</th>
                      <th>End</th>
                      <th>Allowed</th>
                      <th>Actual</th>
                      <th>Extra</th>
                      <th>Extra Rate</th>
                      <th>Base Total</th>
                      <th>Extra Charge</th>
                    </tr>
                  </thead>
                  <tbody>
                    {booking.vehicles?.map((vehicle) => (
                      <tr key={vehicle.bookingVehicleId}>
                        <td>
                          {vehicle.registrationNo} - {vehicle.model || vehicle.vehicleType}
                        </td>
                        <td>{vehicle.startMileage || 0} km</td>
                        <td>{vehicle.endMileage || 0} km</td>
                        <td>{vehicle.allowedMileage || 0} km</td>
                        <td>{vehicle.actualMileage || 0} km</td>
                        <td>{vehicle.extraMileage || 0} km</td>
                        <td>Rs. {formatCurrency(vehicle.extraMileageRate)}</td>
                        <td>Rs. {formatCurrency(vehicle.lineTotal)}</td>
                        <td>Rs. {formatCurrency(vehicle.extraMileageCharge)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className="receipt-totals">
                  <span>Normal Total: Rs. {formatCurrency(getBookingBaseTotal(booking))}</span>
                  <span>
                    Extra Mileage Fees: Rs.{" "}
                    {formatCurrency(getBookingExtraMileageTotal(booking))}
                  </span>
                  <strong>Final Total: Rs. {formatCurrency(booking.totalAmount)}</strong>
                </div>
              </div>
            ))}

            <div className="receipt-grand-total">
              <span>Bulk Payment Total</span>
              <strong>Rs. {formatCurrency(receiptGrandTotal)}</strong>
            </div>
          </div>
        )}
        </div>
      )}
    </div>
  );
}

export default Bookings;
