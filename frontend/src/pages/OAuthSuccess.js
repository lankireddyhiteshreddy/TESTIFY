import { useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const OAuthSuccess = () => {
  const navigate = useNavigate();
  const {login} = useAuth();

  useEffect(() => {
    const func = async()=>{
        try{
            const res = await axiosInstance.get('/auth/me', {withCredentials: true});
            login(res.data.user);
            navigate("/"); 
        }
        catch(e){
            console.error("Auth check failed after Google login", e);
            navigate("/login?message=login_failed");
        }
    }
    func();
  }, [navigate,login]);

  return <p>Finalizing login...</p>;
};

export default OAuthSuccess;
