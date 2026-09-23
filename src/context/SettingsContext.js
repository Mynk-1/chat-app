import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const SettingsContext = createContext(null);

const THEME_KEY = 'chatconnect:theme'; // 'light' | 'dark' | 'system'
const NOTIFICATIONS_KEY = 'chatconnect:notifications';

const readStoredTheme = () => {
  try {
    return localStorage.getItem(THEME_KEY) || 'system';
  } catch {
    return 'system';
  }
};

const readStoredNotifications = () => {
  try {
    const raw = localStorage.getItem(NOTIFICATIONS_KEY);
    return raw === null ? true : raw === 'true';
  } catch {
    return true;
  }
};

const hasMatchMedia = () => typeof window !== 'undefined' && typeof window.matchMedia === 'function';

const systemPrefersDark = () => hasMatchMedia() && window.matchMedia('(prefers-color-scheme: dark)').matches;

const applyTheme = (theme) => {
  const isDark = theme === 'dark' || (theme === 'system' && systemPrefersDark());
  document.documentElement.classList.toggle('dark', isDark);
};

export const SettingsProvider = ({ children }) => {
  const [theme, setThemeState] = useState(readStoredTheme);
  const [notificationsEnabled, setNotificationsEnabledState] = useState(readStoredNotifications);

  useEffect(() => {
    applyTheme(theme);

    if (theme !== 'system' || !hasMatchMedia()) return undefined;
    // Keep following the OS if the user hasn't picked an explicit theme.
    const mql = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => applyTheme('system');
    mql.addEventListener('change', handleChange);
    return () => mql.removeEventListener('change', handleChange);
  }, [theme]);

  const setTheme = useCallback((next) => {
    setThemeState(next);
    try {
      localStorage.setItem(THEME_KEY, next);
    } catch {
      // ignore — per-viewer convenience only
    }
  }, []);

  const setNotificationsEnabled = useCallback((next) => {
    setNotificationsEnabledState(next);
    try {
      localStorage.setItem(NOTIFICATIONS_KEY, String(next));
    } catch {
      // ignore
    }
  }, []);

  return (
    <SettingsContext.Provider value={{ theme, setTheme, notificationsEnabled, setNotificationsEnabled }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => useContext(SettingsContext);
