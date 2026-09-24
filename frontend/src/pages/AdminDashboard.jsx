import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminDashboard.css";

function AdminDashboard() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  /* =========================================================
     LOAD ADMIN
     ========================================================= */

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

      setUser(loggedInUser);
      fetchDashboard(loggedInUser.id);
    } catch (error) {
      console.error("Admin user error:", error);
      navigate("/login");
    }
  }, [navigate]);

  /* =========================================================
     FETCH DASHBOARD
     ========================================================= */

  const fetchDashboard = async (adminId) => {
    try {
      setLoading(true);
      setMessage("");

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/admin.php?admin_id=${adminId}`
      );

      const data = await response.json();

      console.log("Admin dashboard response:", data);

      if (data.success) {
        setStats(data.statistics);

        setUser((currentUser) => ({
          ...currentUser,
          ...data.admin,
        }));
      } else {
        setMessage(
          data.message || "Unable to load admin dashboard."
        );
      }
    } catch (error) {
      console.error("Admin dashboard error:", error);
      setMessage("Unable to connect to HireHub server.");
    } finally {
      setLoading(false);
    }
  };

  /* =========================================================
     LOGOUT
     ========================================================= */

  const logout = () => {
    localStorage.removeItem("hirehub_user");
    navigate("/login");
  };

  /* =========================================================
     HELPERS
     ========================================================= */

  const getPercentage = (value, total) => {
    if (!total || total <= 0) {
      return 0;
    }

    return Math.min(
      100,
      Math.round((Number(value || 0) / Number(total)) * 100)
    );
  };

  /* =========================================================
     LOADING
     ========================================================= */

  if (loading) {
    return (
      <div className="admin-dashboard-page">
        <div className="admin-loading">
          <div className="admin-loading-spinner"></div>

          <h2>Loading Admin Dashboard...</h2>

          <p>
            Please wait while we load your statistics.
          </p>
        </div>
      </div>
    );
  }

  /* =========================================================
     ERROR
     ========================================================= */

  if (message) {
    return (
      <div className="admin-dashboard-page">
        <div className="admin-error-card">

          <h2>
            Unable to load dashboard
          </h2>

          <p>
            {message}
          </p>

          <button onClick={logout}>
            Back to Login
          </button>

        </div>
      </div>
    );
  }

  /* =========================================================
     STAT VALUES
     ========================================================= */

  const totalUsers =
    stats?.users?.total ?? 0;

  const candidates =
    stats?.users?.candidates ?? 0;

  const employers =
    stats?.users?.employers ?? 0;

  const admins =
    stats?.users?.admins ?? 0;

  const candidateProfiles =
    stats?.candidates?.total_profiles ?? 0;

  const totalJobs =
    stats?.jobs?.total ?? 0;

  const activeJobs =
    stats?.jobs?.active ?? 0;

  const applicationTotal =
    stats?.applications?.total ?? 0;

  const pendingApplications =
    stats?.applications?.pending ?? 0;

  const acceptedApplications =
    stats?.applications?.accepted ?? 0;

  const rejectedApplications =
    stats?.applications?.rejected ?? 0;

  const interviewTotal =
    stats?.interviews?.total ?? 0;

  const scheduledInterviews =
    stats?.interviews?.scheduled ?? 0;

  const completedInterviews =
    stats?.interviews?.completed ?? 0;

  const cancelledInterviews =
    stats?.interviews?.cancelled ?? 0;

  /* =========================================================
     DASHBOARD
     ========================================================= */

  return (
    <div className="admin-dashboard-page">

      {/* =====================================================
          SIDEBAR
          ===================================================== */}

      <aside className="admin-sidebar">

        {/* LOGO */}

        <div className="admin-logo">
          Hire<span>Hub</span>
        </div>


        {/* PANEL LABEL */}

        <div className="admin-panel-label">
          ADMIN PANEL
        </div>


        {/* ADMIN USER */}

        <div className="admin-user-card">

          <div className="admin-avatar">
            {user?.name?.charAt(0)?.toUpperCase() || "A"}
          </div>

          <div className="admin-user-info">

            <strong>
              {user?.name || "HireHub Admin"}
            </strong>

            <span>
              Administrator
            </span>

          </div>

        </div>


        {/* =================================================
            NAVIGATION
            ================================================= */}

        <nav className="admin-nav">

          {/* DASHBOARD */}

          <button
            className="active"
            onClick={() =>
              navigate("/admin/dashboard")
            }
          >
            <span>{"\uD83C\uDFE0"}</span>
            Dashboard
          </button>


          {/* USERS */}

          <button
            onClick={() =>
              navigate("/admin/users")
            }
          >
            <span>{"\uD83D\uDC64"}</span>
            User Management
          </button>


          {/* JOBS */}

          <button
            onClick={() =>
              navigate("/admin/jobs")
            }
          >
            <span>{"\uD83D\uDCBC"}</span>
            Jobs
          </button>


          {/* APPLICATIONS */}

          <button
            onClick={() =>
              navigate("/admin/applications")
            }
          >
            <span>{"\uD83D\uDCCB"}</span>
            Applications
          </button>


          {/* INTERVIEWS */}

          <button
            onClick={() =>
              navigate("/admin/interviews")
            }
          >
            <span>{"\uD83C\uDFAF"}</span>
            Interviews
          </button>


          {/* ANALYTICS */}

          <button
            onClick={() =>
              navigate("/admin/analytics")
            }
          >
            <span>{"\uD83D\uDCCA"}</span>
            Analytics
          </button>


          {/* REPORTS */}

          <button
            onClick={() =>
              navigate("/admin/reports")
            }
          >
            <span>{"\uD83D\uDCC4"}</span>
            Reports
          </button>


          {/* ACTIVITY LOGS */}

          <button
            onClick={() =>
              navigate("/admin/activity")
            }
          >
            <span>{"\u2637"}</span>
            Activity Logs
          </button>

        </nav>


        {/* =================================================
            LOGOUT
            ================================================= */}

        <button
          className="admin-logout"
          onClick={logout}
        >
          <span>{"\u21AA"}</span>
          Logout
        </button>

      </aside>


      {/* =====================================================
          MAIN CONTENT
          ===================================================== */}

      <main className="admin-main">


        {/* =================================================
            HEADER
            ================================================= */}

        <header className="admin-header">

          <div className="admin-header-content">

            <div className="admin-breadcrumb">
              ADMINISTRATION
            </div>

            <h1>
              Admin Dashboard
            </h1>

            <p>
              Manage HireHub recruitment activity and platform statistics.
            </p>

          </div>

        </header>


        {/* =================================================
            USER STATISTICS
            ================================================= */}

        <section className="admin-section">

          <div className="admin-section-heading centered">

            <span className="admin-section-tag">
              PLATFORM OVERVIEW
            </span>

            <h2>
              User Statistics
            </h2>

          </div>


          <div className="admin-stat-grid">


            {/* TOTAL USERS */}

            <div className="admin-stat-card">

              <div className="admin-stat-icon">
                {"\uD83D\uDC65"}
              </div>

              <div className="admin-stat-content">

                <span>
                  Total Users
                </span>

                <strong>
                  {totalUsers}
                </strong>

              </div>

            </div>


            {/* CANDIDATES */}

            <div className="admin-stat-card">

              <div className="admin-stat-icon">
                {"\uD83D\uDC64"}
              </div>

              <div className="admin-stat-content">

                <span>
                  Candidates
                </span>

                <strong>
                  {candidates}
                </strong>

              </div>

            </div>


            {/* EMPLOYERS */}

            <div className="admin-stat-card">

              <div className="admin-stat-icon">
                {"\uD83D\uDCBC"}
              </div>

              <div className="admin-stat-content">

                <span>
                  Employers
                </span>

                <strong>
                  {employers}
                </strong>

              </div>

            </div>


            {/* ADMINS */}

            <div className="admin-stat-card">

              <div className="admin-stat-icon">
                {"\u2699\uFE0F"}
              </div>

              <div className="admin-stat-content">

                <span>
                  Admins
                </span>

                <strong>
                  {admins}
                </strong>

              </div>

            </div>

          </div>

        </section>


        {/* =================================================
            SYSTEM STATISTICS
            ================================================= */}

        <section className="admin-section">

          <div className="admin-section-heading centered">

            <span className="admin-section-tag">
              RECRUITMENT
            </span>

            <h2>
              System Statistics
            </h2>

          </div>


          <div className="admin-system-grid">


            {/* CANDIDATE PROFILES */}

            <div className="admin-system-card">

              <div className="system-icon">
                {"\uD83D\uDC64"}
              </div>

              <div>

                <span>
                  Candidate Profiles
                </span>

                <strong>
                  {candidateProfiles}
                </strong>

              </div>

            </div>


            {/* TOTAL JOBS */}

            <div className="admin-system-card">

              <div className="system-icon">
                {"\uD83D\uDCBC"}
              </div>

              <div>

                <span>
                  Total Jobs
                </span>

                <strong>
                  {totalJobs}
                </strong>

              </div>

            </div>


            {/* APPLICATIONS */}

            <div className="admin-system-card">

              <div className="system-icon">
                {"\uD83D\uDCCB"}
              </div>

              <div>

                <span>
                  Applications
                </span>

                <strong>
                  {applicationTotal}
                </strong>

              </div>

            </div>


            {/* INTERVIEWS */}

            <div className="admin-system-card">

              <div className="system-icon">
                {"\uD83C\uDFAF"}
              </div>

              <div>

                <span>
                  Interviews
                </span>

                <strong>
                  {interviewTotal}
                </strong>

              </div>

            </div>

          </div>

        </section>


        {/* =================================================
            APPLICATION + INTERVIEW ACTIVITY
            ================================================= */}

        <section className="admin-status-section">


          {/* APPLICATIONS */}

          <div className="admin-status-panel">

            <div className="status-panel-header">

              <div>

                <div className="admin-section-tag">
                  APPLICATION ACTIVITY
                </div>

                <h2>
                  Applications
                </h2>

              </div>

              <div className="status-total">
                {applicationTotal}
              </div>

            </div>


            {/* PENDING */}

            <div className="status-row">

              <div className="status-row-top">

                <span>
                  Pending
                </span>

                <strong>
                  {pendingApplications}
                </strong>

              </div>

              <div className="progress-track">

                <div
                  className="progress-bar pending-bar"
                  style={{
                    width: `${getPercentage(
                      pendingApplications,
                      applicationTotal
                    )}%`,
                  }}
                />

              </div>

            </div>


            {/* ACCEPTED */}

            <div className="status-row">

              <div className="status-row-top">

                <span>
                  Accepted
                </span>

                <strong>
                  {acceptedApplications}
                </strong>

              </div>

              <div className="progress-track">

                <div
                  className="progress-bar accepted-bar"
                  style={{
                    width: `${getPercentage(
                      acceptedApplications,
                      applicationTotal
                    )}%`,
                  }}
                />

              </div>

            </div>


            {/* REJECTED */}

            <div className="status-row">

              <div className="status-row-top">

                <span>
                  Rejected
                </span>

                <strong>
                  {rejectedApplications}
                </strong>

              </div>

              <div className="progress-track">

                <div
                  className="progress-bar rejected-bar"
                  style={{
                    width: `${getPercentage(
                      rejectedApplications,
                      applicationTotal
                    )}%`,
                  }}
                />

              </div>

            </div>

          </div>


          {/* =================================================
              INTERVIEWS
              ================================================= */}

          <div className="admin-status-panel">

            <div className="status-panel-header">

              <div>

                <div className="admin-section-tag">
                  INTERVIEW ACTIVITY
                </div>

                <h2>
                  Interviews
                </h2>

              </div>

              <div className="status-total">
                {interviewTotal}
              </div>

            </div>


            {/* SCHEDULED */}

            <div className="status-row">

              <div className="status-row-top">

                <span>
                  Scheduled
                </span>

                <strong>
                  {scheduledInterviews}
                </strong>

              </div>

              <div className="progress-track">

                <div
                  className="progress-bar scheduled-bar"
                  style={{
                    width: `${getPercentage(
                      scheduledInterviews,
                      interviewTotal
                    )}%`,
                  }}
                />

              </div>

            </div>


            {/* COMPLETED */}

            <div className="status-row">

              <div className="status-row-top">

                <span>
                  Completed
                </span>

                <strong>
                  {completedInterviews}
                </strong>

              </div>

              <div className="progress-track">

                <div
                  className="progress-bar completed-bar"
                  style={{
                    width: `${getPercentage(
                      completedInterviews,
                      interviewTotal
                    )}%`,
                  }}
                />

              </div>

            </div>


            {/* CANCELLED */}

            <div className="status-row">

              <div className="status-row-top">

                <span>
                  Cancelled
                </span>

                <strong>
                  {cancelledInterviews}
                </strong>

              </div>

              <div className="progress-track">

                <div
                  className="progress-bar cancelled-bar"
                  style={{
                    width: `${getPercentage(
                      cancelledInterviews,
                      interviewTotal
                    )}%`,
                  }}
                />

              </div>

            </div>

          </div>

        </section>


        {/* =================================================
            ACCOUNT STATUS
            ================================================= */}

        <section className="admin-section">

          <div className="admin-section-heading centered">

            <span className="admin-section-tag">
              USER ACTIVITY
            </span>

            <h2>
              Account Status
            </h2>

          </div>


          <div className="admin-account-grid">


            {/* ACTIVE USERS */}

            <div className="admin-account-card">

              <span>
                Active Users
              </span>

              <strong>
                {stats?.users?.active ?? 0}
              </strong>

              <small>
                Currently active accounts
              </small>

            </div>


            {/* INACTIVE USERS */}

            <div className="admin-account-card">

              <span>
                Inactive Users
              </span>

              <strong>
                {stats?.users?.inactive ?? 0}
              </strong>

              <small>
                Inactive platform accounts
              </small>

            </div>


            {/* CANDIDATE PROFILES */}

            <div className="admin-account-card">

              <span>
                Candidate Profiles
              </span>

              <strong>
                {candidateProfiles}
              </strong>

              <small>
                Completed candidate profiles
              </small>

            </div>


            {/* ACTIVE JOBS */}

            <div className="admin-account-card">

              <span>
                Active Jobs
              </span>

              <strong>
                {activeJobs}
              </strong>

              <small>
                Currently active job postings
              </small>

            </div>

          </div>

        </section>


        {/* =================================================
            FOOTER
            ================================================= */}

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

export default AdminDashboard;