// ユーザー管理サービス
import { getItem, setItem, removeItem, KEYS, getAllItems } from './storageService';
import { logUserActivity } from './demoService';

// 型定義
export interface UserProfile {
  id: string;
  email: string;
  name: string;
  password?: string; // デモ用なので平文で保存（実際の実装では暗号化必須）
  phone?: string;
  address?: {
    postalCode?: string;
    prefecture?: string;
    city?: string;
    address1?: string;
    address2?: string;
  };
  registrationDate: string;
  registeredAt?: string; // 後方互換性のため
  lastLogin: string;
  points: number;
  preferences: {
    favoriteCategories: string[];
    notifications: boolean;
  };
}

export interface RegisterUserData {
  email: string;
  password: string;
  name: string;
  phone?: string;
  address?: {
    postalCode?: string;
    prefecture?: string;
    city?: string;
    address1?: string;
    address2?: string;
  };
}

// ユニークなユーザーIDを生成
const generateUserId = (): string => {
  return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// ユーザー登録
export const registerUser = (userData: RegisterUserData): UserProfile => {
  // 既存ユーザーのチェック
  const existingUser = Object.values(getAllUsers()).find(u => u.email === userData.email);
  if (existingUser) {
    throw new Error('このメールアドレスは既に登録されています');
  }

  const userId = generateUserId();
  const now = new Date().toISOString();
  
  const newUser: UserProfile = {
    id: userId,
    email: userData.email,
    name: userData.name,
    password: userData.password, // デモ用なので平文保存
    phone: userData.phone,
    address: userData.address,
    registrationDate: now,
    registeredAt: now, // 後方互換性のため
    lastLogin: now,
    points: 500, // 新規登録ボーナスポイント
    preferences: {
      favoriteCategories: [],
      notifications: true
    }
  };
  
  setItem(`${KEYS.USER_PREFIX}${userId}`, newUser);
  setSessionUser(userId); // セッション保存
  logUserActivity(userId, 'REGISTER', {});
  
  return newUser;
};

// ログイン処理
export const loginUser = (email: string, password: string): UserProfile | null => {
  // 全ユーザー取得して検索
  const users = getAllUsers();
  const user = Object.values(users).find(u => u.email === email);
  
  if (!user) {
    return null;
  }
  
  // パスワード確認（デモ用なので平文比較）
  if (user.password !== password) {
    return null;
  }
  
  // ログイン成功
  const now = new Date().toISOString();
  user.lastLogin = now;
  setItem(`${KEYS.USER_PREFIX}${user.id}`, user);
  setSessionUser(user.id);
  logUserActivity(user.id, 'LOGIN', {});
  
  // パスワードを除外してreturn
  const { password: _, ...userWithoutPassword } = user;
  return userWithoutPassword as UserProfile;
};

// 現在のセッションユーザー取得
export const getCurrentUser = (): UserProfile | null => {
  const userId = getSessionUser();
  if (!userId) return null;
  
  const user = getItem<UserProfile | null>(`${KEYS.USER_PREFIX}${userId}`, null);
  if (!user) return null;
  
  // 後方互換性のためregisteredAtを追加
  if (!user.registeredAt && user.registrationDate) {
    user.registeredAt = user.registrationDate;
  }
  
  // パスワードを除外してreturn
  const { password, ...userWithoutPassword } = user;
  return userWithoutPassword as UserProfile;
};

// ユーザー情報更新
export const updateUser = (userId: string, updates: Partial<UserProfile>): UserProfile | null => {
  const user = getItem<UserProfile | null>(`${KEYS.USER_PREFIX}${userId}`, null);
  if (!user) return null;
  
  const updatedUser = {
    ...user,
    ...updates,
    id: user.id, // IDは変更不可
    email: user.email, // メールアドレスは変更不可（デモ用制限）
  };
  
  setItem(`${KEYS.USER_PREFIX}${userId}`, updatedUser);
  logUserActivity(userId, 'UPDATE_PROFILE', updates);
  
  // パスワードを除外してreturn
  const { password, ...userWithoutPassword } = updatedUser;
  return userWithoutPassword as UserProfile;
};

// セッション管理
export const setSessionUser = (userId: string): void => {
  sessionStorage.setItem(KEYS.SESSION_ID, userId);
};

export const getSessionUser = (): string | null => {
  return sessionStorage.getItem(KEYS.SESSION_ID);
};

export const clearSession = (): void => {
  sessionStorage.removeItem(KEYS.SESSION_ID);
};

// ログアウト
export const logout = (): void => {
  const userId = getSessionUser();
  if (userId) {
    logUserActivity(userId, 'LOGOUT', {});
  }
  clearSession();
};

// 全ユーザー取得（管理用）
export const getAllUsers = (): Record<string, UserProfile> => {
  const users: Record<string, UserProfile> = {};
  const items = getAllItems(KEYS.USER_PREFIX);
  
  Object.entries(items).forEach(([key, value]) => {
    if (value) {
      const userId = key.replace(KEYS.USER_PREFIX, '');
      users[userId] = value;
    }
  });
  
  return users;
};


// ポイント操作
export const addPoints = (userId: string, points: number, reason: string): boolean => {
  const user = getItem<UserProfile | null>(`${KEYS.USER_PREFIX}${userId}`, null);
  if (!user) return false;
  
  user.points = (user.points || 0) + points;
  setItem(`${KEYS.USER_PREFIX}${userId}`, user);
  logUserActivity(userId, 'POINTS_ADDED', { points, reason, newTotal: user.points });
  
  return true;
};

export const usePoints = (userId: string, points: number, reason: string): boolean => {
  const user = getItem<UserProfile | null>(`${KEYS.USER_PREFIX}${userId}`, null);
  if (!user || user.points < points) return false;
  
  user.points -= points;
  setItem(`${KEYS.USER_PREFIX}${userId}`, user);
  logUserActivity(userId, 'POINTS_USED', { points, reason, newTotal: user.points });
  
  return true;
};

// パスワードリセット
export const resetPassword = (email: string, newPassword?: string): { success: boolean; message?: string; newPassword?: string } => {
  // 全ユーザー取得して検索
  const users = getAllUsers();
  const user = Object.values(users).find(u => u.email === email);
  
  if (!user) {
    return {
      success: false,
      message: 'このメールアドレスは登録されていません'
    };
  }
  
  // 新しいパスワードが指定されている場合は設定
  if (newPassword) {
    user.password = newPassword;
    setItem(`${KEYS.USER_PREFIX}${user.id}`, user);
    logUserActivity(user.id, 'PASSWORD_RESET', { email });
    
    return {
      success: true,
      message: 'パスワードがリセットされました'
    };
  }
  
  // 新しいパスワードが指定されていない場合はランダム生成（後方互換性のため）
  const generatedPassword = Math.random().toString(36).substr(2, 8) + Math.random().toString(36).substr(2, 4);
  user.password = generatedPassword;
  setItem(`${KEYS.USER_PREFIX}${user.id}`, user);
  logUserActivity(user.id, 'PASSWORD_RESET', { email });
  
  return {
    success: true,
    message: `パスワードをリセットしました。デモ版のため、新しいパスワードを画面に表示します。`,
    newPassword: generatedPassword
  };
};

// ユーザー削除（退会処理）
export const deleteUser = (userId: string): boolean => {
  const user = getItem<UserProfile | null>(`${KEYS.USER_PREFIX}${userId}`, null);
  if (!user) return false;
  
  // ユーザーデータ削除
  removeItem(`${KEYS.USER_PREFIX}${userId}`);
  
  // 関連データも削除
  removeItem(`${KEYS.CART_PREFIX}${userId}`);
  removeItem(`${KEYS.ORDERS_PREFIX}${userId}`);
  
  // セッションクリア
  if (getSessionUser() === userId) {
    clearSession();
  }
  
  logUserActivity(userId, 'ACCOUNT_DELETED', { email: user.email });
  
  return true;
};
