import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// 管理者ユーザーの種類を定義
export type AdminRole = 'system_admin' | 'store_admin' | 'product_manager' | 'order_manager' | 'customer_support';

// 管理者ユーザーのデータ型
export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  permissions: string[];
  storeId?: string;
  storeName?: string;
  lastLogin?: string;
}

interface AdminAuthContextType {
  isAuthenticated: boolean;
  currentAdmin: AdminUser | null;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  checkPermission: (permission: string) => boolean;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

// ローカルストレージのキー
const ADMIN_STORAGE_KEY = 'ec_admin_user';

export const AdminAuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [currentAdmin, setCurrentAdmin] = useState<AdminUser | null>(null);

  // ローカルストレージから管理者情報を読み込む
  useEffect(() => {
    const storedAdmin = localStorage.getItem(ADMIN_STORAGE_KEY);
    if (storedAdmin) {
      try {
        const adminData = JSON.parse(storedAdmin);
        setCurrentAdmin(adminData);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('管理者情報の読み込みに失敗しました:', error);
        localStorage.removeItem(ADMIN_STORAGE_KEY);
      }
    }
  }, []);

  // ログイン処理
  const login = async (email: string, password: string): Promise<{ success: boolean; message?: string }> => {
    try {
      // 実際はAPIを呼び出して認証するが、ここではダミーデータを使用
      if (email === 'admin@example.com' && password === 'admin123') {
        // システム管理者
        const adminData: AdminUser = {
          id: 'admin-001',
          name: 'システム管理者',
          email: 'admin@example.com',
          role: 'system_admin',
          permissions: ['all'],
          lastLogin: new Date().toISOString()
        };
        
        setCurrentAdmin(adminData);
        setIsAuthenticated(true);
        localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(adminData));
        
        return { success: true };
      } else if (email === 'store@example.com' && password === 'store123') {
        // 店舗管理者
        const adminData: AdminUser = {
          id: 'store-001',
          name: '山田 店長',
          email: 'store@example.com',
          role: 'store_admin',
          storeId: 'store-tokyo-1',
          storeName: '東京本店',
          permissions: ['manage_products', 'manage_orders', 'view_customers'],
          lastLogin: new Date().toISOString()
        };
        
        setCurrentAdmin(adminData);
        setIsAuthenticated(true);
        localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(adminData));
        
        return { success: true };
      } else if (email === 'product@example.com' && password === 'product123') {
        // 商品管理者
        const adminData: AdminUser = {
          id: 'product-001',
          name: '鈴木 商品担当',
          email: 'product@example.com',
          role: 'product_manager',
          storeId: 'store-tokyo-1',
          storeName: '東京本店',
          permissions: ['manage_products', 'view_products'],
          lastLogin: new Date().toISOString()
        };
        
        setCurrentAdmin(adminData);
        setIsAuthenticated(true);
        localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(adminData));
        
        return { success: true };
      }
      
      return { 
        success: false, 
        message: 'メールアドレスまたはパスワードが正しくありません。' 
      };
    } catch (error) {
      console.error('ログインエラー:', error);
      return { 
        success: false, 
        message: 'ログイン処理中にエラーが発生しました。もう一度お試しください。' 
      };
    }
  };

  // ログアウト処理
  const logout = () => {
    setCurrentAdmin(null);
    setIsAuthenticated(false);
    localStorage.removeItem(ADMIN_STORAGE_KEY);
  };

  // 権限チェック
  const checkPermission = (permission: string): boolean => {
    if (!currentAdmin) return false;
    
    // システム管理者は全ての権限を持つ
    if (currentAdmin.role === 'system_admin' || currentAdmin.permissions.includes('all')) {
      return true;
    }
    
    return currentAdmin.permissions.includes(permission);
  };

  return (
    <AdminAuthContext.Provider
      value={{
        isAuthenticated,
        currentAdmin,
        login,
        logout,
        checkPermission
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
};

// カスタムフック
export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (context === undefined) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
};
