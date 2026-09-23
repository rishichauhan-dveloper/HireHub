import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Applications.css";

function Applications() {
  const navigate = useNavigate();

  const [applications, setApplications] = useState([]);
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    const savedUser = localStorage.getItem("hirehub_user");

    if (!savedUser) {
      navigate("/login");
      return;
    }

    try {
      const user = JSON.parse(savedUser);

      const [applicationsResponse, interviewsResponse] =
        await Promise.all([
          fetch(
            `http://localhost/HireHub/backend/api/applications.php?candidate_id=${user.id}`
          ),
          fetch(
            `http://localhost/HireHub/backend/api/interviews.php?candidate_id=${user.id}`
          ),
        ]);

      const applicationsData =
        await applicationsResponse.json();

      const interviewsData =
        await interviewsResponse.json();

      if (applicationsData.success) {
        setApplications(applicationsData.applications || []);
      } else {
        setMessage(
          applicationsData.message ||
            "Unable to load applications."
        );
      }

      if (interviewsData.success) {
        setInterviews(interviewsData.interviews || []);
      } else {
        console.error(
          interviewsData.message ||
            "Unable to load interviews."
        );
      }
    } catch (error) {
      console.error(
        "Applications/interviews fetch error:",
        error
      );

      setMessage(
        "Unable to connect to HireHub server."
      );
    } finally {
      setLoading(false);
    }
  };

  const getStatusClass = (status) => {
    return String(status || "")
      .toLowerCase()
      .replace(/\s+/g, "-");
  };

  const getInterviewForApplication = (applicationId) => {
    return interviews.find(
      (interview) =>
        String(interview.application_id) ===
        String(applicationId)
    );
  };

  const formatApplicationDate = (application) => {
    const value = application?.applied_at;

    if (!value) {
      return "N/A";
    }

    try {
      if (value.$date?.$numberLong) {
        return new Date(
          Number(value.$date.$numberLong)
        ).toLocaleDateString("en-IN");
      }

      if (value.$date) {
        return new Date(value.$date).toLocaleDateString(
          "en-IN"
        );
      }

      return new Date(value).toLocaleDateString("en-IN");
    } catch (error) {
      return "N/A";
    }
  };

  const formatInterviewDate = (date) => {
    if (!date) {
      return "N/A";
    }

    try {
      return new Date(
        `${date}T00:00:00`
      ).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch (error) {
      return date;
    }
  };

  const formatInterviewTime = (time) => {
    if (!time) {
      return "N/A";
    }

    try {
      const [hours, minutes] = time.split(":");

      const date = new Date();

      date.setHours(
        Number(hours),
        Number(minutes),
        0,
        0
      );

      return date.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      return time;
    }
  };

  if (loading) {
    return (
      <div className="applications-page">
        <div className="applications-loading">
          Loading applications...
        </div>
      </div>
    );
  }

  return (
    <div className="applications-page">

      {/* HEADER */}

      <header className="applications-header">

        <div className="applications-logo">
          Hire<span>Hub</span>
        </div>

        <button
          type="button"
          className="back-dashboard"
          onClick={() => navigate("/dashboard")}
        >
          ← Dashboard
        </button>

      </header>


      {/* MAIN */}

      <main className="applications-container">

        {/* PAGE TITLE */}

        <div className="applications-title">

          <span>
            YOUR APPLICATIONS
          </span>

          <h1>
            My Applications
          </h1>

          <p>
            Track the progress of your job applications.
          </p>

        </div>


        {/* MESSAGE */}

        {message && (
          <div className="applications-message">
            {message}
          </div>
        )}


        {/* NO APPLICATIONS */}

        {applications.length === 0 ? (

          <div className="empty-applications">

            <div className="empty-icon">
              📄
            </div>

            <h2>
              No applications yet
            </h2>

            <p>
              Start exploring jobs and apply to
              opportunities that match your skills.
            </p>

            <button
              type="button"
              className="find-jobs-button"
              onClick={() => navigate("/jobs")}
            >
              Find Jobs →
            </button>

          </div>

        ) : (

          /* APPLICATION LIST */

          <div className="applications-list">

            {applications.map((application) => {

              const interview =
                getInterviewForApplication(
                  application._id
                );

              return (

                <article
                  key={application._id}
                  className="application-card"
                >

                  {/* COMPANY ICON */}

                  <div className="application-company-icon">
                    {application.company_name
                      ?.charAt(0)
                      ?.toUpperCase() || "H"}
                  </div>


                  {/* APPLICATION INFORMATION */}

                  <div className="application-info">

                    <h2>
                      {application.job_title ||
                        "Job"}
                    </h2>

                    <h3>
                      {application.company_name ||
                        "Company"}
                    </h3>

                    <p>
                      Applied on{" "}
                      {formatApplicationDate(
                        application
                      )}
                    </p>

                  </div>


                  {/* APPLICATION STATUS */}

                  <div className="application-status-section">

                    <span
                      className={`application-status ${getStatusClass(
                        application.status
                      )}`}
                    >
                      {application.status ||
                        "Applied"}
                    </span>

                    <span className="application-label">
                      Application Status
                    </span>

                  </div>


                  {/* =================================================
                      IMPORTANT:
                      INTERVIEW IS OUTSIDE STATUS SECTION
                      ================================================= */}

                  {interview && (

                    <section
                      className={`application-interview ${
                        interview.status ===
                        "cancelled"
                          ? "interview-cancelled"
                          : ""
                      }`}
                    >

                      {/* INTERVIEW HEADER */}

                      <div className="interview-heading">

                        <span className="interview-icon">
                          📅
                        </span>

                        <div>

                          <h3>
                            {interview.status ===
                            "cancelled"
                              ? "Interview Cancelled"
                              : "Interview Scheduled"}
                          </h3>

                          <p>
                            {interview.status ===
                            "cancelled"
                              ? "This interview has been cancelled by the employer."
                              : "Your interview details are below."}
                          </p>

                        </div>

                      </div>


                      {/* INTERVIEW DETAILS */}

                      <div className="interview-details">

                        <div>
                          <strong>
                            Date
                          </strong>

                          <span>
                            {formatInterviewDate(
                              interview.interview_date
                            )}
                          </span>
                        </div>


                        <div>
                          <strong>
                            Time
                          </strong>

                          <span>
                            {formatInterviewTime(
                              interview.interview_time
                            )}
                          </span>
                        </div>


                        <div>
                          <strong>
                            Type
                          </strong>

                          <span>
                            {interview.interview_type ||
                              "N/A"}
                          </span>
                        </div>


                        <div>
                          <strong>
                            Status
                          </strong>

                          <span>
                            {interview.status ||
                              "scheduled"}
                          </span>
                        </div>

                      </div>


                      {/* COMPLETED INTERVIEW */}

                      {interview.status ===
                        "completed" && (

                        <div className="interview-completed">

                          <h3>
                            Interview Completed
                          </h3>

                          <div className="interview-rating">

                            <strong>
                              Rating:
                            </strong>{" "}

                            {"★".repeat(
                              Math.min(
                                5,
                                Math.max(
                                  0,
                                  Number(
                                    interview.rating || 0
                                  )
                                )
                              )
                            )}

                            {"☆".repeat(
                              5 -
                                Math.min(
                                  5,
                                  Math.max(
                                    0,
                                    Number(
                                      interview.rating || 0
                                    )
                                  )
                                )
                            )}

                          </div>


                          {interview.feedback && (

                            <div className="interview-feedback">

                              <strong>
                                Employer Feedback
                              </strong>

                              <p>
                                {interview.feedback}
                              </p>

                            </div>

                          )}

                        </div>

                      )}


                      {/* INTERVIEW NOTES */}

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


                      {/* ONLINE INTERVIEW */}

                      {interview.status !==
                        "cancelled" &&
                        interview.interview_type
                          ?.toLowerCase() ===
                          "online" &&
                        interview.meeting_link && (

                          <button
                            type="button"
                            className="join-interview-button"
                            onClick={() =>
                              navigate(
                                `/applications/${application._id}/interview`
                              )
                            }
                          >
                            View Interview →
                          </button>

                        )}


                      {/* OFFLINE INTERVIEW */}

                      {interview.status !==
                        "cancelled" &&
                        interview.interview_type
                          ?.toLowerCase() !==
                          "online" &&
                        interview.location && (

                          <div className="interview-location">

                            <strong>
                              Location
                            </strong>

                            <p>
                              {interview.location}
                            </p>

                          </div>

                        )}

                    </section>

                  )}

                </article>

              );

            })}

          </div>

        )}

      </main>

    </div>
  );
}

export default Applications;