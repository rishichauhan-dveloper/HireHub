import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./EmployerCreateJob.css";

function EmployerCreateJob() {
  const navigate = useNavigate();

  const savedUser = localStorage.getItem("hirehub_user");

  let user = null;

  try {
    user = savedUser ? JSON.parse(savedUser) : null;
  } catch {
    user = null;
  }

  const [form, setForm] = useState({
    company_name: "HireHub Technologies",
    title: "",
    description: "",
    skills: "",
    qualification: "",
    experience: "",
    salary: "",
    location: "",
    job_type: "Full Time",
  });

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user || user.role !== "employer") {
      navigate("/login");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const response = await fetch(
        "http://localhost/HireHub/backend/api/jobs.php",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            employer_id: user.id,
            company_name: form.company_name,
            title: form.title,
            description: form.description,

            skills: form.skills
              .split(",")
              .map((skill) => skill.trim())
              .filter(Boolean),

            qualification: form.qualification,
            experience: form.experience,
            salary: form.salary,
            location: form.location,
            job_type: form.job_type,
          }),
        }
      );

      const data = await response.json();

      if (data.success) {
        setMessage("Job posted successfully!");

        setTimeout(() => {
          navigate("/employer/dashboard");
        }, 1000);
      } else {
        setMessage(data.message || "Unable to create job.");
      }
    } catch (error) {
      console.error("Create job error:", error);
      setMessage("Unable to connect to HireHub server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-job-page">

      <div className="create-job-container">

        <div className="create-job-header">

          <button
            className="back-button"
            onClick={() => navigate("/employer/dashboard")}
          >
            ← Dashboard
          </button>

          <p className="create-job-label">
            EMPLOYER PORTAL
          </p>

          <h1>
            Post a Job
          </h1>

          <p>
            Create a new job opportunity and find the right candidate.
          </p>

        </div>


        <form
          className="create-job-form"
          onSubmit={handleSubmit}
        >

          <div className="form-group">

            <label>
              Company Name
            </label>

            <input
              type="text"
              name="company_name"
              value={form.company_name}
              onChange={handleChange}
              required
            />

          </div>


          <div className="form-group">

            <label>
              Job Title
            </label>

            <input
              type="text"
              name="title"
              placeholder="e.g. Frontend Developer"
              value={form.title}
              onChange={handleChange}
              required
            />

          </div>


          <div className="form-group">

            <label>
              Job Description
            </label>

            <textarea
              name="description"
              placeholder="Describe the job responsibilities..."
              value={form.description}
              onChange={handleChange}
              rows="6"
              required
            />

          </div>


          <div className="form-group">

            <label>
              Skills
            </label>

            <input
              type="text"
              name="skills"
              placeholder="React, JavaScript, HTML, CSS"
              value={form.skills}
              onChange={handleChange}
            />

            <small>
              Separate skills with commas.
            </small>

          </div>


          <div className="form-row">

            <div className="form-group">

              <label>
                Qualification
              </label>

              <input
                type="text"
                name="qualification"
                placeholder="BCA / MCA / Equivalent"
                value={form.qualification}
                onChange={handleChange}
              />

            </div>


            <div className="form-group">

              <label>
                Experience
              </label>

              <input
                type="text"
                name="experience"
                placeholder="0-2 years"
                value={form.experience}
                onChange={handleChange}
              />

            </div>

          </div>


          <div className="form-row">

            <div className="form-group">

              <label>
                Salary
              </label>

              <input
                type="text"
                name="salary"
                placeholder="3-5 LPA"
                value={form.salary}
                onChange={handleChange}
              />

            </div>


            <div className="form-group">

              <label>
                Location
              </label>

              <input
                type="text"
                name="location"
                placeholder="Surat, Gujarat"
                value={form.location}
                onChange={handleChange}
              />

            </div>

          </div>


          <div className="form-group">

            <label>
              Job Type
            </label>

            <select
              name="job_type"
              value={form.job_type}
              onChange={handleChange}
            >
              <option value="Full Time">
                Full Time
              </option>

              <option value="Part Time">
                Part Time
              </option>

              <option value="Internship">
                Internship
              </option>

              <option value="Contract">
                Contract
              </option>
            </select>

          </div>


          {message && (
            <div className="create-job-message">
              {message}
            </div>
          )}


          <div className="create-job-actions">

            <button
              type="button"
              className="cancel-button"
              onClick={() => navigate("/employer/dashboard")}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="submit-job-button"
              disabled={loading}
            >
              {loading ? "Posting..." : "Post Job →"}
            </button>

          </div>

        </form>

      </div>

    </div>
  );
}

export default EmployerCreateJob;