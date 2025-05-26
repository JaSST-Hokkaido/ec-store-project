import React, { useState, useEffect } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { initializeDemoEnvironment } from './utils/initializeDemo';

// コンポーネント
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import AdminLayout from './components/admin/AdminLayout';

// ページ
import HomePage from './pages/HomePage';
import ProductListPage from './pages/ProductListPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import MyPage from './pages/MyPage';
import OrderCompletePage from './pages/OrderCompletePage';
import NotFoundPage from './pages/NotFoundPage';

// 管理者ページ
import AdminLoginPage from './pages/admin/AdminLoginPage';

// コンテキスト
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import { AdminAuthProvider } from './context/AdminAuthContext';

function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // デモ環境を初期化
    const initializeApp = async () => {
      await initializeDemoEnvironment();
      setIsLoading(false);
    };
    
    initializeApp();
  }, []);

  if (isLoading) {
    return <div className="loading">読み込み中...</div>;
  }

  return (
    <AuthProvider>
      <CartProvider>
        <AdminAuthProvider>
          <div className="app">
            <Routes>
              {/* 管理者画面のルート */}
              <Route path="/admin/*" element={
                <Routes>
                  <Route path="login" element={<AdminLoginPage />} />
                  <Route path="*" element={
                    <AdminLayout />
                  } />
                </Routes>
              } />
              
              {/* 通常の顧客向け画面のルート */}
              <Route path="/*" element={
                <>
                  <Header />
                  <main className="main-content">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/products" element={<ProductListPage />} />
              <Route path="/products/:id" element={<ProductDetailPage />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/mypage/*" element={<MyPage />} />
              <Route path="/reset-password" element={<LoginPage resetMode={true} />} />
              <Route path="/account-closure-complete" element={<div className="container">
                <div className="auth-success">
                  <h1>退会処理が完了しました</h1>
                  <p>ご利用いただきありがとうございました。</p>
                  <Link to="/" className="btn">トップページに戻る</Link>
                </div>
              </div>} />
              <Route path="/order-complete" element={<OrderCompletePage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
                  </main>
                  <Footer />
                </>
              } />
            </Routes>
          </div>
        </AdminAuthProvider>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
