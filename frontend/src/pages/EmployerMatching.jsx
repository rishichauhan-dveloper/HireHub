import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./EmployerMatching.css";

function EmployerMatching() {
  const navigate = useNavigate();
  const { jobId } = useParams();

  const [user, setUser] = useState(null);
  const [job, setJob] = useState(null);
  const [candidates, setCandidates] = useState([]);
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
        navigate("/login");
        return;
      }

      setUser(loggedInUser);
      fetchMatches();
    } catch (error) {
      console.error("User error:", error);
      navigate("/login");
    }
  }, [navigate, jobId]);

  const fetchMatches = async () => {
    try {
      setLoading(true);
      setMessage("");

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/candidate-matching.php?job_id=${jobId}`
      );

      const data = await response.json();

      console.log("Employer matching response:", data);

      if (data.success) {
        setJob(data.job || null);
        setCandidates(data.candidates || []);
      } else {
        setMessage(
          data.message || "Unable to load matching candidates."
        );
      }
    } catch (error) {
      console.error("Employer matching error:", error);

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

  return (
    <div className="employer-matching-page">

      {/* SIDEBAR */}

      <aside className="employer-matching-sidebar">

        <div className="employer-matching-logo">
          Hire<span>Hub</span>
        </div>

        <div className="employer-matching-user">

          <div className="employer-matching-avatar">
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

        <nav className="employer-matching-nav">

          <button
            onClick={() =>
              navigate("/employer/dashboard")
            }
          >
            Dashboard
          </button>

          <button
            className="active"
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
          className="employer-matching-logout"
          onClick={logout}
        >
          Logout
        </button>

      </aside>


      {/* MAIN */}

      <main className="employer-matching-main">

        <header className="employer-matching-header">

          <button
            className="matching-back-button"
            onClick={() =>
              navigate("/employer/jobs")
            }
          >
            ← Back to My Jobs
          </button>

          <p className="matching-label">
            SMART MATCHING
          </p>

          <h1>
            Find Matching Candidates
          </h1>

          <p>
            Discover candidates whose skills match
            the requirements of your job.
          </p>

        </header>


        {/* MESSAGE */}

        {message && (
          <div className="matching-message">
            {message}
          </div>
        )}


        {/* LOADING */}

        {loading ? (

          <div className="matching-empty">

            <h2>
              Finding matching candidates...
            </h2>

            <p>
              HireHub is comparing candidate skills
              with your job requirements.
            </p>

          </div>

        ) : (

          <>

            {/* JOB INFORMATION */}

            {job && (

              <section className="employer-job-matching-panel">

                <div>

                  <p className="job-matching-label">
                    MATCHING FOR JOB
                  </p>

                  <h2>
                    {job.title || "Job"}
                  </h2>

                  <p>
                    Candidates are ranked according
                    to their skill match.
                  </p>

                </div>

                <div className="required-skills">

                  <h3>
                    Required Skills
                  </h3>

                  <div>

                    {Array.isArray(job.skills) &&
                    job.skills.length > 0 ? (

                      job.skills.map((skill) => (
                        <span key={skill}>
                          {skill}
                        </span>
                      ))

                    ) : (

                      <span className="no-skills">
                        No skills specified
                      </span>

                    )}

                  </div>

                </div>

              </section>

            )}


            {/* CANDIDATES */}

            <section className="candidate-results-section">

              <div className="candidate-results-heading">

                <div>
                  <p>
                    MATCH RESULTS
                  </p>

                  <h2>
                    {candidates.length} Candidate
                    {candidates.length !== 1 ? "s" : ""}
                  </h2>
                </div>

                <span>
                  Highest matches first
                </span>

              </div>


              {candidates.length === 0 ? (

                <div className="matching-empty">

                  <h2>
                    No candidates found
                  </h2>

                  <p>
                    There are currently no candidate
                    profiles available for matching.
                  </p>

                </div>

              ) : (

                <div className="candidate-matching-grid">

                  {candidates.map((candidate) => (

                    <article
                      className="employer-candidate-card"
                      key={candidate.candidate_id}
                    >

                      <div className="candidate-card-header">

                        <div>

                          <h3>
                            {candidate.name || "Candidate"}
                          </h3>

                          <p>
                            {candidate.email || "No email available"}
                          </p>

                        </div>

                        <div className="candidate-match-percentage">

                          <strong>
                            {candidate.match_percentage}%
                          </strong>

                          <small>
                            MATCH
                          </small>

                        </div>

                      </div>


                      <div className="candidate-match-progress">

                        <div
                          style={{
                            width: `${candidate.match_percentage}%`,
                          }}
                        />

                      </div>


                      {/* CANDIDATE SKILLS */}

                      <div className="candidate-skills-section">

                        <h4>
                          Candidate Skills
                        </h4>

                        <div>

                          {Array.isArray(
                            candidate.candidate_skills
                          ) &&
                          candidate.candidate_skills.length > 0 ? (

                            candidate.candidate_skills.map(
                              (skill) => (
                                <span key={skill}>
                                  {skill}
                                </span>
                              )
                            )

                          ) : (

                            <span className="no-candidate-skills">
                              No skills listed
                            </span>

                          )}

                        </div>

                      </div>


                      {/* MATCHED SKILLS */}

                      <div className="candidate-matched-skills">

                        <h4>
                          Matched Skills
                        </h4>

                        <div>

                          {Array.isArray(
                            candidate.matched_skills
                          ) &&
                          candidate.matched_skills.length > 0 ? (

                            candidate.matched_skills.map(
                              (skill) => (
                                <span
                                  className="matched"
                                  key={skill}
                                >
                                  ✓ {skill}
                                </span>
                              )
                            )

                          ) : (

                            <span className="no-matched-skills">
                              No matching skills
                            </span>

                          )}

                        </div>

                      </div>


                      {/* MISSING SKILLS */}

                      {Array.isArray(
                        candidate.missing_skills
                      ) &&
                      candidate.missing_skills.length > 0 && (

                        <div className="candidate-missing-skills">

                          <h4>
                            Missing Skills
                          </h4>

                          <div>

                            {candidate.missing_skills.map(
                              (skill) => (
                                <span key={skill}>
                                  {skill}
                                </span>
                              )
                            )}

                          </div>

                        </div>

                      )}

                    </article>

                  ))}

                </div>

              )}

            </section>

          </>

        )}

      </main>

    </div>
  );
}

export default EmployerMatching;