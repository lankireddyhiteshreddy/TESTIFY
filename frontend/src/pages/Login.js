import React,{useState} from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';

function Login(){
    const [user_name,setUsername] = useState('');
    const [password,setPassword] = useState('');
    const [message,setMessage] = useState('');
    const navigate = useNavigate();

    async function submitFunc(e){
        e.preventDefault();
        setMessage('');
        try{
            const returnVal = await axiosInstance.post('/auth/login',{user_name,password});
            if(!returnVal.data || !returnVal.data.user){
                setUsername('');
                setPassword('');
                return setMessage(returnVal.data.message);
            } 
            setMessage(returnVal.data.message);
            navigate('/dashboard');
        }
        catch(err){
            setMessage(`${err.message}`);
        }
    }
    return(
        <>
            <h2>Login Page</h2>
            {message && <p>{message}</p>}
            <form onSubmit={submitFunc}>
                <input type="text" placeholder='username' value={user_name} onChange={(e)=>setUsername(e.target.value)} required/><br/>
                <input type="password" placeholder='password' value={password} onChange={(e)=>setPassword(e.target.value)} required/><br/>
                <button type='submit'>Login</button><br/>
            </form>
            <button onClick={()=>navigate('/register')}>Register</button>
        </>
    );
}

export default Login;