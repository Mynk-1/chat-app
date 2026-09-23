import http from './httpClient';

export const getMessages = (contactNumber, params = {}) =>
  http.get(`/messages/${contactNumber}`, { params });

export const markRead = (contactNumber) => http.post(`/messages/${contactNumber}/read`);

export const getGroupMessages = (groupId, params = {}) =>
  http.get(`/messages/group/${groupId}`, { params });

export const markGroupRead = (groupId) => http.post(`/messages/group/${groupId}/read`);
