import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./EmployerCreateJob.css";

function EmployerEditJob() {
  const { jobId } = useParams();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const [form, setForm] = useState({
    company_name: "",
    title: "",
    description: "",
    location: "",
    job_type: "",
    experience: "",
    salary: "",
    qualification: "",
    skills: "",
    status: "active",
  });

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
      fetchJob(jobId);
    } catch (error) {
      console.error("User data error:", error);
      navigate("/login");
    }
  }, [navigate, jobId]);

  const fetchJob = async (id) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/jobs.php?id=${id}`
      );

      const data = await response.json();

      if (!data.success) {
        setMessage(data.message || "Unable to load job.");
        return;
      }

      const job = data.job;

      setForm({
        company_name: job.company_name || "",
        title: job.title || "",
        description: job.description || "",
        location: job.location || "",
        job_type: job.job_type || "",
        experience: job.experience || "",
        salary: job.salary || "",
        qualification: job.qualification || "",
        skills: Array.isArray(job.skills)
          ? job.skills.join(", ")
          : job.skills || "",
        status: job.status || "active",
      });
    } catch (error) {
      console.error("Fetch job error:", error);
      setMessage("Unable to connect to HireHub server.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!user?.id) {
      setMessage("User session not found.");
      return;
    }

    setSaving(true);
    setMessage("");

    try {
      const payload = {
        job_id: jobId,
        employer_id: user.id,
        company_name: form.company_name,
        title: form.title,
        description: form.description,
        location: form.location,
        job_type: form.job_type,
        experience: form.experience,
        salary: form.salary,
        qualification: form.qualification,
        skills: form.skills
          .split(",")
          .map((skill) => skill.trim())
          .filter(Boolean),
        status: form.status,
      };

      const response = await fetch(
        "${import.meta.env.VITE_API_URL}/api/jobs.php",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();

      if (data.success) {
        setMessage("Job updated successfully.");

        setTimeout(() => {
          navigate("/employer/jobs");
        }, 800);
      } else {
        setMessage(data.message || "Unable to update job.");
      }
    } catch (error) {
      console.error("Update job error:", error);
      setMessage("Unable to connect to HireHub server.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="employer-create-job-page">
        <div className="create-job-loading">
          Loading job...
        </div>
      </div>
    );
  }

  return (
    <div className="employer-create-job-page">

      <aside className="employer-sidebar">

        <div className="employer-logo">
          Hire<span>Hub</span>
        </div>

        <div className="employer-user-box">
          <div className="employer-avatar">
            {user?.name?.charAt(0)?.toUpperCase() || "E"}
          </div>

          <div>
            <strong>{user?.name || "Employer"}</strong>
            <small>Employer</small>
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
          onClick={() => {
            localStorage.removeItem("hirehub_user");
            navigate("/login");
          }}
        >
          Logout
        </button>

      </aside>

      <main className="employer-create-job-main">

        <header className="employer-create-job-header">

          <div>
            <p className="employer-label">
              EMPLOYER PORTAL
            </p>

            <h1>
              Edit Job
            </h1>

            <p>
              Update your job posting information.
            </p>
          </div>

          <button
            type="button"
            className="back-button"
            onClick={() => navigate("/employer/jobs")}
          >
            Back to My Jobs
          </button>

        </header>

        {message && (
          <div className="create-job-message">
            {message}
          </div>
        )}

        <form
          className="create-job-form"
          onSubmit={handleSubmit}
        >

          <div className="create-job-card">

            <h2>Job Information</h2>

            <div className="create-job-grid">

              <div className="form-group">
                <label>Company Name</label>
                <input
                  name="company_name"
                  value={form.company_name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Job Title</label>
                <input
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Location</label>
                <input
                  name="location"
                  value={form.location}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>Job Type</label>
                <input
                  name="job_type"
                  value={form.job_type}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>Experience</label>
                <input
                  name="experience"
                  value={form.experience}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>Salary</label>
                <input
                  name="salary"
                  value={form.salary}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>Qualification</label>
                <input
                  name="qualification"
                  value={form.qualification}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>Status</label>

                <select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                >
                  <option value="active">Active</option>
                  <option value="closed">Closed</option>
                </select>
              </div>

            </div>

            <div className="form-group">

              <label>Skills</label>

              <input
                name="skills"
                value={form.skills}
                onChange={handleChange}
                placeholder="PHP, React, MongoDB, JavaScript"
              />

              <small>
                Separate skills with commas.
              </small>

            </div>

            <div className="form-group">

              <label>Description</label>

              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows="7"
                required
              />

            </div>

          </div>

          <div className="create-job-actions">

            <button
              type="button"
              onClick={() => navigate("/employer/jobs")}
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
            >
              {saving ? "Updating..." : "Update Job"}
            </button>

          </div>

        </form>

      </main>

    </div>
  );
}

export default EmployerEditJob;