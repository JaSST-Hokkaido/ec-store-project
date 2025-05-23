import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// ユーザー情報の型定義
export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  address?: {
    postalCode?: string;
    prefecture?: string;
    city?: string;
    address1?: string;
    address2?: string;
  };
  registeredAt: string;
}

// 認証コンテキストの型定義
interface AuthContextType {
  currentUser: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  register: (userData: RegisterData) => Promise<{ success: boolean; message?: string }>;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  resetPassword: (email: string) => Promise<{ success: boolean; message?: string }>;
  updateUserProfile: (userData: Partial<User>) => Promise<{ success: boolean; message?: string }>;
  getAllUsers: () => User[]; // 開発用、実際のアプリでは使用しない
}

// 登録データの型定義
export interface RegisterData {
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

// リセットトークンの型定義
interface ResetToken {
  email: string;
  token: string;
  expiresAt: string;
}

// LocalStorageのキー
const USER_STORAGE_KEY = 'ecommerce_users';
const CURRENT_USER_KEY = 'ecommerce_current_user';
const RESET_TOKENS_KEY = 'ecommerce_reset_tokens';

// コンテキストの作成
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 初期化時に認証状態を復元
  useEffect(() => {
    const storedUser = localStorage.getItem(CURRENT_USER_KEY);
    if (storedUser) {
      try {
        setCurrentUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('ユーザー情報の読み込みに失敗しました:', error);
        localStorage.removeItem(CURRENT_USER_KEY);
      }
    }
    setIsLoading(false);
  }, []);

  // LocalStorageからユーザーリストを取得
  const getUsers = (): User[] => {
    const storedUsers = localStorage.getItem(USER_STORAGE_KEY);
    if (storedUsers) {
      try {
        return JSON.parse(storedUsers);
      } catch (error) {
        console.error('ユーザーリストの読み込みに失敗しました:', error);
      }
    }
    return [];
  };

  // LocalStorageにユーザーリストを保存
  const saveUsers = (users: User[]) => {
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(users));
  };

  // パスワードリセットトークンの取得
  const getResetTokens = (): ResetToken[] => {
    const storedTokens = localStorage.getItem(RESET_TOKENS_KEY);
    if (storedTokens) {
      try {
        return JSON.parse(storedTokens);
      } catch (error) {
        console.error('リセットトークンの読み込みに失敗しました:', error);
      }
    }
    return [];
  };

  // パスワードリセットトークンの保存
  const saveResetTokens = (tokens: ResetToken[]) => {
    localStorage.setItem(RESET_TOKENS_KEY, JSON.stringify(tokens));
  };

  // 会員登録
  const register = async (userData: RegisterData): Promise<{ success: boolean; message?: string }> => {
    // ユーザーの存在確認
    const users = getUsers();
    const existingUser = users.find(user => user.email === userData.email);
    
    if (existingUser) {
      return { success: false, message: '既に登録されているメールアドレスです' };
    }

    // 新規ユーザーの作成
    const newUser: User = {
      id: Date.now().toString(), // 簡易的なID生成
      email: userData.email,
      name: userData.name,
      phone: userData.phone,
      address: userData.address,
      registeredAt: new Date().toISOString()
    };

    // パスワードとユーザー情報を別々に保存（実際のアプリではハッシュ化が必要）
    const userWithPassword = {
      ...newUser,
      password: userData.password // 実際のアプリではパスワードをハッシュ化
    };

    // ユーザーリストに追加
    saveUsers([...users, userWithPassword]);

    return { success: true };
  };

  // ログイン
  const login = async (email: string, password: string, rememberMe = false): Promise<{ success: boolean; message?: string }> => {
    const users = getUsers();
    const user = users.find(u => u.email === email && (u as any).password === password);
    
    if (!user) {
      return { success: false, message: 'メールアドレスまたはパスワードが正しくありません' };
    }

    // パスワードを除いたユーザー情報を保存
    const { password: _, ...userWithoutPassword } = user as any;
    setCurrentUser(userWithoutPassword);
    
    // ローカルストレージに保存（rememberMeが有効の場合）
    if (rememberMe) {
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userWithoutPassword));
    } else {
      sessionStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userWithoutPassword));
    }

    return { success: true };
  };

  // ログアウト
  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem(CURRENT_USER_KEY);
    sessionStorage.removeItem(CURRENT_USER_KEY);
  };

  // パスワードリセット（その場でリセット）
  const resetPassword = async (email: string): Promise<{ success: boolean; message?: string; newPassword?: string }> => {
    const users = getUsers();
    const userIndex = users.findIndex(u => u.email === email);
    
    if (userIndex === -1) {
      return { success: false, message: '登録されていないメールアドレスです' };
    }

    // 新しいパスワードを生成（8文字のランダム文字列）
    const newPassword = Math.random().toString(36).substring(2, 10);
    
    // ユーザー情報を更新
    const updatedUser = { ...users[userIndex] };
    (updatedUser as any).password = newPassword;
    
    // ユーザーリストを更新
    users[userIndex] = updatedUser;
    saveUsers(users);

    return { 
      success: true, 
      message: 'パスワードをリセットしました', 
      newPassword: newPassword 
    };
  };

  // ユーザープロフィールの更新
  const updateUserProfile = async (userData: Partial<User>): Promise<{ success: boolean; message?: string }> => {
    if (!currentUser) {
      return { success: false, message: 'ログインが必要です' };
    }

    const users = getUsers();
    const userIndex = users.findIndex(u => u.id === currentUser.id);
    
    if (userIndex === -1) {
      return { success: false, message: 'ユーザーが見つかりません' };
    }

    // ユーザー情報を更新
    const updatedUser = {
      ...users[userIndex],
      ...userData
    };

    // パスワード情報を保持
    const password = (users[userIndex] as any).password;
    (updatedUser as any).password = password;

    // ユーザーリストを更新
    users[userIndex] = updatedUser;
    saveUsers(users);

    // 現在のユーザー情報を更新（パスワードを除く）
    const { password: _, ...userWithoutPassword } = updatedUser as any;
    setCurrentUser(userWithoutPassword);
    
    // ローカルストレージの情報も更新
    if (localStorage.getItem(CURRENT_USER_KEY)) {
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userWithoutPassword));
    }
    if (sessionStorage.getItem(CURRENT_USER_KEY)) {
      sessionStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userWithoutPassword));
    }

    return { success: true, message: 'プロフィールを更新しました' };
  };

  // 開発用、すべてのユーザーを取得
  const getAllUsers = () => {
    return getUsers().map(user => {
      const { password, ...userWithoutPassword } = user as any;
      return userWithoutPassword;
    });
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated: !!currentUser,
        isLoading,
        register,
        login,
        logout,
        resetPassword,
        updateUserProfile,
        getAllUsers
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// カスタムフック
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
