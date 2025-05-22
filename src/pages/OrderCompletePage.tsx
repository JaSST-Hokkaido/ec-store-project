import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const OrderCompletePage: React.FC = () => {
  const navigate = useNavigate();
  
  // 注文情報（実際にはURLパラメータやContextから取得する）
  const orderNumber = 'ORD-' + Math.floor(100000 + Math.random() * 900000); // ダミーの注文番号
  const orderDate = new Date().toISOString().split('T')[0]; // 今日の日付
  
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
              <span className="value">{orderDate}</span>
            </div>
          </div>
          
          <div className="delivery-info">
            <h2>配送情報</h2>
            <p>
              商品の発送が完了次第、メールにてお知らせいたします。<br />
              マイページから注文の進捗状況を確認することもできます。
            </p>
          </div>
          
          <div className="order-complete-actions">
            <button
              className="btn primary"
              onClick={() => navigate('/mypage/orders')}
            >
              注文履歴を見る
            </button>
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
        </div>
      </div>
    </div>
  );
};

export default OrderCompletePage;
