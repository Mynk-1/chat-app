import http from './httpClient';

export const getCallHistory = () => http.get('/calls');
