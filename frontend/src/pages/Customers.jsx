import { useEffect, useState } from "react";
import {
  getAllCustomers,
  createCustomer,
  updateCustomer,
  deleteCustomer,
} from "../services/customerService";
import EmptyState from "../components/EmptyState";
import SegmentedTabs from "../components/SegmentedTabs";
import SkeletonRows from "../components/SkeletonRows";

function Customers() {
  const [customers, setCustomers] = useState([]);
  const [editingCustomerId, setEditingCustomerId] = useState(null);
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

  const loadCustomers = async () => {
    setIsLoading(true);
    try {
      const data = await getAllCustomers();
      setCustomers(data);
    } catch {
      setError("Failed to load customers.");
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

    setEditingCustomerId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    try {
      if (editingCustomerId) {
        await updateCustomer(editingCustomerId, formData);
        setMessage("Customer updated successfully.");
      } else {
        await createCustomer(formData);
        setMessage("Customer created successfully.");
      }

      resetForm();
      setActiveTab("list");
      void loadCustomers();
    } catch (err) {
      const backendMessage = err.response?.data?.message;
      setError(backendMessage || "Failed to save customer.");
    }
  };

  const handleEdit = (customer) => {
    setEditingCustomerId(customer.customerId);

    setFormData({
      fullName: customer.fullName || "",
      phone: customer.phone || "",
      email: customer.email || "",
      nicOrPassport: customer.nicOrPassport || "",
      drivingLicenseNo: customer.drivingLicenseNo || "",
    });
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this customer?"
    );

    if (!confirmDelete) {
      return;
    }

    setMessage("");
    setError("");

    try {
      await deleteCustomer(id);
      setMessage("Customer deleted successfully.");
      void loadCustomers();
    } catch (err) {
      const backendMessage = err.response?.data?.message;
      setError(backendMessage || "Failed to delete customer.");
    }
  };

  useEffect(() => {
    queueMicrotask(() => {
      void loadCustomers();
    });
  }, []);

  return (
    <div>
      <div className="sticky-page-header">
        <div className="page-header">
          <div>
            <h1>Customers</h1>
            <p>Maintain customer identities and driving credentials in one place.</p>
          </div>
          <SegmentedTabs
            tabs={[
              { key: "list", label: "Customer List" },
              { key: "manage", label: editingCustomerId ? "Update Customer" : "Add Customer" },
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
          <h2>{editingCustomerId ? "Update Customer" : "Add Customer"}</h2>

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
                placeholder="Example: customer@example.com"
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
                {editingCustomerId ? "Update Customer" : "Add Customer"}
              </button>

              {editingCustomerId && (
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
          <h2>Customer List</h2>

          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Customer</th>
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
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan="7" className="empty-table">
                    <EmptyState
                      title="No Customers Yet"
                      description="Add customer details before creating bookings."
                    />
                  </td>
                </tr>
              ) : (
                customers.map((customer) => (
                  <tr key={customer.customerId}>
                    <td>{customer.customerId}</td>
                    <td>{customer.fullName}</td>
                    <td>{customer.phone || "N/A"}</td>
                    <td>{customer.email || "N/A"}</td>
                    <td>{customer.nicOrPassport || "N/A"}</td>
                    <td>{customer.drivingLicenseNo || "N/A"}</td>
                    <td>
                      <button
                        className="small-button"
                        onClick={() => {
                          handleEdit(customer);
                          setActiveTab("manage");
                        }}
                      >
                        Edit
                      </button>

                      <button
                        className="danger-button"
                        onClick={() => handleDelete(customer.customerId)}
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

export default Customers;
