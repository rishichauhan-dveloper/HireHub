import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./EmployerApplicationDetails.css";

function EmployerApplicationDetails() {
  const navigate = useNavigate();
  const { applicationId } = useParams();

  const [user, setUser] = useState(null);
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [updatingStatus, setUpdatingStatus] = useState(false);

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
      fetchApplication(loggedInUser.id);
    } catch (error) {
      console.error("User data error:", error);
      navigate("/login");
    }
  }, [navigate, applicationId]);

  const fetchApplication = async (employerId) => {
    try {
      setLoading(true);

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/applications.php?employer_id=${employerId}`
      );

      const data = await response.json();

      if (!data.success) {
        setMessage(data.message || "Unable to load application.");
        return;
      }

      const found = (data.applications || []).find(
        (item) => String(item._id) === String(applicationId)
      );

      if (!found) {
        setMessage("Application not found.");
        return;
      }

      setApplication(found);
    } catch (error) {
      console.error("Application details error:", error);
      setMessage("Unable to connect to HireHub server.");
    } finally {
      setLoading(false);
    }
  };
  const updateStatus = async (newStatus) => {
    if (!application?._id) {
      return;
    }

    try {
      setUpdatingStatus(true);
      setMessage("");

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/applications.php`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            application_id: application._id,
            status: newStatus,
          }),
        }
      );

      const data = await response.json();

      if (data.success) {
        setApplication((previous) => ({
          ...previous,
          status: newStatus,
        }));

        setMessage(
          "Application status updated successfully."
        );
      } else {
        setMessage(
          data.message ||
            "Unable to update application status."
        );
      }
    } catch (error) {
      console.error(
        "Status update error:",
        error
      );

      setMessage(
        "Unable to connect to HireHub server."
      );
    } finally {
      setUpdatingStatus(false);
    }
  };
  const formatDate = (date) => {
    if (!date) return "N/A";

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
    } catch {
      return "N/A";
    }
  };

  const logout = () => {
    localStorage.removeItem("hirehub_user");
    navigate("/login");
  };

  return (
    <div className="employer-details-page">

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

        </nav>

        <button
          className="employer-logout"
          onClick={logout}
        >
          Logout
        </button>

      </aside>

      <main className="employer-details-main">

        <button
          className="back-button"
          onClick={() =>
            navigate("/employer/applications")
          }
        >
          ← Back to Applications
        </button>

        {loading && (
          <div className="details-message">
            Loading application...
          </div>
        )}

        {!loading && message && (
          <div className="details-message">
            {message}
          </div>
        )}

        {!loading && application && (
          <>
            <header className="details-header">

              <div>
                <p className="employer-label">
                  APPLICATION DETAILS
                </p>

                <h1>
                  {application.candidate_name ||
                    "Candidate"}
                </h1>

                <p>
                  Application for{" "}
                  <strong>
                    {application.job_title ||
                      "Job"}
                  </strong>
                </p>
              </div>

              <div className="application-status-control">
  <label>Status</label>

  <select
    value={application.status || "Applied"}
    onChange={(e) =>
      updateStatus(e.target.value)
    }
    disabled={updatingStatus}
  >
    <option value="Applied">Applied</option>
    <option value="Under Review">Under Review</option>
    <option value="Shortlisted">Shortlisted</option>
    <option value="Interview">Interview</option>
    <option value="Selected">Selected</option>
    <option value="Rejected">Rejected</option>
  </select>

  {updatingStatus && (
    <small>Updating...</small>
  )}
</div>
{application.status === "Shortlisted" && (
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
)}
            </header>

            <section className="details-card">

              <h2>Candidate Information</h2>

              <div className="details-grid">

                <div>
                  <label>Name</label>
                  <p>
                    {application.candidate_name ||
                      "N/A"}
                  </p>
                </div>

                <div>
                  <label>Email</label>
                  <p>
                    {application.candidate_email ||
                      "N/A"}
                  </p>
                </div>

              </div>

            </section>

            <section className="details-card">

              <h2>Job Information</h2>

              <div className="details-grid">

                <div>
                  <label>Job Title</label>
                  <p>
                    {application.job_title ||
                      "N/A"}
                  </p>
                </div>

                <div>
                  <label>Company</label>
                  <p>
                    {application.company_name ||
                      "N/A"}
                  </p>
                </div>

                <div>
                  <label>Applied On</label>
                  <p>
                    {formatDate(
                      application.applied_at
                    )}
                  </p>
                </div>

              </div>

            </section>

            <section className="details-card">

              <h2>Cover Letter</h2>

              <div className="cover-letter">
                {application.cover_letter ||
                  "No cover letter provided."}
              </div>

            </section>

          </>
        )}

      </main>

    </div>
  );
}

export default EmployerApplicationDetails;