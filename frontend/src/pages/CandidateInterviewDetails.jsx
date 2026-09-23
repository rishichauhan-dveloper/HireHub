import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./CandidateInterviewDetails.css";

function CandidateInterviewDetails() {
  const navigate = useNavigate();
  const { applicationId } = useParams();

  const [user, setUser] = useState(null);
  const [interview, setInterview] = useState(null);
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

      if (loggedInUser.role !== "candidate") {
        navigate("/dashboard");
        return;
      }

      setUser(loggedInUser);

      if (!applicationId) {
        setMessage("Application ID is missing.");
        setLoading(false);
        return;
      }

      fetchInterview(loggedInUser.id);
    } catch (error) {
      console.error("User data error:", error);
      navigate("/login");
    }
  }, [navigate, applicationId]);

  const fetchInterview = async (candidateId) => {
    try {
      setLoading(true);
      setMessage("");

      const response = await fetch(
        `http://localhost/HireHub/backend/api/interviews.php?candidate_id=${candidateId}&application_id=${applicationId}`
      );

      const data = await response.json();

      if (!data.success) {
        setMessage(
          data.message || "Unable to load interview."
        );
        return;
      }

      const interviews = data.interviews || [];

      const activeInterview = interviews.find(
        (item) =>
          item.status !== "cancelled" 
      );

      if (!activeInterview) {
        setMessage("No active interview found.");
        return;
      }

      setInterview(activeInterview);
    } catch (error) {
      console.error("Interview fetch error:", error);
      setMessage("Unable to connect to HireHub server.");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    if (!date) {
      return "N/A";
    }

    try {
      return new Date(`${date}T00:00:00`).toLocaleDateString(
        undefined,
        {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }
      );
    } catch {
      return date;
    }
  };

  const logout = () => {
    localStorage.removeItem("hirehub_user");
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="candidate-interview-page">
        <div className="candidate-interview-container">
          <h2>Loading interview...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="candidate-interview-page">

      <header className="candidate-interview-header">

        <div className="candidate-interview-logo">
          Hire<span>Hub</span>
        </div>

        <div className="candidate-interview-user">
          <strong>
            {user?.name || "Candidate"}
          </strong>

          <button onClick={logout}>
            Logout
          </button>
        </div>

      </header>

      <main className="candidate-interview-container">

        <button
          className="candidate-interview-back"
          onClick={() => navigate("/applications")}
        >
          ← Back to Applications
        </button>

        <div className="candidate-interview-title">
          <span>INTERVIEW</span>

          <h1>
            Interview Details
          </h1>

          <p>
            Your scheduled interview information.
          </p>
        </div>

        {message && (
          <div className="candidate-interview-message">
            {message}
          </div>
        )}

        {interview && (
          <section className="candidate-interview-card">

            <div className="interview-icon">
              📅
            </div>

            <h2>
            {interview.status === "completed"
            ? "Interview Completed"
            : interview.status === "cancelled"
            ? "Interview Cancelled"
            : "Interview Scheduled"}
            </h2>

            <p className="interview-status">
              {interview.status}
            </p>

            <div className="interview-details">

              <div className="interview-detail">
                <span>Date</span>
                <strong>
                  {formatDate(interview.interview_date)}
                </strong>
              </div>

              <div className="interview-detail">
                <span>Time</span>
                <strong>
                  {interview.interview_time}
                </strong>
              </div>

              <div className="interview-detail">
                <span>Type</span>
                <strong>
                  {interview.interview_type || "N/A"}
                </strong>
              </div>

              {interview.location && (
                <div className="interview-detail">
                  <span>Location</span>
                  <strong>
                    {interview.location}
                  </strong>
                </div>
              )}

            </div>

           {interview.meeting_link &&
            interview.status !== "completed" &&
            interview.status !== "cancelled" && (
          <div className="meeting-section">
          
                <h3>
                  Online Meeting
                </h3>

                <p>
                  Join the interview using the button below.
                </p>

                <a
                  href={interview.meeting_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="join-interview-button"
                >
                  Join Interview →
                </a>

              </div>
            )}

            {interview.notes && (
              <div className="interview-notes">

                <h3>
                  Interview Notes
                </h3>

                <p>
                  {interview.notes}
                </p>

              </div>
            )}

          </section>
        )}

      </main>

    </div>
  );
}

export default CandidateInterviewDetails;