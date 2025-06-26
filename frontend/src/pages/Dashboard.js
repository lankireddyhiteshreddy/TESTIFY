import { useNavigate } from 'react-router-dom';
import {useAuth} from '../context/AuthContext';
import './Dashboard.css'

function Dashboard() {
  const navigate = useNavigate();
  const {logout} = useAuth();
  
  return (
    <div className="dashboard-container">
      <nav className="navbar">
        <span>ABOUT</span>
        <span onClick={()=>navigate('/dashboard/profile')}>PROFILE</span>
        <span onClick={logout} className="logout-link">LOGOUT</span>
      </nav>

      <h1 className="title">Practice to Perfection - Upload, Test, Ace!</h1>

      <div className="button-container">
          <button className="start-button" onClick={() => navigate('/tests')}>
            DISPLAY MY TESTS
          </button>
          <button className="start-button" onClick={() => navigate('/create-test')}>
            GET STARTED (CREATE A TEST)
          </button>
          <button className="start-button" onClick={() => navigate('/public-tests')}>
            DISPLAY PUBLIC TESTS
          </button>
      </div>
    </div>
  );
}

export default Dashboard;
