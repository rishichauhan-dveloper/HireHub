import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminJobs.css";

function AdminJobs() {
  const navigate = useNavigate();

  const [admin, setAdmin] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const [selectedJob, setSelectedJob] = useState(null);
  const [editingJob, setEditingJob] = useState(null);
  const [saving, setSaving] = useState(false);

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
      fetchJobs();
    } catch (error) {
      console.error("Admin user error:", error);
      navigate("/login");
    }
  }, [navigate]);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      setMessage("");

      const response = await fetch(
        "http://localhost/HireHub/backend/api/jobs.php"
      );

      const data = await response.json();

      console.log("Admin jobs response:", data);

      if (data.success) {
        setJobs(data.jobs || []);
      } else {
        setMessage(data.message || "Unable to load jobs.");
      }
    } catch (error) {
      console.error("Admin jobs error:", error);
      setMessage("Unable to connect to HireHub server.");
    } finally {
      setLoading(false);
    }
  };
  const saveJob = async () => {
  if (!editingJob) return;

  try {
    setSaving(true);
    setMessage("");

    const response = await fetch(
      "http://localhost/HireHub/backend/api/jobs.php",
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          job_id: editingJob._id,
          company_name: editingJob.company_name,
          title: editingJob.title,
          description: editingJob.description,
          skills: editingJob.skills || [],
          qualification: editingJob.qualification,
          experience: editingJob.experience,
          salary: editingJob.salary,
          location: editingJob.location,
          job_type: editingJob.job_type,
          status: editingJob.status,
        }),
      }
    );

    const data = await response.json();

    console.log("Update job response:", data);

    if (data.success) {
      setEditingJob(null);
      await fetchJobs();
      setMessage("Job updated successfully.");
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

  const deactivateJob = async (job) => {
  const confirmed = window.confirm(
    `Are you sure you want to deactivate "${job.title}"?`
  );

  if (!confirmed) {
    return;
  }

  try {
    const response = await fetch(
      "http://localhost/HireHub/backend/api/jobs.php",
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          job_id: job._id,
          status: "inactive",
        }),
      }
    );

    const data = await response.json();

    console.log("Deactivate job response:", data);

    if (data.success) {
      alert("Job deactivated successfully.");
      await fetchJobs();
    } else {
      alert(data.message || "Unable to deactivate job.");
    }
  } catch (error) {
    console.error("Deactivate job error:", error);
    alert("Unable to connect to HireHub server.");
  }
};

  const deleteJob = async (job) => {
  const confirmed = window.confirm(
    `Are you sure you want to permanently delete "${job.title}"?`
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
          job_id: job._id,
        }),
      }
    );

    const data = await response.json();

    console.log("Delete job response:", data);

    if (data.success) {
      alert("Job deleted successfully.");

      setSelectedJob(null);

      await fetchJobs();
    } else {
      alert(data.message || "Unable to delete job.");
    }
  } catch (error) {
    console.error("Delete job error:", error);
    alert("Unable to connect to HireHub server.");
  }
};

  const logout = () => {
    localStorage.removeItem("hirehub_user");
    navigate("/login");
  };

  return (
    <div className="admin-jobs-page">

      <header className="admin-jobs-header">

        <div>
          <div className="admin-jobs-label">
            ADMINISTRATION
          </div>

          <h1>Jobs</h1>

          <p>
            Manage all active jobs on HireHub.
          </p>

          <small>
            Admin: {admin?.name || "HireHub Admin"}
          </small>
        </div>

        <div className="admin-jobs-header-actions">

          <button
            className="admin-back-button"
            onClick={() => navigate("/admin/dashboard")}
          >
            Back to Dashboard
          </button>

          <button
            className="admin-logout-button"
            onClick={logout}
          >
            Logout
          </button>

        </div>

      </header>


      {message && (
        <div className="admin-jobs-message">
          {message}
        </div>
      )}


      {loading ? (

        <div className="admin-jobs-loading">
          Loading jobs...
        </div>

      ) : jobs.length === 0 ? (

        <div className="admin-jobs-empty">
          <h2>No active jobs found</h2>
          <p>
            There are currently no active jobs on HireHub.
          </p>
        </div>

      ) : (

        <div>

          <div className="admin-jobs-count">
            Total Active Jobs:
            <strong>{jobs.length}</strong>
          </div>


          <div className="admin-jobs-list">

            {jobs.map((job) => (

              <article
                className="admin-job-card"
                key={job._id}
              >

                <div className="admin-job-card-top">

                  <div>
                    <h2>{job.title}</h2>

                    <h3>
                      {job.company_name || "Company not specified"}
                    </h3>
                  </div>

                  <span className="admin-job-status">
                    {(job.status || "active").toUpperCase()}
                  </span>

                </div>


                <div className="admin-job-info">

                  <div>
                    <span>Location</span>
                    <strong>
                      {job.location || "Not specified"}
                    </strong>
                  </div>

                  <div>
                    <span>Job Type</span>
                    <strong>
                      {job.job_type || "Not specified"}
                    </strong>
                  </div>

                </div>


                <p className="admin-job-description">
                  {job.description ||
                    "No description available."}
                </p>


                <div className="admin-job-actions">

                  <button
                    className="admin-view-button"
                    onClick={() => setSelectedJob(job)}
                  >
                    View
                  </button>

                  <button
                   className="admin-edit-button"
                  onClick={() => setEditingJob({ ...job })}
                  >
                    Edit
                  </button>

                  <button
                    className="admin-deactivate-button"
                    onClick={() => deactivateJob(job)}
                  >
                    Deactivate
                  </button>

                  <button
                    className="admin-delete-button"
                    onClick={() => deleteJob(job)}
                  >
                    Delete
                  </button>

                </div>

              </article>

            ))}

          </div>

        </div>

      )}

{/* EDIT JOB MODAL */}

{editingJob && (
  <div className="admin-job-modal-overlay">

    <div className="admin-job-modal">

      <div className="admin-job-modal-header">

        <div>
          <span>EDIT JOB</span>

          <h2>
            Edit Job
          </h2>
        </div>

        <button
          className="admin-modal-close"
          onClick={() => setEditingJob(null)}
        >
          ×
        </button>

      </div>

      <div className="admin-job-edit-form">

        <label>
          Job Title

          <input
            type="text"
            value={editingJob.title || ""}
            onChange={(e) =>
              setEditingJob({
                ...editingJob,
                title: e.target.value,
              })
            }
          />
        </label>

        <label>
          Company Name

          <input
            type="text"
            value={editingJob.company_name || ""}
            onChange={(e) =>
              setEditingJob({
                ...editingJob,
                company_name: e.target.value,
              })
            }
          />
        </label>

        <label>
          Location

          <input
            type="text"
            value={editingJob.location || ""}
            onChange={(e) =>
              setEditingJob({
                ...editingJob,
                location: e.target.value,
              })
            }
          />
        </label>

        <label>
          Job Type

          <input
            type="text"
            value={editingJob.job_type || ""}
            onChange={(e) =>
              setEditingJob({
                ...editingJob,
                job_type: e.target.value,
              })
            }
          />
        </label>

        <label>
          Salary

          <input
            type="text"
            value={editingJob.salary || ""}
            onChange={(e) =>
              setEditingJob({
                ...editingJob,
                salary: e.target.value,
              })
            }
          />
        </label>

        <label>
          Qualification

          <input
            type="text"
            value={editingJob.qualification || ""}
            onChange={(e) =>
              setEditingJob({
                ...editingJob,
                qualification: e.target.value,
              })
            }
          />
        </label>

        <label>
          Experience

          <input
            type="text"
            value={editingJob.experience || ""}
            onChange={(e) =>
              setEditingJob({
                ...editingJob,
                experience: e.target.value,
              })
            }
          />
        </label>

        <label>
          Description

          <textarea
            value={editingJob.description || ""}
            onChange={(e) =>
              setEditingJob({
                ...editingJob,
                description: e.target.value,
              })
            }
          />
        </label>

        <label>
          Status

          <select
            value={editingJob.status || "active"}
            onChange={(e) =>
              setEditingJob({
                ...editingJob,
                status: e.target.value,
              })
            }
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="closed">Closed</option>
          </select>
        </label>

      </div>

      <div className="admin-job-modal-footer">

        <button
          className="admin-modal-close-button"
          onClick={() => setEditingJob(null)}
          disabled={saving}
        >
          Cancel
        </button>

        <button
          className="admin-save-button"
          onClick={saveJob}
          disabled={saving}
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>

      </div>

    </div>

  </div>
)}

      {/* VIEW JOB MODAL */}

      {selectedJob && (

        <div
          className="admin-job-modal-overlay"
          onClick={() => setSelectedJob(null)}
        >

          <div
            className="admin-job-modal"
            onClick={(event) => event.stopPropagation()}
          >

            <div className="admin-job-modal-header">

              <div>
                <span>JOB DETAILS</span>

                <h2>
                  {selectedJob.title}
                </h2>
              </div>

              <button
                className="admin-modal-close"
                onClick={() => setSelectedJob(null)}
              ><span className="modal-close-x">X</span></button>

            </div>


            <div className="admin-job-modal-company">
              {selectedJob.company_name ||
                "Company not specified"}
            </div>


            <div className="admin-job-modal-grid">

              <div>
                <span>Location</span>
                <strong>
                  {selectedJob.location ||
                    "Not specified"}
                </strong>
              </div>

              <div>
                <span>Job Type</span>
                <strong>
                  {selectedJob.job_type ||
                    "Not specified"}
                </strong>
              </div>

              <div>
                <span>Status</span>
                <strong>
                  {selectedJob.status || "active"}
                </strong>
              </div>

              <div>
                <span>Qualification</span>
                <strong>
                  {selectedJob.qualification ||
                    "Not specified"}
                </strong>
              </div>

              <div>
                <span>Salary</span>
                <strong>
                  {selectedJob.salary ||
                    "Not specified"}
                </strong>
              </div>

            </div>


            <div className="admin-job-modal-section">

              <h3>Description</h3>

              <p>
                {selectedJob.description ||
                  "No description available."}
              </p>

            </div>


            {Array.isArray(selectedJob.skills) &&
              selectedJob.skills.length > 0 && (

                <div className="admin-job-modal-section">

                  <h3>Skills</h3>

                  <div className="admin-job-skills">

                    {selectedJob.skills.map(
                      (skill, index) => (
                        <span key={index}>
                          {skill}
                        </span>
                      )
                    )}

                  </div>

                </div>

              )}


            <div className="admin-job-modal-footer">

              <button
                className="admin-modal-close-button"
                onClick={() => setSelectedJob(null)}
              >
                Close
              </button>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}

export default AdminJobs;




