import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./CandidateProfile.css";

function CandidateProfile() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    date_of_birth: "",
    gender: "",
    city: "",
    state: "",
    country: "",
    skills: "",
  });

  useEffect(() => {
    const savedUser = localStorage.getItem("hirehub_user");

    if (!savedUser) {
      navigate("/login");
      return;
    }

    try {
      const loggedInUser = JSON.parse(savedUser);

      if (loggedInUser.role !== "candidate") {
        navigate("/employer/dashboard");
        return;
      }

      setUser(loggedInUser);
      fetchProfile(loggedInUser.id);
    } catch (error) {
      console.error("User data error:", error);
      navigate("/login");
    }
  }, [navigate]);

  const fetchProfile = async (userId) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/candidate-profile.php?user_id=${userId}`
      );

      const data = await response.json();

      if (data.success) {
        const profile = data.profile;

        setForm({
          full_name: profile.full_name || "",
          email: profile.email || "",
          phone: profile.phone || "",
          date_of_birth: profile.date_of_birth || "",
          gender: profile.gender || "",
          city: profile.address?.city || "",
          state: profile.address?.state || "",
          country: profile.address?.country || "",
          skills: Array.isArray(profile.skills)
            ? profile.skills.join(", ")
            : "",
        });
      } else {
        setMessage(data.message || "Profile not found.");
      }
    } catch (error) {
      console.error("Profile error:", error);
      setMessage("Unable to connect to HireHub server.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (event) => {
    setForm({
      ...form,
      [event.target.name]: event.target.value,
    });
  };

  const saveProfile = async (event) => {
    event.preventDefault();

    if (!user?.id) return;

    try {
      setSaving(true);
      setMessage("");

      const payload = {
        user_id: user.id,
        full_name: form.full_name,
        email: form.email,
        phone: form.phone,
        date_of_birth: form.date_of_birth,
        gender: form.gender,
        city: form.city,
        state: form.state,
        country: form.country,
        skills: form.skills
          .split(",")
          .map((skill) => skill.trim())
          .filter(Boolean),
      };

      const response = await fetch(
        "${import.meta.env.VITE_API_URL}/api/candidate-profile.php",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();

      if (data.success) {
        setMessage("Profile updated successfully.");
      } else {
        setMessage(data.message || "Unable to update profile.");
      }
    } catch (error) {
      console.error("Save profile error:", error);
      setMessage("Unable to connect to HireHub server.");
    } finally {
      setSaving(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("hirehub_user");
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="candidate-profile-page">
        <div className="profile-loading">
          Loading profile...
        </div>
      </div>
    );
  }

  return (
    <div className="candidate-profile-page">

      <aside className="sidebar">

        <div className="dashboard-logo">
          Hire<span>Hub</span>
        </div>

        <div className="profile-user-box">
          <div className="profile-avatar">
            {user?.name?.charAt(0)?.toUpperCase() || "C"}
          </div>

          <div>
            <strong>{user?.name || "Candidate"}</strong>
            <small>Candidate</small>
          </div>
        </div>

        <nav className="sidebar-nav">

          <button onClick={() => navigate("/dashboard")}>
            <span>⌂</span>
            Dashboard
          </button>

          <button onClick={() => navigate("/jobs")}>
            <span>⌕</span>
            Find Jobs
          </button>

          <button onClick={() => navigate("/applications")}>
            <span>▣</span>
            Applications
          </button>

          <button className="active">
            <span>◉</span>
            My Profile
          </button>

          <button onClick={() => navigate("/resume")}>
            <span>↑</span>
            Resume
          </button>

        </nav>

        <button className="logout" onClick={logout}>
          <span>↪</span>
          Logout
        </button>

      </aside>

      <main className="profile-main">

        <header className="profile-header">
          <div>
            <p>MY PROFILE</p>
            <h1>Candidate Profile</h1>
            <span>
              Keep your information updated for employers.
            </span>
          </div>

          <button
            className="back-button"
            onClick={() => navigate("/dashboard")}
          >
            Back to Dashboard
          </button>
        </header>

        {message && (
          <div className="profile-message">
            {message}
          </div>
        )}

        <form
          className="profile-form"
          onSubmit={saveProfile}
        >

          <section className="profile-card">

            <h2>Personal Information</h2>

            <div className="profile-grid">

              <div className="form-group">
                <label>Full Name</label>
                <input
                  name="full_name"
                  value={form.full_name}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                />
              </div>

              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                />
              </div>

              <div className="form-group">
                <label>Phone</label>
                <input
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="Enter phone number"
                />
              </div>

              <div className="form-group">
                <label>Date of Birth</label>
                <input
                  type="date"
                  name="date_of_birth"
                  value={form.date_of_birth}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>Gender</label>
                <select
                  name="gender"
                  value={form.gender}
                  onChange={handleChange}
                >
                  <option value="">Select gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

            </div>

          </section>

          <section className="profile-card">

            <h2>Location</h2>

            <div className="profile-grid">

              <div className="form-group">
                <label>City</label>
                <input
                  name="city"
                  value={form.city}
                  onChange={handleChange}
                  placeholder="City"
                />
              </div>

              <div className="form-group">
                <label>State</label>
                <input
                  name="state"
                  value={form.state}
                  onChange={handleChange}
                  placeholder="State"
                />
              </div>

              <div className="form-group">
                <label>Country</label>
                <input
                  name="country"
                  value={form.country}
                  onChange={handleChange}
                  placeholder="Country"
                />
              </div>

            </div>

          </section>

          <section className="profile-card">

            <h2>Skills</h2>

            <div className="form-group">
              <label>Skills</label>

              <input
                name="skills"
                value={form.skills}
                onChange={handleChange}
                placeholder="PHP, React, MongoDB, JavaScript"
              />

              <small>
                Separate multiple skills with commas.
              </small>
            </div>

          </section>

          <div className="profile-actions">

            <button
              type="submit"
              className="save-profile-button"
              disabled={saving}
            >
              {saving ? "Saving..." : "Save Profile"}
            </button>

          </div>

        </form>

      </main>

    </div>
  );
}

export default CandidateProfile;