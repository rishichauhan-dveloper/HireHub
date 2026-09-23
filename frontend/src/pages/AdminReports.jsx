import React, { useCallback, useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./AdminReports.css";

const menuItems = [
  { path: "/admin/dashboard", label: "Dashboard", icon: "🏠" },
  { path: "/admin/users", label: "User Management", icon: "👤" },
  { path: "/admin/jobs", label: "Jobs", icon: "💼" },
  { path: "/admin/applications", label: "Applications", icon: "📋" },
  { path: "/admin/interviews", label: "Interviews", icon: "🎯" },
  { path: "/admin/analytics", label: "Analytics", icon: "📊" },
  { path: "/admin/reports", label: "Reports", icon: "📄" },
{ path: "/admin/activity", label: "Activity Logs", icon: "☷" }
];

const emptyStats = {
  users: {
    total: 0,
    candidates: 0,
    employers: 0,
    admins: 0,
    active: 0,
    inactive: 0
  },
  candidates: {
    total_profiles: 0
  },
  jobs: {
    total: 0,
    active: 0
  },
  applications: {
    total: 0,
    pending: 0,
    accepted: 0,
    rejected: 0
  },
  interviews: {
    total: 0,
    scheduled: 0,
    completed: 0,
    cancelled: 0
  }
};

function AdminReports() {
  const navigate = useNavigate();
  const location = useLocation();

  const [stats, setStats] = useState(emptyStats);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const getAdminId = () => {
    try {
      const user = JSON.parse(
        localStorage.getItem("hirehub_user") || "{}"
      );

      return (
        user._id ||
        user.id ||
        user.user_id ||
        user.admin_id ||
        ""
      );
    } catch {
      return "";
    }
  };

  const loadReports = useCallback(async () => {
    const adminId = getAdminId();

    if (!adminId) {
      setError("Admin ID not found. Please login again.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(
        `http://localhost/HireHub/backend/api/admin.php?action=dashboard&admin_id=${encodeURIComponent(adminId)}`
      );

      const data = await response.json();

      if (!data.success) {
        throw new Error(
          data.message || "Unable to load reports."
        );
      }

      setStats({
        users: {
          ...emptyStats.users,
          ...(data.statistics?.users || {})
        },
        candidates: {
          ...emptyStats.candidates,
          ...(data.statistics?.candidates || {})
        },
        jobs: {
          ...emptyStats.jobs,
          ...(data.statistics?.jobs || {})
        },
        applications: {
          ...emptyStats.applications,
          ...(data.statistics?.applications || {})
        },
        interviews: {
          ...emptyStats.interviews,
          ...(data.statistics?.interviews || {})
        }
      });

      setError("");
    } catch (err) {
      console.error("Reports error:", err);
      setError(
        err.message || "Failed to load report data."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadReports();

    /*
     * Keep Reports live.
     * The page checks MongoDB every 5 seconds.
     */
    const interval = setInterval(() => {
      loadReports();
    }, 5000);

    /*
     * Refresh when returning to this browser tab.
     */
    const handleFocus = () => {
      loadReports();
    };

    window.addEventListener("focus", handleFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", handleFocus);
    };
  }, [loadReports]);

  const logout = () => {
    localStorage.removeItem("hirehub_user");
    navigate("/login", { replace: true });
  };

  if (loading) {
    return (
      <div className="reports-loading">
        Loading Reports...
      </div>
    );
  }

  return (
    <div className="reports-page">

      {/* ================= SIDEBAR ================= */}

      <aside className="reports-sidebar">

        <div className="reports-logo">
          Hire<span>Hub</span>
        </div>

        <div className="reports-admin-card">

          <div className="reports-avatar">
            H
          </div>

          <div>
            <strong>HireHub Admin</strong>
            <small>Administrator</small>
          </div>

        </div>

        <nav className="reports-nav">

          {menuItems.map((item) => {

            const active =
              location.pathname === item.path ||
              location.pathname.startsWith(
                item.path + "/"
              );

            return (
              <button
                key={item.path}
                type="button"
                className={active ? "active" : ""}
                onClick={() => navigate(item.path)}
              >
                <span className="reports-nav-icon">
                  {item.icon}
                </span>

                <span>
                  {item.label}
                </span>
              </button>
            );
          })}

        </nav>

        <button
          type="button"
          className="reports-logout"
          onClick={logout}
        >
          <span className="reports-nav-icon">
            ↪
          </span>

          <span>
            Logout
          </span>
        </button>

      </aside>


      {/* ================= MAIN ================= */}

      <main className="reports-main">

        <header className="reports-header">

          <div>

            <div className="reports-badge">
              ADMIN REPORTS
            </div>

            <h1>Reports</h1>

            <p>
              Live reports generated from your HireHub platform data.
            </p>

          </div>

          <button
            className="dashboard-button"
            onClick={() => navigate("/admin/dashboard")}
          >
            ← Dashboard
          </button>

        </header>


        {error && (
          <div className="reports-error">
            {error}
          </div>
        )}


        {/* ================= USER / JOB STATISTICS ================= */}

        <section className="reports-stats">

          <div className="report-stat-card">

            <span>Total Users</span>

            <strong>
              {stats.users.total}
            </strong>

            <small>
              {stats.users.active} active users
            </small>

          </div>


          <div className="report-stat-card">

            <span>Total Candidates</span>

            <strong>
              {stats.users.candidates}
            </strong>

            <small>
              {stats.candidates.total_profiles} profiles
            </small>

          </div>


          <div className="report-stat-card">

            <span>Total Employers</span>

            <strong>
              {stats.users.employers}
            </strong>

            <small>
              {stats.users.employers} registered employers
            </small>

          </div>


          <div className="report-stat-card">

            <span>Active Jobs</span>

            <strong>
              {stats.jobs.active}
            </strong>

            <small>
              {stats.jobs.total} total jobs
            </small>

          </div>

        </section>


        {/* ================= USER REPORT ================= */}

        <section className="report-section">

          <div className="report-section-header">

            <div>
              <span>USERS</span>

              <h2>
                User Report
              </h2>

              <p>
                Current user activity across HireHub.
              </p>
            </div>

            <strong>
              {stats.users.total} Total
            </strong>

          </div>

          <div className="report-grid">

            <div>
              <span>Total Users</span>
              <strong>
                {stats.users.total}
              </strong>
            </div>

            <div>
              <span>Candidates</span>
              <strong>
                {stats.users.candidates}
              </strong>
            </div>

            <div>
              <span>Employers</span>
              <strong>
                {stats.users.employers}
              </strong>
            </div>

            <div>
              <span>Admins</span>
              <strong>
                {stats.users.admins}
              </strong>
            </div>

          </div>

        </section>


        {/* ================= USER STATUS ================= */}

        <section className="report-section">

          <div className="report-section-header">

            <div>
              <span>USER STATUS</span>

              <h2>
                Account Status
              </h2>

              <p>
                Active and inactive user accounts.
              </p>
            </div>

            <strong>
              {stats.users.total} Users
            </strong>

          </div>

          <div className="report-grid">

            <div>
              <span>Total</span>
              <strong>
                {stats.users.total}
              </strong>
            </div>

            <div>
              <span>Active</span>
              <strong>
                {stats.users.active}
              </strong>
            </div>

            <div>
              <span>Inactive</span>
              <strong>
                {stats.users.inactive}
              </strong>
            </div>

            <div>
              <span>Profiles</span>
              <strong>
                {stats.candidates.total_profiles}
              </strong>
            </div>

          </div>

        </section>


        {/* ================= JOB REPORT ================= */}

        <section className="report-section">

          <div className="report-section-header">

            <div>
              <span>JOBS</span>

              <h2>
                Jobs Report
              </h2>

              <p>
                Current job activity across HireHub.
              </p>
            </div>

            <strong>
              {stats.jobs.active} Active
            </strong>

          </div>

          <div className="report-grid">

            <div>
              <span>Total Jobs</span>
              <strong>
                {stats.jobs.total}
              </strong>
            </div>

            <div>
              <span>Active</span>
              <strong>
                {stats.jobs.active}
              </strong>
            </div>

            <div>
              <span>Inactive</span>
              <strong>
                {Math.max(
                  0,
                  stats.jobs.total - stats.jobs.active
                )}
              </strong>
            </div>

            <div>
              <span>Employers</span>
              <strong>
                {stats.users.employers}
              </strong>
            </div>

          </div>

        </section>


        {/* ================= APPLICATION REPORT ================= */}

        <section className="report-section">

          <div className="report-section-header">

            <div>
              <span>APPLICATIONS</span>

              <h2>
                Applications Report
              </h2>

              <p>
                Current application status across HireHub.
              </p>
            </div>

            <strong>
              {stats.applications.total} Total
            </strong>

          </div>

          <div className="report-grid">

            <div>
              <span>Total</span>
              <strong>
                {stats.applications.total}
              </strong>
            </div>

            <div>
              <span>Pending</span>
              <strong>
                {stats.applications.pending}
              </strong>
            </div>

            <div>
              <span>Accepted</span>
              <strong>
                {stats.applications.accepted}
              </strong>
            </div>

            <div>
              <span>Rejected</span>
              <strong>
                {stats.applications.rejected}
              </strong>
            </div>

          </div>

        </section>


        {/* ================= INTERVIEW REPORT ================= */}

        <section className="report-section">

          <div className="report-section-header">

            <div>
              <span>INTERVIEWS</span>

              <h2>
                Interview Report
              </h2>

              <p>
                Current interview activity across the platform.
              </p>
            </div>

            <strong>
              {stats.interviews.total} Total
            </strong>

          </div>

          <div className="report-grid">

            <div>
              <span>Total Interviews</span>
              <strong>
                {stats.interviews.total}
              </strong>
            </div>

            <div>
              <span>Scheduled</span>
              <strong>
                {stats.interviews.scheduled}
              </strong>
            </div>

            <div>
              <span>Completed</span>
              <strong>
                {stats.interviews.completed}
              </strong>
            </div>

            <div>
              <span>Cancelled</span>
              <strong>
                {stats.interviews.cancelled}
              </strong>
            </div>

          </div>

        </section>


        {/* ================= LIVE STATUS ================= */}

        <div className="reports-live-status">
          ● Live data — automatically refreshed
        </div>

      </main>

    </div>
  );
}

export default AdminReports;
