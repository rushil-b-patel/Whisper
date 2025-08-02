import axios from 'axios';
import { useRequest } from '../utils/useRequest.jsx';

const BASE_API = import.meta.env.VITE_BASE_API;
const BASE_API_MOBILE = import.meta.env.VITE_BASE_API_MOBILE;
const API = /iphone|ipad|ipod|Android/i.test(navigator.userAgent) ? BASE_API_MOBILE : BASE_API;

export const useUserService = () => {
  const { execute, isLoading, error } = useRequest();

  const getUsersData = async (username) => {
    return await execute(() => axios.get(`${API}/users/${username}`).then(res => res.data), 'Failed to load user data');
  }

  const getUsersTabData = async (username, tabName) => {
    return await execute(() => axios.get(`${API}/users/${username}/${tabName.toLowerCase()}`)
        .then((res) => res.data),
        `Failed to load ${tabName.toLowerCase()}`
    );
  };

  return {
    isLoading, error, getUsersData, getUsersTabData
  };
};
