import { useAuth } from "../context/AuthContext";
import './Profile.css';

export default function Profile() {
    const { user, logout } = useAuth();
    console.log(user);
    return (
        <div className="profile-container">
            <h2>Your Profile</h2>
            <div className="profile-info">
                <p><strong>Username:</strong> {user.user_name}</p>
                <p><strong>Email:</strong> {user.email}</p>
            </div>

            <button className="logout-btn" onClick={logout}>Logout</button>
        </div>
    );
}
