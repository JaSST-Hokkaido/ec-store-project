import React, { useState } from 'react';
import { Navigate, Outlet, Link, useNavigate, useLocation, Routes, Route } from 'react-router-dom';
import DashboardPage from '../../pages/admin/DashboardPage';
import ProductListPage from '../../pages/admin/ProductListPage';
import ProductCreatePage from '../../pages/admin/ProductCreatePage';
import AccountManagementPage from '../../pages/admin/system/AccountManagementPage';
import RoleManagementPage from '../../pages/admin/system/RoleManagementPage';
import CategoryManagementPage from '../../pages/admin/system/CategoryManagementPage';
import { useAdminAuth } from '../../context/AdminAuthContext';

const AdminLayout: React.FC = () => {
  const { isAuthenticated, currentAdmin, logout, checkPermission } = useAdminAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  // 認証されていない場合はログインページにリダイレクト
  if (!isAuthenticated) {
    return <Navigate to="/admin/login" />;
  }
  
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };
  
  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };
  
  // 現在のパスが一致するかチェック
  const isActive = (path: string) => {
    return location.pathname.startsWith(path);
  };
  
  return (
    <div className={`admin-layout ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
      {/* サイドバー */}
      <div className="admin-sidebar">
        <div className="sidebar-header">
          <h2>EC管理システム</h2>
          <button className="sidebar-toggle" onClick={toggleSidebar}>
            {sidebarOpen ? '◀' : '▶'}
          </button>
        </div>
        
        <div className="sidebar-user">
          <div className="user-avatar">
            {currentAdmin?.name.charAt(0) || 'A'}
          </div>
          <div className="user-info">
            <div className="user-name">{currentAdmin?.name}</div>
            <div className="user-role">
              {currentAdmin?.role === 'system_admin' && 'システム管理者'}
              {currentAdmin?.role === 'store_admin' && '店舗管理者'}
              {currentAdmin?.role === 'product_manager' && '商品管理者'}
              {currentAdmin?.role === 'order_manager' && '注文管理者'}
              {currentAdmin?.role === 'customer_support' && 'カスタマーサポート'}
            </div>
          </div>
        </div>
        
        <nav className="sidebar-nav">
          <ul>
            <li>
              <Link to="/admin/dashboard" className={isActive('/admin/dashboard') ? 'active' : ''}>
                <span className="nav-icon">📊</span>
                <span className="nav-text">ダッシュボード</span>
              </Link>
            </li>
            
            {/* 商品管理 */}
            {checkPermission('manage_products') || checkPermission('view_products') ? (
              <li>
                <Link to="/admin/products" className={isActive('/admin/products') ? 'active' : ''}>
                  <span className="nav-icon">📦</span>
                  <span className="nav-text">商品管理</span>
                </Link>
                <ul className="subnav">
                  <li>
                    <Link to="/admin/products" className={location.pathname === '/admin/products' ? 'active' : ''}>
                      <span className="nav-text">商品一覧</span>
                    </Link>
                  </li>
                  {checkPermission('manage_products') && (
                    <li>
                      <Link to="/admin/products/new" className={location.pathname === '/admin/products/new' ? 'active' : ''}>
                        <span className="nav-text">商品登録</span>
                      </Link>
                    </li>
                  )}
                  <li>
                    <Link to="/admin/categories" className={isActive('/admin/categories') ? 'active' : ''}>
                      <span className="nav-text">カテゴリ管理</span>
                    </Link>
                  </li>
                  <li>
                    <Link to="/admin/inventory" className={isActive('/admin/inventory') ? 'active' : ''}>
                      <span className="nav-text">在庫管理</span>
                    </Link>
                  </li>
                </ul>
              </li>
            ) : null}
            
            {/* 注文管理 */}
            {checkPermission('manage_orders') || checkPermission('view_orders') ? (
              <li>
                <Link to="/admin/orders" className={isActive('/admin/orders') ? 'active' : ''}>
                  <span className="nav-icon">🛒</span>
                  <span className="nav-text">注文管理</span>
                </Link>
              </li>
            ) : null}
            
            {/* 顧客管理 */}
            {checkPermission('manage_customers') || checkPermission('view_customers') ? (
              <li>
                <Link to="/admin/customers" className={isActive('/admin/customers') ? 'active' : ''}>
                  <span className="nav-icon">👥</span>
                  <span className="nav-text">顧客管理</span>
                </Link>
              </li>
            ) : null}
            
            {/* 問い合わせ管理 */}
            {checkPermission('manage_inquiries') || checkPermission('view_inquiries') ? (
              <li>
                <Link to="/admin/inquiries" className={isActive('/admin/inquiries') ? 'active' : ''}>
                  <span className="nav-icon">💬</span>
                  <span className="nav-text">問い合わせ管理</span>
                </Link>
              </li>
            ) : null}
            
            {/* システム管理（システム管理者のみ） */}
            {currentAdmin?.role === 'system_admin' && (
              <li>
                <Link to="/admin/system" className={isActive('/admin/system') ? 'active' : ''}>
                  <span className="nav-icon">⚙️</span>
                  <span className="nav-text">システム管理</span>
                </Link>
                <ul className="subnav">
                  <li>
                    <Link to="/admin/system/accounts" className={isActive('/admin/system/accounts') ? 'active' : ''}>
                      <span className="nav-text">アカウント管理</span>
                    </Link>
                  </li>
                  <li>
                    <Link to="/admin/system/roles" className={isActive('/admin/system/roles') ? 'active' : ''}>
                      <span className="nav-text">権限管理</span>
                    </Link>
                  </li>
                  <li>
                    <Link to="/admin/system/logs" className={isActive('/admin/system/logs') ? 'active' : ''}>
                      <span className="nav-text">システムログ</span>
                    </Link>
                  </li>
                </ul>
              </li>
            )}
          </ul>
        </nav>
        
        <div className="sidebar-footer">
          <button className="logout-button" onClick={handleLogout}>
            <span className="nav-icon">🚪</span>
            <span className="nav-text">ログアウト</span>
          </button>
        </div>
      </div>
      
      {/* メインコンテンツ */}
      <div className="admin-main">
        <div className="admin-header">
          <div className="header-left">
            <h1 className="page-title">
              {location.pathname.includes('/admin/dashboard') && 'ダッシュボード'}
              {location.pathname.includes('/admin/products/new') && '商品登録'}
              {location.pathname === '/admin/products' && '商品一覧'}
              {location.pathname.includes('/admin/categories') && 'カテゴリ管理'}
              {location.pathname.includes('/admin/inventory') && '在庫管理'}
              {location.pathname.includes('/admin/orders') && '注文管理'}
              {location.pathname.includes('/admin/customers') && '顧客管理'}
              {location.pathname.includes('/admin/inquiries') && '問い合わせ管理'}
              {location.pathname.includes('/admin/system/accounts') && 'アカウント管理'}
              {location.pathname.includes('/admin/system/roles') && '権限管理'}
              {location.pathname.includes('/admin/system/logs') && 'システムログ'}
            </h1>
          </div>
          <div className="header-right">
            {currentAdmin?.storeName && (
              <div className="store-info">
                <span className="store-name">{currentAdmin.storeName}</span>
              </div>
            )}
            <div className="user-dropdown">
              <div className="user-name">{currentAdmin?.name}</div>
              <div className="dropdown-menu">
                <Link to="/admin/profile">プロフィール</Link>
                <button onClick={handleLogout}>ログアウト</button>
              </div>
            </div>
          </div>
        </div>
        
        <div className="admin-content">
          <Routes>
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="products" element={<ProductListPage />} />
            <Route path="products/new" element={<ProductCreatePage />} />
            <Route path="system/accounts" element={<AccountManagementPage />} />
            <Route path="system/roles" element={<RoleManagementPage />} />
            <Route path="system/categories" element={<CategoryManagementPage />} />
            <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
