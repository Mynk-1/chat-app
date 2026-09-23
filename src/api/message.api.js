import http from './httpClient';

export const getMessages = (contactNumber, params = {}) =>
  http.get(`/messages/${contactNumber}`, { params });

export const markRead = (contactNumber) => http.post(`/messages/${contactNumber}/read`);
