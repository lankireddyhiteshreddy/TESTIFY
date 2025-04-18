import React , {useState} from 'react';
import axiosInstance from '../api/axiosInstance';
import {useNavigate} from 'react-router-dom';

function Register(){
    const [user_name,setUsername] = useState('');
    const [email,setEmail] = useState('');
    const [password,setPassword] = useState('');
    const [reenterPassword,setReenterPassword] = useState('');
    const [message,setMessage] = useState('');
    const navigate = useNavigate();

    async function submitFunc(e){
        e.preventDefault();
        if(password!==reenterPassword) setMessage("Passwords do not match!!");
        else{
            try{
                const returnVal = await axiosInstance.post('/auth/register',{user_name,email,password});
                if(!returnVal.data || !returnVal.data.user){
                    setMessage(returnVal.data.message);
                };
                console.log(returnVal);
                navigate('/');
            }
            catch(err){
                setMessage(err.message);
            }
        }
    }

    return(
        <>
            <h2>Register Page</h2>
            {message && <p>{message}</p>}
            <form onSubmit={submitFunc}>
                <input type="text" value={user_name} placeholder='username' onChange={(e)=>setUsername(e.target.value)} required/><br/>
                <input type="email" value={email} placeholder='email' onChange={(e)=>setEmail(e.target.value)} required/><br/>
                <input type="password" value={password} placeholder='password' onChange={(e)=>setPassword(e.target.value)} required/><br/>
                <input type="password" value={reenterPassword} placeholder='re-enter password' onChange={(e)=>setReenterPassword(e.target.value)} required/><br/>
                <button type='submit'>Register</button><br/>
            </form>
        </>
    );
}

export default Register;