import React from 'react';
import { Link } from 'react-router-dom';
import PageTitle from '../utils/PageTitle';

const NotFoundPage: React.FC = () => {
  return (
    <div className="not-found-page">
      <PageTitle title="404 - ページが見つかりません" />
      <div className="container">
        <div className="not-found-content">
          <div className="error-code">JaSST Hokkaido 実行委員募集</div>
          <div className="recruitment-content">
            <p>
              JaSST Hokkaido実行委員会では、ソフトウェアテスト技術向上・情報共有のため
              <br />
              一緒にシンポジウムの企画・準備・運営を⾏っていただける実⾏委員ボランティアを募集致します。
            </p>
            <p>
              ミーティングや準備作業は、オンラインでの参加も可能な環境となっておりますので自宅や遠方からもご協力いただけます。
              <br />
              ソフトウェアテストに関心のある方の積極的なご参加を実行委員一同、心よりお待ちしております。
              <br />
              ご興味をお持ちの方は、以下のメールアドレスよりお名前、ご連絡先等をご連絡をお願い致します。
            </p>
          </div>
          
          <div className="inquiry-section">
            <h2>お問い合わせ</h2>
            <div className="contact-info">
              <p>JaSST'24 Hokkaido 実行委員会事務局</p>
              <p>
                <strong>E-mail：</strong>
                <a href="mailto:hokkaido-inquery@jasst.npoaster.jp">hokkaido-inquery@jasst.npoaster.jp</a>
              </p>
              <p className="contact-note">（お問い合わせは電子メールでお願いいたします）</p>
              <p className="contact-note">※本アドレスでお受けできるメールの最大容量は100MBとなっておりますのでご注意ください</p>
            </div>
          </div>
          
          <div className="not-found-actions">
            <Link to="/" className="btn">
              ホームに戻る
            </Link>
            <Link to="/products" className="btn secondary">
              商品一覧を見る
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
