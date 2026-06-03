import { useState } from "react";
import { searchVehicles } from "../services/vehicleService";
import EmptyState from "../components/EmptyState";
import SegmentedTabs from "../components/SegmentedTabs";
import SkeletonRows from "../components/SkeletonRows";

function SearchVehicles() {
  const [searchData, setSearchData] = useState({
    pickupDate: "",
    rentalDays: 1,
    numberOfVehicles: 1,
    vehicleType: "",
  });

  const [results, setResults] = useState([]);
  const [selectedVehicleIds, setSelectedVehicleIds] = useState([]);
  const [simulation, setSimulation] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("results");

  const handleChange = (e) => {
    const { name, value } = e.target;

    setSearchData({
      ...searchData,
      [name]:
        name === "rentalDays" || name === "numberOfVehicles"
          ? Number(value)
          : value,
    });
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    setSimulation(null);
    setIsLoading(true);

    try {
      // If vehicleType is empty, we exclude it so the backend sees it as null
      const payload = { ...searchData };
      if (!payload.vehicleType) {
        delete payload.vehicleType;
      }

      const data = await searchVehicles(payload);
      setResults(data);
      setSelectedVehicleIds([]);

      if (data.length === 0) {
        setMessage("No available vehicles found for the selected criteria.");
      } else if (data.length < searchData.numberOfVehicles) {
        setMessage(
          `Only ${data.length} vehicle(s) available out of ${searchData.numberOfVehicles} requested.`
        );
      } else {
        setMessage(`${data.length} available vehicle(s) found.`);
      }
    } catch (err) {
      const backendMessage = err.response?.data?.message;
      setError(backendMessage || "Failed to search vehicles.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSimulateBooking = () => {
    const vehiclesToSimulate = selectedVehicleIds.length > 0 
      ? results.filter(v => selectedVehicleIds.includes(v.vehicleId))
      : results;

    if (vehiclesToSimulate.length === 0) {
      setError("No vehicles available to simulate booking.");
      return;
    }

    if (vehiclesToSimulate.length > searchData.numberOfVehicles) {
      setError(`Please select up to ${searchData.numberOfVehicles} vehicles or modify your search criteria.`);
      return;
    }

    const totalAmount = vehiclesToSimulate.reduce(
      (sum, vehicle) => sum + Number(vehicle.totalPrice),
      0
    );

    setSimulation({
      pickupDate: searchData.pickupDate,
      rentalDays: searchData.rentalDays,
      vehicleCount: vehiclesToSimulate.length,
      vehicleType: searchData.vehicleType || "Multiple Types",
      totalAmount,
    });
    setActiveTab("simulation");
  };

  const handleSelectVehicle = (vehicleId) => {
    setSelectedVehicleIds((prev) => {
      if (prev.includes(vehicleId)) {
        return prev.filter(id => id !== vehicleId);
      }
      return [...prev, vehicleId];
    });
  };

  const handlePrint = () => {
    window.print();
  };

  const clearResults = () => {
    setResults([]);
    setSimulation(null);
    setMessage("");
    setError("");
    setActiveTab("results");
  };

  return (
    <div className="search-vehicles-page">
      <div className="sticky-page-header">
        <div className="page-header">
          <div>
            <h1>Search Vehicles</h1>
            <p>Run availability checks and compare costs before booking decisions.</p>
          </div>
        </div>
      </div>

      <div className="print-report-header">
        <h2>DriveEase Vehicle Availability Report</h2>
        <p>
          Pickup Date:{" "}
          {searchData.pickupDate ? (
            <span className="numeric-value">{searchData.pickupDate}</span>
          ) : (
            "N/A"
          )}
        </p>
        <p>
          Rental Days: <span className="numeric-value">{searchData.rentalDays}</span>
        </p>
        <p>
          Requested Vehicles:{" "}
          <span className="numeric-value">{searchData.numberOfVehicles}</span>
        </p>
        <p>Vehicle Type: {searchData.vehicleType || "Any Type"}</p>
      </div>

      {message && <div className="success-message">{message}</div>}
      {error && <div className="error-message">{error}</div>}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div className="form-card">
          <h2>Search Criteria</h2>

          <form onSubmit={handleSearch}>
            <div className="four-col-grid">
              <div className="form-group">
                <label>Pickup Date</label>
                <input
                  type="date"
                  name="pickupDate"
                  value={searchData.pickupDate}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Number of Rental Days</label>
                <input
                  type="number"
                  name="rentalDays"
                  min="1"
                  value={searchData.rentalDays}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Number of Vehicles Required</label>
                <input
                  type="number"
                  name="numberOfVehicles"
                  min="1"
                  value={searchData.numberOfVehicles}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Vehicle Type <span>(Optional)</span></label>
                <select
                  name="vehicleType"
                  value={searchData.vehicleType}
                  onChange={handleChange}
                >
                  <option value="">Any Type (All Vehicles)</option>
                  <option value="SUV">SUV</option>
                  <option value="SEDAN">SEDAN</option>
                  <option value="HATCHBACK">HATCHBACK</option>
                  <option value="VAN">VAN</option>
                  <option value="OTHER">OTHER</option>
                </select>
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="primary-button">
                Search Vehicles
              </button>

              <button
                type="button"
                className="secondary-button"
                onClick={clearResults}
              >
                Clear
              </button>
            </div>
          </form>
        </div>

        <div className="table-card">
          <div className="results-header">
            <h2>Search Results</h2>

            {results.length > 0 && (
              <div className="results-actions">
                <SegmentedTabs
                  tabs={[
                    { key: "results", label: "Results" },
                    { key: "simulation", label: "Simulation" },
                  ]}
                  activeKey={activeTab}
                  onChange={setActiveTab}
                />
                <button
                  className="small-button"
                  onClick={handleSimulateBooking}
                >
                  Simulate Booking
                </button>

                <button className="secondary-button" onClick={handlePrint}>
                  Print Results
                </button>
              </div>
            )}
          </div>

          <table className="data-table">
            <thead>
              <tr>
                <th>Select</th>
                <th>Image</th>
                <th>Vehicle Type</th>
                <th>Reg No</th>
                <th>Model</th>
                <th>Extra Mileage Rate</th>
                <th> Daily Rate</th>
                <th>Rental Days</th>
                <th>Total Price</th>
                <th>Availability</th>
              </tr>
            </thead>

            <tbody>
              {isLoading ? (
                <SkeletonRows rows={6} columns={11} />
              ) : results.length === 0 ? (
                <tr>
                  <td colSpan="11" className="empty-table">
                    <EmptyState
                      title="No Search Results"
                      description="Use the filters on the left to find available vehicles."
                    />
                  </td>
                </tr>
              ) : (
                results.map((vehicle) => (
                  <tr key={vehicle.vehicleId}>
                    <td>
                      <input 
                        type="checkbox" 
                        checked={selectedVehicleIds.includes(vehicle.vehicleId)}
                        onChange={() => handleSelectVehicle(vehicle.vehicleId)}
                        disabled={!selectedVehicleIds.includes(vehicle.vehicleId) && selectedVehicleIds.length >= searchData.numberOfVehicles}
                      />
                    </td>
                    <td>
                      {vehicle.imageUrl ? (
                        <img
                          src={vehicle.imageUrl}
                          alt={vehicle.model || vehicle.registrationNo}
                          style={{
                            width: "72px",
                            height: "48px",
                            objectFit: "cover",
                            borderRadius: "6px",
                            border: "1px solid #d1d5db",
                          }}
                        />
                      ) : (
                        <span className="muted-text">No image</span>
                      )}
                    </td>
                    <td>{vehicle.vehicleType}</td>
                    <td>{vehicle.registrationNo}</td>
                    <td>{vehicle.model}</td>
                    <td>{vehicle.extraMileageRate}</td>
                    <td className="numeric-cell">Rs. {Number(vehicle.finalDailyRate).toFixed(2)}</td>
                    <td className="numeric-cell">{vehicle.rentalDays}</td>
                    <td>
                      <strong className="numeric-value">
                        Rs. {Number(vehicle.totalPrice).toFixed(2)}
                      </strong>
                    </td>
                    <td>
                      <span className="status-active">
                        {vehicle.availabilityStatus}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {simulation && (
            <div className="summary-box">
              <h3>Booking Simulation Summary</h3>

              <p>
                <strong>Pickup Date:</strong>{" "}
                <span className="numeric-value">{simulation.pickupDate}</span>
              </p>

              <p>
                <strong>Rental Days:</strong>{" "}
                <span className="numeric-value">{simulation.rentalDays}</span>
              </p>

              <p>
                <strong>Vehicle Type:</strong> {simulation.vehicleType}
              </p>

              <p>
                <strong>Vehicle Count:</strong>{" "}
                <span className="numeric-value">{simulation.vehicleCount}</span>
              </p>

              <p>
                <strong>Total Estimated Price:</strong>{" "}
                <span className="numeric-value">
                  Rs. {simulation.totalAmount.toFixed(2)}
                </span>
              </p>

              <p className="muted-text">
                This is only a simulation. No booking record is saved until a
                booking is created.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default SearchVehicles;
