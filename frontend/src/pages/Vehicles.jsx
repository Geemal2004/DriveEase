import { useEffect, useState, useMemo } from "react";
import {
  getAllVehicles,
  createVehicle,
  updateVehicle,
  deactivateVehicle,
  uploadVehicleImage,
} from "../services/vehicleService";
import { getAllContracts } from "../services/contractService";
import EmptyState from "../components/EmptyState";
import SegmentedTabs from "../components/SegmentedTabs";
import SkeletonRows from "../components/SkeletonRows";

function Vehicles() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [vehicles, setVehicles] = useState([]);
  const [contracts, setContracts] = useState([]);
  const [editingVehicleId, setEditingVehicleId] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("list");

  const [formData, setFormData] = useState({
    contractId: "",
    vehicleType: "SUV",
    registrationNo: "",
    model: "",
    imageUrl: "",
    baseDailyRate: "",
    serviceMileageInterval: "",
    extraMileageRate: "",
    allowedMileagePerDay: "",
    availabilityStatus: "AVAILABLE",
    active: true,
  });

  const loadVehicles = async () => {
    setIsLoading(true);
    try {
      const data = await getAllVehicles();

      const sortedVehicles = data.sort((a,b) => {
        if (a.availabilityStatus === "AVAILABLE" && b.availabilityStatus !== "AVAILABLE") {
          return -1;
        }
        if (a.availabilityStatus !== "AVAILABLE" && b.availabilityStatus === "AVAILABLE") {
           return -1;
        }
      });
      setVehicles(data);
    } catch {
      setError("Failed to load vehicles.");
    } finally {
      setIsLoading(false);
    }
  };

  const filteredVehicles = useMemo(() => {
    return vehicles.filter((vehicle) => {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = 
      (vehicle.model && vehicle.model.toLowerCase().includes(searchLower)) ||
      (vehicle.registrationNo && vehicle.registrationNo.toLowerCase().includes(searchLower));
      const matchesStatus = statusFilter === "ALL" || vehicle.availabilityStatus === statusFilter;

      const matchesType = 
      typeFilter === "ALL" || vehicle.vehicleType === typeFilter;

      return matchesSearch && matchesStatus && matchesType;

    });
  }, [vehicles, searchTerm, statusFilter, typeFilter]);

  const loadContracts = async () => {
    try {
      const data = await getAllContracts();
      setContracts(data.filter((contract) => contract.status === "ACTIVE"));
    } catch {
      setError("Failed to load contracts.");
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData({
      ...formData,
      [name]:
        type === "checkbox"
          ? checked
          : name === "contractId" ||
            name === "baseDailyRate" ||
            name === "extraMileageRate" ||
            name === "allowedMileagePerDay" ||
            name === "serviceMileageInterval"
          ? Number(value)
          : value,
    });
  };

  const resetForm = () => {
    setFormData({
      contractId: "",
      vehicleType: "SUV",
      registrationNo: "",
      model: "",
      imageUrl: "",
      baseDailyRate: "",
      serviceMileageInterval: "",
      extraMileageRate: "",
      allowedMileagePerDay: "",
      availabilityStatus: "AVAILABLE",
      active: true,
    });

    setEditingVehicleId(null);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) {
      return;
    }

    setMessage("");
    setError("");
    setIsUploadingImage(true);

    try {
      const response = await uploadVehicleImage(file);
      setFormData((prev) => ({
        ...prev,
        imageUrl: response.imageUrl,
      }));
      setMessage("Vehicle image uploaded successfully.");
    } catch (err) {
      const backendMessage = err.response?.data?.message;
      setError(backendMessage || "Failed to upload image.");
    } finally {
      setIsUploadingImage(false);
      e.target.value = "";
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    const payload = {
      ...formData,
      contractId: Number(formData.contractId),
      baseDailyRate: Number(formData.baseDailyRate),
      extraMileageRate: formData.extraMileageRate
        ? Number(formData.extraMileageRate)
        : 0,
      serviceMileageInterval: formData.serviceMileageInterval
        ? Number(formData.serviceMileageInterval)
        : null,
      allowedMileagePerDay: formData.allowedMileagePerDay
        ? Number(formData.allowedMileagePerDay)
        : null,
    };

    try {
      if (editingVehicleId) {
        await updateVehicle(editingVehicleId, payload);
        setMessage("Vehicle updated successfully.");
      } else {
        await createVehicle(payload);
        setMessage("Vehicle created successfully.");
      }

      resetForm();
      setActiveTab("list");
      void loadVehicles();
    } catch (err) {
      const backendMessage = err.response?.data?.message;
      setError(backendMessage || "Failed to save vehicle.");
    }
  };

  const handleEdit = (vehicle) => {
    setEditingVehicleId(vehicle.vehicleId);

    setFormData({
      contractId: vehicle.contractId || "",
      vehicleType: vehicle.vehicleType || "SUV",
      registrationNo: vehicle.registrationNo || "",
      model: vehicle.model || "",
      imageUrl: vehicle.imageUrl || "",
      baseDailyRate: vehicle.baseDailyRate || "",
      extraMileageRate: vehicle. extraMileageRate || "",
      serviceMileageInterval: vehicle.serviceMileageInterval || "",
      allowedMileagePerDay: vehicle.allowedMileagePerDay || "",
      availabilityStatus: vehicle.availabilityStatus || "AVAILABLE",
      active: vehicle.active ?? true,
    });
  };

  const handleDeactivate = async (id) => {
    const confirmDeactivate = window.confirm(
      "Are you sure you want to deactivate this vehicle?"
    );

    if (!confirmDeactivate) {
      return;
    }

    setMessage("");
    setError("");

    try {
      await deactivateVehicle(id);
      setMessage("Vehicle deactivated successfully.");
      
      // Update local state without needing API call or ensure the loadVehicles works properly. 
      // If we deactivate it, it remains in the list as inactive, so we should update its status in state or just reload.
      void loadVehicles();
    } catch {
      setError("Failed to deactivate vehicle.");
    }
  };

  useEffect(() => {
    queueMicrotask(() => {
      void loadVehicles();
      void loadContracts();
    });
  }, []);

  return (
    <div>
      <div className="sticky-page-header">
        <div className="page-header">
          <div>
            <h1>Vehicles</h1>
            <p>Central inventory for contract-linked vehicles, status, pricing, and imagery.</p>
          </div>
          <SegmentedTabs
            tabs={[
              { key: "list", label: "Vehicle List" },
              { key: "manage", label: editingVehicleId ? "Update Vehicle" : "Add Vehicle" },
            ]}
            activeKey={activeTab}
            onChange={setActiveTab}
          />
        </div>
      </div>

      {message && <div className="success-message">{message}</div>}
      {error && <div className="error-message">{error}</div>}

      <div
        className="content-grid"
        style={{
          gridTemplateColumns:
            activeTab === "manage"
              ? "minmax(360px, 460px) minmax(0, 1fr)"
              : "minmax(0, 1fr)",
        }}
      >
        {activeTab === "manage" && (
          <div className="form-card">
          <h2>{editingVehicleId ? "Update Vehicle" : "Add Vehicle"}</h2>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Contract</label>
              <select
                name="contractId"
                value={formData.contractId}
                onChange={handleChange}
                required
              >
                <option value="">Select Contract</option>
                {contracts.map((contract) => (
                  <option key={contract.contractId} value={contract.contractId}>
                    {contract.documentName} - {contract.providerName}
                  </option>
                ))}
              </select>
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
              <label>Registration Number</label>
              <input
                type="text"
                name="registrationNo"
                value={formData.registrationNo}
                onChange={handleChange}
                placeholder="Example: CAB-1234"
                required
              />
            </div>

            <div className="form-group">
              <label>Model</label>
              <input
                type="text"
                name="model"
                value={formData.model}
                onChange={handleChange}
                placeholder="Example: Toyota CHR"
              />
            </div>

            <div className="form-group">
              <label>Vehicle Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={isUploadingImage}
              />
              {isUploadingImage && <p className="muted-text">Uploading image...</p>}
              {formData.imageUrl && (
                <img
                  src={formData.imageUrl}
                  alt="Vehicle preview"
                  style={{
                    marginTop: "10px",
                    width: "140px",
                    height: "90px",
                    objectFit: "cover",
                    borderRadius: "8px",
                    border: "1px solid #d1d5db",
                  }}
                />
              )}
            </div>

            <div className="form-group">
              <label>Base Daily Rate</label>
              <input
                type="number"
                name="baseDailyRate"
                value={formData.baseDailyRate}
                onChange={handleChange}
                placeholder="Example: 10000"
                required
              />
            </div>
            <div className="form-group">
              <label>Service Mileage Inerval </label>
              <input
                type="number"
                name="serviceMileageInterval"
                value={formData.serviceMileageInterval}
                onChange={handleChange}
                placeholder="Example: 5000"
                required
              />
            </div>
            <div className="form-group">
              <label>Extra Mileage Rate</label>
              <input
                type="number"
                name="extraMileageRate"
                value={formData.extraMileageRate}
                onChange={handleChange}
                placeholder="Example: 120"
                required
              />
            </div>

            <div className="form-group">
              <label>Allowed Mileage Per Day</label>
              <input
                type="number"
                name="allowedMileagePerDay"
                value={formData.allowedMileagePerDay}
                onChange={handleChange}
                placeholder="Example: 100"
              />
            </div>

            <div className="form-group">
              <label>Availability Status</label>
              <select
                name="availabilityStatus"
                value={formData.availabilityStatus}
                onChange={handleChange}
              >
                <option value="AVAILABLE">AVAILABLE</option>
                <option value="NOT_AVAILABLE">NOT_AVAILABLE</option>
                <option value="MAINTENANCE">MAINTENANCE</option>
              </select>
            </div>

            <div className="form-group checkbox-group">
              <label>
                <input
                  type="checkbox"
                  name="active"
                  checked={formData.active}
                  onChange={handleChange}
                />
                Active Vehicle
              </label>
            </div>

            <div className="form-actions">
              <button type="submit" className="primary-button">
                {editingVehicleId ? "Update Vehicle" : "Add Vehicle"}
              </button>

              {editingVehicleId && (
                <button
                  type="button"
                  className="secondary-button"
                  onClick={resetForm}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>
        )}

        <div className="table-card" style={{ background: "transparent", border: "none", boxShadow: "none", padding: 0, borderRadius: 0 }}>
          <h2 style={{ marginBottom: "20px" }}>Vehicle List</h2>

          {isLoading ? (
            <table style={{ display: "none" }}>
    <tbody>
       <SkeletonRows rows={6} columns={11} />

    </tbody>
    </table>
           
          ) : vehicles.length === 0 ? (
            <div className="empty-table" style={{ background: "var(--bg-elevated)", borderRadius: "var(--radius-lg)", border: "1px solid var(--border-subtle)" }}>
              <EmptyState
                title="No Vehicles Yet"
                description="Add vehicles to make inventory searchable for booking."
              />
            </div>
          ) : (
            <div className="cards-grid">
              {vehicles.map((vehicle) => (
                <div key={vehicle.vehicleId} className="vehicle-card">
                  {vehicle.imageUrl ? (
                    <img
                      className="vehicle-card-img"
                      src={vehicle.imageUrl}
                      alt={vehicle.model || vehicle.registrationNo}
                    />
                  ) : (
                    <div className="vehicle-card-no-img">No Image Available</div>
                  )}
                  
                  <div className="vehicle-card-content">
                    <div className="vehicle-card-header">
                      <div>
                        <div className="vehicle-card-title">{vehicle.model || "Unknown Model"}</div>
                        <div className="vehicle-card-subtitle">{vehicle.registrationNo} • {vehicle.vehicleType}</div>
                      </div>
                      <span
                        className={
                          vehicle.availabilityStatus === "AVAILABLE"
                            ? "status-active"
                            : "status-inactive"
                        }
                      >
                        {vehicle.availabilityStatus}
                      </span>
                    </div>

                    <div className="vehicle-card-details">
                      <div><strong>Provider:</strong> {vehicle.providerName}</div>
                      <div>
                        <strong>Base Rate:</strong>{" "}
                        <span className="numeric-value">
                          Rs. {Number(vehicle.baseDailyRate).toFixed(2)}
                        </span>{" "}
                        / day
                      </div>
                      <div>
                        <strong>Mileage:</strong>{" "}
                        {vehicle.allowedMileagePerDay ? (
                          <span className="numeric-value">{vehicle.allowedMileagePerDay}</span>
                        ) : (
                          "N/A"
                        )}
                      </div>
                      <div>
                        <strong>Extra Rate:</strong>{" "}
                        <span className="numeric-value">
                          Rs. {Number(vehicle.extraMileageRate || 0).toFixed(2)}
                        </span>{" "}
                        / km
                      </div>
                      <div><strong>Active:</strong> {vehicle.active ? "Yes" : "No"}</div>
                    </div>

                    <div className="vehicle-card-actions">
                      <button
                        className="small-button"
                        onClick={() => {
                          handleEdit(vehicle);
                          setActiveTab("manage");
                        }}
                      >
                        Edit
                      </button>

                      <button
                        className="danger-button"
                        onClick={() => handleDeactivate(vehicle.vehicleId)}
                      >
                        Deactivate
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Vehicles;
