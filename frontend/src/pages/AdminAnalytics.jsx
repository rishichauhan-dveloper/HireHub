import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminDashboard.css";

function AdminAnalytics() {
  const navigate = useNavigate();

  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const savedUser = localStorage.getItem("hirehub_user");

    if (!savedUser) {
      navigate("/login");
      return;
    }

    try {
      const loggedInUser = JSON.parse(savedUser);

      if (loggedInUser.role !== "admin") {
        navigate("/login");
        return;
      }

      setAdmin(loggedInUser);
      fetchAnalytics(loggedInUser);
    } catch (error) {
      console.error("Admin analytics error:", error);
      navigate("/login");
    }
  }, [navigate]);

  const fetchAnalytics = async (loggedInUser) => {
    try {
      setLoading(true);
      setMessage("");

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/admin.php?admin_id=${loggedInUser.id}`
      );

      const data = await response.json();

      console.log("Admin analytics response:", data);

      if (data.success) {
        setStats(data.statistics);

        try {
          await fetch(
            "${import.meta.env.VITE_API_URL}/api/admin.php",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json"
              },
              body: JSON.stringify({
                action: "log_activity",
                admin_id: loggedInUser.id,
                activity_action: "analytics_viewed",
                description: "Admin viewed platform analytics.",
                user_name: loggedInUser.name || "HireHub Admin",
                user_email: loggedInUser.email || "",
                role: loggedInUser.role || "admin"
              })
            }
          );
        } catch (activityError) {
          console.error(
            "Activity logging error:",
            activityError
          );
        }
      } else {
        setMessage(
          data.message || "Unable to load analytics."
        );
      }
    } catch (error) {
      console.error("Analytics error:", error);

      setMessage(
        "Unable to connect to HireHub server."
      );
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("hirehub_user");
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="admin-loading-spinner"></div>

        <h2>Loading Analytics...</h2>

        <p>
          Please wait while HireHub loads platform analytics.
        </p>
      </div>
    );
  }

  return (
    <div className="admin-dashboard-page">

      {/* =====================================================
          SIDEBAR
          ===================================================== */}

      <aside className="admin-sidebar">

        <div className="admin-logo">
          Hire<span>Hub</span>
        </div>

        <div className="admin-panel-label">
          ADMIN PANEL
        </div>

        <div className="admin-user-card">

          <div className="admin-avatar">
            {admin?.name?.charAt(0)?.toUpperCase() || "A"}
          </div>

          <div className="admin-user-info">

            <strong>
              {admin?.name || "HireHub Admin"}
            </strong>

            <span>
              Administrator
            </span>

          </div>

        </div>

        <nav className="admin-nav">

          <button
            onClick={() => navigate("/admin/dashboard")}
          >
            <span>🏠</span>
            Dashboard
          </button>

          <button
            onClick={() => navigate("/admin/users")}
          >
            <span>👤</span>
            User Management
          </button>

          <button
            onClick={() => navigate("/admin/jobs")}
          >
            <span>💼</span>
            Jobs
          </button>

          <button
            onClick={() => navigate("/admin/applications")}
          >
            <span>📋</span>
            Applications
          </button>

          <button
            onClick={() => navigate("/admin/interviews")}
          >
            <span>🎯</span>
            Interviews
          </button>

          <button
            className="active"
            onClick={() => navigate("/admin/analytics")}
          >
            <span>📊</span>
            Analytics
          </button>

          <button
  onClick={() => navigate("/admin/reports")}
>
  <span>📄</span>
  Reports
</button>

<button
  onClick={() => navigate("/admin/activity")}
>
  <span>☷</span>
  Activity Logs
</button>

        </nav>

        <button
          className="admin-logout"
          onClick={logout}
        >
          <span>↪</span>
          Logout
        </button>

      </aside>


      {/* =====================================================
          MAIN CONTENT
          ===================================================== */}

      <main className="admin-main">

        <header className="admin-header">

          <div className="admin-header-content">

            <div className="admin-breadcrumb">
              ADMINISTRATION
            </div>

            <h1>
              Platform Analytics
            </h1>

            <p>
              Monitor HireHub recruitment activity and
              platform performance.
            </p>

          </div>

          <div className="admin-header-profile">

            <div className="admin-header-profile-label">
              ADMIN ANALYTICS
            </div>

            <strong>
              {admin?.name || "HireHub Admin"}
            </strong>

            <span>
              Administrator
            </span>

          </div>

        </header>


        {message && (
          <div className="admin-error-card">
            <h2>Unable to load analytics</h2>

            <p>{message}</p>

            <button
              onClick={() => fetchAnalytics(admin)}
            >
              Try Again
            </button>
          </div>
        )}


        {/* =====================================================
            USER OVERVIEW
            ===================================================== */}

        <section className="admin-section">

          <div className="admin-section-heading centered">

            <span className="admin-section-tag">
              USERS
            </span>

            <h2>
              User Overview
            </h2>

          </div>

          <div className="admin-stat-grid">

            <div className="admin-stat-card">

              <div className="admin-stat-icon users-icon">
                👥
              </div>

              <div className="admin-stat-content">

                <span>
                  Total Users
                </span>

                <strong>
                  {stats?.users?.total ?? 0}
                </strong>

              </div>

            </div>


            <div className="admin-stat-card">

              <div className="admin-stat-icon candidate-icon">
                👤
              </div>

              <div className="admin-stat-content">

                <span>
                  Candidates
                </span>

                <strong>
                  {stats?.users?.candidates ?? 0}
                </strong>

              </div>

            </div>


            <div className="admin-stat-card">

              <div className="admin-stat-icon employer-icon">
                💼
              </div>

              <div className="admin-stat-content">

                <span>
                  Employers
                </span>

                <strong>
                  {stats?.users?.employers ?? 0}
                </strong>

              </div>

            </div>


            <div className="admin-stat-card">

              <div className="admin-stat-icon admin-icon">
                🛡️
              </div>

              <div className="admin-stat-content">

                <span>
                  Administrators
                </span>

                <strong>
                  {stats?.users?.admins ?? 0}
                </strong>

              </div>

            </div>

          </div>

        </section>


        {/* =====================================================
            RECRUITMENT OVERVIEW
            ===================================================== */}

        <section className="admin-section">

          <div className="admin-section-heading centered">

            <span className="admin-section-tag">
              RECRUITMENT
            </span>

            <h2>
              Recruitment Overview
            </h2>

          </div>

          <div className="admin-system-grid">

            <div className="admin-system-card">

              <div className="system-icon">
                💼
              </div>

              <div>

                <span>
                  Total Jobs
                </span>

                <strong>
                  {stats?.jobs?.total ?? 0}
                </strong>

              </div>

            </div>


            <div className="admin-system-card">

              <div className="system-icon">
                🟢
              </div>

              <div>

                <span>
                  Active Jobs
                </span>

                <strong>
                  {stats?.jobs?.active ?? 0}
                </strong>

              </div>

            </div>


            <div className="admin-system-card">

              <div className="system-icon">
                📊
              </div>

              <div>

                <span>
                  Total Applications
                </span>

                <strong>
                  {stats?.applications?.total ?? 0}
                </strong>

              </div>

            </div>


            <div className="admin-system-card">

              <div className="system-icon">
                📄
              </div>

              <div>

                <span>
                  Candidate Profiles
                </span>

                <strong>
                  {stats?.candidates?.total_profiles ?? 0}
                </strong>

              </div>

            </div>

          </div>

        </section>


        {/* =====================================================
            APPLICATION STATUS
            ===================================================== */}

        <section className="admin-status-section">

          <div className="admin-status-panel">

            <div className="status-panel-header">

              <div>
                <span className="admin-section-tag">
                  APPLICATIONS
                </span>

                <h2>
                  Application Status
                </h2>
              </div>

              <div className="status-total">
                {stats?.applications?.total ?? 0}
              </div>

            </div>


            <div className="status-row">

              <div className="status-row-top">
                <span>Pending</span>

                <strong>
                  {stats?.applications?.pending ?? 0}
                </strong>
              </div>

              <div className="progress-track">

                <div
                  className="progress-bar pending-bar"
                  style={{
                    width: `${
                      stats?.applications?.total
                        ? (
                            (stats.applications.pending /
                              stats.applications.total) *
                            100
                          )
                        : 0
                    }%`
                  }}
                />

              </div>

            </div>


            <div className="status-row">

              <div className="status-row-top">
                <span>Accepted</span>

                <strong>
                  {stats?.applications?.accepted ?? 0}
                </strong>
              </div>

              <div className="progress-track">

                <div
                  className="progress-bar accepted-bar"
                  style={{
                    width: `${
                      stats?.applications?.total
                        ? (
                            (stats.applications.accepted /
                              stats.applications.total) *
                            100
                          )
                        : 0
                    }%`
                  }}
                />

              </div>

            </div>


            <div className="status-row">

              <div className="status-row-top">
                <span>Rejected</span>

                <strong>
                  {stats?.applications?.rejected ?? 0}
                </strong>
              </div>

              <div className="progress-track">

                <div
                  className="progress-bar rejected-bar"
                  style={{
                    width: `${
                      stats?.applications?.total
                        ? (
                            (stats.applications.rejected /
                              stats.applications.total) *
                            100
                          )
                        : 0
                    }%`
                  }}
                />

              </div>

            </div>

          </div>


          {/* =====================================================
              INTERVIEW STATUS
              ===================================================== */}

          <div className="admin-status-panel">

            <div className="status-panel-header">

              <div>
                <span className="admin-section-tag">
                  INTERVIEWS
                </span>

                <h2>
                  Interview Status
                </h2>
              </div>

              <div className="status-total">
                {stats?.interviews?.total ?? 0}
              </div>

            </div>


            <div className="status-row">

              <div className="status-row-top">
                <span>Scheduled</span>

                <strong>
                  {stats?.interviews?.scheduled ?? 0}
                </strong>
              </div>

              <div className="progress-track">

                <div
                  className="progress-bar scheduled-bar"
                  style={{
                    width: `${
                      stats?.interviews?.total
                        ? (
                            (stats.interviews.scheduled /
                              stats.interviews.total) *
                            100
                          )
                        : 0
                    }%`
                  }}
                />

              </div>

            </div>


            <div className="status-row">

              <div className="status-row-top">
                <span>Completed</span>

                <strong>
                  {stats?.interviews?.completed ?? 0}
                </strong>
              </div>

              <div className="progress-track">

                <div
                  className="progress-bar completed-bar"
                  style={{
                    width: `${
                      stats?.interviews?.total
                        ? (
                            (stats.interviews.completed /
                              stats.interviews.total) *
                            100
                          )
                        : 0
                    }%`
                  }}
                />

              </div>

            </div>


            <div className="status-row">

              <div className="status-row-top">
                <span>Cancelled</span>

                <strong>
                  {stats?.interviews?.cancelled ?? 0}
                </strong>
              </div>

              <div className="progress-track">

                <div
                  className="progress-bar cancelled-bar"
                  style={{
                    width: `${
                      stats?.interviews?.total
                        ? (
                            (stats.interviews.cancelled /
                              stats.interviews.total) *
                            100
                          )
                        : 0
                    }%`
                  }}
                />

              </div>

            </div>

          </div>

        </section>


        {/* =====================================================
            FOOTER
            ===================================================== */}

        <footer className="admin-footer">

          <span>
            HireHub
          </span>

          <span>
            Admin Control Center
          </span>

        </footer>

      </main>

    </div>
  );
}

export default AdminAnalytics;