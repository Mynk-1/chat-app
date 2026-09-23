import http from './httpClient';

export const updateContactProfile = (contactNumber, { nickname, avatarColor }) =>
  http.patch(`/contacts/${contactNumber}`, { nickname, avatarColor });
