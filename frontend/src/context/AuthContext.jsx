import { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const BASE_API = import.meta.env.VITE_BASE_API;
const BASE_API_MOBILE = `http://${window.location.hostname}:8080`;

const getBaseURI = () => {
  const isMobile = /iphone|ipad|ipod|Android/i.test(navigator.userAgent);
  if (isMobile) {
    return BASE_API_MOBILE;
  }
  return BASE_API;
};

let API = getBaseURI();
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleError = (error, customMessage) => {
    const errorMessage =
      error.response?.data?.message || customMessage || 'An unexpected error occurred';
    console.error(errorMessage, error);
    setError(errorMessage);
    toast.error(errorMessage, { position: 'bottom-right' });
    return errorMessage;
  };

  const verifyAuth = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setUser(null);
        return;
      }

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      };

      const response = await axios.get(`${API}/auth/check-auth`, config);
      setUser(response.data.user);
    } catch (error) {
      console.error('verify auth failed', error);
      setUser(null);
      setError(error.response?.data?.message || 'An error occurred while verifying auth');
      localStorage.removeItem('token');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const checkTokenAndVerifyAuth = async () => {
      await verifyAuth();
    };
    API = getBaseURI();
    checkTokenAndVerifyAuth();
  }, []);

  const login = async (identifier, password) => {
    setIsLoading(true);
    setError(null);
    try {
      // Validate inputs
      if (!identifier || !password) {
        const msg = 'Username/Email and password are required';
        setError(msg);
        toast.error(msg, { position: 'bottom-right' });
        return null;
      }

      console.log('Login request:', { identifier, password: '****' });

      const response = await axios.post(`${API}/auth/login`, { email: identifier, password });

      console.log('Login response:', response.data);

      if (response.data && response.data.token && response.data.user) {
        const { token, user } = response.data;
        setUser(user);
        localStorage.setItem('token', token);
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        toast.success('Logged in successfully', { position: 'bottom-right' });
        return response.data;
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      handleError(error, 'Login failed. Please check your credentials.');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (userName, email, password) => {
    setIsLoading(true);
    setError(null);
    try {
      // Validate inputs
      if (!userName || !email || !password) {
        const msg = 'All fields are required';
        setError(msg);
        toast.error(msg, { position: 'bottom-right' });
        return null;
      }

      const response = await axios.post(`${API}/auth/signup`, { userName, email, password });
      const { token, user } = response.data;
      setUser(user);
      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      toast.success('Account created successfully', { position: 'bottom-right' });
      navigate(user.isVerified ? '/' : '/verify-email');
      return response.data;
    } catch (error) {
      handleError(error, 'Signup failed. Please try again.');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const googleLogin = async (response) => {
    setIsLoading(true);
    try {
      console.log('Google login response data:', response);

      if (!response || !response.credential) {
        throw new Error('Invalid Google response');
      }

      const result = await axios.post(
        `${API}/auth/google/login`,
        { googleToken: response.credential },
        { withCredentials: true }
      );

      console.log('Google login server response:', result.data);

      const { token, user } = result.data;
      setUser(user);
      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      if (user) {
        toast.success('Logged in successfully with Google', { position: 'bottom-right' });
        navigate(user.isVerified ? '/' : '/verify-email');
      }
    } catch (error) {
      handleError(error, 'Google authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  const googleSignup = async (response) => {
    setIsLoading(true);
    try {
      console.log(response);
      if (!response || !response.credential) {
        throw new Error('Invalid Google response');
      }

      const result = await axios.post(`${API}/auth/google/signup`, {
        googleToken: response.credential,
      });
      console.log(result.data);

      if (!result.data || !result.data.token || !result.data.user) {
        throw new Error('Invalid server response');
      }

      const { token, user } = result.data;
      setUser(user);
      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      toast.success('Account created successfully with Google', { position: 'bottom-right' });
      navigate(result.data.user.isVerified ? '/' : '/verify-email');
    } catch (error) {
      handleError(error, 'Google signup failed');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    try {
      setUser(null);
      localStorage.removeItem('token');
      delete axios.defaults.headers.common['Authorization'];
      toast.success('Logged out successfully', { position: 'bottom-right' });
      navigate('/login');
    } catch (error) {
      handleError(error, 'Logout failed');
    }
  };

  const verifyEmail = async (code) => {
    setIsLoading(true);
    setError(null);
    try {
      if (!code || code.length < 4) {
        const msg = 'Please enter a valid verification code';
        setError(msg);
        toast.error(msg, { position: 'bottom-right' });
        return;
      }

      const response = await axios.post(`${API}/auth/verify-email`, { code });
      console.log('verify email', response);
      if (response.data.success) {
        setUser(response.data.user);
        toast.success('Email verified successfully', { position: 'bottom-right' });
        navigate('/');
      } else {
        console.log('email not verified');
        setError(response.data.message || 'Email verification failed');
        toast.error(response.data.message || 'Email verification failed', {
          position: 'bottom-right',
        });
      }
    } catch (error) {
      handleError(error, 'Email verification failed');
    } finally {
      setIsLoading(false);
    }
  };

  const updateUserData = async (data) => {
    setIsLoading(true);
    setError(null);
    try {
      if (!data.userName) {
        const msg = 'Username is required';
        setError(msg);
        toast.error(msg, { position: 'bottom-right' });
        return;
      }

      axios.defaults.withCredentials = true;
      const response = await axios.put(`${API}/auth/update-user`, data, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      setUser(response.data.user);
      toast.success('Profile Updated', {
        position: 'bottom-right',
      });
    } catch (error) {
      handleError(error, 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        error,
        login,
        signup,
        googleSignup,
        googleLogin,
        logout,
        verifyAuth,
        verifyEmail,
        updateUserData,
        setIsLoading,
        setError,
      }}
    >
      {!isLoading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
