// Utility functions for user-specific localStorage
// All data is stored with user ID prefix to ensure isolation between users

export const getUserStorageKey = (userId, key) => {
  if (!userId) {
    console.warn("No user ID provided for storage key");
    return key;
  }
  return `user_${userId}_${key}`;
};

export const setUserData = (userId, key, value) => {
  const storageKey = getUserStorageKey(userId, key);
  try {
    localStorage.setItem(storageKey, JSON.stringify(value));
  } catch (error) {
    console.error("Error saving user data:", error);
  }
};

export const getUserData = (userId, key, defaultValue = null) => {
  const storageKey = getUserStorageKey(userId, key);
  try {
    const item = localStorage.getItem(storageKey);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error("Error reading user data:", error);
    return defaultValue;
  }
};

export const removeUserData = (userId, key) => {
  const storageKey = getUserStorageKey(userId, key);
  try {
    localStorage.removeItem(storageKey);
  } catch (error) {
    console.error("Error removing user data:", error);
  }
};

// Clear all user data (useful for logout)
export const clearAllUserData = (userId) => {
  if (!userId) return;
  
  const keys = Object.keys(localStorage);
  keys.forEach(key => {
    if (key.startsWith(`user_${userId}_`)) {
      localStorage.removeItem(key);
    }
  });
};
