import { useEffect, useState } from 'react';
import { Eye, EyeOff } from '../ui/Icons';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';

const Signup = () => {
  const [userName, setUserName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { signup, googleSignup, isLoading, error, setError } = useAuth();

  useEffect(() => {
    return () => setError(null);
  }, [userName, email, password]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await signup(userName, email, password);
  };

  const handleGoogleSignup = async (response) => {
    try {
      await googleSignup(response);
    } catch {
      setError('Google signup failed. Please try again.');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-4em)] px-4 py-12 bg-white dark:bg-[#0e1113]">
      <div className="w-full max-w-md border border-gray-200 dark:border-[#2A2B30] rounded-lg p-8 dark:bg-[#131619]">
        <h2 className="text-2xl font-bold text-center mb-6 text-black dark:text-white font-mono">
          Create Account
        </h2>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium mb-1 dark:text-gray-300">Username</label>
            <input
              type="text"
              placeholder="Username"
              className="w-full px-3 py-2 rounded-md bg-white dark:bg-[#2A3236] dark:text-[#eef1f3] border border-gray-300 dark:border-[#2A2B30] placeholder-gray-400 focus:outline-none transition"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 dark:text-gray-300">Email</label>
            <input
              type="email"
              placeholder="you@example.com"
              className="w-full px-3 py-2 rounded-md bg-white dark:bg-[#2A3236] dark:text-[#eef1f3] border border-gray-300 dark:border-[#2A2B30] placeholder-gray-400 focus:outline-none transition"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 dark:text-gray-300">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                className="w-full px-3 py-2 pr-10 rounded-md bg-white dark:bg-[#2A3236] dark:text-[#eef1f3] border border-gray-300 dark:border-[#2A2B30] placeholder-gray-400 focus:outline-none transition"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {error && <p className="text-red-500 text-sm font-medium -mt-2">{error}</p>}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-2 px-4 rounded-md text-sm font-medium text-white hover:text-black bg-black hover:bg-white border-[2px] border-transparent hover:border-black transition animation duration-500 ease-in-out"          >
            {isLoading ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>

        <div className="text-sm text-center mt-5 dark:text-gray-300">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-500 hover:underline">
            Log in
          </Link>
        </div>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300 dark:border-gray-700" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-white dark:bg-[#131619] px-2 text-gray-500 dark:text-gray-300">
              Or continue with
            </span>
          </div>
        </div>

        <div className="flex justify-center">
          <GoogleLogin onSuccess={handleGoogleSignup} onError={() => setError('Google signup failed.')} />
        </div>
      </div>
    </div>
  );
};

export default Signup;
