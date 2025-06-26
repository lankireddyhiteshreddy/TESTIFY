import React, { useState } from 'react';
import axiosInstance from '../api/axiosInstance';
import { useNavigate } from 'react-router-dom';
import './styles.css';

function Register() {
    const [user_name, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [reenterPassword, setReenterPassword] = useState('');
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    async function submitFunc(e) {
        e.preventDefault();
        if (password !== reenterPassword) setMessage('Passwords do not match!!');
        else {
            try {
                const returnVal = await axiosInstance.post('/auth/register', { user_name, email, password });
                if (!returnVal.data || !returnVal.data.user) {
                    setMessage(returnVal.data.message);
                    return;
                }
                console.log(returnVal);
                navigate('/login');
            } catch (err) {
                setMessage(err.message);
            }
        }
    }

    const handleLoginClick = () => {
        navigate('/login');
    };
    const handleHomeClick = () => {
        navigate('/');
    }
    return (
        <div className="container">
            <nav className="navbar">
                <span>ABOUT</span>
                <span onClick={handleHomeClick}>HOME</span>
            </nav>
            <div className="form-container">
                <form onSubmit={submitFunc} className="form">
                    <input type="text" value={user_name} placeholder="username" onChange={(e) => setUsername(e.target.value)} required className="input-field" />
                    <input type="email" value={email} placeholder="email" onChange={(e) => setEmail(e.target.value)} required className="input-field" />
                    <input type="password" value={password} placeholder="Password" onChange={(e) => setPassword(e.target.value)} required className="input-field" />
                    <input type="password" value={reenterPassword} placeholder="Re-enter Password" onChange={(e) => setReenterPassword(e.target.value)} required className="input-field" />
                    <button type="submit" className="submit-button">REGISTER</button>
                    {message && <p className="error-message">{message}</p>}
                </form>
                <button onClick={handleLoginClick} className="login-button">LOGIN</button>
            </div>
        </div>
    );
}

export default Register;
