import { AVATAR_COLORS } from '../constants/avatarColors';

// Every contact gets a stable default color derived from their number, so
// avatars look distinct without the user having to pick one for every
// contact (they can still override it via the contact profile panel).
export const getDefaultAvatarColor = (phoneNumber) => {
  const lastDigit = phoneNumber.charCodeAt(phoneNumber.length - 1) || 0;
  return AVATAR_COLORS[lastDigit % AVATAR_COLORS.length];
};

export const getAvatarColor = (contact) => contact.avatarColor || getDefaultAvatarColor(contact.contactNumber);

export const getInitials = (contact) => {
  if (contact.nickname && contact.nickname.trim()) {
    const parts = contact.nickname.trim().split(/\s+/);
    return parts.length > 1
      ? (parts[0][0] + parts[1][0]).toUpperCase()
      : parts[0].slice(0, 2).toUpperCase();
  }
  return contact.contactNumber.slice(-2);
};

export const getDisplayName = (contact) => contact.nickname?.trim() || contact.contactNumber;
