import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./EmployerDashboard.css";

function EmployerDashboard() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [jobs, setJobs] = useState([]);
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

      // Fetch jobs and applications
      fetchDashboardData(loggedInUser.id);

    } catch (error) {
      console.error("User data error:", error);
      navigate("/login");
    }
  }, [navigate]);

  const fetchDashboardData = async (employerId) => {
    try {
      setLoading(true);
      setMessage("");

      // Fetch jobs and applications together
      const [jobsResponse, applicationsResponse] =
        await Promise.all([
          fetch(
            `${import.meta.env.VITE_API_URL}/api/jobs.php?employer_id=${employerId}`
          ),

          fetch(
            `${import.meta.env.VITE_API_URL}/api/applications.php?employer_id=${employerId}`
          )
        ]);

      if (!jobsResponse.ok) {
        throw new Error(
          `Jobs API error: ${jobsResponse.status}`
        );
      }

      if (!applicationsResponse.ok) {
        throw new Error(
          `Applications API error: ${applicationsResponse.status}`
        );
      }

      const jobsData = await jobsResponse.json();
      const applicationsData = await applicationsResponse.json();

      console.log("Employer jobs response:", jobsData);
      console.log(
        "Employer applications response:",
        applicationsData
      );

      // Jobs
      if (jobsData.success) {
        setJobs(jobsData.jobs || []);
      } else {
        setMessage(
          jobsData.message || "Unable to load jobs."
        );
      }

      // Applications
      if (applicationsData.success) {
        setApplications(
          applicationsData.applications || []
        );
      } else {
        setMessage(
          applicationsData.message ||
            "Unable to load applications."
        );
      }

    } catch (error) {
      console.error(
        "Employer dashboard error:",
        error
      );

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

  // Active jobs
  const activeJobs = jobs.filter(
    (job) =>
      String(job.status || "")
        .toLowerCase() === "active"
  );

  // Shortlisted applications
  const shortlistedApplications =
    applications.filter(
      (application) =>
        String(application.status || "")
          .toLowerCase()
          .trim() === "shortlisted"
    );

  return (
    <div className="employer-dashboard">

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
            className="active"
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
            onClick={() =>
              navigate("/employer/applications")
            }
          >
            Applications
          </button>

          <button
            onClick={() =>
              navigate("/employer/interviews")
            }
          >
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


      {/* MAIN */}
      <main className="employer-main">

        {/* HEADER */}
        <header className="employer-header">

          <div>

            <p className="employer-label">
              EMPLOYER DASHBOARD
            </p>

            <h1>
              Welcome back, {user?.name || "Employer"} 👋
            </h1>

            <p>
              Manage your jobs and find the right candidates.
            </p>

          </div>

          <button
            className="create-job-button"
            onClick={() =>
              navigate("/employer/jobs/create")
            }
          >
            + Post a Job
          </button>

        </header>


        {/* STATS */}
        <section className="employer-stats">

          {/* TOTAL JOBS */}
          <div className="employer-stat-card">

            <span>💼</span>

            <div>
              <strong>
                {jobs.length}
              </strong>

              <small>
                Total Jobs
              </small>
            </div>

          </div>


          {/* ACTIVE JOBS */}
          <div className="employer-stat-card">

            <span>🟢</span>

            <div>
              <strong>
                {activeJobs.length}
              </strong>

              <small>
                Active Jobs
              </small>
            </div>

          </div>


          {/* APPLICATIONS */}
          <div className="employer-stat-card">

            <span>👥</span>

            <div>
              <strong>
                {applications.length}
              </strong>

              <small>
                Applications
              </small>
            </div>

          </div>


          {/* SHORTLISTED */}
          <div className="employer-stat-card">

            <span>⭐</span>

            <div>
              <strong>
                {shortlistedApplications.length}
              </strong>

              <small>
                Shortlisted
              </small>
            </div>

          </div>

        </section>


        {/* JOBS */}
        <section className="employer-jobs-section">

          <div className="employer-section-header">

            <div>

              <h2>
                My Jobs
              </h2>

              <p>
                Manage the jobs you have posted.
              </p>

            </div>

            <button
              className="view-all-btn"
              onClick={() =>
                navigate("/employer/jobs")
              }
            >
              View All →
            </button>

          </div>


          {/* LOADING */}
          {loading && (
            <div className="employer-message">
              Loading your jobs...
            </div>
          )}


          {/* ERROR */}
          {!loading && message && (
            <div className="employer-message">
              {message}
            </div>
          )}


          {/* NO JOBS */}
          {!loading &&
            !message &&
            jobs.length === 0 && (

              <div className="employer-empty">

                <h3>
                  No jobs posted yet
                </h3>

                <p>
                  Create your first job posting to start
                  finding candidates.
                </p>

                <button
                  onClick={() =>
                    navigate("/employer/jobs/create")
                  }
                >
                  + Post Your First Job
                </button>

              </div>
            )}


          {/* JOB LIST */}
          {!loading &&
            !message &&
            jobs.length > 0 && (

              <div className="employer-job-list">

                {jobs.slice(0, 5).map((job) => (

                  <article
                    className="employer-job-card"
                    key={job._id}
                  >

                    <div className="employer-job-info">

                      <h3>
                        {job.title}
                      </h3>

                      <p className="employer-company">
                        {job.company_name}
                      </p>

                      <p className="employer-location">
                        📍{" "}
                        {job.location ||
                          "Location not specified"}
                      </p>

                    </div>


                    <div className="employer-job-meta">

                      <span
                        className={`job-status ${
                          String(job.status || "")
                            .toLowerCase()
                            .replace(/\s+/g, "-")
                        }`}
                      >
                        {job.status || "Unknown"}
                      </span>

                      <button
                        onClick={() =>
                          navigate(
                            `/employer/jobs/${job._id}/edit`
                          )
                        }
                      >
                        Edit
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

export default EmployerDashboard;