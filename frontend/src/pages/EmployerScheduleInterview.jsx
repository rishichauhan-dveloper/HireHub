import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./EmployerScheduleInterview.css";

function EmployerScheduleInterview() {
  const navigate = useNavigate();
  const { applicationId } = useParams();

  const [user, setUser] = useState(null);
  const [application, setApplication] = useState(null);
  const [interview, setInterview] = useState(null);

  const [form, setForm] = useState({
    interview_date: "",
    interview_time: "",
    interview_type: "Online",
    meeting_link: "",
    location: "",
    notes: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [message, setMessage] = useState("");

  /*
  |--------------------------------------------------------------------------
  | Load User / Application / Interview
  |--------------------------------------------------------------------------
  */

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

      if (!applicationId) {
        setMessage("Application ID is missing.");
        setLoading(false);
        return;
      }

      fetchApplication(applicationId, loggedInUser.id);
      fetchInterview(applicationId);
    } catch (error) {
      console.error("User data error:", error);
      navigate("/login");
    }
  }, [navigate, applicationId]);

  /*
  |--------------------------------------------------------------------------
  | Fetch Application
  |--------------------------------------------------------------------------
  */

  const fetchApplication = async (id, employerId) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/applications.php?employer_id=${employerId}`
      );

      const data = await response.json();

      if (!data.success) {
        setMessage(
          data.message || "Unable to load application."
        );
        return;
      }

      const foundApplication = (data.applications || []).find(
        (item) => String(item._id) === String(id)
      );

      if (!foundApplication) {
        setMessage("Application not found.");
        return;
      }

      setApplication(foundApplication);
    } catch (error) {
      console.error("Application error:", error);
      setMessage(
        "Unable to connect to HireHub server."
      );
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Fetch Existing Interview
  |--------------------------------------------------------------------------
  */

  const fetchInterview = async (id) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/interviews.php?application_id=${id}`
      );

      const data = await response.json();

      if (!data.success) {
        setInterview(null);
        return;
      }

      const interviews = data.interviews || [];

      const activeInterview = interviews.find(
        (item) =>
          item.status !== "cancelled" &&
          item.status !== "completed"
      );

      if (activeInterview) {
        setInterview(activeInterview);

        setForm({
          interview_date:
            activeInterview.interview_date || "",

          interview_time:
            activeInterview.interview_time || "",

          interview_type:
            activeInterview.interview_type || "Online",

          meeting_link:
            activeInterview.meeting_link || "",

          location:
            activeInterview.location || "",

          notes:
            activeInterview.notes || "",
        });
      } else {
        setInterview(null);
      }
    } catch (error) {
      console.error("Interview error:", error);
    } finally {
      setLoading(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Form Change
  |--------------------------------------------------------------------------
  */

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }));
  };

  /*
  |--------------------------------------------------------------------------
  | Schedule New Interview
  |--------------------------------------------------------------------------
  */

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!application) {
      setMessage(
        "Application information is missing."
      );
      return;
    }

    if (!form.interview_date || !form.interview_time) {
      setMessage(
        "Interview date and time are required."
      );
      return;
    }

    try {
      setSaving(true);
      setMessage("");

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/interviews.php`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            application_id: application._id,
            candidate_id: application.candidate_id,
            employer_id: application.employer_id,
            job_id: application.job_id,

            interview_date:
              form.interview_date,

            interview_time:
              form.interview_time,

            interview_type:
              form.interview_type,

            meeting_link:
              form.meeting_link,

            location:
              form.location,

            notes:
              form.notes,
          }),
        }
      );

      const data = await response.json();

      if (data.success) {
        setMessage(
          "Interview scheduled successfully."
        );

        await fetchInterview(application._id);
      } else {
        setMessage(
          data.message ||
            "Unable to schedule interview."
        );
      }
    } catch (error) {
      console.error(
        "Schedule interview error:",
        error
      );

      setMessage(
        "Unable to connect to HireHub server."
      );
    } finally {
      setSaving(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | UPDATE EXISTING INTERVIEW
  |--------------------------------------------------------------------------
  */

  const updateInterview = async (event) => {
    event.preventDefault();

    if (!interview?._id) {
      setMessage(
        "No active interview found."
      );
      return;
    }

    if (!form.interview_date || !form.interview_time) {
      setMessage(
        "Interview date and time are required."
      );
      return;
    }

    try {
      setSaving(true);
      setMessage("");

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/interviews.php`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            interview_id: interview._id,

            interview_date:
              form.interview_date,

            interview_time:
              form.interview_time,

            interview_type:
              form.interview_type,

            meeting_link:
              form.meeting_link,

            location:
              form.location,

            notes:
              form.notes,
          }),
        }
      );

      const data = await response.json();

      console.log(
        "Update interview response:",
        data
      );

      if (data.success) {
        setMessage(
          "Interview updated successfully."
        );

        await fetchInterview(
          application._id
        );
      } else {
        setMessage(
          data.message ||
            "Unable to update interview."
        );
      }
    } catch (error) {
      console.error(
        "Update interview error:",
        error
      );

      setMessage(
        "Unable to connect to HireHub server."
      );
    } finally {
      setSaving(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Cancel Interview
  |--------------------------------------------------------------------------
  */

  const cancelInterview = async () => {
    if (!interview?._id) {
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to cancel this interview?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setCancelling(true);
      setMessage("");

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/interviews.php`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            interview_id: interview._id,
          }),
        }
      );

      const data = await response.json();

      if (data.success) {
        setInterview(null);

        setForm({
          interview_date: "",
          interview_time: "",
          interview_type: "Online",
          meeting_link: "",
          location: "",
          notes: "",
        });

        setMessage(
          "Interview cancelled successfully."
        );
      } else {
        setMessage(
          data.message ||
            "Unable to cancel interview."
        );
      }
    } catch (error) {
      console.error(
        "Cancel interview error:",
        error
      );

      setMessage(
        "Unable to connect to HireHub server."
      );
    } finally {
      setCancelling(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Loading
  |--------------------------------------------------------------------------
  */

  if (loading) {
    return (
      <div className="schedule-interview-page">
        <div className="schedule-interview-container">
          <h2>Loading application...</h2>
        </div>
      </div>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Page
  |--------------------------------------------------------------------------
  */

  return (
    <div className="schedule-interview-page">

      <div className="schedule-interview-container">

        {/* BACK */}

        <button
          className="schedule-back-button"
          onClick={() =>
            navigate(
              "/employer/applications"
            )
          }
        >
          ← Back to Applications
        </button>


        {/* HEADER */}

        <div className="schedule-interview-header">

          <p className="schedule-interview-label">
            EMPLOYER PORTAL
          </p>

          <h1>
            {interview
              ? "Manage Interview"
              : "Schedule Interview"}
          </h1>

          <p>
            Schedule, update and manage
            candidate interviews.
          </p>

        </div>


        {/* APPLICATION INFO */}

        {application && (
          <div className="schedule-application-card">

            <h2>
              {application.candidate_name ||
                application.name ||
                "Candidate"}
            </h2>

            <p>
              {application.candidate_email ||
                application.email ||
                ""}
            </p>

            <p>
              {application.job_title ||
                application.title ||
                "Job Application"}
            </p>

          </div>
        )}


        {/* MESSAGE */}

        {message && (
          <div className="schedule-message">
            {message}
          </div>
        )}


        {/* EXISTING INTERVIEW */}

        {interview && (
          <div className="existing-interview-card">

            <p className="existing-interview-label">
              EXISTING INTERVIEW
            </p>

            <h2>
              Interview Scheduled
            </h2>

            <span className="interview-status">
              {interview.status || "Scheduled"}
            </span>

            <div className="existing-interview-details">

              <div>
                <strong>Date</strong>
                <span>
                  {interview.interview_date}
                </span>
              </div>

              <div>
                <strong>Time</strong>
                <span>
                  {interview.interview_time}
                </span>
              </div>

              <div>
                <strong>Type</strong>
                <span>
                  {interview.interview_type ||
                    "Online"}
                </span>
              </div>

              <div>
                <strong>Location</strong>
                <span>
                  {interview.location || "N/A"}
                </span>
              </div>

            </div>

            {interview.meeting_link && (
              <div className="existing-interview-link">

                <strong>
                  Meeting Link
                </strong>

                <a
                  href={
                    interview.meeting_link
                  }
                  target="_blank"
                  rel="noreferrer"
                >
                  {interview.meeting_link}
                </a>

              </div>
            )}

            {interview.notes && (
              <div className="existing-interview-notes">

                <strong>
                  Notes
                </strong>

                <p>
                  {interview.notes}
                </p>

              </div>
            )}

          </div>
        )}


        {/* FORM */}

        <form
          className="schedule-interview-form"
          onSubmit={
            interview
              ? updateInterview
              : handleSubmit
          }
        >

          <div className="form-section">

            <h2>
              {interview
                ? "Update Interview"
                : "Interview Details"}
            </h2>

            <div className="form-grid">

              {/* DATE */}

              <div className="form-group">

                <label htmlFor="interview_date">
                  Interview Date
                </label>

                <input
                  id="interview_date"
                  type="date"
                  name="interview_date"
                  value={
                    form.interview_date
                  }
                  onChange={handleChange}
                  required
                />

              </div>


              {/* TIME */}

              <div className="form-group">

                <label htmlFor="interview_time">
                  Interview Time
                </label>

                <input
                  id="interview_time"
                  type="time"
                  name="interview_time"
                  value={
                    form.interview_time
                  }
                  onChange={handleChange}
                  required
                />

              </div>


              {/* TYPE */}

              <div className="form-group">

                <label htmlFor="interview_type">
                  Interview Type
                </label>

                <select
                  id="interview_type"
                  name="interview_type"
                  value={
                    form.interview_type
                  }
                  onChange={handleChange}
                >

                  <option value="Online">
                    Online
                  </option>

                  <option value="In-Person">
                    In-Person
                  </option>

                  <option value="Phone">
                    Phone
                  </option>

                </select>

              </div>


              {/* MEETING LINK */}

              <div className="form-group">

                <label htmlFor="meeting_link">
                  Meeting Link
                </label>

                <input
                  id="meeting_link"
                  type="url"
                  name="meeting_link"
                  placeholder="https://meet.google.com/..."
                  value={
                    form.meeting_link
                  }
                  onChange={handleChange}
                />

              </div>


              {/* LOCATION */}

              <div className="form-group">

                <label htmlFor="location">
                  Location
                </label>

                <input
                  id="location"
                  type="text"
                  name="location"
                  placeholder="Interview location"
                  value={
                    form.location
                  }
                  onChange={handleChange}
                />

              </div>

            </div>


            {/* NOTES */}

            <div className="form-group">

              <label htmlFor="notes">
                Notes
              </label>

              <textarea
                id="notes"
                name="notes"
                rows="5"
                placeholder="Add interview notes..."
                value={form.notes}
                onChange={handleChange}
              />

            </div>


            {/* BUTTONS */}

            <div className="schedule-action-buttons">

              <button
                type="submit"
                className="schedule-submit-button"
                disabled={saving}
              >
                {saving
                  ? "Saving..."
                  : interview
                    ? "Update Interview"
                    : "Schedule Interview"}
              </button>


              {interview && (
                <button
                  type="button"
                  className="schedule-cancel-button"
                  onClick={
                    cancelInterview
                  }
                  disabled={cancelling}
                >
                  {cancelling
                    ? "Cancelling..."
                    : "Cancel Interview"}
                </button>
              )}

            </div>

          </div>

        </form>

      </div>

    </div>
  );
}

export default EmployerScheduleInterview;