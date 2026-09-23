import http from './httpClient';

export const getChats = () => http.get('/chats');
