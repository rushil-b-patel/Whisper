import { useState } from 'react';
import toast from 'react-hot-toast';

export const useRequest = () => {
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleError = (error, fallbackMessage) => {
    const message = error?.response?.data?.message || fallbackMessage || 'Something went wrong';
    console.error('Request Error:', message);
    toast.error(message, { position: 'bottom-right' });
    setError(message);
    return message;
  };

  const execute = async (fn, fallbackMessage) => {
    setIsLoading(true);
    try {
      const result = await fn();
      return result;
    } catch (err) {
      throw handleError(err, fallbackMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return { execute, isLoading, error, setError, setIsLoading };
};
