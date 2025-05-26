import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  UserProfile,
  RegisterUserData,
  registerUser as serviceRegisterUser,
  loginUser as serviceLoginUser,
  logout as serviceLogout,
  getCurrentUser as serviceGetCurrentUser,
  updateUser as serviceUpdateUser,
  getSessionUser,
  addPoints
} from '../services/userService';
import { migrateGuestCart } from '../services/cartService';

// 認証コンテキストの型定義
interface AuthContextType {
  currentUser: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  register: (userData: RegisterUserData) => Promise<{ success: boolean; message?: string; user?: UserProfile }>;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  resetPassword: (email: string) => Promise<{ success: boolean; message?: string }>;
  updateUserProfile: (userData: Partial<UserProfile>) => Promise<{ success: boolean; message?: string }>;
  refreshUser: () => void;
}

// コンテキストの作成
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // ユーザー情報を更新する関数
  const refreshUser = () => {
    const user = serviceGetCurrentUser();
    setCurrentUser(user);
  };

  // 初期化時に認証状態を復元
  useEffect(() => {
    try {
      const sessionUserId = getSessionUser();
      if (sessionUserId) {
        refreshUser();
      }
    } catch (error) {
      console.error('認証状態の復元に失敗しました:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // localStorageの変更を監視
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key && (e.key.startsWith('ec-user-') || e.key === 'ec-session-id')) {
        refreshUser();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // 会員登録
  const register = async (userData: RegisterUserData): Promise<{ success: boolean; message?: string; user?: UserProfile }> => {
    try {
      const newUser = serviceRegisterUser(userData);
      setCurrentUser(newUser);
      
      // ゲストカートがあれば移行
      migrateGuestCart();
      
      return { success: true, user: newUser };
    } catch (error) {
      const message = error instanceof Error ? error.message : '登録に失敗しました';
      return { success: false, message };
    }
  };

  // ログイン
  const login = async (email: string, password: string, rememberMe = false): Promise<{ success: boolean; message?: string }> => {
    try {
      const user = serviceLoginUser(email, password);
      
      if (!user) {
        return { success: false, message: 'メールアドレスまたはパスワードが正しくありません' };
      }

      setCurrentUser(user);
      
      // ゲストカートがあれば移行
      migrateGuestCart();
      
      return { success: true };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'ログインに失敗しました';
      return { success: false, message };
    }
  };

  // ログアウト
  const logout = () => {
    serviceLogout();
    setCurrentUser(null);
  };

  // パスワードリセット（デモ用簡易実装）
  const resetPassword = async (email: string): Promise<{ success: boolean; message?: string }> => {
    // デモ用なので実際のパスワードリセットは行わない
    // 本番環境では、メール送信などの処理を実装する
    return { 
      success: true, 
      message: 'パスワードリセットメールを送信しました（デモ版のため実際には送信されません）' 
    };
  };

  // ユーザープロフィールの更新
  const updateUserProfile = async (userData: Partial<UserProfile>): Promise<{ success: boolean; message?: string }> => {
    if (!currentUser) {
      return { success: false, message: 'ログインが必要です' };
    }

    try {
      const updatedUser = serviceUpdateUser(currentUser.id, userData);
      
      if (!updatedUser) {
        return { success: false, message: 'ユーザー情報の更新に失敗しました' };
      }

      setCurrentUser(updatedUser);
      return { success: true, message: 'プロフィールを更新しました' };
    } catch (error) {
      const message = error instanceof Error ? error.message : '更新に失敗しました';
      return { success: false, message };
    }
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
        refreshUser
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

// User型のエクスポート（後方互換性のため）
export type User = UserProfile;
export type { RegisterUserData as RegisterData };
