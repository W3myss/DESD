// components/Profile.jsx
import { useState, useEffect } from "react";
import api from "../api";
import Navbar from "../components/Navbar";


function Profile() {
  const [profile, setProfile] = useState({
    bio: "",
    course: "",
    year: "",
    interests: "",
    achievements: ""
  });

  useEffect(() => {
    getProfile();
  }, []);

  const getProfile = () => {
    api
      .get("/api/profile/")
      .then((res) => {
        setProfile(res.data);
      })
      .catch((err) => console.log(err));
  };

  const updateProfile = (e) => {
    e.preventDefault();
    api
      .patch("/api/profile/", profile)
      .then((res) => {
        if (res.status === 200) alert("Profile updated!");
        else alert("Error updating profile!");
      })
      .catch((error) => alert(error));
  };

  const handleChange = (e) => {
    setProfile({
      ...profile,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div>
        <Navbar title="Profile" />
      <h1>Your Profile</h1>
      <form onSubmit={updateProfile}>
        <div>
          <label>Bio:</label>
          <textarea
            name="bio"
            value={profile.bio}
            onChange={handleChange}
          />
        </div>
        <div>
          <label>Course:</label>
          <input
            type="text"
            name="course"
            value={profile.course}
            onChange={handleChange}
          />
        </div>
        <div>
          <label>Year:</label>
          <input
            type="number"
            name="year"
            value={profile.year}
            onChange={handleChange}
          />
        </div>
        <div>
          <label>Interests:</label>
          <textarea
            name="interests"
            value={profile.interests}
            onChange={handleChange}
          />
        </div>
        <div>
          <label>Achievements:</label>
          <textarea
            name="achievements"
            value={profile.achievements}
            onChange={handleChange}
          />
        </div>
        <button type="submit">Update Profile</button>
      </form>
    </div>
  );
}

export default Profile;