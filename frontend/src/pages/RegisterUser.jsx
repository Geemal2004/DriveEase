import { useEffect, useState } from "react";
import authService from "../services/authService";
import EmptyState from "../components/EmptyState";
import SkeletonRows from "../components/SkeletonRows";

const RegisterUser = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    role: "MANAGER", // Default selection
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [users, setUsers] = useState([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);

  const loadUsers = async () => {
    setIsLoadingUsers(true);

    try {
      const data = await authService.getAllUsers();
      setUsers(data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load users.");
    } finally {
      setIsLoadingUsers(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    try {
      const response = await authService.registerUser(formData);
      setMessage(response.message || "User registered successfully!");
      setFormData({
        fullName: "",
        email: "",
        password: "",
        role: "MANAGER",
      });
      void loadUsers();
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed.");
    }
  };

  useEffect(() => {
    queueMicrotask(() => {
      void loadUsers();
    });
  }, []);

  return (
    <div>
      <div className="sticky-page-header">
        <div className="page-header">
          <div>
            <h1>User Registration</h1>
            <p>Create internal user accounts with role-based access.</p>
          </div>
        </div>
      </div>

      {message && <div className="success-message">{message}</div>}
      {error && <div className="error-message">{error}</div>}

      <div className="booking-stack">
        <div className="form-card">
          <h2 style={{ marginBottom: "20px" }}>Register New User (Admin Only)</h2>
          <form onSubmit={handleSubmit}>
            <div className="horizontal-form-grid user-form-grid">
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                  minLength={3}
                />
              </div>

              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Password</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  minLength={6}
                />
              </div>

              <div className="form-group">
                <label>Role</label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                >
                  <option value="MANAGER">Manager</option>
                  <option value="SUPPORT_AGENT">Support Agent</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="primary-button">
                Register User
              </button>
            </div>
          </form>
        </div>

        <div className="table-card">
          <div className="results-header">
            <h2>Current Users</h2>
            <button
              type="button"
              className="secondary-button"
              onClick={loadUsers}
              disabled={isLoadingUsers}
            >
              Refresh
            </button>
          </div>

          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Created</th>
              </tr>
            </thead>

            <tbody>
              {isLoadingUsers ? (
                <SkeletonRows rows={5} columns={6} />
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan="6" className="empty-table">
                    <EmptyState
                      title="No Users Found"
                      description="Registered users will appear here."
                    />
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.userId}>
                    <td className="numeric-cell">{user.userId}</td>
                    <td>{user.fullName}</td>
                    <td>{user.email}</td>
                    <td>{user.role}</td>
                    <td>
                      <span
                        className={
                          user.status === "ACTIVE"
                            ? "status-active"
                            : "status-inactive"
                        }
                      >
                        {user.status}
                      </span>
                    </td>
                    <td className="numeric-cell">
                      {user.createdAt
                        ? new Date(user.createdAt).toLocaleDateString()
                        : "N/A"}
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
};

export default RegisterUser;
