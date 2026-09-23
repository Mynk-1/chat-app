import React, { createContext, useContext, useState, useCallback } from 'react';
import * as authApi from '../api/auth.api';
import { disconnectSocket } from '../socket/socket';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  // Guards routing decisions until the initial cookie check (restoreSession)
  // has actually resolved, so a logged-in user isn't flashed to the landing
  // page while /auth/me is still in flight.
  const [authChecked, setAuthChecked] = useState(false);

  const verifyOtp = useCallback(async (phoneNumber, otp) => {
    const { data } = await authApi.verifyOtp(phoneNumber, otp);
    setUser(data.user);
    return data.user;
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } finally {
      setUser(null);
      disconnectSocket();
    }
  }, []);

  // Called once on app boot. The JWT itself lives in an httpOnly cookie we
  // can't read from JS, so the only way to know if there's a valid session
  // is to ask the backend.
  const restoreSession = useCallback(async () => {
    try {
      const { data } = await authApi.getMe();
      setUser(data.user);
      return data.user;
    } catch (error) {
      setUser(null);
      return null;
    } finally {
      setAuthChecked(true);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, authChecked, verifyOtp, logout, restoreSession }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
