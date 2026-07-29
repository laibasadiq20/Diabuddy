import axios from 'axios';
import { API_URL } from './api';

// Cookie-only auth — JWT lives in httpOnly cookie (withCredentials).
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  withCredentials: true,
});

export default api;
