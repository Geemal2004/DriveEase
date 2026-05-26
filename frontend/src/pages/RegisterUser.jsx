import { useState } from "react";
import authService from "../services/authService";

const RegisterUser = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    role: "MANAGER", // Default selection
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

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
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed.");
    }
  };

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

      <div className="panel-card" style={{ maxWidth: "520px" }}>
        <h2 style={{ marginBottom: "20px" }}>Register New User (Admin Only)</h2>
        <form onSubmit={handleSubmit}>
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

          <div className="form-actions">
            <button type="submit" className="primary-button">
              Register User
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterUser;
