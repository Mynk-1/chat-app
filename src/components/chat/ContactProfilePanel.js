import React, { useState } from 'react';
import { X, Check } from 'lucide-react';
import { AVATAR_COLORS } from '../../constants/avatarColors';
import { getAvatarColor, getInitials } from '../../utils/avatar';

const formatPhoneNumber = (number) => number.replace(/(\d{3})(\d{3})(\d{4})/, '$1 $2 $3');

// WhatsApp-style "contact info" screen: lets the owner give this contact a
// personal nickname and avatar color. Purely local labeling — never seen by
// the other participant.
const ContactProfilePanel = ({ contact, onClose, onSave }) => {
  const [nickname, setNickname] = useState(contact.nickname || '');
  const [avatarColor, setAvatarColor] = useState(getAvatarColor(contact));
  const [saving, setSaving] = useState(false);

  const preview = { ...contact, nickname, avatarColor };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(contact.contactNumber, { nickname: nickname.trim(), avatarColor });
      onClose();
    } catch (error) {
      console.error('Failed to update contact profile', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-clay-text/30 backdrop-blur-sm p-4 animate-fade">
      <div className="w-full max-w-sm bg-clay-surface dark:bg-clay-surfaceDark rounded-clay-lg shadow-clay dark:shadow-clay-dark overflow-hidden">
        <div className="flex items-center justify-between p-4">
          <h2 className="text-lg font-semibold text-clay-text dark:text-clay-textDark">Contact info</h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="w-9 h-9 rounded-full bg-clay-bg dark:bg-clay-bgDark shadow-clay-sm flex items-center justify-center text-clay-muted dark:text-clay-mutedDark"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-6 pt-2 flex flex-col items-center">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-semibold text-white shadow-clay-sm"
            style={{ backgroundColor: avatarColor }}
          >
            {getInitials(preview)}
          </div>
          <p className="mt-3 text-sm text-clay-muted dark:text-clay-mutedDark">
            {formatPhoneNumber(contact.contactNumber)}
          </p>
        </div>

        <div className="px-6 pb-2">
          <label htmlFor="nickname" className="block text-sm font-medium text-clay-text dark:text-clay-textDark mb-2">
            Nickname
          </label>
          <input
            id="nickname"
            type="text"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder={contact.contactNumber}
            maxLength={60}
            className="w-full px-4 py-2.5 rounded-full bg-clay-bg dark:bg-clay-bgDark shadow-clay-inset dark:shadow-clay-dark-inset
              text-clay-text dark:text-clay-textDark placeholder-clay-muted dark:placeholder-clay-mutedDark focus:outline-none"
          />
        </div>

        <div className="px-6 pb-6 pt-4">
          <p className="block text-sm font-medium text-clay-text dark:text-clay-textDark mb-3">Avatar color</p>
          <div className="flex flex-wrap gap-3">
            {AVATAR_COLORS.map((color) => (
              <button
                key={color}
                type="button"
                aria-label={`Choose avatar color ${color}`}
                onClick={() => setAvatarColor(color)}
                className="w-9 h-9 rounded-full flex items-center justify-center shadow-clay-sm transition-shadow"
                style={{ backgroundColor: color }}
              >
                {avatarColor === color && <Check className="h-4 w-4 text-white" />}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-3 px-6 pb-6">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-full bg-clay-bg dark:bg-clay-bgDark shadow-clay-sm dark:shadow-clay-dark-sm text-clay-text dark:text-clay-textDark active:shadow-clay-inset transition-shadow"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 py-2.5 rounded-full bg-clay-primary text-white shadow-clay-sm active:shadow-clay-inset disabled:opacity-50 transition-shadow"
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ContactProfilePanel;
