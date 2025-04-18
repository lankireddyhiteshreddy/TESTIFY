import React,{useState,useEffect} from 'react';
import axiosInstance from '../api/axiosInstance';
import { useNavigate } from 'react-router-dom';

function Dashboard(){
    const [user_name,setUsername] = useState('');
    const [message,setMessage] = useState('');
    const navigate = useNavigate();
    async function getDashboard() {
        try {
            const response = await axiosInstance.get('/dashboard');
            setMessage(response.data.message);
            setUsername(response.data.user.user_name);
        } catch (error) {
            console.log(error.message);
            setMessage(error.message);
        }
    }

    async function deleteAccount(){
        try{
            const returnVal = await axiosInstance.delete('/deregister',{data : {user_name}});
            setMessage(returnVal.data.message);
            navigate('/');
        }
        catch(err){
            setMessage(err.message);
        }
    };

    useEffect(()=>{
        getDashboard();
    },[]);

    return (
        <div>
            <h2>Dashboard</h2>
            {message && <p>{message}</p>}
            {user_name && <p>Username : {user_name}</p>}
            <button onClick={deleteAccount}>Delete Account</button>
        </div>
    );
}

export default Dashboard;