import { useEffect, useState } from "react";
import {
  getAllBookings,
  createBooking,
  cancelBooking,
  completeBooking,
} from "../services/bookingService";
import { getAllCustomers } from "../services/customerService";
import { getAllDrivers } from "../services/driverService";
import { searchVehicles } from "../services/vehicleService";
import authService from "../services/authService";
import EmptyState from "../components/EmptyState";
import SegmentedTabs from "../components/SegmentedTabs";
import SkeletonRows from "../components/SkeletonRows";

function Bookings() {
  const [bookings, setBookings] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [availableDrivers, setAvailableDrivers] = useState([]);
  const [availableVehicles, setAvailableVehicles] = useState([]);
  
  // Array of selected vehicle IDs
  const [selectedVehicleIds, setSelectedVehicleIds] = useState([]);
  
  // Object to store specific details (driverId, startMileage) mapped by vehicleId
  const [vehicleAssignments, setVehicleAssignments] = useState({});

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isLoadingBookings, setIsLoadingBookings] = useState(true);
  const [isLoadingCustomers, setIsLoadingCustomers] = useState(true);
  const [isSearchingDrivers, setIsSearchingDrivers] = useState(false);
  const [isSearchingVehicles, setIsSearchingVehicles] = useState(false);
  
  const [activeTab, setActiveTab] = useState("vehicles"); 

  const [formData, setFormData] = useState({
    customerId: "",
    createdByUserId: authService.getCurrentUser()?.id || 1,
    pickupDate: "",
    rentalDays: 1,
    numberOfVehicles: 1,
    vehicleType: "SUV",
    status: "CONFIRMED",
    needsDriver: false,
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
    const { name, value, type, checked } = e.target;
    
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked 
          : name === "customerId" ||
            name === "createdByUserId" ||
            name === "rentalDays" ||
            name === "numberOfVehicles"
          ? Number(value)
          : value,
    }));
  };

  const handleSearchVehicles = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    setAvailableVehicles([]);
    setSelectedVehicleIds([]);
    setVehicleAssignments({});
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
        setMessage(`${data.length} available vehicle(s) found. Select vehicles to proceed.`);
      }
    } catch (err) {
      const backendMessage = err.response?.data?.message;
      setError(backendMessage || "Failed to search available vehicles.");
    } finally {
      setIsSearchingVehicles(false);
    }
  };

  const handleVehicleSelect = (vehicleId, vehicleData) => {
    if (selectedVehicleIds.includes(vehicleId)) {
      // Remove from array and assignments
      setSelectedVehicleIds(selectedVehicleIds.filter((id) => id !== vehicleId));
      setVehicleAssignments((prev) => {
        const copy = { ...prev };
        delete copy[vehicleId];
        return copy;
      });
      setError("");
    } else {
      // Check limit
      if (selectedVehicleIds.length >= Number(formData.numberOfVehicles)) {
        setError(`You can only select ${formData.numberOfVehicles} vehicle(s).`);
        return;
      }
      
      // Add to array and initialize assignments
      setSelectedVehicleIds([...selectedVehicleIds, vehicleId]);
      setVehicleAssignments((prev) => ({
        ...prev,
        [vehicleId]: {
          driverId: "",
          // Use current mileage from DB if available, otherwise default to 0
          startMileage: vehicleData.currentMileage || vehicleData.startMileage || 0, 
        }
      }));
      setError("");
    }
  };

  const handleAssignmentChange = (vehicleId, field, value) => {
    setVehicleAssignments((prev) => ({
      ...prev,
      [vehicleId]: {
        ...prev[vehicleId],
        [field]: value,
      }
    }));
  };

  const loadDriversForAssignment = async () => {
    setIsSearchingDrivers(true);
    setError("");
    try {
      const data = await getAllDrivers();
      setAvailableDrivers(data);
    } catch (err) {
      setError("Failed to load drivers for assignment.");
    } finally {
      setIsSearchingDrivers(false);
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
      // Map state exactly to the requested payload structure
      const formattedVehicles = selectedVehicleIds.map((vId) => ({
        vehicleId: vId,
        driverId: vehicleAssignments[vId]?.driverId ? Number(vehicleAssignments[vId].driverId) : null,
        startMileage: Number(vehicleAssignments[vId]?.startMileage) || 0,
      }));

      const payload = {
        customerId: Number(formData.customerId),
        createdByUserId: Number(formData.createdByUserId),
        pickupDate: formData.pickupDate,
        rentalDays: Number(formData.rentalDays),
        status: formData.status,
        vehicles: formattedVehicles, // Embedded array of objects
      };

      await createBooking(payload);

      setMessage("Booking created successfully.");
      setAvailableVehicles([]);
      setSelectedVehicleIds([]);
      setVehicleAssignments({});
      
      setFormData({
        customerId: "",
        createdByUserId: authService.getCurrentUser()?.id || 1,
        pickupDate: "",
        rentalDays: 1,
        numberOfVehicles: 1,
        vehicleType: "SUV",
        status: "CONFIRMED",
        needsDriver: false,
      });

      void loadBookings();
      setActiveTab("bookings");
    } catch (err) {
      const backendMessage = err.response?.data?.message;
      setError(backendMessage || "Failed to create booking.");
    }
  };

  // ... (handleCancelBooking and handleCompleteBooking remain exactly the same)
  const handleCancelBooking = async (id) => {
    const confirmCancel = window.confirm("Are you sure you want to cancel this booking?");
    if (!confirmCancel) return;
    try { await cancelBooking(id); void loadBookings(); } catch {}
  };

  const handleCompleteBooking = async (id) => {
    const confirmComplete = window.confirm("Are you sure you want to mark this booking as completed?");
    if (!confirmComplete) return;
    try { await completeBooking(id); void loadBookings(); } catch {}
  };

  const selectedTotal = availableVehicles
    .filter((vehicle) => selectedVehicleIds.includes(vehicle.vehicleId))
    .reduce((sum, vehicle) => sum + Number(vehicle.totalPrice), 0);

  useEffect(() => {
    void loadBookings();
    void loadCustomers();
  }, []);

  // If they need to enter mileage OR assign a driver, give them the configuration tab
  // If they skip the driver, we still need startMileage. 
  const dynamicTabs = [
    { key: "vehicles", label: "1. Select Vehicles" },
    { key: "configure", label: formData.needsDriver ? "2. Configure Vehicles & Drivers" : "2. Configure Mileage" },
    { key: "bookings", label: "3. Booking List" }
  ];

  return (
    <div>
      <div className="sticky-page-header">
        <div className="page-header">
          <div>
            <h1>Bookings</h1>
            <p>Create bookings from availability and monitor all reservation states.</p>
          </div>
          <SegmentedTabs tabs={dynamicTabs} activeKey={activeTab} onChange={setActiveTab} />
        </div>
      </div>

      {message && <div className="success-message">{message}</div>}
      {error && <div className="error-message">{error}</div>}

      {/* --- TAB 1: VEHICLE SELECTION --- */}
      {activeTab === "vehicles" && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="form-card">
            <h2>Search Criteria</h2>
            {/* Form inputs are the same as previously defined */}
            <form onSubmit={handleSearchVehicles}>
              <div className="four-col-grid">
                <div className="form-group">
                  <label>Customer</label>
                  <select name="customerId" value={formData.customerId} onChange={handleChange} required>
                    <option value="">Select Customer</option>
                    {!isLoadingCustomers && customers.map((c) => (
                      <option key={c.customerId} value={c.customerId}>{c.fullName}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Pickup Date</label>
                  <input type="date" name="pickupDate" value={formData.pickupDate} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label>Rental Days</label>
                  <input type="number" name="rentalDays" min="1" value={formData.rentalDays} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label>Number of Vehicles</label>
                  <input type="number" name="numberOfVehicles" min="1" value={formData.numberOfVehicles} onChange={handleChange} required />
                </div>
                
                <div className="form-group" style={{ gridColumn: '1 / -1', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <input type="checkbox" id="needsDriver" name="needsDriver" checked={formData.needsDriver} onChange={handleChange} style={{ width: '18px', height: '18px' }} />
                  <label htmlFor="needsDriver" style={{ marginBottom: 0, fontWeight: 'bold' }}>Include Driver(s) with this Booking</label>
                </div>

                <div className="form-actions" style={{ gridColumn: '1 / -1' }}>
                  <button type="submit" className="primary-button" disabled={isSearchingVehicles}>
                    Search Available Vehicles
                  </button>
                </div>
              </div>
            </form>
          </div>

          <div className="table-card">
            <h2>Available Vehicles</h2>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Select</th>
                  <th>Reg No</th>
                  <th>Type / Model</th>
                  <th>Total Price</th>
                </tr>
              </thead>
              <tbody>
                {isSearchingVehicles ? <SkeletonRows rows={3} columns={4} /> : availableVehicles.map((v) => (
                  <tr key={v.vehicleId}>
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedVehicleIds.includes(v.vehicleId)}
                        onChange={() => handleVehicleSelect(v.vehicleId, v)}
                      />
                    </td>
                    <td>{v.registrationNo}</td>
                    <td>{v.vehicleType} - {v.model}</td>
                    <td>Rs. {Number(v.totalPrice).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {selectedVehicleIds.length > 0 && (
            <div className="summary-box">
              <h3>Vehicles Selected: <span className="numeric-value">{selectedVehicleIds.length}</span></h3>
              <button type="button" className="primary-button" onClick={() => {
                if (formData.needsDriver) loadDriversForAssignment();
                setActiveTab("configure");
              }}>
                Next: Configure Details
              </button>
            </div>
          )}
        </div>
      )}

      {/* --- TAB 2: CONFIGURE VEHICLES (START MILEAGE & DRIVERS) --- */}
      {activeTab === "configure" && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="form-card">
             <h2>Configure Assigned Vehicles</h2>
             <p>Set the starting mileage for each vehicle, and assign drivers if requested.</p>
          </div>

          <div className="table-card">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Vehicle</th>
                  <th>Start Mileage</th>
                  {formData.needsDriver && <th>Assign Driver</th>}
                </tr>
              </thead>
              <tbody>
                {selectedVehicleIds.map((vId) => {
                  const vehicle = availableVehicles.find(v => v.vehicleId === vId);
                  return (
                    <tr key={vId}>
                      <td><strong>{vehicle?.registrationNo}</strong> ({vehicle?.model})</td>
                      <td>
                        <input 
                          type="number" 
                          min="0"
                          value={vehicleAssignments[vId]?.startMileage || ""}
                          onChange={(e) => handleAssignmentChange(vId, "startMileage", e.target.value)}
                          style={{ padding: '8px', width: '150px' }}
                        />
                      </td>
                      {formData.needsDriver && (
                        <td>
                          {isSearchingDrivers ? (
                             <span>Loading drivers...</span>
                          ) : (
                             <select 
                               value={vehicleAssignments[vId]?.driverId || ""} 
                               onChange={(e) => handleAssignmentChange(vId, "driverId", e.target.value)}
                               style={{ padding: '8px', width: '200px' }}
                             >
                               <option value="">-- No Driver --</option>
                               {availableDrivers.map(d => (
                                 <option key={d.driverId} value={d.driverId}>
                                   {d.name} (Rs. {d.dailyRate})
                                 </option>
                               ))}
                             </select>
                          )}
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="summary-box">
             <h3>Final Booking Summary</h3>
             <p><strong>Total Vehicle Amount:</strong> Rs. {selectedTotal.toFixed(2)}</p>
             <button type="button" className="primary-button" onClick={handleCreateBooking}>
               Confirm & Create Booking
             </button>
          </div>
        </div>
      )}

      {/* --- TAB 3: BOOKING LIST --- */}
      {activeTab === "bookings" && (
         <div className="table-card booking-list-card">
            {/* Existing Table Code for Bookings List */}
            <h2>Booking List</h2>
         </div>
      )}
    </div>
  );
}

export default Bookings;