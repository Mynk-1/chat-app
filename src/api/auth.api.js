import http from './httpClient';

export const sendOtp = (phoneNumber) => http.post('/auth/send-otp', { phoneNumber });
export const verifyOtp = (phoneNumber, otp) => http.post('/auth/verify-otp', { phoneNumber, otp });
export const logout = () => http.post('/auth/logout');
export const getMe = () => http.get('/auth/me');
