import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useChat } from '../../context/ChatContext';
import { getAvatarColor, getInitials, getDisplayName } from '../../utils/avatar';

// Members are picked from your existing 1:1 chats — "contacts" here are
// people you've already messaged, not a separately managed address book.
const CreateGroupModal = ({ onClose }) => {
  const { chats, createGroup } = useChat();
  const [name, setName] = useState('');
  const [selected, setSelected] = useState(() => new Set());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const contacts = chats.filter((c) => c.type === 'contact');

  const toggleMember = (contactNumber) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(contactNumber)) next.delete(contactNumber);
      else next.add(contactNumber);
      return next;
    });
  };

  const handleCreate = async () => {
    if (!name.trim()) {
      setError('Group name is required');
      return;
    }
    if (selected.size < 2) {
      setError('Pick at least 2 members');
      return;
    }

    setSaving(true);
    setError('');
    try {
      await createGroup(name.trim(), Array.from(selected));
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create group');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-clay-text/30 backdrop-blur-sm p-4 animate-fade">
      <div className="w-full max-w-sm bg-clay-surface dark:bg-clay-surfaceDark rounded-clay-lg shadow-clay dark:shadow-clay-dark overflow-hidden max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between p-4">
          <h2 className="text-lg font-semibold text-clay-text dark:text-clay-textDark">New group</h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="w-9 h-9 rounded-full bg-clay-bg dark:bg-clay-bgDark shadow-clay-sm flex items-center justify-center text-clay-muted dark:text-clay-mutedDark"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="px-6 pb-3">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Group name"
            maxLength={60}
            className="w-full px-4 py-2.5 rounded-full bg-clay-bg dark:bg-clay-bgDark shadow-clay-inset dark:shadow-clay-dark-inset
              text-clay-text dark:text-clay-textDark placeholder-clay-muted dark:placeholder-clay-mutedDark focus:outline-none"
          />
        </div>

        <p className="px-6 pb-2 text-sm font-medium text-clay-text dark:text-clay-textDark">
          Select members ({selected.size} selected)
        </p>

        <div className="flex-1 overflow-y-auto px-4 space-y-1">
          {contacts.length === 0 ? (
            <p className="text-center text-sm text-clay-muted dark:text-clay-mutedDark py-4">
              Message someone first to add them to a group.
            </p>
          ) : (
            contacts.map((c) => (
              <button
                key={c.contactNumber}
                onClick={() => toggleMember(c.contactNumber)}
                className={`w-full flex items-center gap-3 p-2 rounded-clay text-left transition-shadow ${
                  selected.has(c.contactNumber) ? 'shadow-clay-inset dark:shadow-clay-dark-inset' : ''
                }`}
              >
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-semibold flex-shrink-0"
                  style={{ backgroundColor: getAvatarColor(c) }}
                >
                  {getInitials(c)}
                </div>
                <span className="text-sm text-clay-text dark:text-clay-textDark truncate">{getDisplayName(c)}</span>
              </button>
            ))
          )}
        </div>

        {error && <p className="px-6 pt-2 text-sm text-clay-danger dark:text-clay-dangerDark">{error}</p>}

        <div className="p-6 pt-4">
          <button
            onClick={handleCreate}
            disabled={saving}
            className="w-full py-2.5 rounded-full bg-clay-primary text-white shadow-clay-sm active:shadow-clay-inset disabled:opacity-50 transition-shadow"
          >
            {saving ? 'Creating...' : 'Create group'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateGroupModal;
