import AsyncStorage from "@react-native-async-storage/async-storage";

// Single place to resolve the logged-in user's id from storage.
// Two legacy keys exist ("userData" and "userInfo") — check both.
export const getStoredUserId = async () => {
  try {
    const raw =
      (await AsyncStorage.getItem("userData")) ||
      (await AsyncStorage.getItem("userInfo"));
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?.id ?? null;
  } catch (e) {
    return null;
  }
};

export const getStoredUser = async () => {
  try {
    const raw =
      (await AsyncStorage.getItem("userData")) ||
      (await AsyncStorage.getItem("userInfo"));
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
};
