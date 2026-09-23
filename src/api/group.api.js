import http from './httpClient';

export const createGroup = (name, members) => http.post('/groups', { name, members });
