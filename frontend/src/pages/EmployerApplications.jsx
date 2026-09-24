import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./EmployerApplications.css";

function EmployerApplications() {
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

      if (loggedInUser.role !== "employer") {
        navigate("/dashboard");
        return;
      }

      setUser(loggedInUser);
      fetchApplications(loggedInUser.id);
    } catch (error) {
      console.error("User data error:", error);
      navigate("/login");
    }
  }, [navigate]);

  const fetchApplications = async (employerId) => {
    try {
      setLoading(true);
      setMessage("");

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/applications.php?employer_id=${employerId}`
      );

      const data = await response.json();

      console.log("Employer applications response:", data);

      if (data.success) {
        setApplications(data.applications || []);
      } else {
        setMessage(data.message || "Unable to load applications.");
      }
    } catch (error) {
      console.error("Employer applications error:", error);
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

  return (
    <div className="employer-applications-page">

      {/* SIDEBAR */}
      <aside className="employer-sidebar">

        <div className="employer-logo">
          Hire<span>Hub</span>
        </div>

        <div className="employer-user-box">

          <div className="employer-avatar">
            {user?.name?.charAt(0)?.toUpperCase() || "E"}
          </div>

          <div>
            <strong>
              {user?.name || "Employer"}
            </strong>

            <small>
              Employer
            </small>
          </div>

        </div>

        <nav className="employer-nav">

          <button
            onClick={() =>
              navigate("/employer/dashboard")
            }
          >
            Dashboard
          </button>

          <button
            onClick={() =>
              navigate("/employer/jobs")
            }
          >
            My Jobs
          </button>

          <button
            className="active"
            onClick={() =>
              navigate("/employer/applications")
            }
          >
            Applications
          </button>
          <button onClick={() => navigate("/employer/interviews")}>
            Interviews
          </button>

        </nav>

        <button
          className="employer-logout"
          onClick={logout}
        >
          Logout
        </button>

      </aside>


      {/* MAIN CONTENT */}
      <main className="employer-applications-main">

        <header className="employer-applications-header">

          <div>

            <p className="employer-label">
              EMPLOYER APPLICATIONS
            </p>

            <h1>
              Candidate Applications
            </h1>

            <p>
              Review candidates who applied to your jobs.
            </p>

          </div>

          <button
            className="back-dashboard-button"
            onClick={() =>
              navigate("/employer/dashboard")
            }
          >
            ← Dashboard
          </button>

        </header>


        {/* APPLICATION COUNT */}
        <div className="applications-summary">

          <div className="applications-summary-card">

            <span className="summary-icon">
              👥
            </span>

            <div>
              <strong>
                {applications.length}
              </strong>

              <small>
                Total Applications
              </small>
            </div>

          </div>

        </div>


        {/* CONTENT */}
        <section className="applications-content">

          {loading && (
            <div className="applications-message">
              Loading applications...
            </div>
          )}


          {!loading && message && (
            <div className="applications-message error">
              {message}
            </div>
          )}


          {!loading &&
            !message &&
            applications.length === 0 && (

              <div className="applications-empty">

                <div className="empty-icon">
                  📭
                </div>

                <h2>
                  No applications yet
                </h2>

                <p>
                  When candidates apply to your jobs,
                  their applications will appear here.
                </p>

                <button
                  onClick={() =>
                    navigate("/employer/jobs")
                  }
                >
                  View My Jobs
                </button>

              </div>
            )}


          {!loading &&
            applications.length > 0 && (

              <div className="applications-list">

                {applications.map((application) => (

                  <article
                    className="application-card"
                    key={application._id}
                  >

                    <div className="candidate-avatar">
                      {application.candidate_name
                        ?.charAt(0)
                        ?.toUpperCase() || "C"}
                    </div>


                    <div className="application-info">

                      <h2>
                        {application.candidate_name ||
                          "Candidate"}
                      </h2>

                      <p className="candidate-email">
                        {application.candidate_email ||
                          "Email not available"}
                      </p>

                      <div className="application-job">

                        <strong>
                          {application.job_title ||
                            "Job"}
                        </strong>

                        <span>
                          {application.company_name ||
                            "Company"}
                        </span>

                      </div>

                      <p className="application-date">
                        Applied on{" "}
                        {formatDate(
                          application.applied_at
                        )}
                      </p>

                      {application.cover_letter && (
                        <div className="cover-letter">

                          <strong>
                            Cover Letter
                          </strong>

                          <p>
                            {application.cover_letter}
                          </p>

                        </div>
                      )}

                    </div>


                    <div className="application-actions">

  <span
    className={`application-status ${getStatusClass(
      application.status
    )}`}
  >
    {application.status || "Applied"}
  </span>

  <button
    className="view-application-button"
    onClick={() =>
      navigate(
        `/employer/applications/${application._id}`
      )
    }
  >
    View
  </button>

  <button
    className="schedule-interview-button"
    onClick={() =>
      navigate(
        `/employer/applications/${application._id}/schedule`
      )
    }
  >
    Schedule Interview
  </button>

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

export default EmployerApplications;