import { useState } from "react";
import CandidateDashboard from "./CandidateDashboard";
import "./Login.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    setMessage("Signing in...");

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/login.php`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            password,
          }),
        }
      );

      const data = await response.json();

     if (data.success) {

  localStorage.setItem(
    "hirehub_user",
    JSON.stringify(data.user)
  );

  if (data.user.role === "admin") {
  window.location.href = "/admin/dashboard";
} else if (data.user.role === "employer") {
  window.location.href = "/employer/dashboard";
} else if (data.user.role === "candidate") {
  window.location.href = "/dashboard";
} else {
  setMessage("Invalid user role.");
}

} else {

  setMessage(
    data.message || "Login failed."
  );
}

    } catch (error) {
      console.error(error);
      setMessage(
        "Unable to connect to HireHub server."
      );
    }
  };

  return (
    <div className="login-page">

      <div className="login-glow"></div>

      <div className="login-card">

        <div className="login-logo">
          Hire<span>Hub</span>
        </div>

        <div className="login-heading">

          <div className="login-badge">
            ✦ SECURE LOGIN
          </div>

          <h1>
            Welcome back
          </h1>

          <p>
            Sign in to continue to your HireHub account.
          </p>

        </div>


        <form onSubmit={handleLogin}>

          <label>
            Email
          </label>

          <input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
            required
          />


          <label>
            Password
          </label>

          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
            required
          />
          <div
  style={{
    textAlign: "right",
    marginTop: "-8px",
    marginBottom: "18px",
  }}
>
  <button
    type="button"
    onClick={() => {
      window.location.href = "/forgot-password";
    }}
    style={{
      border: "none",
      background: "transparent",
      color: "#45bfff",
      cursor: "pointer",
      fontSize: "14px",
      padding: 0,
    }}
  >
    Forgot Password?
  </button>
</div>


          <button
            type="submit"
            className="login-submit"
          >
            Sign In →
          </button>

        </form>


        {message && (
          <div className="login-message">
            {message}
          </div>
        )}

<div className="login-footer">
  Don't have an account?

  <button
    type="button"
    onClick={() => {
      window.location.href = "/register";
    }}
    style={{
      border: "none",
      background: "transparent",
      color: "#45bfff",
      cursor: "pointer",
      fontSize: "inherit",
      padding: 0,
      marginLeft: "5px",
    }}
  >
    Create one
  </button>
</div>
      </div>

    </div>
  );
}

export default Login;