import React from 'react';
import { MessageCircle } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

// Fires for a message that arrives while you're not looking at that chat —
// mirrors the server's own "is the recipient actively viewing this" check
// (see ChatContext's MESSAGE_NEW handler), so it never shows for a chat
// that's already open.
const Toast = () => {
  const { toast, dismissToast } = useToast();
  if (!toast) return null;

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[70] w-full max-w-sm px-4 animate-fade">
      <button
        onClick={() => {
          toast.onClick?.();
          dismissToast();
        }}
        className="w-full flex items-start gap-3 text-left bg-clay-surface dark:bg-clay-surfaceDark rounded-clay shadow-clay dark:shadow-clay-dark p-4"
      >
        <div className="w-9 h-9 rounded-full bg-clay-primary flex items-center justify-center flex-shrink-0">
          <MessageCircle className="h-4 w-4 text-white" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-clay-text dark:text-clay-textDark truncate">{toast.title}</p>
          <p className="text-sm text-clay-muted dark:text-clay-mutedDark truncate">{toast.message}</p>
        </div>
      </button>
    </div>
  );
};

export default Toast;
