import { useState } from "react";
import { useNavigate } from "react-router-dom";

function ForgotPassword() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

 const handleSubmit = async (e) => {
  e.preventDefault();

  setMessage("");

  try {
    const response = await fetch(
      "http://localhost/HireHub/backend/api/forgot-password.php",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
        }),
      }
    );

    const data = await response.json();

    if (data.success) {
  navigate(
    `/reset-password?token=${data.reset_token}`
  );
} else {
      setMessage(data.message || "Password recovery failed.");
    }
  } catch (error) {
    console.error(error);
    setMessage("Unable to connect to HireHub server.");
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
          Forgot Password
        </h1>

        <p
          style={{
            textAlign: "center",
            color: "#7891b7",
            marginBottom: "30px",
          }}
        >
          Enter your email to recover your account.
        </p>

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
            Email
          </label>

          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
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
            Recover Password
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

export default ForgotPassword;