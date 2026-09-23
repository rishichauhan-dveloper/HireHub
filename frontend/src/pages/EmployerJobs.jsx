import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./EmployerJobs.css";

function EmployerJobs() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [jobs, setJobs] = useState([]);
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
      fetchJobs(loggedInUser.id);
    } catch (error) {
      console.error("User data error:", error);
      navigate("/login");
    }
  }, [navigate]);

  const fetchJobs = async (employerId) => {
    try {
      setLoading(true);
      setMessage("");

      const response = await fetch(
        `http://localhost/HireHub/backend/api/jobs.php?employer_id=${employerId}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        setJobs(data.jobs || []);
      } else {
        setMessage(data.message || "Unable to load jobs.");
      }
    } catch (error) {
      console.error("Fetch jobs error:", error);
      setMessage("Unable to connect to HireHub server.");
    } finally {
      setLoading(false);
    }
  };

  const deleteJob = async (jobId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this job?"
    );

    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(
        "http://localhost/HireHub/backend/api/jobs.php",
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            job_id: jobId,
          }),
        }
      );

      const data = await response.json();

      if (data.success) {
        setJobs((currentJobs) =>
          currentJobs.filter((job) => job._id !== jobId)
        );

        setMessage("Job deleted successfully.");
      } else {
        setMessage(data.message || "Unable to delete job.");
      }
    } catch (error) {
      console.error("Delete job error:", error);
      setMessage("Unable to connect to HireHub server.");
    }
  };

  const logout = () => {
    localStorage.removeItem("hirehub_user");
    navigate("/login");
  };

  return (
    <div className="employer-jobs-page">

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
            onClick={() => navigate("/employer/dashboard")}
          >
            Dashboard
          </button>

          <button
            className="active"
            onClick={() => navigate("/employer/jobs")}
          >
            My Jobs
          </button>

          <button
            onClick={() => navigate("/employer/applications")}
          >
            Applications
          </button>

        </nav>

        <button
          className="employer-logout"
          onClick={logout}
        >
          Logout
        </button>

      </aside>


      <main className="employer-jobs-main">

        <header className="employer-jobs-header">

          <div>
            <p className="employer-label">
              EMPLOYER PORTAL
            </p>

            <h1>
              My Jobs
            </h1>

            <p>
              Manage all the jobs you have posted.
            </p>
          </div>

          <button
            className="create-job-button"
            onClick={() => navigate("/employer/jobs/create")}
          >
            + Post a Job
          </button>

        </header>


        {message && (
          <div className="employer-jobs-message">
            {message}
          </div>
        )}


        {loading ? (

          <div className="employer-jobs-empty">
            <h3>
              Loading jobs...
            </h3>
          </div>

        ) : jobs.length === 0 ? (

          <div className="employer-jobs-empty">

            <h2>
              No jobs found
            </h2>

            <p>
              You haven't posted any jobs yet.
            </p>

            <button
              onClick={() => navigate("/employer/jobs/create")}
            >
              + Post Your First Job
            </button>

          </div>

        ) : (

          <div className="employer-jobs-list">

            {jobs.map((job) => (

              <article
                className="employer-full-job-card"
                key={job._id}
              >

                <div className="employer-full-job-content">

                  <div className="employer-full-job-title">

                    <h2>
                      {job.title}
                    </h2>

                    <span
                      className={`job-status ${
                        String(job.status || "")
                          .toLowerCase()
                          .replace(/\s+/g, "-")
                      }`}
                    >
                      {job.status}
                    </span>

                  </div>

                  <p className="employer-company">
                    {job.company_name}
                  </p>

                  <div className="employer-job-details">

                    <span>
                      📍 {job.location || "Location not specified"}
                    </span>

                    <span>
                      💼 {job.job_type || "Full Time"}
                    </span>

                    <span>
                      💰 {job.salary || "Salary not specified"}
                    </span>

                    <span>
                      🎓 {job.qualification || "Qualification not specified"}
                    </span>

                  </div>

                  <p className="employer-job-description">
                    {job.description}
                  </p>

                  {Array.isArray(job.skills) && job.skills.length > 0 && (

                    <div className="employer-job-skills">

                      {job.skills.map((skill, index) => (
                        <span key={index}>
                          {skill}
                        </span>
                      ))}

                    </div>

                  )}

                </div>


                <div className="employer-full-job-actions">

  <button
    className="edit-job-button"
    onClick={() =>
      navigate(`/employer/jobs/${job._id}/edit`)
    }
  >
    Edit
  </button>

  <button
    className="matching-candidates-button"
    onClick={() =>
      navigate(`/employer/matching/${job._id}`)
    }
  >
    ✨ Find Matching Candidates
  </button>

  <button
    className="delete-job-button"
    onClick={() => deleteJob(job._id)}
  >
    Delete
  </button>

</div>

              </article>

            ))}

          </div>

        )}

      </main>

    </div>
  );
}

export default EmployerJobs;