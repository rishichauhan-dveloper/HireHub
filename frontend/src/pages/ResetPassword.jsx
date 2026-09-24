import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    if (!token) {
      setError("Invalid or missing reset token.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    try {
      const response = await fetch(
        "${import.meta.env.VITE_API_URL}/api/reset-password.php",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            token,
            password,
          }),
        }
      );

      const data = await response.json();

      if (data.success) {
        setMessage("Password reset successfully.");

        setTimeout(() => {
          navigate("/login");
        }, 1500);
      } else {
        setError(data.message || "Password reset failed.");
      }
    } catch (error) {
      console.error(error);
      setError("Unable to connect to HireHub server.");
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "#070b14",
        padding: "30px 20px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "480px",
          padding: "40px",
          background: "#0d1422",
          border: "1px solid #202d43",
          borderRadius: "20px",
          boxShadow: "0 20px 60px rgba(0,0,0,0.35)",
        }}
      >
        <div
          style={{
            textAlign: "center",
            color: "#f5f7ff",
            fontSize: "38px",
            fontWeight: "800",
            marginBottom: "25px",
          }}
        >
          Hire<span style={{ color: "#22b8ff" }}>Hub</span>
        </div>

        <h1
          style={{
            textAlign: "center",
            color: "#f5f7ff",
            margin: "0 0 10px",
          }}
        >
          Reset Password
        </h1>

        <p
          style={{
            textAlign: "center",
            color: "#7891b7",
            marginBottom: "30px",
          }}
        >
          Create a new password for your account.
        </p>

        {error && (
          <div
            style={{
              marginBottom: "20px",
              padding: "12px",
              borderRadius: "9px",
              background: "#35151b",
              border: "1px solid #6b2631",
              color: "#ff9da8",
            }}
          >
            {error}
          </div>
        )}

        {message && (
          <div
            style={{
              marginBottom: "20px",
              padding: "12px",
              borderRadius: "9px",
              background: "#12351f",
              border: "1px solid #23653a",
              color: "#8df0ae",
            }}
          >
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <label
            style={{
              display: "block",
              marginBottom: "8px",
              color: "#dbe5f5",
              fontWeight: "600",
            }}
          >
            New Password
          </label>

          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter new password"
            required
            style={{
              width: "100%",
              padding: "14px",
              marginBottom: "20px",
              border: "1px solid #293750",
              borderRadius: "10px",
              background: "#111a2a",
              color: "#f5f7ff",
              fontSize: "15px",
              boxSizing: "border-box",
            }}
          />

          <label
            style={{
              display: "block",
              marginBottom: "8px",
              color: "#dbe5f5",
              fontWeight: "600",
            }}
          >
            Confirm New Password
          </label>

          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm new password"
            required
            style={{
              width: "100%",
              padding: "14px",
              marginBottom: "20px",
              border: "1px solid #293750",
              borderRadius: "10px",
              background: "#111a2a",
              color: "#f5f7ff",
              fontSize: "15px",
              boxSizing: "border-box",
            }}
          />

          <button
            type="submit"
            style={{
              width: "100%",
              padding: "14px",
              border: "0",
              borderRadius: "10px",
              background: "#168ee8",
              color: "#ffffff",
              fontSize: "16px",
              fontWeight: "700",
              cursor: "pointer",
            }}
          >
            Reset Password
          </button>
        </form>

        <button
          type="button"
          onClick={() => navigate("/login")}
          style={{
            width: "100%",
            marginTop: "20px",
            border: "none",
            background: "transparent",
            color: "#45bfff",
            cursor: "pointer",
            fontSize: "14px",
            fontWeight: "700",
          }}
        >
          ← Back to Login
        </button>
      </div>
    </div>
  );
}

export default ResetPassword;