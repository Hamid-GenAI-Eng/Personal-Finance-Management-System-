import { useEffect, useState } from "react";
import { Pencil, Trash } from "lucide-react";
import axios from "axios";
import { useNavigate } from "react-router-dom"; // Import useNavigate from React Router
import './admin_pannel.css';
import BackButton from "./backbutton";

const AdminPanel = () => {
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState(""); // State for search input
  const [filteredUsers, setFilteredUsers] = useState([]);
  const navigate = useNavigate(); // Initialize useNavigate hook for navigation

  useEffect(() => {
    axios
      .get("http://localhost:5001/api/admin/users")
      .then((res) => {
        setUsers(res.data);
        setFilteredUsers(res.data); // Initialize filteredUsers with full user list
      })
      .catch((err) => console.error(err));
  }, []);

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);

    // Filter users by name or email based on search query
    const filtered = users.filter(
      (user) =>
        user.fullname.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query)
    );
    setFilteredUsers(filtered);
  };

  const handleUserClick = (userId) => {
    // Redirect to the user's dashboard using the userId
    navigate(`/dashboard/${userId}`);
  };

  const user = localStorage.getItem("userEmail");
  const userID = user.split("@")[0];

  return (
    <div>
      <header className="header">
        <span className="welcome-text">Salam, Welcome back <strong>{userID}</strong></span>
        <span> <BackButton/> </span>
        <input
          type="text"
          placeholder="Search by name or email"
          value={searchQuery}
          onChange={handleSearch}
          className="search-box"
        />
      </header>
      <div className="main">
        <div className="userlist">
          <h2>User List</h2>
          {filteredUsers.length > 0 ? (
            <ul>
              {filteredUsers.map((user) => (
                <li key={user._id} onClick={() => handleUserClick(user._id)} className="clickable-user-item">
                  <div className="user-info">
                    <p><strong>Name:</strong> {user.fullname}</p>
                    <p><strong>Email:</strong> {user.email}</p>
                  </div>
                  <div className="user-actions">
                    <Pencil size={18} />
                    <Trash size={18} />
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p>No users found.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
