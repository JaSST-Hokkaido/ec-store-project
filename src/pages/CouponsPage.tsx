import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// クーポンの型定義
interface Coupon {
  id: string;
  name: string;
  code: string;
  discount: string; // 例：'10%' または '¥500'
  minPurchase: number;
  expiry: string;
  isUsed: boolean;
  description?: string;
}

const CouponsPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, currentUser } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [couponCode, setCouponCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  useEffect(() => {
    if (!isAuthenticated || !currentUser) {
      navigate('/login?redirect=mypage/coupons');
      return;
    }
    
    // 実際にはAPIからデータを取得
    // ダミーデータ作成
    const dummyCoupons: Coupon[] = [
      { 
        id: 'COUPON-123', 
        name: '初回購入10%オフ', 
        code: 'FIRSTBUY10',
        discount: '10%',
        minPurchase: 3000,
        expiry: '2025-06-30',
        isUsed: false,
        description: '初めてのご注文で使える特別クーポンです。'
      },
      { 
        id: 'COUPON-124', 
        name: '夏季セール特別クーポン', 
        code: 'SUMMER2025',
        discount: '¥500',
        minPurchase: 5000,
        expiry: '2025-08-31',
        isUsed: false,
        description: '5,000円以上のお買い上げで使用できます。'
      },
      { 
        id: 'COUPON-120', 
        name: 'お誕生日クーポン', 
        code: 'BDAYSP15',
        discount: '15%',
        minPurchase: 2000,
        expiry: '2025-01-31',
        isUsed: true,
        description: 'お誕生日おめでとうございます。特別な一日をお祝いします。'
      }
    ];
    
    setCoupons(dummyCoupons);
    setIsLoading(false);
  }, [isAuthenticated, currentUser, navigate]);
  
  // クーポンコード入力ハンドラー
  const handleCouponCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCouponCode(e.target.value.toUpperCase());
    setError('');
    setSuccess('');
  };
  
  // クーポン登録ハンドラー
  const handleAddCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!couponCode.trim()) {
      setError('クーポンコードを入力してください');
      return;
    }
    
    // クーポンコードが既に登録されていないか確認
    const existingCoupon = coupons.find(c => c.code === couponCode);
    if (existingCoupon) {
      if (existingCoupon.isUsed) {
        setError('このクーポンコードは既に使用済みです');
      } else {
        setError('このクーポンコードは既に登録されています');
      }
      return;
    }
    
    // 実際のAPIではここでクーポンコードの有効性を確認
    // ダミーの有効なクーポンコード
    const validCouponCodes = ['WELCOME10', 'SUMMER25', 'MEMBER5'];
    
    if (validCouponCodes.includes(couponCode)) {
      // 新しいクーポンを追加
      const newCoupon: Coupon = { 
        id: `COUPON-${Date.now()}`, 
        name: 'スペシャルクーポン', 
        code: couponCode,
        discount: '10%',
        minPurchase: 2000,
        expiry: '2025-12-31',
        isUsed: false,
        description: '新しく追加されたクーポンです。'
      };
      
      setCoupons([...coupons, newCoupon]);
      setCouponCode('');
      setSuccess('クーポンが正常に登録されました');
    } else {
      setError('このクーポンコードは利用できません');
    }
  };
  
  if (isLoading) {
    return <div className="loading">読み込み中...</div>;
  }
  
  // 使用可能なクーポンと使用済みクーポンを分ける
  const availableCoupons = coupons.filter(coupon => !coupon.isUsed);
  const usedCoupons = coupons.filter(coupon => coupon.isUsed);
  
  return (
    <div className="coupons-page">
      <div className="container">
        <h1 className="page-title">クーポン</h1>
        
        <div className="coupon-add-section">
          <h2>クーポンを登録する</h2>
          <form className="coupon-form" onSubmit={handleAddCoupon}>
            <div className="form-group">
              <input
                type="text"
                placeholder="クーポンコードを入力"
                value={couponCode}
                onChange={handleCouponCodeChange}
                className="coupon-input"
              />
              <button type="submit" className="btn">登録する</button>
            </div>
            
            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}
          </form>
          <div className="coupon-info">
            <p>クーポンコードは、大文字・小文字を区別しません。</p>
            <p>テスト用コード: WELCOME10, SUMMER25, MEMBER5</p>
          </div>
        </div>
        
        <div className="coupons-available-section">
          <h2>使用可能なクーポン</h2>
          {availableCoupons.length > 0 ? (
            <div className="coupons-grid">
              {availableCoupons.map(coupon => (
                <div className="coupon-card" key={coupon.id}>
                  <div className="coupon-header">
                    <div className="coupon-name">{coupon.name}</div>
                    <div className="coupon-discount">{coupon.discount} OFF</div>
                  </div>
                  <div className="coupon-body">
                    {coupon.description && (
                      <div className="coupon-description">{coupon.description}</div>
                    )}
                    <div className="coupon-details">
                      <div className="coupon-code">
                        <span className="label">クーポンコード:</span>
                        <span className="code">{coupon.code}</span>
                      </div>
                      <div className="coupon-conditions">
                        <div>
                          <span className="label">最低購入金額:</span>
                          <span>¥{coupon.minPurchase.toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="label">有効期限:</span>
                          <span>{coupon.expiry}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="coupon-footer">
                    <button 
                      className="btn"
                      onClick={() => navigate('/products')}
                    >
                      このクーポンを使う
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <p>使用可能なクーポンはありません。</p>
            </div>
          )}
        </div>
        
        {usedCoupons.length > 0 && (
          <div className="coupons-used-section">
            <h2>使用済みクーポン</h2>
            <div className="coupons-grid">
              {usedCoupons.map(coupon => (
                <div className="coupon-card used" key={coupon.id}>
                  <div className="coupon-header">
                    <div className="coupon-name">{coupon.name}</div>
                    <div className="coupon-status">使用済み</div>
                  </div>
                  <div className="coupon-body">
                    <div className="coupon-details">
                      <div className="coupon-code">
                        <span className="label">クーポンコード:</span>
                        <span className="code">{coupon.code}</span>
                      </div>
                      <div className="coupon-conditions">
                        <div>
                          <span className="label">割引:</span>
                          <span>{coupon.discount} OFF</span>
                        </div>
                        <div>
                          <span className="label">有効期限:</span>
                          <span>{coupon.expiry}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CouponsPage;
