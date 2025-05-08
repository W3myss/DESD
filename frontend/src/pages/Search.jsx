import { useState } from "react";
import api from "../api";
import Navbar from "../components/Navbar";

function UserCard({ user }) {
  // Fetch or define the current user
  const currentUser = JSON.parse(localStorage.getItem("currentUser")); // Example: Fetch from localStorage

  const handleSendRequest = () => {
    if (user.id === currentUser?.id) {
      alert("You cannot add yourself as a friend.");
      return;
    }
    api.post('/api/friend-requests/', { receiver_id: user.id })
      .then(() => alert('Friend request sent!'))
      .catch(err => {
        if (err.response?.data?.detail) {
          alert(err.response.data.detail);
        } else {
          console.error(err);
        }
      });
  };

  return (
    <div className="user-card">
      <p>{user.username}</p>
      <button onClick={handleSendRequest}>Add Friend</button>
    </div>
  );
}

function Search() {
  const [course, setCourse] = useState("");
  const [year, setYear] = useState("");
  const [interests, setInterests] = useState("");
  const [students, setStudents] = useState([]);

  const handleSearch = async () => {
    if (!course && !year && !interests) {
      alert("Please enter at least one filter to search.");
      return;
    }

    try {
      const response = await api.get(`/api/search/students/?course=${course}&year=${year}&interests=${interests}`);
      console.log("Students Response:", response.data);
      setStudents(response.data);
    } catch (err) {
      console.error("Search failed:", err);
    }
  };

  return (
    <div className="search-page">
      <Navbar />
      <div className="search-container">
        <h1>Search Students</h1>
        <input
          type="text"
          placeholder="Filter by course..."
          value={course}
          onChange={(e) => setCourse(e.target.value)}
        />
        <input
          type="text"
          placeholder="Filter by year..."
          value={year}
          onChange={(e) => setYear(e.target.value)}
        />
        <input
          type="text"
          placeholder="Filter by interests..."
          value={interests}
          onChange={(e) => setInterests(e.target.value)}
        />
        <button onClick={handleSearch}>Search</button>
      </div>
      <div className="search-results">
        <h2>Students</h2>
        {students.length > 0 ? (
          students.map(student => (
            <UserCard key={student.id} user={student} />
          ))
        ) : (
          <p>No students found.</p>
        )}
      </div>
    </div>
  );
}

export default Search;