import React, { createContext, useState, useContext, useEffect} from 'react'
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const AuthProvider = ({children}) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const navigate = useNavigate();

    const login = async (email, password) => {
        try{
            const response = await axios.post('http://localhost:8080/auth/login', {email, password});
            const {token, user} = response.data;
            console.log('token', token);
            console.log('user', user);
            setUser(user);
            localStorage.setItem('token', token);
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            navigate('/');            
        }
        catch(error){
            console.error('login failed', error);
            setError(error.response?.data?.message || 'An error occurred while logging in');
        }
    }

    const signup = async (userName, email, password) => {
        try{
            const response = await axios.post('http://localhost:8080/auth/signup', {userName, email, password});
            const {token, user} = response.data;
            setUser(user);
            console.log('user', user);
            localStorage.setItem('token', token);
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            navigate('/');
        }
        catch(error){
            console.error('signup failed', error);
            setError(error.response?.data?.message || 'An error occurred during signup');
        }
    }

    const logout = () => {
        setUser(null);
        localStorage.removeItem('token');
        delete axios.defaults.headers.common['Authorization'];
        navigate('/login');
    }

    const verifyEmail = (code) => {
        try{
            const response = axios.post('http://localhost:8080/auth/verify-email', {code});
            setUser(response.data);
        }
        catch(error){
            console.error('verify email failed', error);
            setError(error.response?.data?.message || 'An error occurred while verifying email');
        }
    }

    const verifyAuth = async () => {
        try{
            axios.defaults.withCredentials = true;
            const response = await axios.get('http://localhost:8080/auth/check-auth');
            setUser(response.data.user);
            console.log('me', response);
        }
        catch(error){
            console.error('verify auth failed', error);
            setError(error.response?.data?.message || 'An error occurred while verifying authentication');
        }
        finally{
            setLoading(false);
        }
    }

    useEffect(()=>{
        const token = localStorage.getItem('token');
        if(token){
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            verifyAuth();
        }
        else{
            setLoading(false);
        }
    },[])

    return(
        <AuthContext.Provider value={{user, login, signup, logout, verifyAuth, verifyEmail, loading, error}}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => {
    return useContext(AuthContext);
}