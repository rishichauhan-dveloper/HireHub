import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./JobDetails.css";

function JobDetails() {
  const { jobId } = useParams();
  const navigate = useNavigate();

  const [job, setJob] = useState(null);
  const [coverLetter, setCoverLetter] = useState("");
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [message, setMessage] = useState("");

  const [alreadyApplied, setAlreadyApplied] = useState(false);
  const [checkingApplication, setCheckingApplication] = useState(true);

  useEffect(() => {
    fetchJob();
  }, [jobId]);

  useEffect(() => {
    checkExistingApplication();
  }, [jobId]);

  const fetchJob = async () => {
    try {
      const response = await fetch(
        `http://localhost/HireHub/backend/api/jobs.php?id=${jobId}`
      );

      const data = await response.json();

      if (data.success) {
        setJob(data.job);
      } else {
        setMessage(data.message || "Job not found.");
      }
    } catch (error) {
      console.error("Job fetch error:", error);
      setMessage("Unable to load job.");
    } finally {
      setLoading(false);
    }
  };

  const checkExistingApplication = async () => {
    const savedUser = localStorage.getItem("hirehub_user");

    if (!savedUser) {
      setCheckingApplication(false);
      return;
    }

    try {
      const user = JSON.parse(savedUser);

      const response = await fetch(
        `http://localhost/HireHub/backend/api/applications.php?candidate_id=${user.id}`
      );

      const data = await response.json();

      if (data.success) {
        const exists = (data.applications || []).some(
          (application) => application.job_id === jobId
        );

        setAlreadyApplied(exists);
      }
    } catch (error) {
      console.error("Application check error:", error);
    } finally {
      setCheckingApplication(false);
    }
  };

  const handleApply = async (e) => {
    e.preventDefault();

    const savedUser = localStorage.getItem("hirehub_user");

    if (!savedUser) {
      navigate("/login");
      return;
    }

    const user = JSON.parse(savedUser);

    if (!coverLetter.trim()) {
      setMessage("Please enter a cover letter.");
      return;
    }

    setApplying(true);
    setMessage("");

    try {
      const response = await fetch(
        "http://localhost/HireHub/backend/api/applications.php",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            job_id: job._id,
            candidate_id: user.id,
            employer_id: job.employer_id,
            candidate_name: user.name,
            candidate_email: user.email,
            job_title: job.title,
            company_name: job.company_name,
            cover_letter: coverLetter,
          }),
        }
      );

      const data = await response.json();

      if (data.success) {
        setMessage("Application submitted successfully! 🎉");
        setCoverLetter("");
        setAlreadyApplied(true);
      } else {
        setMessage(data.message || "Application failed.");
      }
    } catch (error) {
      console.error("Application error:", error);
      setMessage("Unable to submit application.");
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <div className="job-details-page">
        <div className="job-loading">
          Loading job...
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="job-details-page">
        <div className="job-loading">
          {message || "Job not found."}
        </div>
      </div>
    );
  }

  return (
    <div className="job-details-page">

      <header className="job-details-header">

        <div className="jobs-logo">
          Hire<span>Hub</span>
        </div>

        <button
          onClick={() => navigate("/jobs")}
          className="back-jobs"
        >
          ← Back to Jobs
        </button>

      </header>

      <main className="job-details-container">

        <section className="job-info-card">

          <div className="job-company-icon">
            {job.company_name?.charAt(0).toUpperCase()}
          </div>

          <div className="job-info">

            <span className="job-status">
              {job.status}
            </span>

            <h1>{job.title}</h1>

            <h2>{job.company_name}</h2>

            <div className="job-meta">

              <span>📍 {job.location}</span>
              <span>💼 {job.experience}</span>
              <span>💰 {job.salary}</span>
              <span>🕐 {job.job_type}</span>

            </div>

          </div>

        </section>

        <div className="job-details-grid">

          <section className="job-description-card">

            <h2>About this job</h2>

            <p>
              {job.description}
            </p>

            <h2>Required Skills</h2>

            <div className="detail-skills">

              {job.skills?.map((skill) => (
                <span key={skill}>
                  {skill}
                </span>
              ))}

            </div>

            <h2>Qualification</h2>

            <p>
              {job.qualification}
            </p>

          </section>

          <aside className="apply-card">

            <h2>
              Apply for this job
            </h2>

            <p>
              Submit your application to{" "}
              {job.company_name}.
            </p>

            {checkingApplication ? (

              <div className="application-checking">
                Checking application status...
              </div>

            ) : alreadyApplied ? (

              <div className="already-applied">

                <div className="already-applied-icon">
                  ✓
                </div>

                <h3>
                  Already Applied
                </h3>

                <p>
                  You have already applied for this position.
                </p>

                <button
                  type="button"
                  onClick={() =>
                    navigate("/applications")
                  }
                  className="view-application-button"
                >
                  View My Applications →
                </button>

              </div>

            ) : (

              <form onSubmit={handleApply}>

                <label>
                  Cover Letter
                </label>

                <textarea
                  value={coverLetter}
                  onChange={(e) =>
                    setCoverLetter(e.target.value)
                  }
                  placeholder="Tell the employer why you're a good fit..."
                  rows="8"
                />

                <button
                  type="submit"
                  disabled={applying}
                  className="apply-button"
                >
                  {applying
                    ? "Submitting..."
                    : "Submit Application →"}
                </button>

              </form>

            )}

            {message && (
              <div className="apply-message">
                {message}
              </div>
            )}

          </aside>

        </div>

      </main>

    </div>
  );
}

export default JobDetails;