import React,{useState,useEffect} from 'react';
import {useNavigate} from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './styles.css';

function Login(){
    const {login} = useAuth();
    const [user_name,setUsername] = useState('');
    const [password,setPassword] = useState('');
    const [message,setMessage] = useState('');
    const [messageType,setMessageType] = useState(0);
    const navigate = useNavigate();
    const location = useLocation();
    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const message = queryParams.get('message');
        if (message) {
            setMessage(message);
        }
    }, [location.search]);

    const handleGoogleLogin = () => {
        window.location.href = 'http://localhost:3000/api/auth/google';
    };


    async function submitFunc(e){
        e.preventDefault();
        setMessage('');
        try{
            const returnVal = await axiosInstance.post('/auth/login',{user_name,password});
            if(!returnVal.data || !returnVal.data.user){
                setUsername('');
                setPassword('');
                setMessageType(1);
                return setMessage(returnVal.data.message);
            } 
            setMessage(returnVal.data.message);
            login(returnVal.data.user);
            navigate('/');
        }
        catch(err){
            setMessage(`${err.message}`);
        }
    };

    const handleHomeClick = () => {
        navigate('/');
    }

    return(
        <div className="container">
            <nav className="navbar">
                <span>ABOUT</span>
                <span onClick={handleHomeClick}>HOME</span>
            </nav>
            <div className="form-container">
                <form onSubmit={submitFunc} className='form'>
                    <input type="text" placeholder='username' value={user_name} onChange={(e)=>setUsername(e.target.value)} required className='input-field'/><br/>
                    <input type="password" placeholder='password' value={password} onChange={(e)=>setPassword(e.target.value)} required className='input-field'/><br/>
                    <button type='submit' className='submit-button'>Login</button><br/>
                    {message && <p style={{color : (messageType===1)?'red':'green'}}>{message}</p>}
                </form>
                <button onClick={()=>navigate('/register')} className="register-button">Register</button>
                <button onClick={handleGoogleLogin} className="login-button">Login with Google</button>
            </div>
        </div>
    );
}

export default Login;