import { useEffect, useState } from "react";
import {
  getAllProviders,
  createProvider,
  updateProvider,
  deactivateProvider,
} from "../services/providerService";
import EmptyState from "../components/EmptyState";
import SegmentedTabs from "../components/SegmentedTabs";
import SkeletonRows from "../components/SkeletonRows";

function Providers() {
  const [providers, setProviders] = useState([]);
  const [editingProviderId, setEditingProviderId] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("list");
  const [isLoading, setIsLoading] = useState(true);

  const [formData, setFormData] = useState({
    providerName: "",
    contactPerson: "",
    phone: "",
    email: "",
    address: "",
    status: "ACTIVE",
  });

  const loadProviders = async () => {
    setIsLoading(true);
    try {
      const data = await getAllProviders();
      setProviders(data);
    } catch {
      setError("Failed to load providers.");
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
      providerName: "",
      contactPerson: "",
      phone: "",
      email: "",
      address: "",
      status: "ACTIVE",
    });

    setEditingProviderId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    try {
      if (editingProviderId) {
        await updateProvider(editingProviderId, formData);
        setMessage("Provider updated successfully.");
      } else {
        await createProvider(formData);
        setMessage("Provider created successfully.");
      }

      resetForm();
      setActiveTab("list");
      void loadProviders();
    } catch (err) {
      const backendMessage = err.response?.data?.message;
      setError(backendMessage || "Failed to save provider.");
    }
  };

  const handleEdit = (provider) => {
    setEditingProviderId(provider.providerId);

    setFormData({
      providerName: provider.providerName || "",
      contactPerson: provider.contactPerson || "",
      phone: provider.phone || "",
      email: provider.email || "",
      address: provider.address || "",
      status: provider.status || "ACTIVE",
    });
  };

  const handleDeactivate = async (id) => {
    const confirmDeactivate = window.confirm(
      "Are you sure you want to deactivate this provider?"
    );

    if (!confirmDeactivate) {
      return;
    }

    setMessage("");
    setError("");

    try {
      await deactivateProvider(id);
      setMessage("Provider deactivated successfully.");
      void loadProviders();
    } catch {
      setError("Failed to deactivate provider.");
    }
  };

  useEffect(() => {
    queueMicrotask(() => {
      void loadProviders();
    });
  }, []);

  return (
    <div>
      <div className="sticky-page-header">
        <div className="page-header">
          <div>
            <h1>Providers</h1>
            <p>Manage provider records, contact ownership, and activation status.</p>
          </div>
          <SegmentedTabs
            tabs={[
              { key: "list", label: "Provider List" },
              { key: "manage", label: editingProviderId ? "Update Provider" : "Add Provider" },
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
          <h2>{editingProviderId ? "Update Provider" : "Add Provider"}</h2>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Provider Name</label>
              <input
                type="text"
                name="providerName"
                value={formData.providerName}
                onChange={handleChange}
                placeholder="Example: City Rent A Car"
                required
              />
            </div>

            <div className="form-group">
              <label>Contact Person</label>
              <input
                type="text"
                name="contactPerson"
                value={formData.contactPerson}
                onChange={handleChange}
                placeholder="Example: Mr. Perera"
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
                placeholder="Example: provider@example.com"
              />
            </div>

            <div className="form-group">
              <label>Address</label>
              <details className="accordion-panel" open>
                <summary>Show Address Details</summary>
                <div className="accordion-content">
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Provider address"
                    rows="3"
                  ></textarea>
                </div>
              </details>
            </div>

            <div className="form-group">
              <label>Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
              >
                <option value="ACTIVE">ACTIVE</option>
                <option value="INACTIVE">INACTIVE</option>
              </select>
            </div>

            <div className="form-actions">
              <button type="submit" className="primary-button">
                {editingProviderId ? "Update Provider" : "Add Provider"}
              </button>

              {editingProviderId && (
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
          <h2>Provider List</h2>

          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Provider</th>
                <th>Contact</th>
                <th>Phone</th>
                <th>Email</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {isLoading ? (
                <SkeletonRows rows={6} columns={7} />
              ) : providers.length === 0 ? (
                <tr>
                  <td colSpan="7" className="empty-table">
                    <EmptyState
                      title="No Providers Yet"
                      description="Add your first provider to start contract and vehicle onboarding."
                    />
                  </td>
                </tr>
              ) : (
                providers.map((provider) => (
                  <tr key={provider.providerId}>
                    <td className="numeric-cell">{provider.providerId}</td>
                    <td>{provider.providerName}</td>
                    <td>{provider.contactPerson}</td>
                    <td className="numeric-cell">{provider.phone}</td>
                    <td>{provider.email}</td>
                    <td>
                      <span
                        className={
                          provider.status === "ACTIVE"
                            ? "status-active"
                            : "status-inactive"
                        }
                      >
                        {provider.status}
                      </span>
                    </td>
                    <td>
                      <button
                        className="small-button"
                        onClick={() => {
                          handleEdit(provider);
                          setActiveTab("manage");
                        }}
                      >
                        Edit
                      </button>

                      <button
                        className="danger-button"
                        onClick={() => handleDeactivate(provider.providerId)}
                      >
                        Deactivate
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

export default Providers;
