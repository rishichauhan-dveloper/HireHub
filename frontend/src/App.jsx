import {
  BrowserRouter,
  Routes,
  Route,
  Navigate
} from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import CandidateDashboard from "./pages/CandidateDashboard";
import FindJobs from "./pages/FindJobs";
import JobDetails from "./pages/JobDetails";
import Applications from "./pages/Applications";
import CandidateProfile from "./pages/CandidateProfile";
import CandidateResume from "./pages/CandidateResume";
import EmployerDashboard from "./pages/EmployerDashboard";
import EmployerCreateJob from "./pages/EmployerCreateJob";
import EmployerJobs from "./pages/EmployerJobs";
import EmployerApplications from "./pages/EmployerApplications";
import EmployerApplicationDetails from "./pages/EmployerApplicationDetails";
import SavedJobs from "./pages/SavedJobs";
import EmployerEditJob from "./pages/EmployerEditJob";
import EmployerScheduleInterview from "./pages/EmployerScheduleInterview";
import CandidateInterviewDetails from "./pages/CandidateInterviewDetails";
import EmployerInterviews from "./pages/EmployerInterviews";
import CandidateMatches from "./pages/CandidateMatches";
import EmployerMatching from "./pages/EmployerMatching";
import AdminDashboard from "./pages/AdminDashboard";
import AdminUsers from "./pages/AdminUsers";
import AdminApplications from "./pages/AdminApplications";
import AdminInterviews from "./pages/AdminInterviews";
import AdminJobs from "./pages/AdminJobs";
import AdminAnalytics from "./pages/AdminAnalytics";
import AdminReports from "./pages/AdminReports";
import AdminActivityLogs from "./pages/AdminActivityLogs";

/*
|--------------------------------------------------------------------------
| Protected Candidate Route
|--------------------------------------------------------------------------
*/

function CandidateRoute({ children }) {

  const savedUser =
    localStorage.getItem("hirehub_user");

  if (!savedUser) {
    return <Navigate to="/login" replace />;
  }

  try {
    const user = JSON.parse(savedUser);

    if (user.role !== "candidate") {
      if (user.role === "employer") {
        return <Navigate to="/employer/dashboard" replace />;
      }

      if (user.role === "admin") {
        return <Navigate to="/admin/dashboard" replace />;
      }

      return <Navigate to="/login" replace />;
    }

    return children;

  } catch (error) {
    localStorage.removeItem("hirehub_user");
    return <Navigate to="/login" replace />;
  }
}


/*
|--------------------------------------------------------------------------
| Protected Employer Route
|--------------------------------------------------------------------------
*/

function EmployerRoute({ children }) {

  const savedUser =
    localStorage.getItem("hirehub_user");

  if (!savedUser) {
    return <Navigate to="/login" replace />;
  }

  try {
    const user = JSON.parse(savedUser);

    if (user.role !== "employer") {
      if (user.role === "candidate") {
        return <Navigate to="/dashboard" replace />;
      }

      if (user.role === "admin") {
        return <Navigate to="/admin/dashboard" replace />;
      }

      return <Navigate to="/login" replace />;
    }

    return children;

  } catch (error) {
    localStorage.removeItem("hirehub_user");
    return <Navigate to="/login" replace />;
  }
}

/*
|--------------------------------------------------------------------------
| Protected Admin Route
|--------------------------------------------------------------------------
*/

function AdminRoute({ children }) {

  const savedUser =
    localStorage.getItem("hirehub_user");

  if (!savedUser) {
    return <Navigate to="/login" replace />;
  }

  try {
    const user = JSON.parse(savedUser);

    if (user.role !== "admin") {
      if (user.role === "candidate") {
        return <Navigate to="/dashboard" replace />;
      }

      if (user.role === "employer") {
        return <Navigate to="/employer/dashboard" replace />;
      }

      return <Navigate to="/login" replace />;
    }

    return children;

  } catch (error) {
    localStorage.removeItem("hirehub_user");
    return <Navigate to="/login" replace />;
  }
}

/*
|--------------------------------------------------------------------------
| App
|--------------------------------------------------------------------------
*/

function App() {

  return (
    <BrowserRouter>

      <Routes>

        {/* LOGIN */}

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />

        <Route
          path="/forgot-password"
          element={<ForgotPassword />}
        />

<Route
  path="/reset-password"
  element={<ResetPassword />}
/>
        

        {/* CANDIDATE DASHBOARD */}

        <Route
          path="/"
          element={
            <CandidateRoute>
              <CandidateDashboard />
            </CandidateRoute>
          }
        />

        <Route
          path="/dashboard"
          element={
            <CandidateRoute>
              <CandidateDashboard />
            </CandidateRoute>
          }
        />


        {/* FIND JOBS */}

        <Route
          path="/jobs"
          element={
            <CandidateRoute>
              <FindJobs />
            </CandidateRoute>
          }
        />
<Route
  path="/jobs/saved"
  element={
    <CandidateRoute>
      <SavedJobs />
    </CandidateRoute>
  }
/>
        <Route
          path="/jobs/:jobId"
          element={
            <CandidateRoute>
              <JobDetails />
            </CandidateRoute>
          }
        />


        {/* APPLICATIONS */}

        <Route
          path="/applications"
          element={
            <CandidateRoute>
              <Applications />
            </CandidateRoute>
          }
        />


        {/* PROFILE */}

        <Route
          path="/profile"
          element={
            <CandidateRoute>
              <CandidateProfile />
            </CandidateRoute>
          }
        />
        <Route
          path="/matches"
          element={
        <CandidateRoute>
        <CandidateMatches />
        </CandidateRoute>
  }
/>
<Route
  path="/employer/matching/:jobId"
  element={
    <EmployerRoute>
      <EmployerMatching />
    </EmployerRoute>
  }
/>

        {/* RESUME */}

        <Route
          path="/resume"
          element={
            <CandidateRoute>
              <CandidateResume />
            </CandidateRoute>
          }
        />

{/* EMPLOYER */}

<Route
  path="/employer/dashboard"
  element={
    <EmployerRoute>
      <EmployerDashboard />
    </EmployerRoute>
  }
/>

<Route
  path="/employer/applications"
  element={
    <EmployerRoute>
      <EmployerApplications />
    </EmployerRoute>
  }
/>

<Route
  path="/employer/applications/:applicationId"
  element={
    <EmployerRoute>
      <EmployerApplicationDetails />
    </EmployerRoute>
  }
/>

<Route
  path="/employer/applications/:applicationId/schedule"
  element={
    <EmployerRoute>
      <EmployerScheduleInterview />
    </EmployerRoute>
  }
/>

<Route
  path="/applications/:applicationId/interview"
  element={
    <CandidateRoute>
      <CandidateInterviewDetails />
    </CandidateRoute>
  }
/>

<Route
  path="/employer/interviews"
  element={
    <EmployerRoute>
      <EmployerInterviews />
    </EmployerRoute>
  }
/>

<Route
  path="/employer/jobs"
  element={
    <EmployerRoute>
      <EmployerJobs />
    </EmployerRoute>
  }
/>

<Route
  path="/employer/jobs/create"
  element={
    <EmployerRoute>
      <EmployerCreateJob />
    </EmployerRoute>
  }
/>

<Route
  path="/employer/jobs/:jobId/edit"
  element={
    <EmployerRoute>
      <EmployerEditJob />
    </EmployerRoute>
  }
/>
{/* ADMIN */}

<Route
  path="/admin/dashboard"
  element={
    <AdminRoute>
      <AdminDashboard />
    </AdminRoute>
  }
/>

<Route
  path="/admin/users"
  element={
    <AdminRoute>
      <AdminUsers />
    </AdminRoute>
  }
/>

<Route
  path="/admin/applications"
  element={
    <AdminRoute>
      <AdminApplications />
    </AdminRoute>
  }
/>

<Route
  path="/admin/interviews"
  element={
    <AdminRoute>
      <AdminInterviews />
    </AdminRoute>
  }
/>

<Route
  path="/admin/jobs"
  element={
    <AdminRoute>
      <AdminJobs />
    </AdminRoute>
  }
/>

<Route
  path="/admin/analytics"
  element={
    <AdminRoute>
      <AdminAnalytics />
    </AdminRoute>
  }
/>

<Route
  path="/admin/reports"
  element={
    <AdminRoute>
      <AdminReports />
    </AdminRoute>
  }
/>

<Route
  path="/admin/activity"
  element={
    <AdminRoute>
      <AdminActivityLogs />
    </AdminRoute>
  }
/>        {/* FALLBACK */}

        <Route
          path="*"
          element={<Navigate to="/login" replace />}
        />

      </Routes>

    </BrowserRouter>
  );
}

export default App;