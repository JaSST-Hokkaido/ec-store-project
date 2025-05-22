import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-container">
          <div className="footer-column">
            <h3>JaSST Hokkaidoストア</h3>
            <ul className="footer-links">
              <li className="footer-link">
                <Link to="/about">当店について</Link>
              </li>
              <li className="footer-link">
                <Link to="/company">会社概要</Link>
              </li>
              <li className="footer-link">
                <Link to="/news">ニュース</Link>
              </li>
              <li className="footer-link">
                <Link to="/recruit">採用情報</Link>
              </li>
            </ul>
          </div>

          <div className="footer-column">
            <h3>お買い物ガイド</h3>
            <ul className="footer-links">
              <li className="footer-link">
                <Link to="/guide">ご利用ガイド</Link>
              </li>
              <li className="footer-link">
                <Link to="/faq">よくある質問</Link>
              </li>
              <li className="footer-link">
                <Link to="/shipping">配送について</Link>
              </li>
              <li className="footer-link">
                <Link to="/payment">お支払い方法</Link>
              </li>
            </ul>
          </div>

          <div className="footer-column">
            <h3>カテゴリー</h3>
            <ul className="footer-links">
              <li className="footer-link">
                <Link to="/products?category=アパレル">アパレル</Link>
              </li>
              <li className="footer-link">
                <Link to="/products?category=生活雑貨">生活雑貨</Link>
              </li>
              <li className="footer-link">
                <Link to="/products?category=ステーショナリー">ステーショナリー</Link>
              </li>
              <li className="footer-link">
                <Link to="/products?category=書籍">書籍</Link>
              </li>
            </ul>
          </div>

          <div className="footer-column">
            <h3>カスタマーサポート</h3>
            <ul className="footer-links">
              <li className="footer-link">
                <Link to="/contact">お問い合わせ</Link>
              </li>
              <li className="footer-link">
                <Link to="/returns">返品・交換について</Link>
              </li>
              <li className="footer-link">
                <Link to="/privacy">プライバシーポリシー</Link>
              </li>
              <li className="footer-link">
                <Link to="/terms">利用規約</Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; {currentYear} JaSST Hokkaidoストア All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
