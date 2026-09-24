import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./CandidateResume.css";

function CandidateResume() {
  const navigate = useNavigate();

  const savedUser = localStorage.getItem("hirehub_user");

  let user = null;

  try {
    user = savedUser ? JSON.parse(savedUser) : null;
  } catch {
    user = null;
  }

  const [resume, setResume] = useState({
    headline: "",
    summary: "",
    skills: "",
    education: "",
    experience: "",
    certifications: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const [resumeFile, setResumeFile] = useState(null);
  const [uploading, setUploading] = useState(false);
const [uploadedResume, setUploadedResume] = useState(null);

  /*
  |--------------------------------------------------------------------------
  | Load Resume
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    fetchResume(user.id);
    fetchUploadedResume(user.id);
  }, [user?.id]);


  const fetchUploadedResume = async (userId) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/resume-upload.php?user_id=${userId}`
      );

      const data = await response.json();

      if (data.success) {
        setUploadedResume(data.resume || null);
      }
    } catch (error) {
      console.error("Fetch uploaded resume error:", error);
    }
  };
  const fetchResume = async (userId) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/candidate-resume.php?user_id=${userId}`
      );

      const data = await response.json();

      if (data.success && data.resume) {
        setResume({
          headline: data.resume.headline || "",
          summary: data.resume.summary || "",
          skills: data.resume.skills || "",
          education: data.resume.education || "",
          experience: data.resume.experience || "",
          certifications: data.resume.certifications || "",
        });
      }

    } catch (error) {
      console.error("Fetch resume error:", error);

      setMessage(
        "Unable to connect to HireHub server."
      );

    } finally {
      setLoading(false);
    }
  };


  /*
  |--------------------------------------------------------------------------
  | Logout
  |--------------------------------------------------------------------------
  */

  const logout = () => {
    localStorage.removeItem("hirehub_user");
    navigate("/login");
  };


  /*
  |--------------------------------------------------------------------------
  | Handle Input
  |--------------------------------------------------------------------------
  */

  const handleChange = (event) => {
    const { name, value } = event.target;

    setResume((previous) => ({
      ...previous,
      [name]: value,
    }));
  };
/*
|--------------------------------------------------------------------------
| Upload Resume File
|--------------------------------------------------------------------------
*/

const handleResumeFileUpload = async () => {
  if (!user?.id) {
    setMessage("User session not found.");
    return;
  }

  if (!resumeFile) {
    setMessage("Please select a resume file.");
    return;
  }

  setUploading(true);
  setMessage("");

  try {
    const formData = new FormData();

    formData.append("user_id", user.id);
    formData.append("resume", resumeFile);

    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/api/resume-upload.php`,
      {
        method: "POST",
        body: formData,
      }
    );

    const data = await response.json();

    if (data.success) {
  setMessage("Resume file uploaded successfully.");
  setResumeFile(null);

  setUploadedResume(data.resume || null);
}else {
      setMessage(
        data.message || "Unable to upload resume file."
      );
    }

  } catch (error) {
    console.error("Resume upload error:", error);

    setMessage(
      "Unable to connect to HireHub server."
    );

  } finally {
    setUploading(false);
  }
};

  /*
  |--------------------------------------------------------------------------
  | Save Resume
  |--------------------------------------------------------------------------
  */

    /*
  |--------------------------------------------------------------------------
  | Delete Uploaded Resume
  |--------------------------------------------------------------------------
  */

  const handleDeleteResume = async () => {

    if (!user?.id) {
      setMessage("User session not found.");
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to delete your uploaded resume?"
    );

    if (!confirmed) {
      return;
    }

    setMessage("");

    try {

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/resume-upload.php`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            user_id: user.id,
          }),
        }
      );

      const data = await response.json();

      if (data.success) {

        setUploadedResume(null);

        setMessage(
          "Resume deleted successfully."
        );

      } else {

        setMessage(
          data.message || "Unable to delete resume."
        );

      }

    } catch (error) {

      console.error(
        "Delete resume error:",
        error
      );

      setMessage(
        "Unable to connect to HireHub server."
      );

    }
  };

const handleSubmit = async (event) => {
    event.preventDefault();

    if (!user?.id) {
      setMessage("User session not found.");
      return;
    }

    setSaving(true);
    setMessage("");

    try {

      const payload = {
        user_id: user.id,
        ...resume,
      };

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/candidate-resume.php`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();

      if (data.success) {

        setMessage(
          "Resume saved successfully."
        );

      } else {

        setMessage(
          data.message ||
          "Unable to save resume."
        );

      }

    } catch (error) {

      console.error("Save resume error:", error);

      setMessage(
        "Unable to connect to HireHub server."
      );

    } finally {

      setSaving(false);

    }
  };


  /*
  |--------------------------------------------------------------------------
  | Loading
  |--------------------------------------------------------------------------
  */

  if (loading) {
    return (
      <div className="candidate-resume-page">

        <div className="profile-loading">
          Loading resume...
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
    <div className="candidate-resume-page">

      {/* Sidebar */}

      <aside className="sidebar">

        <div className="dashboard-logo">
          Hire<span>Hub</span>
        </div>


        <div className="profile-user-box">

          <div className="profile-avatar">
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


        <nav className="sidebar-nav">

          <button
            onClick={() => navigate("/dashboard")}
          >
            <span>⌂</span>
            Dashboard
          </button>


          <button
            onClick={() => navigate("/jobs")}
          >
            <span>⌕</span>
            Find Jobs
          </button>


          <button
            onClick={() => navigate("/applications")}
          >
            <span>▣</span>
            Applications
          </button>


          <button
            onClick={() => navigate("/profile")}
          >
            <span>◉</span>
            My Profile
          </button>


          <button className="active">
            <span>↑</span>
            Resume
          </button>

        </nav>


        <button
          className="logout"
          onClick={logout}
        >
          <span>↪</span>
          Logout
        </button>

      </aside>


      {/* Main */}

      <main className="resume-main">

        <header className="resume-header">

          <div>

            <p>MY RESUME</p>

            <h1>
              Resume Builder
            </h1>

            <span>
              Build your professional resume for employers.
            </span>

          </div>


          <button
            className="back-button"
            onClick={() => navigate("/dashboard")}
          >
            Back to Dashboard
          </button>

        </header>


        {/* Message */}

        {message && (
          <div className="resume-message">
            {message}
          </div>
        )}


        <form
          className="resume-form"
          onSubmit={handleSubmit}
        >

          {/* Professional Information */}

          <section className="resume-card">

            <h2>
              Professional Information
            </h2>


            <div className="form-group">

              <label>
                Professional Headline
              </label>

              <input
                name="headline"
                value={resume.headline}
                onChange={handleChange}
                placeholder="Frontend Developer | React Developer"
              />

            </div>


            <div className="form-group">

              <label>
                Professional Summary
              </label>

              <textarea
                name="summary"
                value={resume.summary}
                onChange={handleChange}
                placeholder="Write a short professional summary..."
                rows="6"
              />

            </div>

          </section>


          {/* Skills */}

          <section className="resume-card">

            <h2>
              Skills
            </h2>

            <div className="form-group">

              <label>
                Technical Skills
              </label>

              <textarea
                name="skills"
                value={resume.skills}
                onChange={handleChange}
                placeholder="React, JavaScript, PHP, MongoDB, HTML, CSS..."
                rows="4"
              />

              <small>
                Separate skills with commas.
              </small>

            </div>

          </section>


          {/* Education */}

          <section className="resume-card">

            <h2>
              Education
            </h2>

            <div className="form-group">

              <label>
                Education Details
              </label>

              <textarea
                name="education"
                value={resume.education}
                onChange={handleChange}
                placeholder="B.Tech in Computer Engineering - ABC University - 2022 to 2026"
                rows="6"
              />

            </div>

          </section>


          {/* Experience */}

          <section className="resume-card">

            <h2>
              Work Experience
            </h2>

            <div className="form-group">

              <label>
                Experience Details
              </label>

              <textarea
                name="experience"
                value={resume.experience}
                onChange={handleChange}
                placeholder="Frontend Developer - XYZ Company - 2025 to Present..."
                rows="7"
              />

            </div>

          </section>


          {/* Certifications */}

          <section className="resume-card">

            <h2>
              Certifications
            </h2>

            <div className="form-group">

              <label>
                Certifications
              </label>

              <textarea
                name="certifications"
                value={resume.certifications}
                onChange={handleChange}
                placeholder="React Certification, MongoDB Certification..."
                rows="5"
              />

            </div>

          </section>
            {/* Resume File Upload */}

<section className="resume-card resume-upload-card">

  <h2>
    Resume File
  </h2>

  <div className="form-group">

    <label>
      Upload Resume
    </label>

    <input
      type="file"
      accept=".pdf,.doc,.docx"
      onChange={(event) => {
        setResumeFile(event.target.files[0] || null);
      }}
    />

    <small>
      PDF, DOC or DOCX. Maximum file size: 5 MB.
    </small>

  </div>

  {resumeFile && (
    <div className="selected-resume-file">

      <strong>
        Selected file:
      </strong>

      <span>
        {resumeFile.name}
      </span>

      <span>
        {(resumeFile.size / 1024 / 1024).toFixed(2)} MB
      </span>

    </div>
  )}

  <button
    type="button"
    className="upload-resume-button"
    onClick={handleResumeFileUpload}
    disabled={uploading || !resumeFile}
  >
    {uploading
      ? "Uploading..."
      : "Upload Resume"}
  </button>

</section>

          {/* Actions */}

          {/* Uploaded Resume */}

{uploadedResume && (
  <section className="resume-card uploaded-resume-card">

    <h2>
      Current Resume
    </h2>

    <div className="uploaded-resume-info">

      <div>
        <span>File Name</span>
        <strong>
          {uploadedResume.original_name}
        </strong>
      </div>

      <div>
        <span>File Type</span>
        <strong>
          {String(uploadedResume.file_type || "").toUpperCase()}
        </strong>
      </div>

      <div>
        <span>File Size</span>
        <strong>
          {(uploadedResume.file_size / 1024 / 1024).toFixed(2)} MB
        </strong>
      </div>

    </div>

    <a
      className="view-resume-button"
      href={`http://localhost/HireHub/${uploadedResume.file_path}`}
      target="_blank"
      rel="noreferrer"
    >
      View Resume
    </a>
    <button
      type="button"
      className="delete-resume-button"
      onClick={handleDeleteResume}
    >
      Delete Resume
    </button>

  </section>
)}

<div className="resume-actions">

            <button
              type="submit"
              className="save-resume-button"
              disabled={saving}
            >
              {saving
                ? "Saving..."
                : "Save Resume"}
            </button>

          </div>

        </form>

      </main>

    </div>
  );
}

export default CandidateResume;





