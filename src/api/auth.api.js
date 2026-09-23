import http from './httpClient';

export const login = (phoneNumber) => http.post('/auth/login', { phoneNumber });
export const logout = () => http.post('/auth/logout');
export const getMe = () => http.get('/auth/me');
