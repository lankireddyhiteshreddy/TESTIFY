import { createContext, useContext, useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }

        const run = async () => {
            try {
                const res = await axiosInstance.get('/auth/me', { withCredentials: true });
                if (res.data && res.data.user) {
                    login(res.data.user); // Save user info to state/localStorage
                }
            } catch (err) {
                logout();
            }
        };
        run();
    }, []);


    const login = (userData) => {
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
    };

    const logout = async () => {
        try {
            localStorage.removeItem('user');
            setUser(false); 
            await axiosInstance.post('/auth/logout');
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
