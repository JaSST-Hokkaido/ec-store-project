import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface OrderData {
  orderNumber: string;
  orderDate: string;
  isGuest: boolean;
  address: {
    firstName: string;
    lastName: string;
    email: string;
  };
}

const OrderCompletePage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [orderData, setOrderData] = useState<OrderData | null>(null);
  
  // localStorageから注文情報を取得
  useEffect(() => {
    const storedOrder = localStorage.getItem('latestOrder');
    if (storedOrder) {
      try {
        const parsedOrder = JSON.parse(storedOrder);
        setOrderData(parsedOrder);
      } catch (error) {
        console.error('注文データの解析に失敗しました:', error);
      }
    } else {
      // 注文データがない場合はホームページにリダイレクト
      navigate('/');
    }
  }, [navigate]);
  
  if (!orderData) {
    return <div className="loading">読み込み中...</div>;
  }
  
  // 注文情報を取得
  const { orderNumber, orderDate, isGuest } = orderData;
  const formattedDate = new Date(orderDate).toLocaleDateString('ja-JP');
  
  return (
    <div className="order-complete-page">
      <div className="container">
        <div className="order-complete-content">
          <div className="success-icon">✓</div>
          <h1>ご注文ありがとうございます</h1>
          <p className="success-message">
            注文が正常に完了しました。注文の確認メールを送信しました。
          </p>
          
          <div className="order-details">
            <div className="order-info-row">
              <span className="label">注文番号:</span>
              <span className="value">{orderNumber}</span>
            </div>
            <div className="order-info-row">
              <span className="label">注文日:</span>
              <span className="value">{formattedDate}</span>
            </div>
          </div>
          
          <div className="delivery-info">
            <h2>配送情報</h2>
            <p>
              商品の発送が完了次第、メールにてお知らせいたします。<br />
              {!isGuest && 'マイページから注文の進捗状況を確認することもできます。'}
            </p>
          </div>
          
          <div className="order-complete-actions">
            {!isGuest && (
              <button
                className="btn primary"
                onClick={() => navigate('/mypage/orders')}
              >
                注文履歴を見る
              </button>
            )}
            <Link to="/" className="btn secondary">
              ショッピングを続ける
            </Link>
          </div>
          
          <div className="customer-support">
            <h3>お問い合わせ</h3>
            <p>
              ご注文に関するご質問やご不明点がございましたら、
              <Link to="/contact">お問い合わせフォーム</Link>
              または下記の電話番号までお気軽にお問い合わせください。
            </p>
            <p className="contact-phone">TEL: 03-1234-5678 (平日 10:00-18:00)</p>
          </div>
          
          {isGuest && (
            <div className="guest-order-note">
              <h3>会員登録のご案内</h3>
              <p>
                会員登録をすると、注文履歴の確認やポイントの獲得など様々な特典があります。
                今回の注文情報を引き継いで会員登録することもできます。
              </p>
              <Link to="/register" className="btn">
                会員登録する
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderCompletePage;
