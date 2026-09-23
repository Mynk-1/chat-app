import http from './httpClient';

export const getContacts = () => http.get('/contacts');
export const addContactRequest = (contactNumber) => http.post('/contacts', { contactNumber });

export const updateContactProfile = (contactNumber, { nickname, avatarColor }) =>
  http.patch(`/contacts/${contactNumber}`, { nickname, avatarColor });
