import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const VerifyEmail = () => {
  const [code, setCode] = useState(Array(6).fill(''));
  const inputRefs = useRef([]);

  const { user, error, isLoading, verifyEmail } = useAuth();

  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const updatedCode = [...code];

    if (value.length > 1) {
      const pastedValues = value.slice(0, 6).split('');
      pastedValues.forEach((digit, i) => {
        if (index + i < 6) updatedCode[index + i] = digit;
      });
      setCode(updatedCode);
      const nextFocusIndex = Math.min(index + pastedValues.length, 5);
      inputRefs.current[nextFocusIndex].focus();
    } else {
      updatedCode[index] = value;
      setCode(updatedCode);
      if (value && index < 5) inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    const verificationCode = code.join('');

    if (verificationCode.length !== 6) {
      toast.error('Please enter a 6-digit code.');
      return;
    }

    try {
      await verifyEmail(verificationCode);
      toast.success('Email verified successfully');
    } catch (error) {
      console.error('Verification failed', error);
      toast.error(error.response?.data?.message || 'Verification failed. Please try again.');
    }
  };
  useEffect(() => {
    if (code.every((digit) => digit !== '')) {
      handleSubmit();
    }
  }, [code]);

  return (
    <div className="rounded-2xl overflow-hidden bg-gray-100 flex flex-col h-[calc(100vh-4em)] justify-center items-center p-12 sm:px-6 lg:px-8">
      <div className="bg-white dark:bg-black text-black dark:text-white bg-opacity-85 rounded-xl p-8 w-full max-w-md">
        <h2 className="text-3xl font-bold text-center">Verify Your Email</h2>
        <p className="text-center mb-6 mt-1">
          Enter the 6-digit code sent to your{' '}
          <a
            href="https://mail.google.com/mail/u/0/#inbox"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            {user ? user.email : `email address`}
          </a>
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex justify-between">
            {code.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type="text"
                maxLength="1"
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="w-12 h-12 text-center text-2xl font-bold bg-white dark:bg-black text-black dark:text-white border-2 border-gray-700 rounded-lg focus:border-gray-500 focus:outline-none"
              />
            ))}
          </div>
          {error && <p className="text-red-500 font-semibold mt-2 flex justify-center">{error}</p>}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-black dark:bg-gray-300 text-white dark:text-black font-bold py-3 px-4 rounded-lg shadow-lg"
          >
            {isLoading ? 'Verifying...' : 'Verify Email'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default VerifyEmail;
