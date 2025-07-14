import { useState } from 'react';
import { Eye, EyeOff } from '../ui/Icons';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';

const Login = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const { login, googleLogin, isLoading, setIsLoading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const response = await login(identifier, password);
      if (response && response.user) {
        navigate(response.user.isVerified ? '/' : '/verify-email');
      }
    } catch (error) {
      setError(error.response?.data?.message || 'An error occurred while logging in');
    } finally {
      setIsLoading(false);
    }
  };

  const handlegoogleLogin = async (response) => {
    try {
      await googleLogin(response);
    } catch (error) {
      console.error('Google login error:', error);
      setError('Google login failed. Please try again or use email login.');
    }
  };

  const handleError = (error) => {
    console.error('Google login error:', error);
    setError('Google login failed. Please try again or use email login.');
  };

  return (
    <div className="dark:bg-[#0e1113] flex flex-col h-[calc(100vh-4em)] justify-center p-12 sm:px-6 lg:px-8s">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="text-center text-3xl font-extrabold dark:text-[#eef1f3]">
          Log into your account
        </h2>
        <div className="dark:bg-[#0e1113] dark:text-[#eef1f3] py-8 px-4 sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="identifier" className="block text-sm font-medium">
                Username or Email
              </label>
              <div className="mt-1">
                <input
                  id="identifier"
                  name="identifier"
                  type="text"
                  autoComplete="username email"
                  placeholder="Enter username or email"
                  required
                  className="appearance-none block w-full px-3 py-2 dark:bg-[#2A3236] bg-slate-200 dark:text-[#eef1f3] outline-none rounded-md sm:text-sm"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium">
                Password
              </label>
              <div className="mt-1 relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="Password"
                  required
                  className="appearance-none block w-full px-3 py-2 dark:bg-[#2A3236] bg-slate-200 dark:text-[#eef1f3] outline-none rounded-md sm:text-sm"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 p-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 rounded-md shadow-sm text-sm font-medium text-white hover:text-black bg-black hover:bg-white border-[2px] border-transparent hover:border-black transition animation duration-500 ease-in-out"
                disabled={isLoading}
              >
                {isLoading ? 'Loading...' : 'Sign in'}
              </button>
              {error && <p className="text-red-500 font-semibold mt-2 ">{error}</p>}
            </div>
          </form>
          <div className="my-4 text-sm flex justify-center space-x-1">
            <p>Don't have an account? </p>
            <Link to="/signup" className="text-blue-500 text-sm hover:underline">
              Signup
            </Link>
          </div>
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 py-1 bg-white rounded text-[#0e1113]">Or continue with</span>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-3 gap-3">
            <GoogleLogin onSuccess={handlegoogleLogin} onFailure={handleError} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
