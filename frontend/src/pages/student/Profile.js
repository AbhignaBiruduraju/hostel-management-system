import { useState, useEffect } from "react";
import axios from "axios";
import "./Profile.css";

const Profile = () => {
  const studentId = localStorage.getItem("studentId");
  const [profileData, setProfileData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [profilePicPreview, setProfilePicPreview] = useState(""); // For displaying selected image preview
  const [selectedFile, setSelectedFile] = useState(null); // To hold the actual file object
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!studentId) {
      setError("No student ID found. Please login again.");
      setIsLoading(false);
      return;
    }

    const fetchProfile = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/student/${studentId}`);
        setProfileData(res.data);
        // Set initial profile picture preview
        setProfilePicPreview(res.data.profilePic || "default-user.png");
      } catch (err) {
        console.error("Failed to load profile", err);
        setError("Failed to load profile data. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [studentId]);

  const handleProfilePicChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        alert("Image size should be less than 2MB");
        setSelectedFile(null); // Clear selected file
        setProfilePicPreview(profileData.profilePic || "default-user.png"); // Revert preview
        return;
      }
      setSelectedFile(file); // Store the file object
      setProfilePicPreview(URL.createObjectURL(file)); // Set preview for display
    }
  };

  const handleChange = (e) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
  };

  const toggleEdit = async () => {
    if (isEditing) {
      try {
        setIsLoading(true);

        const formData = new FormData();
        formData.append("name", profileData.name);
        formData.append("username", profileData.username);
        formData.append("phone", profileData.phone);
        formData.append("rollNumber", profileData.rollNumber);
        formData.append("hostel", profileData.hostel);
        formData.append("roomNumber", profileData.roomNumber);
        if (profileData.password) {
          formData.append("password", profileData.password);
        }

        if (selectedFile) {
          formData.append("profilePic", selectedFile); // Append the actual file
        } else if (profileData.profilePic) {
          // If no new file selected, but existing profilePic exists, send its path
          formData.append("profilePic", profileData.profilePic);
        } else {
          // If no new file and no existing pic, send a default or empty string
          formData.append("profilePic", "default-user.png");
        }


        await axios.put(`http://localhost:5000/api/student/${studentId}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data', // Important for file uploads
          },
        });
        setIsEditing(false);
        setSelectedFile(null); // Clear the selected file after upload
        // Refresh profile data to get the latest pic path from backend
        const res = await axios.get(`http://localhost:5000/api/student/${studentId}`);
        setProfileData(res.data);
        setProfilePicPreview(res.data.profilePic || "default-user.png");


        alert("Profile updated successfully!");
      } catch (err) {
        console.error("Update failed", err);
        alert("Error updating profile. Please try again.");
      } finally {
        setIsLoading(false);
      }
    } else {
      setIsEditing(true);
    }
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setSelectedFile(null); // Clear any selected file
    // Reset to original data
    axios.get(`http://localhost:5000/api/student/${studentId}`)
      .then((res) => {
        setProfileData(res.data);
        // Use default-user.png as fallback when cancelling edit
        setProfilePicPreview(res.data.profilePic || "default-user.png");
      });
  };

  if (isLoading) return (
    <div className="profile-loading">
      <div className="spinner"></div>
      <p>Loading your profile...</p>
    </div>
  );

  if (error) return (
    <div className="profile-error">
      <div className="error-icon">!</div>
      <p>{error}</p>
      <button className="retry-btn" onClick={() => window.location.reload()}>Retry</button>
    </div>
  );

  if (!profileData) return <div>No profile data available</div>;

  return (
    <div className="profile-container">
      <div className="profile-card">
        <div className="profile-header">
          <h2>Student Profile</h2>
          <p>Manage your personal information</p>
        </div>

        <div className="profile-content">
          <div className="profile-picture-section">
            <div className="profile-picture-container">
              <label htmlFor="profile-upload" className="profile-picture-wrapper">
                <img
                  src={profilePicPreview === 'default-user.png' ? '/default-user.png' : (profilePicPreview.startsWith('http') ? profilePicPreview : `http://localhost:5000/${profilePicPreview}`)}
                  alt="Profile"
                  className="profile-picture"
                  onError={(e) => { e.target.src = '/default-user.png'; } }
                />
                {isEditing && (
                  <div className="profile-picture-overlay">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" width="24px" height="24px">
                      <path d="M0 0h24v24H0z" fill="none"/>
                      <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                    </svg>
                  </div>
                )}
              </label>
              <input
                type="file"
                id="profile-upload"
                accept="image/*"
                onChange={handleProfilePicChange}
                style={{ display: "none" }}
                disabled={!isEditing}
              />
            </div>
            {isEditing && (
              <button
                className="upload-btn"
                onClick={() => document.getElementById("profile-upload").click()}
              >
                Change Photo
              </button>
            )}
          </div>

          <div className="profile-details">
            {[
              { key: "name", label: "Full Name" },
              { key: "username", label: "Username" },
              { key: "phone", label: "Phone Number", type: "tel" },
              { key: "rollNumber", label: "Roll Number" },
              { key: "hostel", label: "Block" },
              { key: "roomNumber", label: "Room Number" },
              { key: "password", label: "Password", type: "password" }
            ].map((field) => (
              <div key={field.key} className="profile-field">
                <label>{field.label}</label>
                <input
                  type={field.type || "text"}
                  name={field.key}
                  value={field.key === 'hostel' ? (profileData[field.key] || '').replace("Hostel", "Block") : (profileData[field.key] || '')}
                  onChange={handleChange}
                  disabled={!isEditing}
                  placeholder={`Enter your ${field.label.toLowerCase()}`}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="profile-actions">
          {isEditing ? (
            <>
              <button className="save-btn" onClick={toggleEdit} disabled={isLoading}>
                {isLoading ? "Saving..." : "Save Changes"}
              </button>
              <button className="cancel-btn" onClick={cancelEdit} disabled={isLoading}>
                Cancel
              </button>
            </>
          ) : (
            <button className="edit-btn" onClick={toggleEdit}>
              Edit Profile
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;