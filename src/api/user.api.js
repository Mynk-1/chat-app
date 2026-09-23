import http from './httpClient';

export const lookupUser = (phoneNumber) => http.get(`/users/${phoneNumber}`);
