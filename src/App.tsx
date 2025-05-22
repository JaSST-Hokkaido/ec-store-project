import React, { useState, useEffect } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import './styles/App.css';

// コンポーネント
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';

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

// コンテキスト
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';

function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 初期設定やデータ読み込みがある場合はここで実行
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <div className="loading">読み込み中...</div>;
  }

  return (
    <AuthProvider>
      <CartProvider>
        <div className="app">
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
        </div>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
