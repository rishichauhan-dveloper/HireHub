import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./EmployerInterviews.css";

function EmployerInterviews() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [interviews, setInterviews] = useState([]);
  const [applications, setApplications] = useState([]);

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const [feedbackInterview, setFeedbackInterview] = useState(null);
  const [feedback, setFeedback] = useState("");
  const [rating, setRating] = useState(5);
  const [savingFeedback, setSavingFeedback] = useState(false);

  const [cancellingId, setCancellingId] = useState(null);

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
      fetchData(loggedInUser.id);
    } catch (error) {
      console.error("User error:", error);
      navigate("/login");
    }
  }, [navigate]);

  const fetchData = async (employerId) => {
    try {
      setLoading(true);
      setMessage("");

      const [
        interviewsResponse,
        applicationsResponse,
      ] = await Promise.all([
        fetch(
          `http://localhost/HireHub/backend/api/interviews.php?employer_id=${employerId}`
        ),
        fetch(
          `http://localhost/HireHub/backend/api/applications.php?employer_id=${employerId}`
        ),
      ]);

      const interviewsData =
        await interviewsResponse.json();

      const applicationsData =
        await applicationsResponse.json();

      if (!interviewsData.success) {
        setMessage(
          interviewsData.message ||
            "Unable to load interviews."
        );
        return;
      }

      setInterviews(
        interviewsData.interviews || []
      );

      if (applicationsData.success) {
        setApplications(
          applicationsData.applications || []
        );
      }
    } catch (error) {
      console.error(
        "Interview management error:",
        error
      );

      setMessage(
        "Unable to connect to HireHub server."
      );
    } finally {
      setLoading(false);
    }
  };

  const getApplication = (applicationId) => {
    return applications.find(
      (application) =>
        String(application._id) ===
        String(applicationId)
    );
  };

  const formatDate = (date) => {
    if (!date) {
      return "N/A";
    }

    try {
      return new Date(
        `${date}T00:00:00`
      ).toLocaleDateString(undefined, {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch {
      return date;
    }
  };

  const cancelInterview = async (interviewId) => {
    const confirmed = window.confirm(
      "Are you sure you want to cancel this interview?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setCancellingId(interviewId);
      setMessage("");

      const response = await fetch(
        "http://localhost/HireHub/backend/api/interviews.php",
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
            String(interview._id) ===
            String(interviewId)
              ? {
                  ...interview,
                  status: "cancelled",
                }
              : interview
          )
        );

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
      setCancellingId(null);
    }
  };

  const completeInterview = async () => {
    if (!feedbackInterview) {
      return;
    }

    if (!feedback.trim()) {
      setMessage(
        "Please enter interview feedback."
      );
      return;
    }

    try {
      setSavingFeedback(true);
      setMessage("");

      const response = await fetch(
        "http://localhost/HireHub/backend/api/interviews.php",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            interview_id:
              feedbackInterview._id,
            status: "completed",
            feedback: feedback.trim(),
            rating: Number(rating),
          }),
        }
      );

      const data = await response.json();

      if (data.success) {
        setInterviews((current) =>
          current.map((interview) =>
            String(interview._id) ===
            String(feedbackInterview._id)
              ? {
                  ...interview,
                  status: "completed",
                  feedback: feedback.trim(),
                  rating: Number(rating),
                }
              : interview
          )
        );

        setMessage(
          "Interview completed and feedback saved successfully."
        );

        setFeedbackInterview(null);
        setFeedback("");
        setRating(5);
      } else {
        setMessage(
          data.message ||
            "Unable to complete interview."
        );
      }
    } catch (error) {
      console.error(
        "Complete interview error:",
        error
      );

      setMessage(
        "Unable to connect to HireHub server."
      );
    } finally {
      setSavingFeedback(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("hirehub_user");
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="employer-interviews-page">
        <div className="employer-interviews-container">
          <h2>Loading interviews...</h2>
        </div>
      </div>
    );
  }

  const activeInterviews =
    interviews.filter(
      (interview) =>
        interview.status !== "cancelled" &&
        interview.status !== "completed"
    );

  const completedInterviews =
    interviews.filter(
      (interview) =>
        interview.status === "completed"
    );

  return (
    <div className="employer-interviews-page">

      <header className="employer-interviews-header">

        <div className="employer-interviews-logo">
          Hire<span>Hub</span>
        </div>

        <div className="employer-interviews-user">

          <strong>
            {user?.name || "Employer"}
          </strong>

          <button onClick={logout}>
            Logout
          </button>

        </div>

      </header>

      <main className="employer-interviews-container">

        <button
          className="employer-interviews-back"
          onClick={() =>
            navigate("/employer/applications")
          }
        >
          Back to Applications
        </button>

        <div className="employer-interviews-title">

          <p>EMPLOYER PORTAL</p>

          <h1>
            Interview Management
          </h1>

          <span>
            Schedule, manage and review candidate interviews.
          </span>

        </div>

        {message && (
          <div className="employer-interviews-message">
            {message}
          </div>
        )}

        <section className="interviews-section">

          <div className="section-heading">

            <h2>
              Active Interviews
            </h2>

            <span>
              {activeInterviews.length}
            </span>

          </div>

          {activeInterviews.length === 0 ? (

            <div className="no-interviews">
              <h3>
                No active interviews
              </h3>

              <p>
                Scheduled interviews will appear here.
              </p>
            </div>

          ) : (

            <div className="interviews-list">

              {activeInterviews.map(
                (interview) => {

                  const application =
                    getApplication(
                      interview.application_id
                    );

                  return (
                    <article
                      className="employer-interview-card"
                      key={interview._id}
                    >

                      <div className="employer-interview-header">

                        <div>

                          <h2>
                            {application?.candidate_name ||
                              "Candidate"}
                          </h2>

                          <p>
                            {application?.candidate_email ||
                              "Email not available"}
                          </p>

                        </div>

                        <span className="interview-status">
                          {interview.status}
                        </span>

                      </div>

                      <div className="employer-interview-job">

                        <strong>
                          {application?.job_title ||
                            "Job"}
                        </strong>

                        <span>
                          {application?.company_name ||
                            "HireHub"}
                        </span>

                      </div>

                      <div className="employer-interview-details">

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
                            {interview.interview_time}
                          </strong>
                        </div>

                        <div>
                          <span>Type</span>

                          <strong>
                            {interview.interview_type ||
                              "N/A"}
                          </strong>
                        </div>

                      </div>

                      {interview.location && (
                        <div className="interview-location">

                          <strong>
                            Location:
                          </strong>{" "}

                          {interview.location}

                        </div>
                      )}

                      {interview.meeting_link && (
                        <div className="interview-location">

                          <strong>
                            Meeting:
                          </strong>{" "}

                          <a
                            href={
                              interview.meeting_link
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Join Meeting
                          </a>

                        </div>
                      )}

                      {interview.notes && (
                        <div className="interview-notes">

                          <strong>
                            Notes
                          </strong>

                          <p>
                            {interview.notes}
                          </p>

                        </div>
                      )}

                      <div className="employer-interview-actions">

                        {interview.meeting_link && (
                          <a
                            href={
                              interview.meeting_link
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className="join-meeting-button"
                          >
                            Join Meeting
                          </a>
                        )}

                        <button
                          className="complete-interview-button"
                          onClick={() => {
                            setFeedbackInterview(
                              interview
                            );
                            setFeedback("");
                            setRating(5);
                          }}
                        >
                          Complete Interview
                        </button>

                        <button
                          className="cancel-interview-button"
                          onClick={() =>
                            cancelInterview(
                              interview._id
                            )
                          }
                          disabled={
                            cancellingId ===
                            interview._id
                          }
                        >
                          {cancellingId ===
                          interview._id
                            ? "Cancelling..."
                            : "Cancel Interview"}
                        </button>

                      </div>

                    </article>
                  );
                }
              )}

            </div>
          )}

        </section>

        <section className="interviews-section">

          <div className="section-heading">

            <h2>
              Completed Interviews
            </h2>

            <span>
              {completedInterviews.length}
            </span>

          </div>

          {completedInterviews.length === 0 ? (

            <div className="no-interviews">
              <h3>
                No completed interviews
              </h3>

              <p>
                Completed interviews will appear here.
              </p>
            </div>

          ) : (

            <div className="interviews-list">

              {completedInterviews.map(
                (interview) => {

                  const application =
                    getApplication(
                      interview.application_id
                    );

                  return (
                    <article
                      className="employer-interview-card completed"
                      key={interview._id}
                    >

                      <div className="employer-interview-header">

                        <div>

                          <h2>
                            {application?.candidate_name ||
                              "Candidate"}
                          </h2>

                          <p>
                            {application?.candidate_email ||
                              "Email not available"}
                          </p>

                        </div>

                        <span className="interview-status">
                          Completed
                        </span>

                      </div>

                      <div className="employer-interview-job">

                        <strong>
                          {application?.job_title ||
                            "Job"}
                        </strong>

                        <span>
                          {application?.company_name ||
                            "HireHub"}
                        </span>

                      </div>

                      <div className="employer-interview-details">

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
                            {interview.interview_time}
                          </strong>
                        </div>

                        <div>
                          <span>Rating</span>

                          <strong>
                            {interview.rating
                              ? `${interview.rating}/5`
                              : "N/A"}
                          </strong>
                        </div>

                      </div>

                      {interview.feedback && (
                        <div className="interview-notes">

                          <strong>
                            Feedback
                          </strong>

                          <p>
                            {interview.feedback}
                          </p>

                        </div>
                      )}

                    </article>
                  );
                }
              )}

            </div>
          )}

        </section>

        {feedbackInterview && (
          <div className="feedback-form">

            <h2>
              Complete Interview
            </h2>

            <p>
              Submit feedback for this interview.
            </p>

            <label>
              Rating
            </label>

            <select
              value={rating}
              onChange={(event) =>
                setRating(
                  Number(event.target.value)
                )
              }
              disabled={savingFeedback}
            >

              <option value="5">
                5 - Excellent
              </option>

              <option value="4">
                4 - Very Good
              </option>

              <option value="3">
                3 - Good
              </option>

              <option value="2">
                2 - Fair
              </option>

              <option value="1">
                1 - Poor
              </option>

            </select>

            <label>
              Feedback
            </label>

            <textarea
              value={feedback}
              onChange={(event) =>
                setFeedback(event.target.value)
              }
              placeholder="Enter interview feedback..."
              rows="5"
              disabled={savingFeedback}
            />

            <div className="feedback-actions">

              <button
                type="button"
                onClick={completeInterview}
                disabled={savingFeedback}
                className="save-feedback-button"
              >
                {savingFeedback
                  ? "Saving..."
                  : "Save & Complete"}
              </button>

              <button
                type="button"
                onClick={() => {
                  setFeedbackInterview(null);
                  setFeedback("");
                  setRating(5);
                }}
                disabled={savingFeedback}
                className="cancel-feedback-button"
              >
                Cancel
              </button>

            </div>

          </div>
        )}

      </main>

    </div>
  );
}

export default EmployerInterviews;