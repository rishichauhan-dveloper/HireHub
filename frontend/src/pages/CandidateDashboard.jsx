import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./CandidateDashboard.css";

function CandidateDashboard() {
  const navigate = useNavigate();

const [user, setUser] = useState(null);
const [applications, setApplications] = useState([]);
const [loadingApplications, setLoadingApplications] = useState(true);
const [notifications, setNotifications] = useState([]);
const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {

  const savedUser =
    localStorage.getItem("hirehub_user");

  if (!savedUser) {
    window.location.href = "/login";
    return;
  }

  const loggedInUser =
    JSON.parse(savedUser);

  setUser(loggedInUser);

  fetchApplications(loggedInUser);
  fetchNotifications(loggedInUser);

}, []);

  const logout = () => {

    localStorage.removeItem("hirehub_user");

    navigate("/login");
  };
  const fetchApplications = async (loggedInUser) => {

  try {

    setLoadingApplications(true);

    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/api/applications.php?candidate_id=${loggedInUser.id}`
    );

    const data = await response.json();

    if (data.success) {

      setApplications(
        data.applications || []
      );

    } else {

      console.error(
        data.message
      );

    }

  } catch (error) {

    console.error(
      "Application fetch error:",
      error
    );

  } finally {

    setLoadingApplications(false);

  }
};
const fetchNotifications = async (loggedInUser) => {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/api/notifications.php?user_id=${loggedInUser.id}`
    );

    const data = await response.json();

    if (data.success) {
      setNotifications(data.notifications || []);
    } else {
      console.error(data.message);
    }
  } catch (error) {
    console.error("Notification fetch error:", error);
  }
};

  return (

    <div className="dashboard">

      {/* Sidebar */}

      <aside className="sidebar">

        <div className="dashboard-logo">
          Hire<span>Hub</span>
        </div>

        <div className="user-box">

          <div className="avatar">
            {user?.name?.charAt(0) || "C"}
          </div>

          <div>
            <strong>
              {user?.name || "Candidate"}
            </strong>

            <small>
              Candidate
            </small>
          </div>

        </div>

        <nav className="sidebar-nav">

          <button className="active">
            <span>⌂</span>
            Dashboard
          </button>

          <button onClick={() => navigate("/jobs")}>
            <span>⌕</span>
              Find Jobs
          </button>

          <button
            onClick={() => navigate("/jobs/saved")}
          >
          <span>♡</span>
          Saved Jobs
          </button>

<button
  onClick={() => navigate("/applications")}
>
  <span>▣</span>
  Applications
</button>

<button
  onClick={() => navigate("/profile")}
>
  <span>◉</span>
  Profile
</button>

<button
  onClick={() => navigate("/resume")}
>
  <span>↑</span>
  Resume
</button>

        </nav>

        <button
          className="logout"
          onClick={logout}
        >
          <span>↪</span>
          Logout
        </button>

      </aside>


      {/* Main Content */}

      <main className="dashboard-main">

        <header className="dashboard-header">

          <div>

            <p className="dashboard-label">
              CANDIDATE DASHBOARD
            </p>

            <h1>
              Welcome back,{" "}
              {user?.name || "Candidate"} 👋
            </h1>

            <p>
              Find your next opportunity and manage
              your applications.
            </p>

          </div>
          <button
  type="button"
  onClick={() => setShowNotifications(!showNotifications)}
  style={{
    position: "relative",
    marginRight: "15px",
    padding: "10px 14px",
    border: "1px solid #26344d",
    borderRadius: "10px",
    background: "#101827",
    color: "#f5f7ff",
    cursor: "pointer",
    fontSize: "20px",
  }}
>
  🔔

  {notifications.filter(
    (notification) => !notification.is_read
  ).length > 0 && (
    <span
      style={{
        position: "absolute",
        top: "-5px",
        right: "-5px",
        minWidth: "18px",
        height: "18px",
        padding: "0 4px",
        borderRadius: "50%",
        background: "#ef4444",
        color: "#ffffff",
        fontSize: "11px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {
        notifications.filter(
          (notification) => !notification.is_read
        ).length
      }
    </span>
  )}
</button>

          <div className="header-avatar">
            {user?.name?.charAt(0) || "C"}
            
          </div>
          {showNotifications && (
  <div
    style={{
      position: "absolute",
      top: "80px",
      right: "20px",
      width: "320px",
      background: "#0d1422",
      border: "1px solid #26344d",
      borderRadius: "14px",
      padding: "15px",
      zIndex: 100,
    }}
  >
    <h3 style={{ color: "#f5f7ff" }}>
      Notifications
    </h3>

    {notifications.length === 0 ? (
      <p style={{ color: "#7891b7" }}>
        No notifications.
      </p>
    ) : (
      notifications.map((notification) => (
        <div
  key={notification.id}
  onClick={async () => {
    try {
      await fetch(
        `${import.meta.env.VITE_API_URL}/api/notifications.php`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            notification_id: notification.id,
          }),
        }
      );

      setNotifications((prev) =>
        prev.map((item) =>
          item.id === notification.id
            ? { ...item, is_read: true }
            : item
        )
      );
    } catch (error) {
      console.error("Notification read error:", error);
    }
  }}
  style={{
    padding: "12px 0",
    borderBottom: "1px solid #202d43",
    cursor: "pointer",
  }}
>
          <strong style={{ color: "#f5f7ff" }}>
            {notification.title}
          </strong>

          <p style={{ color: "#94a3b8" }}>
            {notification.message}
          </p>
        </div>
      ))
    )}
  </div>
)}

        </header>


        {/* Search */}

        <section className="dashboard-search">

          <div>

            <span>⌕</span>

            <input
              type="text"
              placeholder="Search jobs, skills or companies..."
            />

          </div>

          <button onClick={() => navigate("/jobs")}>
            Search Jobs →
          </button>

        </section>


        {/* Stats */}

        <section className="dashboard-stats">

          <div className="stat-card">

            <div className="stat-icon blue">
              ⌕
            </div>

            <div>
              <strong>{applications.length}</strong>
              <span>Jobs Applied</span>
            </div>

          </div>


          <div className="stat-card">

            <div className="stat-icon purple">
              ✦
            </div>

            <div>
              <strong>
  {
    applications.filter(
      app =>
        String(app.status).toLowerCase() === "shortlisted"
    ).length
  }
</strong>
              <span>Shortlisted</span>
            </div>

          </div>


          <div className="stat-card">

            <div className="stat-icon cyan">
              ◷
            </div>

            <div>
              <strong>
  {
    applications.filter(
      app =>
        String(app.status).toLowerCase() === "interview"
    ).length
  }
</strong>
              <span>Interviews</span>
            </div>

          </div>


          <div className="stat-card">

            <div className="stat-icon green">
              ✓
            </div>

            <div>
              <strong>
  {
    applications.filter(
      app =>
        String(app.status).toLowerCase() === "selected"
    ).length
  }
</strong>
              <span>Selected</span>
            </div>

          </div>

        </section>


        {/* Content Grid */}

        <section className="dashboard-grid">


          {/* Profile Completion */}

          <div className="panel profile-panel">

            <div className="panel-heading">

              <div>
                <h2>Profile</h2>
                <p>
                  Complete your profile to get better matches.
                </p>
              </div>

              <span>
                70%
              </span>

            </div>

            <div className="progress">

              <div
                className="progress-value"
                style={{ width: "70%" }}
              ></div>

            </div>

            <button className="panel-button">
              Complete Profile →
            </button>

          </div>


          {/* Smart Matching */}

          <div className="panel matching-panel">

            <div className="ai-icon">
              ✦
            </div>

            <p className="ai-label">
              SMART MATCHING
            </p>

            <h2>
              Find jobs that fit you.
            </h2>

            <p>
              Our matching system compares your skills
              with job requirements to find better
              opportunities.
            </p>

            <button
  className="match-button"
  onClick={() => navigate("/matches")}
>
  Explore Matches →
</button>
          </div>


        </section>


        {/* Recent Applications */}

        <section className="panel applications-panel">

          <div className="panel-heading">

            <div>

              <h2>
                Recent Applications
              </h2>

              <p>
                Track your latest job applications.
              </p>

            </div>

            <button className="view-all">
              View All →
            </button>

          </div>


          {loadingApplications ? (

  <div className="empty-applications">

    <h3>
      Loading applications...
    </h3>

  </div>

) : applications.length === 0 ? (

  <div className="empty-applications">

    <div className="empty-icon">
      ▣
    </div>

    <h3>
      Your applications will appear here
    </h3>

    <p>
      Start exploring jobs and apply to
      opportunities that match your skills.
    </p>

    <button onClick={() => navigate("/jobs")}>
      Find Jobs →
    </button>   

  </div>

) : (

  <div className="application-list">

    {applications.map((application) => (

      <div
        className="application-card"
        key={application._id}
      >

        <div className="application-info">

          <h3>
            {application.job_title}
          </h3>

          <p>
            {application.company_name}
          </p>

          <small>
            Applied on{" "}
            {new Date(
              application.applied_at.$date
                ? application.applied_at.$date
                : application.applied_at
            ).toLocaleDateString()}
          </small>

        </div>

        <div>

          <span
            className={`status ${application.status
              .toLowerCase()
              .replace(" ", "-")}`}
          >
            {application.status}
          </span>

        </div>

      </div>

    ))}

  </div>

)}

        </section>

      </main>

    </div>
  );
}

export default CandidateDashboard;