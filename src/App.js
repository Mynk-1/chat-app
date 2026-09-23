import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { ChatProvider } from './context/ChatContext';
import { CallProvider } from './context/CallContext';
import LandingPage from './components/landing/LandingPage';
import ChatApp from './components/chat/ChatApp';

const RequireAuth = ({ children }) => {
  const { user, authChecked } = useAuth();
  if (!authChecked) return null;
  if (!user) return <Navigate to="/" replace />;
  return children;
};

const RedirectIfAuthed = ({ children }) => {
  const { user, authChecked } = useAuth();
  if (!authChecked) return null;
  if (user) return <Navigate to="/chat" replace />;
  return children;
};

const AppRoutes = () => {
  const { restoreSession } = useAuth();

  useEffect(() => {
    restoreSession();
  }, [restoreSession]);

  return (
    <Routes>
      <Route
        path="/"
        element={
          <RedirectIfAuthed>
            <LandingPage />
          </RedirectIfAuthed>
        }
      />
      <Route
        path="/chat"
        element={
          <RequireAuth>
            <SocketProvider>
              <ChatProvider>
                <CallProvider>
                  <ChatApp />
                </CallProvider>
              </ChatProvider>
            </SocketProvider>
          </RequireAuth>
        }
      />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

const App = () => (
  <BrowserRouter>
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  </BrowserRouter>
);

export default App;
