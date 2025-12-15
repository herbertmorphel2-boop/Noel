import { AUTHORIZED_USERS } from '../constants';

// This is a mock JWT service to avoid using Node.js libraries in the browser.

export const login = (username: string): string | null => {
  const cleanUsername = username.trim().toUpperCase();
  if (AUTHORIZED_USERS.includes(cleanUsername)) {
    // Create a mock JWT by base64-encoding the username.
    const mockPayload = btoa(JSON.stringify({ username: cleanUsername }));
    return `mock-header.${mockPayload}.mock-signature`;
  }
  return null;
};

export const verifyToken = (token: string): { username: string } | null => {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }
    const decodedPayload = atob(parts[1]);
    const payload = JSON.parse(decodedPayload);
    if (AUTHORIZED_USERS.includes(payload.username)) {
      return payload;
    }
    return null;
  } catch (error) {
    return null;
  }
};
