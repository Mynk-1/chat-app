import axios from 'axios';
import { API_URL } from '../config/env';

// The JWT lives in an httpOnly cookie set by the backend — it's invisible to
// this code by design (XSS protection), so there's no Authorization header
// to attach here. withCredentials makes the browser send that cookie on
// every request even though the frontend and backend are different origins.
// A timeout keeps a slow/unreachable backend from hanging the initial
// session check (restoreSession) forever and leaving the app stuck blank.
const http = axios.create({ baseURL: API_URL, withCredentials: true, timeout: 15000 });

// If the session cookie has expired or been cleared server-side, bounce back
// to the landing page instead of leaving the app stuck on failed requests.
http.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && window.location.pathname !== '/') {
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export default http;
