import { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useRequest } from '../utils/useRequest.jsx';
import { showSuccess } from '../utils/toast.jsx';

const BASE_API = import.meta.env.VITE_BASE_API;
const BASE_API_MOBILE = `http://${window.location.hostname}:8080`;

const getBaseURI = () => /iphone|ipad|ipod|Android/i.test(navigator.userAgent) ? BASE_API_MOBILE : BASE_API;
let API = getBaseURI();

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const { execute, isLoading, error, setError, setIsLoading } = useRequest();
  const navigate = useNavigate();

  const verifyAuth = async () => {
    await execute(async () => {
      const token = localStorage.getItem('token');
      if (!token) return setUser(null);

      const res = await axios.get(`${API}/auth/check-auth`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });
      setUser(res.data.user);
    }, 'Failed to verify user');
  };

  useEffect(() => {
    API = getBaseURI();
    verifyAuth();
  }, []);

  const login = async (identifier, password) => {
    return await execute(async () => {
      const res = await axios.post(`${API}/auth/login`, { email: identifier, password });
      const { token, user } = res.data;
      setUser(user);
      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      showSuccess('Logged in successfully');
      return res.data;
    }, 'Login failed');
  };

  const signup = async (userName, email, password) => {
    return await execute(async () => {
      const res = await axios.post(`${API}/auth/signup`, { userName, email, password });
      const { token, user } = res.data;
      setUser(user);
      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      showSuccess('Account created');
      navigate(user.isVerified ? '/' : '/verify-email');
    }, 'Signup failed');
  };

  const googleLogin = async (response) => {
    return await execute(async () => {
      const res = await axios.post(`${API}/auth/google/login`, { googleToken: response.credential });
      const { token, user } = res.data;
      setUser(user);
      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      showSuccess('Logged in with Google');
      navigate(user.isVerified ? '/' : '/verify-email');
    }, 'Google login failed');
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    showSuccess('Logged out');
    navigate('/login');
  };

  const verifyEmail = async (code) => {
    return await execute(async () => {
      const res = await axios.post(`${API}/auth/verify-email`, { code });
      setUser(res.data.user);
      showSuccess('Email verified');
      navigate('/');
    }, 'Email verification failed');
  };

  const updateUserData = async (data) => {
    return await execute(async () => {
      const res = await axios.put(`${API}/auth/update-user`, data, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setUser(res.data.user);
      showSuccess('Profile updated');
    }, 'Update failed');
  };

  return (
    <AuthContext.Provider value={{
      user, isLoading, error,
      setIsLoading, setError,
      login, signup, googleLogin, logout, verifyAuth, verifyEmail, updateUserData,
    }}>
      {!isLoading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
