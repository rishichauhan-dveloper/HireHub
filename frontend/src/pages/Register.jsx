import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Register = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    role: "candidate",
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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

    if (
      !formData.name ||
      !formData.email ||
      !formData.password ||
      !formData.confirmPassword ||
      !formData.role
    ) {
      setError("Please fill in all required fields.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/register.php`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            password: formData.password,
            role: formData.role,
          }),
        }
      );

      const data = await response.json();

      if (data.success) {
        setMessage("Registration successful. Redirecting to login...");

        setTimeout(() => {
          navigate("/login");
        }, 1500);
      } else {
        setError(data.message || "Registration failed.");
      }
    } catch (err) {
      setError("Unable to connect to the server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.logo}>
          Hire<span style={styles.logoSpan}>Hub</span>
        </h1>

        <h2 style={styles.title}>Create Account</h2>
        <p style={styles.subtitle}>
          Register for your HireHub account
        </p>

        {error && <div style={styles.error}>{error}</div>}

        {message && <div style={styles.success}>{message}</div>}

        <form onSubmit={handleSubmit}>
          <label style={styles.label}>Full Name *</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter your full name"
            style={styles.input}
          />

          <label style={styles.label}>Email *</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter your email"
            style={styles.input}
          />

          <label style={styles.label}>Phone</label>
          <input
            type="text"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="Enter your phone number"
            style={styles.input}
          />

          <label style={styles.label}>Password *</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Create a password"
            style={styles.input}
          />

          <label style={styles.label}>Confirm Password *</label>
          <input
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="Confirm your password"
            style={styles.input}
          />

          <label style={styles.label}>Register As *</label>

          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            style={styles.input}
          >
            <option value="candidate">Candidate</option>
            <option value="employer">Employer</option>
          </select>

          <button
            type="submit"
            disabled={loading}
            style={styles.button}
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <p style={styles.loginText}>
          Already have an account?{" "}
          <button
            type="button"
            onClick={() => navigate("/login")}
            style={styles.loginButton}
          >
            Login
          </button>
        </p>
      </div>
    </div>
  );
};

const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "#070b14",
    padding: "30px 20px",
    fontFamily: "Arial, sans-serif",
  },

  card: {
    width: "100%",
    maxWidth: "480px",
    padding: "40px",
    background: "#0d1422",
    border: "1px solid #202d43",
    borderRadius: "20px",
    boxShadow: "0 20px 60px rgba(0,0,0,0.35)",
  },

  logo: {
    margin: "0 0 25px",
    textAlign: "center",
    color: "#f5f7ff",
    fontSize: "38px",
    fontWeight: "800",
  },

  logoSpan: {
    color: "#22b8ff",
  },

  title: {
    margin: "0",
    textAlign: "center",
    color: "#f5f7ff",
    fontSize: "28px",
  },

  subtitle: {
    margin: "10px 0 28px",
    textAlign: "center",
    color: "#7891b7",
    fontSize: "15px",
  },

  label: {
    display: "block",
    marginBottom: "7px",
    color: "#dbe5f5",
    fontSize: "14px",
    fontWeight: "600",
  },

  input: {
    width: "100%",
    padding: "13px 14px",
    marginBottom: "17px",
    border: "1px solid #293750",
    borderRadius: "10px",
    background: "#111a2a",
    color: "#f5f7ff",
    fontSize: "15px",
    outline: "none",
    boxSizing: "border-box",
  },

  button: {
    width: "100%",
    padding: "14px",
    marginTop: "8px",
    border: "0",
    borderRadius: "10px",
    background: "#168ee8",
    color: "#ffffff",
    fontSize: "16px",
    fontWeight: "700",
    cursor: "pointer",
  },

  error: {
    marginBottom: "18px",
    padding: "12px",
    borderRadius: "9px",
    background: "#35151b",
    border: "1px solid #6b2631",
    color: "#ff9da8",
    fontSize: "14px",
  },

  success: {
    marginBottom: "18px",
    padding: "12px",
    borderRadius: "9px",
    background: "#12351f",
    border: "1px solid #23653a",
    color: "#8df0ae",
    fontSize: "14px",
  },

  loginText: {
    marginTop: "24px",
    textAlign: "center",
    color: "#7891b7",
    fontSize: "14px",
  },

  loginButton: {
    border: "0",
    background: "transparent",
    color: "#45bfff",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "700",
  },
};

export default Register;