import { useEffect, useState } from "react";
import "./FindJobs.css";

function FindJobs() {

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {

    try {

      const response = await fetch(
        "http://localhost/HireHub/backend/api/jobs.php"
      );

      const data = await response.json();

      if (data.success) {
        setJobs(data.jobs || []);
      }

    } catch (error) {

      console.error(
        "Jobs fetch error:",
        error
      );

    } finally {

      setLoading(false);

    }
  };


  const filteredJobs = jobs.filter((job) => {

    const text =
      `${job.title} ${job.company_name} ${job.location} ${job.skills?.join(" ")}`
        .toLowerCase();

    return text.includes(
      search.toLowerCase()
    );

  });


  return (

    <div className="find-jobs-page">

      {/* Header */}

      <header className="jobs-header">

        <div className="jobs-logo">
          Hire<span>Hub</span>
        </div>

        <button
          className="back-dashboard"
          onClick={() =>
            window.location.href = "/dashboard"
          }
        >
          ← Dashboard
        </button>

      </header>


      {/* Hero */}

      <section className="jobs-hero">

        <div className="jobs-badge">
          ✦ FIND YOUR NEXT OPPORTUNITY
        </div>

        <h1>
          Find a job that
          <span> fits your future.</span>
        </h1>

        <p>
          Discover opportunities that match your
          skills, experience and career goals.
        </p>


        <div className="jobs-search">

          <span>⌕</span>

          <input
            type="text"
            placeholder="Search jobs, skills or companies..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
          />

          <button>
            Search
          </button>

        </div>

      </section>


      {/* Jobs */}

      <main className="jobs-container">

        <div className="jobs-title">

          <div>
            <h2>
              Available Jobs
            </h2>

            <p>
              {filteredJobs.length} opportunities found
            </p>
          </div>

        </div>


        {loading ? (

          <div className="jobs-message">
            Loading jobs...
          </div>

        ) : filteredJobs.length === 0 ? (

          <div className="jobs-message">
            No jobs found.
          </div>

        ) : (

          <div className="jobs-list">

            {filteredJobs.map((job) => (

              <div
                className="job-card"
                key={job._id}
              >

                <div className="job-card-top">

                  <div className="company-logo">
                    {job.company_name
                      ?.charAt(0)
                      .toUpperCase()}
                  </div>

                  <div className="job-main">

                    <h3>
                      {job.title}
                    </h3>

                    <p className="company-name">
                      {job.company_name}
                    </p>

                  </div>

                  <span className="job-type">
                    {job.job_type}
                  </span>

                </div>


                <p className="job-description">
                  {job.description}
                </p>


                <div className="job-details">

                  <span>
                    📍 {job.location}
                  </span>

                  <span>
                    💼 {job.experience}
                  </span>

                  <span>
                    💰 {job.salary}
                  </span>

                </div>


                <div className="job-skills">

                  {job.skills?.map(
                    (skill) => (

                      <span key={skill}>
                        {skill}
                      </span>

                    )
                  )}

                </div>


                <div className="job-footer">

                  <small>
                    Qualification:{" "}
                    {job.qualification}
                  </small>

                  <button
  onClick={() =>
    window.location.href =
      `/jobs/${job._id}`
  }
>
  View & Apply →
</button>

                </div>

              </div>

            ))}

          </div>

        )}

      </main>

    </div>
  );
}

export default FindJobs;