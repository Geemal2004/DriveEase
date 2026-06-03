import { useEffect, useState } from "react";
import {
  getAllDrivers,
  createDriver,
  updateDriver,
  deleteDriver,
} from "../services/driverService";
import EmptyState from "../components/EmptyState";
import SegmentedTabs from "../components/SegmentedTabs";
import SkeletonRows from "../components/SkeletonRows";

function Drivers() {
  const [drivers, setDrivers] = useState([]);
  const [editingDriverId, setEditingDriverId] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("list");
  const [isLoading, setIsLoading] = useState(true);

  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    email: "",
    nicOrPassport: "",
    drivingLicenseNo: "",
  });

  const loadDrivers = async () => {
    setIsLoading(true);
    try {
      const data = await getAllDrivers();
      setDrivers(data);
    } catch {
      setError("Failed to load drivers.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const resetForm = () => {
    setFormData({
      fullName: "",
      phone: "",
      email: "",
      nicOrPassport: "",
      drivingLicenseNo: "",
    });

    setEditingDriverId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    try {
      if (editingDriverId) {
        await updateDriver(editingDriverId, formData);
        setMessage("Driver updated successfully.");
      } else {
        await createDriver(formData);
        setMessage("Driver created successfully.");
      }

      resetForm();
      setActiveTab("list");
      void loadDrivers();
    } catch (err) {
      const backendMessage = err.response?.data?.message;
      setError(backendMessage || "Failed to save driver.");
    }
  };

  const handleEdit = (driver) => {
    setEditingDriverId(driver.driverId);

    setFormData({
      fullName: driver.fullName || "",
      phone: driver.phone || "",
      email: driver.email || "",
      nicOrPassport: driver.nicOrPassport || "",
      drivingLicenseNo: driver.drivingLicenseNo || "",
    });
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this driver?"
    );

    if (!confirmDelete) {
      return;
    }

    setMessage("");
    setError("");

    try {
      await deleteDriver(id);
      setMessage("Driver deleted successfully.");
      void loadDrivers();
    } catch (err) {
      const backendMessage = err.response?.data?.message;
      setError(backendMessage || "Failed to delete driver.");
    }
  };

  useEffect(() => {
    queueMicrotask(() => {
      void loadDrivers();
    });
  }, []);

  return (
    <div>
      <div className="sticky-page-header">
        <div className="page-header">
          <div>
            <h1>Drivers</h1>
            <p>Manage Drivers in one place.</p>
          </div>
          <SegmentedTabs
            tabs={[
              { key: "list", label: "Driver List" },
              { key: "manage", label: editingDriverId ? "Update Driver" : "Add Driver" },
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
          <h2>{editingDriverId ? "Update Driver" : "Add Driver"}</h2>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Full Name</label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Example: Kasun Perera"
                required
              />
            </div>

            <div className="form-group">
              <label>Phone</label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Example: 0771234567"
              />
            </div>

            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Example: driver@example.com"
              />
            </div>

            <div className="form-group">
              <label>NIC / Passport</label>
              <input
                type="text"
                name="nicOrPassport"
                value={formData.nicOrPassport}
                onChange={handleChange}
                placeholder="Example: 200012345678"
              />
            </div>

            <div className="form-group">
              <label>Driving License No</label>
              <input
                type="text"
                name="drivingLicenseNo"
                value={formData.drivingLicenseNo}
                onChange={handleChange}
                placeholder="Example: B1234567"
              />
            </div>

            <div className="form-actions">
              <button type="submit" className="primary-button">
                {editingDriverId ? "Update driver" : "Add driver"}
              </button>

              {editingDriverId && (
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

        <div className="table-card">
          <h2>Driver List</h2>

          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Driver</th>
                <th>Phone</th>
                <th>Email</th>
                <th>NIC / Passport</th>
                <th>License No</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {isLoading ? (
                <SkeletonRows rows={6} columns={7} />
              ) : drivers.length === 0 ? (
                <tr>
                  <td colSpan="7" className="empty-table">
                    <EmptyState
                      title="No Drivers Yet"
                      description="Add driver details before creating bookings."
                    />
                  </td>
                </tr>
              ) : (
                drivers.map((driver) => (
                  <tr key={driver.driverId}>
                    <td className="numeric-cell">{driver.driverId}</td>
                    <td>{driver.fullName}</td>
                    <td>
                      {driver.phone ? (
                        <span className="numeric-value">{driver.phone}</span>
                      ) : (
                        "N/A"
                      )}
                    </td>
                    <td>{driver.email || "N/A"}</td>
                    <td>
                      {driver.nicOrPassport ? (
                        <span className="numeric-value">{driver.nicOrPassport}</span>
                      ) : (
                        "N/A"
                      )}
                    </td>
                    <td>
                      {driver.drivingLicenseNo ? (
                        <span className="numeric-value">{driver.drivingLicenseNo}</span>
                      ) : (
                        "N/A"
                      )}
                    </td>
                    <td>
                      <button
                        className="small-button"
                        onClick={() => {
                          handleEdit(driver);
                          setActiveTab("manage");
                        }}
                      >
                        Edit
                      </button>

                      <button
                        className="danger-button"
                        onClick={() => handleDelete(driver.driverId)}
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

export default Drivers;
