import React, { useEffect, useState } from 'react';
import { EyeOff, Eye } from '../ui/Icons';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
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
    toast.success('Signed up successfully');
  };

  const handleGoogleSignup = async (response) => {
      await googleSignup(response);
      toast.success('Signed up successfully');
  }

  return (
    <div className="dark:bg-[#0e1113] dark:text-[#eef1f3] flex flex-col h-[calc(100vh-4em)] justify-center p-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="text-center text-3xl font-extrabold">
          Create your account
        </h2>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="py-8 px-4 sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium"
              >
                User name
              </label>
              <div className="mt-1">
                <input
                  id="userName"
                  name="userName"
                  type="text"
                  autoComplete="userName"
                  placeholder='Username'
                  required
                  className="appearance-none block w-full px-3 py-2 dark:bg-[#2A3236] bg-slate-200 dark:text-[#eef1f3] outline-none rounded-md sm:text-sm"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium"
              >
                Email address
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder='Email'
                  required
                  className="appearance-none block w-full px-3 py-2 dark:bg-[#2A3236] bg-slate-200 dark:text-[#eef1f3] outline-none rounded-md sm:text-sm"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium"
              >
                Password
              </label>
              <div className="mt-1 relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder='Password'
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
                  {showPassword ? <EyeOff /> : <Eye />}
                </button>
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 rounded-md text-sm font-medium text-white hover:text-black bg-black hover:bg-white border-[2px] border-transparent hover:border-black transition animation duration-500 ease-in-out"
                disabled={isLoading}
              >
                {isLoading ? "loading..." : "Sign up"}
              </button>
              {error && (
                <p className="text-red-500 font-semibold mt-2">{error}</p>
              )}
            </div>
          </form>
          <div className="text-sm flex justify-center space-x-1 my-4">
            <p>Already have an account?</p>
            <Link to="/login" className="text-blue-500 text-sm hover:underline">
              Login
            </Link>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-black">Or continue with</span>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-3 gap-3">
            <GoogleLogin
              onSuccess={handleGoogleSignup}
              onFailure={() => console.log("Google signup failed")}
              useOneTap
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;