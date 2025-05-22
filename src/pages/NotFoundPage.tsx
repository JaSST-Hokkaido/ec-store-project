import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage: React.FC = () => {
  return (
    <div className="not-found-page">
      <div className="container">
        <div className="not-found-content">
          <div className="error-code">404</div>
          <h1>ページが見つかりません</h1>
          <p>
            お探しのページは移動したか、削除された可能性があります。
            <br />
            URLが正しく入力されていることをご確認ください。
          </p>
          <div className="not-found-actions">
            <Link to="/" className="btn">
              ホームに戻る
            </Link>
            <Link to="/products" className="btn secondary">
              商品一覧を見る
            </Link>
          </div>
          <div className="not-found-suggestions">
            <h2>おすすめのページ</h2>
            <ul>
              <li>
                <Link to="/">ホーム</Link>
              </li>
              <li>
                <Link to="/products">商品一覧</Link>
              </li>
              <li>
                <Link to="/cart">ショッピングカート</Link>
              </li>
              <li>
                <Link to="/contact">お問い合わせ</Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
