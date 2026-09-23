import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./CandidateMatches.css";

function CandidateMatches() {

  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [candidateSkills, setCandidateSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {

    const savedUser =
      localStorage.getItem("hirehub_user");

    if (!savedUser) {
      navigate("/login");
      return;
    }

    try {

      const loggedInUser =
        JSON.parse(savedUser);

      if (loggedInUser.role !== "candidate") {
        navigate("/login");
        return;
      }

      setUser(loggedInUser);

      fetchMatches(loggedInUser.id);

    } catch (error) {

      console.error(
        "User error:",
        error
      );

      navigate("/login");
    }

  }, [navigate]);


  const fetchMatches = async (candidateId) => {

    try {

      setLoading(true);
      setMessage("");

      const response = await fetch(
        `http://localhost/HireHub/backend/api/candidate-job-matching.php?candidate_id=${candidateId}`
      );

      const data = await response.json();

      console.log(
        "Candidate matching response:",
        data
      );

      if (data.success) {

        setJobs(data.jobs || []);

        setCandidateSkills(
          data.candidate?.skills || []
        );

      } else {

        setMessage(
          data.message ||
          "Unable to load job matches."
        );
      }

    } catch (error) {

      console.error(
        "Candidate matching error:",
        error
      );

      setMessage(
        "Unable to connect to HireHub server."
      );

    } finally {

      setLoading(false);

    }
  };


  const logout = () => {

    localStorage.removeItem(
      "hirehub_user"
    );

    navigate("/login");
  };


  return (

    <div className="candidate-matches-page">

      <aside className="candidate-matches-sidebar">

        <div className="candidate-matches-logo">
          Hire<span>Hub</span>
        </div>

        <div className="candidate-matches-user">

          <div className="candidate-matches-avatar">
            {user?.name?.charAt(0)?.toUpperCase() || "C"}
          </div>

          <div>

            <strong>
              {user?.name || "Candidate"}
            </strong>

            <small>
              Candidate
            </small>

          </div>

        </div>


        <nav className="candidate-matches-nav">

          <button
            onClick={() =>
              navigate("/dashboard")
            }
          >
            Dashboard
          </button>

          <button
            onClick={() =>
              navigate("/jobs")
            }
          >
            Find Jobs
          </button>

          <button
            className="active"
          >
            Smart Matching
          </button>

          <button
            onClick={() =>
              navigate("/applications")
            }
          >
            Applications
          </button>

          <button
            onClick={() =>
              navigate("/profile")
            }
          >
            Profile
          </button>

          <button
            onClick={() =>
              navigate("/resume")
            }
          >
            Resume
          </button>

        </nav>


        <button
          className="candidate-matches-logout"
          onClick={logout}
        >
          Logout
        </button>

      </aside>


      <main className="candidate-matches-main">

        <header className="candidate-matches-header">

          <button
            className="matches-back-button"
            onClick={() =>
              navigate("/dashboard")
            }
          >
            → Dashboard
          </button>

          <p className="matches-label">
            AI / SMART CANDIDATE MATCHING
          </p>

          <h1>
            Jobs That Fit You
          </h1>

          <p>
            HireHub compares your skills with job
            requirements and ranks the best matches.
          </p>

        </header>


        <section className="candidate-skills-panel">

          <div>

            <h2>
              Your Skills
            </h2>

            <p>
              Matching is based on the skills in your
              candidate profile.
            </p>

          </div>

          <div className="candidate-skills">

            {candidateSkills.length > 0 ? (

              candidateSkills.map(
                (skill) => (
                  <span key={skill}>
                    {skill}
                  </span>
                )
              )

            ) : (

              <span className="no-skills">
                No skills added yet
              </span>

            )}

          </div>

        </section>


        {message && (

          <div className="matches-message">
            {message}
          </div>

        )}


        {loading ? (

          <section className="matches-empty">

            <h2>
              Finding your best matches...
            </h2>

            <p>
              Comparing your skills with available jobs.
            </p>

          </section>

        ) : jobs.length === 0 ? (

          <section className="matches-empty">

            <h2>
              No job matches found
            </h2>

            <p>
              Try adding more skills to your profile
              or check back when new jobs are posted.
            </p>

            <button
              onClick={() =>
                navigate("/profile")
              }
            >
              Update Profile →
            </button>

          </section>

        ) : (

          <section className="matches-section">

            <div className="matches-section-heading">

              <div>

                <p>
                  RECOMMENDED JOBS
                </p>

                <h2>
                  {jobs.length} Jobs Found
                </h2>

              </div>

            </div>


            <div className="matches-grid">

              {jobs.map((job) => (

                <article
                  className="match-card"
                  key={job.job_id}
                >

                  <div className="match-card-header">

                    <div>

                      <h3>
                        {job.title}
                      </h3>

                      <p>
                        {job.company_name}
                      </p>

                    </div>

                    <div
                      className="match-percentage"
                    >
                      {job.match_percentage}%
                      <small>
                        Match
                      </small>
                    </div>

                  </div>


                  <div className="match-progress">

                    <div
                      className="match-progress-value"
                      style={{
                        width:
                          `${job.match_percentage}%`
                      }}
                    />

                  </div>


                  <div className="match-details">

                    <span>
                      📍 {job.location || "Not specified"}
                    </span>

                    <span>
                      💼 {job.job_type || "Not specified"}
                    </span>

                    {job.salary && (
                      <span>
                        💰 {job.salary}
                      </span>
                    )}

                  </div>


                  <div className="matched-skills">

                    <h4>
                      Matched Skills
                    </h4>

                    <div>

                      {job.matched_skills.length > 0 ? (

                        job.matched_skills.map(
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

                        <span>
                          No matching skills
                        </span>

                      )}

                    </div>

                  </div>


                  {job.missing_skills.length > 0 && (

                    <div className="missing-skills">

                      <h4>
                        Missing Skills
                      </h4>

                      <div>

                        {job.missing_skills.map(
                          (skill) => (
                            <span
                              key={skill}
                            >
                              {skill}
                            </span>
                          )
                        )}

                      </div>

                    </div>

                  )}


                  <button
                    className="view-match-button"
                    onClick={() =>
                      navigate(
                        `/jobs/${job.job_id}`
                      )
                    }
                  >
                    View Job →
                  </button>

                </article>

              ))}

            </div>

          </section>

        )}

      </main>

    </div>
  );
}

export default CandidateMatches;

