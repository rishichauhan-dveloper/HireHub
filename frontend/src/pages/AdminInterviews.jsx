import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminInterviews.css";

function AdminInterviews() {
  const navigate = useNavigate();

  const [admin, setAdmin] = useState(null);
  const [interviews, setInterviews] = useState([]);
  const [applications, setApplications] = useState([]);
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

      if (loggedInUser.role !== "admin") {
        navigate("/login");
        return;
      }

      setAdmin(loggedInUser);
      fetchData();
    } catch (error) {
      console.error("Admin user error:", error);
      navigate("/login");
    }
  }, [navigate]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setMessage("");

      const savedUser = localStorage.getItem("hirehub_user");
      const loggedInUser = savedUser ? JSON.parse(savedUser) : {};
      const adminId = loggedInUser.id;

      const [interviewsResponse, applicationsResponse] =
        await Promise.all([
          fetch(
            "${import.meta.env.VITE_API_URL}/api/interviews.php"
          ),
          fetch(
            `${import.meta.env.VITE_API_URL}/api/applications.php?admin_id=${adminId}`
          ),
        ]);

      const interviewsData = await interviewsResponse.json();
      const applicationsData = await applicationsResponse.json();

      console.log("Admin interviews response:", interviewsData);
      console.log("Admin applications response:", applicationsData);

      if (!interviewsData.success) {
        setMessage(
          interviewsData.message || "Unable to load interviews."
        );
        return;
      }

      setInterviews(interviewsData.interviews || []);

      if (applicationsData.success) {
        setApplications(applicationsData.applications || []);
      }
    } catch (error) {
      console.error("Admin interviews error:", error);
      setMessage("Unable to connect to HireHub server.");
    } finally {
      setLoading(false);
    }
  };

  const getApplication = (applicationId) => {
    return applications.find(
      (application) =>
        String(application._id) === String(applicationId)
    );
  };

  const formatDate = (date) => {
    if (!date) return "N/A";

    try {
      return new Date(date).toLocaleDateString();
    } catch {
      return "N/A";
    }
  };

  const cancelInterview = async (interviewId) => {
    if (
      !window.confirm(
        "Are you sure you want to cancel this interview?"
      )
    ) {
      return;
    }

    try {
      const response = await fetch(
        "${import.meta.env.VITE_API_URL}/api/interviews.php",
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            interview_id: interviewId,
          }),
        }
      );

      const data = await response.json();

      if (data.success) {
        setInterviews((current) =>
          current.map((interview) =>
            String(interview._id) === String(interviewId)
              ? {
                  ...interview,
                  status: "cancelled",
                }
              : interview
          )
        );

        setMessage("Interview cancelled successfully.");
      } else {
        setMessage(
          data.message || "Unable to cancel interview."
        );
      }
    } catch (error) {
      console.error("Cancel interview error:", error);
      setMessage("Unable to connect to HireHub server.");
    }
  };

  const logout = () => {
    localStorage.removeItem("hirehub_user");
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="admin-interviews-page">
        <div className="admin-interviews-loading">
          Loading Interviews...
        </div>
      </div>
    );
  }

  return (
    <div className="admin-interviews-page">

      {/* ================= SIDEBAR ================= */}

      <aside className="admin-interviews-sidebar">

        <div className="admin-interviews-logo">
          Hire<span>Hub</span>
        </div>

        <div className="admin-interviews-panel-title">
          ADMIN PANEL
        </div>

        <div className="admin-interviews-user">

          <div className="admin-interviews-avatar">
            {admin?.name?.charAt(0)?.toUpperCase() || "A"}
          </div>

          <div className="admin-interviews-user-info">
            <strong>
              {admin?.name || "HireHub Admin"}
            </strong>

            <small>Administrator</small>
          </div>

        </div>

        <nav className="admin-interviews-nav">

          <button
            onClick={() => navigate("/admin/dashboard")}
          >
            <span className="nav-icon">🏠</span>
            <span>Dashboard</span>
          </button>

          <button
            onClick={() => navigate("/admin/users")}
          >
            <span className="nav-icon">👤</span>
            <span>User Management</span>
          </button>

          <button
            onClick={() => navigate("/admin/jobs")}
          >
            <span className="nav-icon">💼</span>
            <span>Jobs</span>
          </button>

          <button
            onClick={() => navigate("/admin/applications")}
          >
            <span className="nav-icon">📋</span>
            <span>Applications</span>
          </button>

          <button className="active">
            <span className="nav-icon">🎯</span>
            <span>Interviews</span>
          </button>

          <button
            onClick={() => navigate("/admin/analytics")}
          >
            <span className="nav-icon">📊</span>
            <span>Analytics</span>
          </button>

          <button
            onClick={() => navigate("/admin/reports")}
          >
            <span className="nav-icon">📄</span>
            <span>Reports</span>
          </button>

          <button
            onClick={() => navigate("/admin/activity")}
          >
            <span className="nav-icon">📝</span>
            <span>Activity Logs</span>
          </button>

        </nav>

        <button
          className="admin-interviews-sidebar-logout"
          onClick={logout}
        >
          Logout
        </button>

      </aside>

      {/* ================= MAIN ================= */}

      <main className="admin-interviews-main">

        <header className="admin-interviews-header">

          <div>
            <div className="admin-interviews-label">
              ADMINISTRATION
            </div>

            <h1>Interview Management</h1>

            <p>
              Monitor and manage candidate interviews.
            </p>
          </div>

          <div className="admin-interviews-actions">

            <button
              className="admin-interviews-back"
              onClick={() =>
                navigate("/admin/dashboard")
              }
            >
              Back to Dashboard
            </button>

            <button
              className="admin-interviews-header-logout"
              onClick={logout}
            >
              Logout
            </button>

          </div>

        </header>

        <div className="admin-interviews-container">

          {message && (
            <div className="admin-interviews-message">
              {message}
            </div>
          )}

          {/* SUMMARY */}

          <div className="admin-interviews-summary">

            <div className="admin-interview-stat">
              <span>Total Interviews</span>
              <strong>{interviews.length}</strong>
            </div>

            <div className="admin-interview-stat">
              <span>Scheduled</span>
              <strong>
                {
                  interviews.filter(
                    (item) =>
                      item.status === "scheduled"
                  ).length
                }
              </strong>
            </div>

            <div className="admin-interview-stat">
              <span>Completed</span>
              <strong>
                {
                  interviews.filter(
                    (item) =>
                      item.status === "completed"
                  ).length
                }
              </strong>
            </div>

            <div className="admin-interview-stat">
              <span>Cancelled</span>
              <strong>
                {
                  interviews.filter(
                    (item) =>
                      item.status === "cancelled"
                  ).length
                }
              </strong>
            </div>

          </div>

          {/* INTERVIEWS */}

          <section className="admin-interviews-section">

            <div className="admin-interviews-section-heading">
              <span>INTERVIEWS</span>
              <h2>All Candidate Interviews</h2>
            </div>

            {interviews.length === 0 ? (

              <div className="admin-interviews-empty">
                <h3>No interviews found</h3>
                <p>
                  Scheduled interviews will appear here.
                </p>
              </div>

            ) : (

              <div className="admin-interviews-list">

                {interviews.map((interview) => {

                  const application =
                    getApplication(
                      interview.application_id
                    );

                  return (
                    <article
                      className="admin-interview-card"
                      key={interview._id}
                    >

                      <div className="admin-interview-card-header">

                        <div className="admin-interview-top">
                          <h3>
                            {application?.candidate_name ||
                              "Candidate"}
                          </h3>

                          <p>
                            {application?.candidate_email ||
                              "Email not available"}
                          </p>
                        </div>

                        <span
                          className={`admin-interview-status ${String(
                            interview.status || "scheduled"
                          )
                            .toLowerCase()
                            .replace(/\s+/g, "-")}`}
                        >
                          {interview.status || "scheduled"}
                        </span>

                      </div>

                      <div className="admin-interview-info">

                        <div>
                          <span>Job</span>
                          <strong>
                            {application?.job_title || "Job"}
                          </strong>
                        </div>

                        <div>
                          <span>Company</span>
                          <strong>
                            {application?.company_name ||
                              "Company"}
                          </strong>
                        </div>

                        <div>
                          <span>Date</span>
                          <strong>
                            {formatDate(
                              interview.interview_date
                            )}
                          </strong>
                        </div>

                        <div>
                          <span>Time</span>
                          <strong>
                            {interview.interview_time || "N/A"}
                          </strong>
                        </div>

                        <div>
                          <span>Type</span>
                          <strong>
                            {interview.interview_type ||
                              "Online"}
                          </strong>
                        </div>

                      </div>

                      <div className="admin-interview-actions">

                        {interview.meeting_link && (
                          <a
                            href={interview.meeting_link}
                            target="_blank"
                            rel="noreferrer"
                            className="admin-interview-link"
                          >
                            Meeting Link
                          </a>
                        )}

                        {interview.status !== "cancelled" &&
                          interview.status !== "completed" && (
                            <button
                              className="admin-interview-cancel"
                              onClick={() =>
                                cancelInterview(
                                  interview._id
                                )
                              }
                            >
                              Cancel Interview
                            </button>
                          )}

                      </div>

                    </article>
                  );
                })}

              </div>

            )}

          </section>

        </div>

      </main>

    </div>
  );
}

export default AdminInterviews;