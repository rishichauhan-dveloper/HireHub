import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminApplications.css";

function AdminApplications() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
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

      setUser(loggedInUser);
      fetchApplications(loggedInUser.id);

    } catch (error) {
      console.error("Admin user error:", error);
      navigate("/login");
    }
  }, [navigate]);

  const fetchApplications = async (adminId) => {
    try {
      setLoading(true);
      setMessage("");

      /*
       * Admin needs all applications.
       * The existing applications.php currently supports
       * candidate_id and employer_id filters only.
       */
      const response = await fetch(
  `${import.meta.env.VITE_API_URL}/api/applications.php?admin_id=${adminId}`
);

      const data = await response.json();

      console.log("Admin applications response:", data);

      if (data.success) {
        setApplications(data.applications || []);
      } else {
        setMessage(
          data.message || "Unable to load applications."
        );
      }

    } catch (error) {
      console.error("Admin applications error:", error);
      setMessage("Unable to connect to HireHub server.");
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("hirehub_user");
    navigate("/login");
  };

  const formatDate = (date) => {
    if (!date) {
      return "N/A";
    }

    try {
      if (date.$date?.$numberLong) {
        return new Date(
          Number(date.$date.$numberLong)
        ).toLocaleDateString();
      }

      if (date.$date) {
        return new Date(date.$date).toLocaleDateString();
      }

      return new Date(date).toLocaleDateString();

    } catch (error) {
      return "N/A";
    }
  };

  const getStatusClass = (status) => {
    return String(status || "Applied")
      .toLowerCase()
      .replace(/\s+/g, "-");
  };

  const updateStatus = async (applicationId, status) => {
    try {
      const response = await fetch(
        "${import.meta.env.VITE_API_URL}/api/applications.php",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            application_id: applicationId,
            status: status,
          }),
        }
      );

      const data = await response.json();

      console.log("Update application response:", data);

      if (data.success) {
        setApplications((currentApplications) =>
          currentApplications.map((application) =>
            application._id === applicationId
              ? {
                  ...application,
                  status: status,
                }
              : application
          )
        );
      } else {
        alert(
          data.message ||
          "Unable to update application status."
        );
      }

    } catch (error) {
      console.error(
        "Update application error:",
        error
      );

      alert(
        "Unable to connect to HireHub server."
      );
    }
  };

  if (loading) {
    return (
      <div className="admin-applications-page">
        <div className="admin-applications-loading">
          <div className="admin-applications-spinner"></div>
          <h2>Loading Applications...</h2>
          <p>
            Please wait while applications are loaded.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-applications-page">

      {/* SIDEBAR */}

      <aside className="admin-applications-sidebar">

        <div className="admin-applications-logo">
          Hire<span>Hub</span>
        </div>

        <div className="admin-applications-label">
          ADMIN PANEL
        </div>

        <div className="admin-applications-user">

          <div className="admin-applications-avatar">
            {user?.name?.charAt(0)?.toUpperCase() || "A"}
          </div>

          <div>
            <strong>
              {user?.name || "HireHub Admin"}
            </strong>

            <small>
              Administrator
            </small>
          </div>

        </div>

        <nav className="admin-applications-nav">

  <button
    onClick={() => navigate("/admin/dashboard")}
  >
    🏠 Dashboard
  </button>

  <button
    onClick={() => navigate("/admin/users")}
  >
    👤 User Management
  </button>

  <button
    onClick={() => navigate("/admin/jobs")}
  >
    💼 Jobs
  </button>

  <button className="active">
    📋 Applications
  </button>

  <button
    onClick={() => navigate("/admin/interviews")}
  >
    🎯 Interviews
  </button>

  <button
    onClick={() => navigate("/admin/analytics")}
  >
    📊 Analytics
  </button>

  <button
    onClick={() => navigate("/admin/reports")}
  >
    📄 Reports
  </button>

  <button
    onClick={() => navigate("/admin/activity")}
  >
    📝 Activity Logs
  </button>

</nav>

        <button
          className="admin-applications-logout"
          onClick={logout}
        >
          Logout
        </button>

      </aside>


      {/* MAIN */}

      <main className="admin-applications-main">

        <header className="admin-applications-header">

          <div>

            <span className="admin-applications-tag">
              ADMINISTRATION
            </span>

            <h1>
              Applications
            </h1>

            <p>
              Review and manage candidate applications
              across the HireHub platform.
            </p>

          </div>

          <div className="admin-applications-actions">

            <button
              className="admin-applications-back"
              onClick={() =>
                navigate("/admin/dashboard")
              }
            >
              Back to Dashboard
            </button>

          </div>

        </header>


        {message && (
          <div className="admin-applications-message">
            {message}
          </div>
        )}


        <section className="admin-applications-section">

          <div className="admin-applications-section-heading">

            <div>
              <span>
                RECRUITMENT
              </span>

              <h2>
                Candidate Applications
              </h2>
            </div>

            <strong>
              {applications.length} Applications
            </strong>

          </div>


          {applications.length === 0 ? (

            <div className="admin-applications-empty">

              <h3>
                No Applications Found
              </h3>

              <p>
                There are currently no candidate
                applications to display.
              </p>

            </div>

          ) : (

            <div className="admin-applications-list">

              {applications.map((application) => (

                <article
                  className="admin-application-card"
                  key={application._id}
                >

                  <div className="admin-application-main">

                    <div className="admin-application-avatar">
                      {(
                        application.candidate_name ||
                        "C"
                      )
                        .charAt(0)
                        .toUpperCase()}
                    </div>

                    <div className="admin-application-info">

                      <h3>
                        {application.candidate_name ||
                          "Candidate"}
                      </h3>

                      <p>
                        {application.candidate_email ||
                          "Candidate application"}
                      </p>

                      <div className="admin-application-job">

                        <strong>
                          {application.job_title ||
                            "Job"}
                        </strong>

                        <span>
                          {application.company_name ||
                            "Company"}
                        </span>

                      </div>

                      <small>
                        Applied on{" "}
                        {formatDate(
                          application.applied_at
                        )}
                      </small>

                      {application.cover_letter && (
                        <div className="admin-cover-letter">

                          <strong>
                            Cover Letter
                          </strong>

                          <p>
                            {application.cover_letter}
                          </p>

                        </div>
                      )}

                    </div>

                  </div>


                  <div className="admin-application-actions">

                    <span
                      className={`admin-application-status ${getStatusClass(
                        application.status
                      )}`}
                    >
                      {application.status ||
                        "Applied"}
                    </span>


                    <select
                      value={
                        application.status ||
                        "Applied"
                      }
                      onChange={(event) =>
                        updateStatus(
                          application._id,
                          event.target.value
                        )
                      }
                      className="admin-application-status-select"
                    >

                      <option value="Applied">
                        Applied
                      </option>

                      <option value="Under Review">
                        Under Review
                      </option>

                      <option value="Shortlisted">
                        Shortlisted
                      </option>

                      <option value="Interview">
                        Interview
                      </option>

                      <option value="Selected">
                        Selected
                      </option>

                      <option value="Rejected">
                        Rejected
                      </option>

                    </select>

                  </div>

                </article>

              ))}

            </div>

          )}

        </section>

      </main>

    </div>
  );
}

export default AdminApplications;

