import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminUsers.css";

function AdminUsers() {
  const navigate = useNavigate();

  const [admin, setAdmin] = useState(null);
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [updatingUser, setUpdatingUser] = useState(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const savedUser = localStorage.getItem("hirehub_user");

    if (!savedUser) {
      navigate("/login");
      return;
    }

    try {
      const loggedInUser = JSON.parse(savedUser);

      if (loggedInUser.role !== "admin") {
        navigate("/login");
        return;
      }

      setAdmin(loggedInUser);
      fetchUsers(loggedInUser.id);

    } catch (error) {
      console.error("Admin user error:", error);
      navigate("/login");
    }
  }, [navigate]);

  const fetchUsers = async (adminId) => {
    try {
      setLoading(true);
      setMessage("");

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/admin.php?admin_id=${adminId}&action=users`
      );

      const data = await response.json();

      console.log("Admin users response:", data);

      if (data.success) {
        setUsers(data.users || []);

        try {
          await fetch(
            "${import.meta.env.VITE_API_URL}/api/admin.php",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json"
              },
              body: JSON.stringify({
                action: "log_activity",
                admin_id: adminId,
                activity_action: "user_management",
                description: "Admin opened User Management.",
                user_name: admin?.name || "HireHub Admin",
                user_email: admin?.email || "",
                role: admin?.role || "admin"
              })
            }
          );
        } catch (activityError) {
          console.error(
            "Activity logging error:",
            activityError
          );
        }

      } else {
        setMessage(
          data.message || "Unable to load users."
        );
      }

    } catch (error) {
      console.error("Users error:", error);
      setMessage(
        "Unable to connect to HireHub server."
      );

    } finally {
      setLoading(false);
    }
  };

  const updateUserStatus = async (user) => {

    if (!admin?.id) {
      setMessage("Admin session not found.");
      return;
    }

    if (user._id === admin.id) {
      setMessage("You cannot deactivate your own admin account.");
      return;
    }

    const newStatus =
      user.status === "active"
        ? "inactive"
        : "active";

    const actionText =
      newStatus === "active"
        ? "activate"
        : "deactivate";

    const confirmed = window.confirm(
      `Are you sure you want to ${actionText} ${user.name}?`
    );

    if (!confirmed) {
      return;
    }

    try {

      setUpdatingUser(user._id);
      setMessage("");

      const response = await fetch(
        "${import.meta.env.VITE_API_URL}/api/admin.php",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            action: "update_status",
            admin_id: admin.id,
            user_id: user._id,
            status: newStatus
          })
        }
      );

      const data = await response.json();

      console.log("Update user response:", data);

      if (!data.success) {
        setMessage(
          data.message || "Unable to update user status."
        );
        return;
      }

      setUsers((currentUsers) =>
        currentUsers.map((currentUser) =>
          currentUser._id === user._id
            ? {
                ...currentUser,
                status: newStatus
              }
            : currentUser
        )
      );

      setMessage(
        `${user.name} has been ${
          newStatus === "active"
            ? "activated"
            : "deactivated"
        } successfully.`
      );

    } catch (error) {

      console.error("Update status error:", error);
      setMessage(
        "Unable to connect to HireHub server."
      );

    } finally {
      setUpdatingUser(null);
    }
  };

  const logout = () => {
    localStorage.removeItem("hirehub_user");
    navigate("/login");
  };

  const filteredUsers = users.filter((user) => {

    const searchText = search.toLowerCase();

    const matchesSearch =
      (user.name || "")
        .toLowerCase()
        .includes(searchText) ||
      (user.email || "")
        .toLowerCase()
        .includes(searchText);

    const matchesRole =
      roleFilter === "all" ||
      user.role === roleFilter;

    const matchesStatus =
      statusFilter === "all" ||
      user.status === statusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  });

  return (
    <div className="admin-users-page">

      {/* =====================================================
          SIDEBAR
          ===================================================== */}

      <aside className="admin-users-sidebar">

        {/* SAME HIREHUB LOGO */}
        <div className="admin-users-logo">
          Hire<span>Hub</span>
        </div>


        {/* ADMIN PROFILE */}
        <div className="admin-users-profile">

          <div className="admin-users-avatar">
            {admin?.name?.charAt(0)?.toUpperCase() || "A"}
          </div>

          <div>
            <strong>
              {admin?.name || "HireHub Admin"}
            </strong>

            <small>
              Administrator
            </small>
          </div>

        </div>


        {/* FULL ADMIN NAVIGATION */}
        <nav className="admin-users-nav">

          {/* Dashboard */}
          <button
            type="button"
            onClick={() =>
              navigate("/admin/dashboard")
            }
          >
            <span className="admin-nav-icon">
              🏠
            </span>

            <span>
              Dashboard
            </span>
          </button>


          {/* User Management */}
          <button
            type="button"
            className="active"
          >
            <span className="admin-nav-icon">
              👤
            </span>

            <span>
              User Management
            </span>
          </button>


          {/* Jobs */}
          <button
            type="button"
            onClick={() =>
              navigate("/admin/jobs")
            }
          >
            <span className="admin-nav-icon">
              💼
            </span>

            <span>
              Jobs
            </span>
          </button>


          {/* Applications */}
          <button
            type="button"
            onClick={() =>
              navigate("/admin/applications")
            }
          >
            <span className="admin-nav-icon">
              📋
            </span>

            <span>
              Applications
            </span>
          </button>


          {/* Interviews */}
          <button
            type="button"
            onClick={() =>
              navigate("/admin/interviews")
            }
          >
            <span className="admin-nav-icon">
              🎯
            </span>

            <span>
              Interviews
            </span>
          </button>


          {/* Analytics */}
          <button
            type="button"
            onClick={() =>
              navigate("/admin/analytics")
            }
          >
            <span className="admin-nav-icon">
              📊
            </span>

            <span>
              Analytics
            </span>
          </button>


          {/* Reports */}
          <button
            type="button"
            onClick={() =>
              navigate("/admin/reports")
            }
          >
            <span className="admin-nav-icon">
              📄
            </span>

            <span>
              Reports
            </span>
          </button>


          {/* Activity Logs */}
          <button
            type="button"
            onClick={() =>
              navigate("/admin/activity")
            }
          >
            <span className="admin-nav-icon">
              ☷
            </span>

            <span>
              Activity Logs
            </span>
          </button>

        </nav>


        {/* LOGOUT */}
        <button
          type="button"
          className="admin-users-logout"
          onClick={logout}
        >
          <span className="admin-nav-icon">
            ↪
          </span>

          <span>
            Logout
          </span>
        </button>

      </aside>


      {/* =====================================================
          MAIN
          ===================================================== */}

      <main className="admin-users-main">

        <header className="admin-users-header">

          <div>

            <span className="admin-users-badge">
              ADMIN CONTROL
            </span>

            <h1>
              User Management
            </h1>

            <p>
              Manage HireHub candidates, employers and administrators.
            </p>

          </div>

          <button
            className="admin-users-back"
            onClick={() =>
              navigate("/admin/dashboard")
            }
          >
            Dashboard
          </button>

        </header>


        {message && (
          <div className="admin-users-message">
            {message}
          </div>
        )}


        {/* SEARCH / FILTERS */}

        <section className="admin-users-toolbar">

          <div className="admin-users-search">

            <label>
              Search Users
            </label>

            <input
              type="text"
              placeholder="Search by name or email..."
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
            />

          </div>


          <div className="admin-users-filter">

            <label>
              Role
            </label>

            <select
              value={roleFilter}
              onChange={(event) =>
                setRoleFilter(event.target.value)
              }
            >
              <option value="all">
                All Roles
              </option>

              <option value="candidate">
                Candidate
              </option>

              <option value="employer">
                Employer
              </option>

              <option value="admin">
                Admin
              </option>
            </select>

          </div>


          <div className="admin-users-filter">

            <label>
              Status
            </label>

            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value)
              }
            >
              <option value="all">
                All Status
              </option>

              <option value="active">
                Active
              </option>

              <option value="inactive">
                Inactive
              </option>
            </select>

          </div>

        </section>


        {/* USERS */}

        <section className="admin-users-card">

          <div className="admin-users-card-header">

            <div>
              <h2>
                All Users
              </h2>

              <p>
                {filteredUsers.length} user
                {filteredUsers.length !== 1
                  ? "s"
                  : ""}{" "}
                found
              </p>
            </div>

          </div>


          {loading ? (

            <div className="admin-users-empty">

              <h3>
                Loading users...
              </h3>

              <p>
                Please wait while HireHub loads the users.
              </p>

            </div>

          ) : filteredUsers.length === 0 ? (

            <div className="admin-users-empty">

              <h3>
                No users found
              </h3>

              <p>
                Try changing your search or filter options.
              </p>

            </div>

          ) : (

            <div className="admin-users-table-wrapper">

              <table className="admin-users-table">

                <thead>

                  <tr>
                    <th>User</th>
                    <th>Role</th>
                    <th>Phone</th>
                    <th>Status</th>
                    <th>Joined</th>
                    <th>Action</th>
                  </tr>

                </thead>

                <tbody>

                  {filteredUsers.map((user) => {

                    const isCurrentAdmin =
                      user._id === admin?.id;

                    return (

                      <tr key={user._id}>

                        <td>

                          <div className="admin-user-info">

                            <div className="admin-user-row-avatar">

                              {user.name
                                ?.charAt(0)
                                ?.toUpperCase() || "U"}

                            </div>

                            <div>

                              <strong>
                                {user.name ||
                                  "Unnamed User"}
                              </strong>

                              <span>
                                {user.email ||
                                  "No email"}
                              </span>

                            </div>

                          </div>

                        </td>


                        <td>

                          <span
                            className={`admin-role admin-role-${user.role}`}
                          >
                            {user.role}
                          </span>

                        </td>


                        <td>
                          {user.phone || "—"}
                        </td>


                        <td>

                          <span
                            className={`admin-status ${
                              user.status === "active"
                                ? "active"
                                : "inactive"
                            }`}
                          >

                            <span></span>

                            {user.status ||
                              "unknown"}

                          </span>

                        </td>


                        <td>

                          {user.created_at
                            ? new Date(
                                user.created_at
                              ).toLocaleDateString()
                            : "—"}

                        </td>


                        <td>

                          {isCurrentAdmin ? (

                            <span className="admin-protected">
                              Protected
                            </span>

                          ) : (

                            <button
                              className={`admin-status-button ${
                                user.status === "active"
                                  ? "deactivate"
                                  : "activate"
                              }`}
                              disabled={
                                updatingUser ===
                                user._id
                              }
                              onClick={() =>
                                updateUserStatus(user)
                              }
                            >

                              {updatingUser ===
                              user._id
                                ? "Updating..."
                                : user.status ===
                                  "active"
                                ? "Deactivate"
                                : "Activate"}

                            </button>

                          )}

                        </td>

                      </tr>

                    );

                  })}

                </tbody>

              </table>

            </div>

          )}

        </section>

      </main>

    </div>
  );
}

export default AdminUsers;