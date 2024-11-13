import React, { createContext, useState, useContext, useEffect} from 'react'
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const AuthProvider = ({children}) => {

    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const verifyAuth = async () => {
        try{
            axios.defaults.withCredentials = true;
            const response = await axios.get('http://localhost:8080/auth/check-auth');
            setUser(response.data.user);
        }
        catch(error){
            console.error('verify auth failed', error);
        }
        finally{
            setIsLoading(false);
        }
    }

    useEffect(() => {
        const checkTokenAndVerifyAuth = async () => {
            const token = localStorage.getItem('token');
            if(token){
                axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                await verifyAuth();
            }
            else{
                setIsLoading(false);
            }
        };
        
        checkTokenAndVerifyAuth();
    
    },[]);


    const login = async (email, password) => {
        setIsLoading(true);
        setError(null);
        try{
            const response = await axios.post('http://localhost:8080/auth/login', {email, password});
            const {token, user} = response.data;
            setUser(user);
            console.log('user', user);
            localStorage.setItem('token', token);
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            navigate(user.isVerified ? '/' : '/verify-email');
            toast.success('Logged in successfully',{
                position: 'bottom-right'
            });
        }
        catch(error){
            console.error('login failed', error);
            setError(error.response?.data?.message || 'An error occurred while logging in');
        }
        finally{
            setIsLoading(false);
        }
    }

    const signup = async ( userName, email, password) => {
        setIsLoading(true);
        setError(null);
        try{
            const response = await axios.post('http://localhost:8080/auth/signup', { userName, email, password});
            const {token, user} = response.data;
            setUser(user);
            console.log('user', user);
            localStorage.setItem('token', token);
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            
            navigate(user.isVerified ? '/' : '/verify-email');
        }
        catch(error){
            console.error('signup failed', error);
            setError(error.response?.data?.message || 'An error occurred during signup');
        }
        finally{
            setIsLoading(false);
        }
    }

    const logout = () => {
        setUser(null);
        localStorage.removeItem('token');
        delete axios.defaults.headers.common['Authorization'];
        navigate('/login');
    }

    const verifyEmail = async (code) => {
        setIsLoading(true);
        setError(null);
        try{
            const response = await axios.post('http://localhost:8080/auth/verify-email', {code});
            console.log('verify email', response);
            if(response.data.success){
                setUser(response.data.user);
                navigate('/');
            }
            else{
                console.log('email not verified');
                setError(response.data.message || 'Email verification failed');
            }
        }
        catch(error){
            console.error('Verifying email failed', error);
            setError(error.response?.data?.message || 'An error occurred while verifying email');
        }
        setIsLoading(false);
    }

    const updateUserData = async (data) => {
        setIsLoading(true);
        setError(null);
        try{
            const response = await axios.put('http://localhost:8080/auth/update-user', data);
            setUser(response.data.user);
            toast.success('Profile Updated',{
                position: 'bottom-right'
            });
        }
        catch(error){
            console.error('Update user data failed', error);
            setError(error.response?.data?.message || 'An error occurred while updating profile');
        }
        setIsLoading(false);
    }

    return(
        <AuthContext.Provider value={{user, login, signup, logout, verifyAuth, verifyEmail, updateUserData , isLoading, error, setError}}>
            {!isLoading && children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => {
    return useContext(AuthContext);
}