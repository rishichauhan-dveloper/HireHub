import { useNavigate } from "react-router-dom";

function SavedJobs() {

  const navigate = useNavigate();

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#070b14",
        color: "white",
        padding: "60px",
        textAlign: "center"
      }}
    >

      <h1>Saved Jobs</h1>

      <p>
        Your saved jobs will appear here.
      </p>

      <button
        onClick={() => navigate("/dashboard")}
        style={{
          marginTop: "30px",
          padding: "12px 25px",
          cursor: "pointer"
        }}
      >
        Back to Dashboard
      </button>

    </div>
  );
}

export default SavedJobs;