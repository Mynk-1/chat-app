import React from 'react';
import { X, Sun, Moon, Monitor, Bell, BellOff } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';
import { getAvatarColor, getInitials } from '../../utils/avatar';

const THEME_OPTIONS = [
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'dark', label: 'Dark', icon: Moon },
  { value: 'system', label: 'System', icon: Monitor },
];

const SettingsModal = ({ onClose }) => {
  const { user } = useAuth();
  const { theme, setTheme, notificationsEnabled, setNotificationsEnabled } = useSettings();

  const selfContact = { contactNumber: user?.phoneNumber || '' };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-clay-text/30 backdrop-blur-sm p-4 animate-fade">
      <div className="w-full max-w-sm bg-clay-surface dark:bg-clay-surfaceDark rounded-clay-lg shadow-clay dark:shadow-clay-dark overflow-hidden max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between p-4">
          <h2 className="text-lg font-semibold text-clay-text dark:text-clay-textDark">Settings</h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="w-9 h-9 rounded-full bg-clay-bg dark:bg-clay-bgDark shadow-clay-sm flex items-center justify-center text-clay-muted dark:text-clay-mutedDark"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 pb-6 space-y-6">
          {/* Profile */}
          <div className="flex flex-col items-center pt-2">
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-semibold text-white shadow-clay-sm"
              style={{ backgroundColor: getAvatarColor(selfContact) }}
            >
              {getInitials(selfContact)}
            </div>
            <p className="mt-3 text-base font-semibold text-clay-text dark:text-clay-textDark">
              {user?.phoneNumber}
            </p>
            <p className="text-sm text-clay-muted dark:text-clay-mutedDark">Your account</p>
          </div>

          {/* Appearance */}
          <div>
            <p className="text-sm font-medium text-clay-text dark:text-clay-textDark mb-2">Appearance</p>
            <div className="flex bg-clay-bg dark:bg-clay-bgDark rounded-full p-1 shadow-clay-inset dark:shadow-clay-dark-inset">
              {THEME_OPTIONS.map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  onClick={() => setTheme(value)}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-full text-sm font-medium transition-shadow ${
                    theme === value
                      ? 'bg-clay-primary text-white shadow-clay-sm'
                      : 'text-clay-muted dark:text-clay-mutedDark'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Notifications */}
          <div>
            <p className="text-sm font-medium text-clay-text dark:text-clay-textDark mb-2">Notifications</p>
            <button
              onClick={() => setNotificationsEnabled(!notificationsEnabled)}
              className="w-full flex items-center justify-between p-3 rounded-clay bg-clay-bg dark:bg-clay-bgDark shadow-clay-inset dark:shadow-clay-dark-inset"
            >
              <span className="flex items-center gap-2 text-sm text-clay-text dark:text-clay-textDark">
                {notificationsEnabled ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4" />}
                Message notifications
              </span>
              <span
                className={`w-11 h-6 rounded-full flex items-center px-0.5 transition-colors ${
                  notificationsEnabled ? 'bg-clay-primary justify-end' : 'bg-clay-muted/40 justify-start'
                }`}
              >
                <span className="w-5 h-5 rounded-full bg-white shadow" />
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
