import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import { getMe, updateProfile } from "../api";

const LANDING_URL = process.env.REACT_APP_LANDING_URL || "http://localhost:3000";

const Menu = () => {
  const [selectedMenu, setSelectedMenu] = useState(0);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [userData, setUserData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    city: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const response = await getMe();
      const user = response.data;
      setUserData(user);
      setEditForm({
        name: user.name || "",
        email: user.email || "",
        phoneNumber: user.phoneNumber || "",
        city: user.city || "",
      });
    } catch (err) {
      console.error("Failed to fetch user data:", err);
    }
  };

  const handleMenuClick = (index) => {
    setSelectedMenu(index);
  };

  const handleProfileClick = () => {
    setIsProfileModalOpen(true);
    setError("");
    setSuccess("");
    setIsEditing(false);
    fetchUserData();
  };

  const handleCloseModal = () => {
    setIsProfileModalOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("stockly_token");
    try {
      window.top.location.href = `${LANDING_URL}/login?logout=true`;
    } catch (e) {
      window.location.href = `${LANDING_URL}/login?logout=true`;
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsSaving(true);

    try {
      const response = await updateProfile(editForm);
      setUserData({
        ...userData,
        name: response.data.name,
        email: response.data.email,
        phoneNumber: response.data.phoneNumber,
        city: response.data.city,
      });
      setSuccess("Profile updated successfully!");
      setIsEditing(false);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  const getInitials = () => {
    if (!userData || !userData.name) return "..";
    const parts = userData.name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return parts[0].substring(0, 2).toUpperCase();
  };

  const menuClass = "menu";
  const activeMenuClass = "menu selected";

  return (
    <div className="menu-container">
     <img
  src="logo.svg"
  alt="Logo"
  style={{
    width: "140px",
    height: "auto",
    objectFit: "contain",
  }}
/>
      <div className="menus">
        <ul>
          <li>
            <Link
              style={{ textDecoration: "none" }}
              to="/"
              onClick={() => handleMenuClick(0)}
            >
              <p className={selectedMenu === 0 ? activeMenuClass : menuClass}>
                Dashboard
              </p>
            </Link>
          </li>
          <li>
            <Link
              style={{ textDecoration: "none" }}
              to="/orders"
              onClick={() => handleMenuClick(1)}
            >
              <p className={selectedMenu === 1 ? activeMenuClass : menuClass}>
                Orders
              </p>
            </Link>
          </li>
          <li>
            <Link
              style={{ textDecoration: "none" }}
              to="/holdings"
              onClick={() => handleMenuClick(2)}
            >
              <p className={selectedMenu === 2 ? activeMenuClass : menuClass}>
                Holdings
              </p>
            </Link>
          </li>
         
          <li>
            <Link
              style={{ textDecoration: "none" }}
              to="funds"
              onClick={() => handleMenuClick(4)}
            >
              <p className={selectedMenu === 4 ? activeMenuClass : menuClass}>
                Funds
              </p>
            </Link>
          </li>
          <li>
            <Link
              style={{ textDecoration: "none" }}
              to="/apps"
              onClick={() => handleMenuClick(6)}
            >
              <p className={selectedMenu === 6 ? activeMenuClass : menuClass}>
                Apps
              </p>
            </Link>
          </li>
        </ul>
        <hr />
        <div className="profile" onClick={handleProfileClick}>
          <div className="avatar">{getInitials()}</div>
          <p className="username">{userData ? userData.name : "Loading..."}</p>
        </div>
      </div>

      {/* ── Profile Modal (portalled to body to escape topbar containing block) ── */}
      {isProfileModalOpen && createPortal(
        <div className="profile-modal-overlay" onClick={handleCloseModal}>
          <div
            className="profile-modal-card"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="profile-modal-header">
              <h2>My Profile</h2>
              <button
                className="profile-modal-close"
                onClick={handleCloseModal}
              >
                ×
              </button>
            </div>

            {error && <div className="profile-error">{error}</div>}
            {success && <div className="profile-success">{success}</div>}

            {!isEditing ? (
              /* ── View Mode ── */
              <div className="profile-details-grid">
                <div className="profile-detail-row">
                  <span className="profile-detail-label">Name</span>
                  <span className="profile-detail-value">
                    {userData?.name || "—"}
                  </span>
                </div>
                <div className="profile-detail-row">
                  <span className="profile-detail-label">Email</span>
                  <span className="profile-detail-value">
                    {userData?.email || "—"}
                  </span>
                </div>
                <div className="profile-detail-row">
                  <span className="profile-detail-label">Phone</span>
                  <span className="profile-detail-value">
                    {userData?.phoneNumber || "—"}
                  </span>
                </div>
                <div className="profile-detail-row">
                  <span className="profile-detail-label">City</span>
                  <span className="profile-detail-value">
                    {userData?.city || "—"}
                  </span>
                </div>
                <div className="profile-detail-row">
                  <span className="profile-detail-label">Wallet Balance</span>
                  <span
                    className="profile-detail-value"
                    style={{ color: "var(--profit)", fontWeight: 600 }}
                  >
                    ₹
                    {userData?.walletBalance != null
                      ? Number(userData.walletBalance).toLocaleString("en-IN", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })
                      : "0.00"}
                  </span>
                </div>

                <div className="profile-actions">
                  <button
                    className="btn btn-blue"
                    onClick={() => setIsEditing(true)}
                  >
                    Edit Profile
                  </button>
                  <button className="btn btn-grey" onClick={handleLogout}>
                    Log Out
                  </button>
                </div>
              </div>
            ) : (
              /* ── Edit Mode ── */
              <form
                onSubmit={handleEditSubmit}
                className="profile-details-grid"
              >
                <div className="profile-edit-field">
                  <label>Full Name</label>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) =>
                      setEditForm({ ...editForm, name: e.target.value })
                    }
                  />
                </div>
                <div className="profile-edit-field">
                  <label>Email Address</label>
                  <input
                    type="email"
                    value={editForm.email}
                    onChange={(e) =>
                      setEditForm({ ...editForm, email: e.target.value })
                    }
                  />
                </div>
                <div className="profile-edit-field">
                  <label>Phone Number</label>
                  <input
                    type="text"
                    value={editForm.phoneNumber}
                    onChange={(e) =>
                      setEditForm({ ...editForm, phoneNumber: e.target.value })
                    }
                  />
                </div>
                <div className="profile-edit-field">
                  <label>City</label>
                  <input
                    type="text"
                    value={editForm.city}
                    onChange={(e) =>
                      setEditForm({ ...editForm, city: e.target.value })
                    }
                  />
                </div>

                <div className="profile-actions">
                  <button
                    type="submit"
                    className="btn btn-green"
                    disabled={isSaving}
                  >
                    {isSaving ? "Saving..." : "Save Changes"}
                  </button>
                  <button
                    type="button"
                    className="btn btn-grey"
                    onClick={() => setIsEditing(false)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default Menu;
