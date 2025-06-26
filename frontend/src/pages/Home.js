import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import './Home.css'; 

function Home() {
    const navigate = useNavigate();
    const { user } = useAuth();

    useEffect(() => {
        if (user) {
            navigate('/dashboard');
        }
    }, [user,navigate]);

    return (
        <div className="home-container">
            <div className="home-navbar">
                <div className="home-link" onClick={() => navigate('/register')}>Register</div>
                <div className="home-link" onClick={() => navigate('/login')}>Login</div>
            </div>

            <h1 className="home-title">Practice to Perfection - Upload, Test, Ace!</h1>

            <div className="home-button-container">
                <button className="home-start-button" onClick={() => navigate('/register')}>
                    Get Started
                </button>
            </div>
        </div>
    );
}

export default Home;
