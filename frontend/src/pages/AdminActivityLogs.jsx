import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminActivityLogs.css";

function AdminActivityLogs() {
  const navigate = useNavigate();

  const [admin, setAdmin] = useState(null);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

    useEffect(() => {
    const savedUser = localStorage.getItem("hirehub_user");

    if (!savedUser) {
      navigate("/login");
      return;
    }

    try {
      const loggedInUser = JSON.parse(savedUser);

      const userRole = String(loggedInUser.role || "").toLowerCase();

      if (userRole !== "admin") {
        console.error("Admin access denied. User data:", loggedInUser);
        navigate("/login");
        return;
      }

      setAdmin(loggedInUser);

      const adminId = loggedInUser.id || loggedInUser.user_id;

      if (!adminId) {
        console.error("Admin ID missing:", loggedInUser);
        setMessage("Admin account ID is missing.");
        setLoading(false);
        return;
      }

      fetchActivities(adminId);

    } catch (error) {
      console.error("Admin error:", error);
      navigate("/login");
    }
  }, [navigate]);
  const fetchActivities = async (adminId) => {
    try {
      setLoading(true);
      setMessage("");

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/admin.php?admin_id=${adminId}&action=activity`
      );

      const data = await response.json();

      console.log("Activity logs response:", data);

      if (data.success) {
        setActivities(data.logs || []);
      } else {
        setMessage(data.message || "Unable to load activity logs.");
      }
    } catch (error) {
      console.error("Activity logs error:", error);
      setMessage("Unable to connect to HireHub server.");
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("hirehub_user");
    navigate("/login");
  };

  return (
    <div className="admin-activity-page">

      <aside className="admin-activity-sidebar">

        <div className="admin-activity-logo">
          Hire<span>Hub</span>
        </div>

        <div className="admin-activity-profile">

          <div className="admin-activity-avatar">
            {admin?.name?.charAt(0)?.toUpperCase() || "A"}
          </div>

          <div>
            <strong>{admin?.name || "Admin"}</strong>
            <small>Administrator</small>
          </div>

        </div>

        <nav className="admin-activity-nav">

  <button onClick={() => navigate("/admin/dashboard")}>
    <span className="nav-icon">🏠</span>
    <span>Dashboard</span>
  </button>

  <button onClick={() => navigate("/admin/users")}>
    <span className="nav-icon">👤</span>
    <span>User Management</span>
  </button>

  <button onClick={() => navigate("/admin/jobs")}>
    <span className="nav-icon">💼</span>
    <span>Jobs</span>
  </button>

  <button onClick={() => navigate("/admin/applications")}>
    <span className="nav-icon">📋</span>
    <span>Applications</span>
  </button>

  <button onClick={() => navigate("/admin/interviews")}>
    <span className="nav-icon">🎯</span>
    <span>Interviews</span>
  </button>

  <button onClick={() => navigate("/admin/analytics")}>
    <span className="nav-icon">📊</span>
    <span>Analytics</span>
  </button>

  <button onClick={() => navigate("/admin/reports")}>
    <span className="nav-icon">📄</span>
    <span>Reports</span>
  </button>

  <button
    className="active"
    onClick={() => navigate("/admin/activity-logs")}
  >
    <span className="nav-icon">☷</span>
    <span>Activity Logs</span>
  </button>

</nav>

        <button
          className="admin-activity-logout"
          onClick={logout}
        >
          Logout
        </button>

      </aside>


      <main className="admin-activity-main">

        <header className="admin-activity-header">

          <div>

            <span className="admin-activity-badge">
              ADMIN ACTIVITY
            </span>

            <h1>Activity Logs</h1>

            <p>
              Monitor important activity across the HireHub platform.
            </p>

          </div>

          <button
            className="admin-activity-back"
            onClick={() => navigate("/admin/dashboard")}
          >
            ← Dashboard
          </button>

        </header>


        {message && (
          <div className="admin-activity-message">
            {message}
          </div>
        )}


        <section className="admin-activity-card">

          <div className="admin-activity-card-header">

            <div>
              <h2>Recent Activity</h2>
              <p>
                Latest recorded platform events.
              </p>
            </div>

            <button
              className="admin-activity-refresh"
              onClick={() =>
                admin && fetchActivities(admin.id)
              }
            >
              Refresh
            </button>

          </div>


          {loading ? (

            <div className="admin-activity-empty">

              <h3>Loading activity...</h3>

              <p>
                Please wait while HireHub loads recent activity.
              </p>

            </div>

          ) : activities.length === 0 ? (

            <div className="admin-activity-empty">

              <div className="admin-activity-empty-icon">
                ✓
              </div>

              <h3>No activity logs yet</h3>

              <p>
                There are currently no recorded activity events.
              </p>

            </div>

          ) : (

            <div className="admin-activity-list">

              {activities.map((activity, index) => (

                <div
                  className="admin-activity-item"
                  key={activity._id || index}
                >

                  <div className="admin-activity-icon">
                    {activity.type === "login"
                      ? "↗"
                      : activity.type === "register"
                      ? "+"
                      : "•"}
                  </div>

                  <div className="admin-activity-content">

                    <strong>
                      {activity.action ||
                        activity.message ||
                        "Platform activity"}
                    </strong>

                    <p>
                      {activity.description ||
                        activity.message ||
                        ""}
                    </p>

                    <small>
                      {activity.user_name ||
                        activity.email ||
                        "HireHub User"}
                      {" • "}
                      {activity.created_at
                        ? new Date(
                            activity.created_at
                          ).toLocaleString()
                        : "Unknown time"}
                    </small>

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

export default AdminActivityLogs;