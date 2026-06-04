import { useEffect, useState } from "react";
import {
  getAllServiceLogs,
  createServiceLog,
  updateServiceLog,
  deleteServiceLog,
} from "../services/serviceLogService";
import { getAllVehicles } from "../services/vehicleService";

function ServiceLogs() {
  const [serviceLogs, setServiceLogs] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [editingLogId, setEditingLogId] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    vehicleId: "",
    serviceLocation: "",
    serviceDate: "",
    notes: "",
    cost: "",
  });

  useEffect(() => {
    loadServiceLogs();
    loadVehicles();
  }, []);

  const loadServiceLogs = async () => {
    try {
      const data = await getAllServiceLogs();
      setServiceLogs(data);
    } catch (err) {
      setError("Failed to load service logs.");
    }
  };

  const loadVehicles = async () => {
    try {
      const data = await getAllVehicles();
      setVehicles(data);
    } catch (err) {
      setError("Failed to load vehicles.");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]:
        name === "vehicleId" || name === "cost"
          ? value === ""
            ? ""
            : Number(value)
          : value,
    });
  };

  const resetForm = () => {
    setFormData({
      vehicleId: "",
      serviceLocation: "",
      serviceDate: "",
      notes: "",
      cost: "",
    });

    setEditingLogId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    const payload = {
      vehicleId: Number(formData.vehicleId),
      serviceLocation: formData.serviceLocation,
      serviceDate: formData.serviceDate,
      notes: formData.notes,
      cost: formData.cost === "" ? null : Number(formData.cost),
    };

    try {
      if (editingLogId) {
        await updateServiceLog(editingLogId, payload);
        setMessage("Service log updated successfully.");
      } else {
        await createServiceLog(payload);
        setMessage("Service log created successfully.");
      }

      resetForm();
      loadServiceLogs();
    } catch (err) {
      const backendMessage = err.response?.data?.message;
      setError(backendMessage || "Failed to save service log.");
    }
  };

  const handleEdit = (log) => {
    setEditingLogId(log.logId);

    setFormData({
      vehicleId: log.vehicleId || "",
      serviceLocation: log.serviceLocation || "",
      serviceDate: log.serviceDate || "",
      notes: log.notes || "",
      cost: log.cost || "",
    });
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this service log?"
    );

    if (!confirmDelete) {
      return;
    }

    setMessage("");
    setError("");

    try {
      await deleteServiceLog(id);
      setMessage("Service log deleted successfully.");
      loadServiceLogs();
    } catch (err) {
      const backendMessage = err.response?.data?.message;
      setError(backendMessage || "Failed to delete service log.");
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Service Logs</h1>
          <p>Track vehicle maintenance and service history.</p>
        </div>
      </div>

      {message && <div className="success-message">{message}</div>}
      {error && <div className="error-message">{error}</div>}

      <div className="content-grid">
        <div className="form-card">
          <h2>{editingLogId ? "Update Service Log" : "Add Service Log"}</h2>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Vehicle</label>
              <select
                name="vehicleId"
                value={formData.vehicleId}
                onChange={handleChange}
                required
              >
                <option value="">Select Vehicle</option>
                {vehicles.map((vehicle) => (
                  <option key={vehicle.vehicleId} value={vehicle.vehicleId}>
                    {vehicle.registrationNo} - {vehicle.model}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Service Location</label>
              <input
                type="text"
                name="serviceLocation"
                value={formData.serviceLocation}
                onChange={handleChange}
                placeholder="Example: Toyota Service Center"
              />
            </div>

            <div className="form-group">
              <label>Service Date</label>
              <input
                type="date"
                name="serviceDate"
                value={formData.serviceDate}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Cost</label>
              <input
                type="number"
                name="cost"
                value={formData.cost}
                onChange={handleChange}
                placeholder="Example: 25000"
              />
            </div>

            <div className="form-group">
              <label>Notes</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Service details..."
                rows="4"
              ></textarea>
            </div>

            <div className="form-actions">
              <button type="submit" className="primary-button">
                {editingLogId ? "Update Service Log" : "Add Service Log"}
              </button>

              {editingLogId && (
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

        <div className="table-card">
          <h2>Service History</h2>

          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Vehicle</th>
                <th>Location</th>
                <th>Date</th>
                <th>Cost</th>
                <th>Notes</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {serviceLogs.length === 0 ? (
                <tr>
                  <td colSpan="7" className="empty-table">
                    No service logs found.
                  </td>
                </tr>
              ) : (
                serviceLogs.map((log) => (
                  <tr key={log.logId}>
                    <td>{log.logId}</td>
                    <td>
                      <strong>{log.registrationNo}</strong>
                      <br />
                      <span className="muted-text">
                        {log.vehicleModel || "No model"}
                      </span>
                    </td>
                    <td>{log.serviceLocation || "N/A"}</td>
                    <td>{log.serviceDate}</td>
                    <td>
                      {log.cost ? `Rs. ${Number(log.cost).toFixed(2)}` : "N/A"}
                    </td>
                    <td>{log.notes || "N/A"}</td>
                    <td>
                      <button
                        className="small-button"
                        onClick={() => handleEdit(log)}
                      >
                        Edit
                      </button>

                      <button
                        className="danger-button"
                        onClick={() => handleDelete(log.logId)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default ServiceLogs;