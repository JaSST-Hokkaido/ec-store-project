import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

// 注文情報の型定義
interface OrderSummary {
  subtotal: number;
  shippingFee: number;
  tax: number;
  total: number;
  items: {
    id: number;
    name: string;
    price: number;
    quantity: number;
    options?: {
      size?: string;
      color?: string;
    };
  }[];
}

// 住所情報の型定義
interface AddressForm {
  firstName: string;
  lastName: string;
  email: string; // ゲスト購入用のメールアドレス
  postalCode: string;
  prefecture: string;
  city: string;
  address1: string;
  address2: string;
  phone: string;
}

const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, currentUser } = useAuth();
  const { getCartItems, clearCart } = useCart();
  const [isLoading, setIsLoading] = useState(true);
  const [activeStep, setActiveStep] = useState(1); // 1: 配送情報, 2: 支払い情報, 3: 注文確認
  const [isGuest, setIsGuest] = useState(!isAuthenticated);
  const [orderSummary, setOrderSummary] = useState<OrderSummary>({
    subtotal: 0,
    shippingFee: 0,
    tax: 0,
    total: 0,
    items: []
  });
  
  // 配送先住所フォーム
  const [addressForm, setAddressForm] = useState<AddressForm>({
    firstName: currentUser?.name?.split(' ')[1] || '',
    lastName: currentUser?.name?.split(' ')[0] || '',
    email: currentUser?.email || '',
    postalCode: currentUser?.address?.postalCode || '',
    prefecture: currentUser?.address?.prefecture || '',
    city: currentUser?.address?.city || '',
    address1: currentUser?.address?.address1 || '',
    address2: currentUser?.address?.address2 || '',
    phone: currentUser?.phone || ''
  });
  
  // 支払い方法
  const [paymentMethod, setPaymentMethod] = useState('credit-card');
  
  // クレジットカード情報（実際はこのように平文で保存しないこと）
  const [cardInfo, setCardInfo] = useState({
    cardNumber: '',
    cardName: '',
    expiry: '',
    cvv: ''
  });

  // 利用可能なポイント（仮の実装）
  const [availablePoints, setAvailablePoints] = useState(500);
  const [usePoints, setUsePoints] = useState(false);
  
  // 利用規約同意
  const [termsAgreed, setTermsAgreed] = useState(false);

  // カート情報を取得して注文情報を更新
  useEffect(() => {
    const cartItems = getCartItems();
    
    if (cartItems.length === 0) {
      // カートが空の場合はカートページにリダイレクト
      navigate('/cart');
      return;
    }
    
    // カート情報から注文情報を作成
    const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = Math.floor(subtotal * 0.1); // 10%の消費税
    const shippingFee = subtotal >= 10000 ? 0 : 500; // 1万円以上は送料無料
    
    const orderData: OrderSummary = {
      subtotal,
      shippingFee,
      tax,
      total: subtotal + shippingFee + tax,
      items: cartItems.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        options: item.options
      }))
    };
    
    setOrderSummary(orderData);
    setIsLoading(false);
  }, [getCartItems, navigate]);

  // 住所フォームの変更ハンドラー
  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setAddressForm({
      ...addressForm,
      [e.target.name]: e.target.value
    });
  };

  // 支払い方法の変更ハンドラー
  const handlePaymentMethodChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPaymentMethod(e.target.value);
  };

  // カード情報の変更ハンドラー
  const handleCardInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCardInfo({
      ...cardInfo,
      [e.target.name]: e.target.value
    });
  };

  // ポイント利用の切り替えハンドラー
  const handleTogglePoints = () => {
    setUsePoints(!usePoints);
  };

  // ステップの進行ハンドラー
  const handleNextStep = () => {
    setActiveStep(activeStep + 1);
    window.scrollTo(0, 0);
  };

  // ステップの戻りハンドラー
  const handlePrevStep = () => {
    setActiveStep(activeStep - 1);
    window.scrollTo(0, 0);
  };

  // 注文確定ハンドラー
  const handlePlaceOrder = () => {
    // 注文情報を作成
    const orderData = {
      orderNumber: 'ORD-' + Math.floor(100000 + Math.random() * 900000),
      orderDate: new Date().toISOString(),
      address: addressForm,
      payment: {
        method: paymentMethod,
        card: paymentMethod === 'credit-card' ? cardInfo : null
      },
      order: orderSummary,
      usePoints: usePoints ? availablePoints : 0,
      isGuest: isGuest
    };
    
    // 注文情報をローカルストレージに保存（実際はAPIリクエストを送信）
    localStorage.setItem('latestOrder', JSON.stringify(orderData));
    
    // カートをクリア
    clearCart();
    
    // 注文完了ページへリダイレクト
    navigate('/order-complete');
  };

  // 配送先フォームのバリデーション
  const validateAddressForm = () => {
    const emailValid = !isGuest || (isGuest && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(addressForm.email));
    
    return (
      addressForm.firstName.trim() !== '' &&
      addressForm.lastName.trim() !== '' &&
      addressForm.postalCode.trim() !== '' &&
      addressForm.prefecture.trim() !== '' &&
      addressForm.city.trim() !== '' &&
      addressForm.address1.trim() !== '' &&
      addressForm.phone.trim() !== '' &&
      emailValid
    );
  };

  // 支払い情報のバリデーション
  const validatePaymentInfo = () => {
    if (paymentMethod === 'credit-card') {
      return (
        cardInfo.cardNumber.trim() !== '' &&
        cardInfo.cardName.trim() !== '' &&
        cardInfo.expiry.trim() !== '' &&
        cardInfo.cvv.trim() !== ''
      );
    }
    return true; // その他の支払い方法はバリデーション不要
  };

  // 最終注文確認のバリデーション
  const validateOrderConfirmation = () => {
    return termsAgreed;
  };

  // 次へ進むボタンの有効/無効状態
  const isNextButtonDisabled = () => {
    if (activeStep === 1) {
      return !validateAddressForm();
    } else if (activeStep === 2) {
      return !validatePaymentInfo();
    }
    return false;
  };

  // 注文確定ボタンの有効/無効状態
  const isPlaceOrderButtonDisabled = () => {
    return !validateOrderConfirmation();
  };

  if (isLoading) {
    return <div className="loading">読み込み中...</div>;
  }

  // 実際の注文合計（ポイント適用後）
  const finalTotal = usePoints
    ? Math.max(0, orderSummary.total - availablePoints)
    : orderSummary.total;

  return (
    <div className="checkout-page">
      <div className="container">
        <h1 className="page-title">ご注文手続き</h1>
        
        {/* チェックアウトのステップ */}
        <div className="checkout-steps">
          <div className={`checkout-step ${activeStep >= 1 ? 'active' : ''}`}>
            <div className="step-number">1</div>
            <div className="step-title">配送情報</div>
          </div>
          <div className="step-divider"></div>
          <div className={`checkout-step ${activeStep >= 2 ? 'active' : ''}`}>
            <div className="step-number">2</div>
            <div className="step-title">支払い情報</div>
          </div>
          <div className="step-divider"></div>
          <div className={`checkout-step ${activeStep >= 3 ? 'active' : ''}`}>
            <div className="step-number">3</div>
            <div className="step-title">注文確認</div>
          </div>
        </div>
        
        <div className="checkout-container">
          <div className="checkout-main">
            {/* ステップ1: 配送情報 */}
            {activeStep === 1 && (
              <div className="checkout-section">
                <h2 className="section-title">配送先情報</h2>
                
                {!isAuthenticated && (
                  <div className="guest-checkout-notice">
                    <p>
                      会員登録済みのお客様は <Link to={`/login?redirect=checkout`}>ログイン</Link> すると
                      ポイントが貯まり、次回以降のお買い物がよりスムーズになります。
                    </p>
                  </div>
                )}
                <form className="address-form">
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="lastName">姓</label>
                      <input
                        type="text"
                        id="lastName"
                        name="lastName"
                        value={addressForm.lastName}
                        onChange={handleAddressChange}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="firstName">名</label>
                      <input
                        type="text"
                        id="firstName"
                        name="firstName"
                        value={addressForm.firstName}
                        onChange={handleAddressChange}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="postalCode">郵便番号</label>
                      <input
                        type="text"
                        id="postalCode"
                        name="postalCode"
                        value={addressForm.postalCode}
                        onChange={handleAddressChange}
                        placeholder="123-4567"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="prefecture">都道府県</label>
                      <select
                        id="prefecture"
                        name="prefecture"
                        value={addressForm.prefecture}
                        onChange={handleAddressChange}
                        required
                      >
                        <option value="">選択してください</option>
                        <option value="北海道">北海道</option>
                        <option value="東京都">東京都</option>
                        <option value="大阪府">大阪府</option>
                        {/* 他の都道府県も追加 */}
                      </select>
                    </div>
                  </div>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="city">市区町村</label>
                      <input
                        type="text"
                        id="city"
                        name="city"
                        value={addressForm.city}
                        onChange={handleAddressChange}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="address1">番地・建物名</label>
                      <input
                        type="text"
                        id="address1"
                        name="address1"
                        value={addressForm.address1}
                        onChange={handleAddressChange}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="address2">部屋番号など (任意)</label>
                      <input
                        type="text"
                        id="address2"
                        name="address2"
                        value={addressForm.address2}
                        onChange={handleAddressChange}
                      />
                    </div>
                  </div>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="phone">電話番号</label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={addressForm.phone}
                        onChange={handleAddressChange}
                        placeholder="090-1234-5678"
                        required
                      />
                    </div>
                  </div>
                  
                  {isGuest && (
                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="email">メールアドレス (注文確認メールの送信先)</label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          value={addressForm.email}
                          onChange={handleAddressChange}
                          placeholder="your@email.com"
                          required
                        />
                      </div>
                    </div>
                  )}
                </form>
                
                <div className="form-actions">
                  <button
                    className="btn"
                    onClick={handleNextStep}
                    disabled={isNextButtonDisabled()}
                  >
                    次へ進む
                  </button>
                </div>
              </div>
            )}
            
            {/* ステップ2: 支払い情報 */}
            {activeStep === 2 && (
              <div className="checkout-section">
                <h2 className="section-title">お支払い方法</h2>
                <div className="payment-methods">
                  <div className="payment-method">
                    <input
                      type="radio"
                      id="credit-card"
                      name="payment-method"
                      value="credit-card"
                      checked={paymentMethod === 'credit-card'}
                      onChange={handlePaymentMethodChange}
                    />
                    <label htmlFor="credit-card">クレジットカード</label>
                  </div>
                  
                  <div className="payment-method">
                    <input
                      type="radio"
                      id="bank-transfer"
                      name="payment-method"
                      value="bank-transfer"
                      checked={paymentMethod === 'bank-transfer'}
                      onChange={handlePaymentMethodChange}
                    />
                    <label htmlFor="bank-transfer">銀行振込</label>
                  </div>
                  
                  <div className="payment-method">
                    <input
                      type="radio"
                      id="convenience-store"
                      name="payment-method"
                      value="convenience-store"
                      checked={paymentMethod === 'convenience-store'}
                      onChange={handlePaymentMethodChange}
                    />
                    <label htmlFor="convenience-store">コンビニ決済</label>
                  </div>
                </div>
                
                {paymentMethod === 'credit-card' && (
                  <div className="credit-card-form">
                    <h3>クレジットカード情報</h3>
                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="cardNumber">カード番号</label>
                        <input
                          type="text"
                          id="cardNumber"
                          name="cardNumber"
                          value={cardInfo.cardNumber}
                          onChange={handleCardInfoChange}
                          placeholder="1234 5678 9012 3456"
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="cardName">カード名義</label>
                        <input
                          type="text"
                          id="cardName"
                          name="cardName"
                          value={cardInfo.cardName}
                          onChange={handleCardInfoChange}
                          placeholder="TARO YAMADA"
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="form-row">
                      <div className="form-group half-width">
                        <label htmlFor="expiry">有効期限</label>
                        <input
                          type="text"
                          id="expiry"
                          name="expiry"
                          value={cardInfo.expiry}
                          onChange={handleCardInfoChange}
                          placeholder="MM/YY"
                          required
                        />
                      </div>
                      <div className="form-group half-width">
                        <label htmlFor="cvv">セキュリティコード</label>
                        <input
                          type="text"
                          id="cvv"
                          name="cvv"
                          value={cardInfo.cvv}
                          onChange={handleCardInfoChange}
                          placeholder="123"
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="card-icons">
                      <span className="card-icon">VISA</span>
                      <span className="card-icon">Mastercard</span>
                      <span className="card-icon">JCB</span>
                      <span className="card-icon">AMEX</span>
                    </div>
                  </div>
                )}
                
                {paymentMethod === 'bank-transfer' && (
                  <div className="bank-transfer-info">
                    <h3>銀行振込情報</h3>
                    <p>ご注文確定後、振込先情報をメールでお送りします。</p>
                    <p>お振込みが確認でき次第、商品を発送いたします。</p>
                  </div>
                )}
                
                {paymentMethod === 'convenience-store' && (
                  <div className="convenience-store-info">
                    <h3>コンビニ決済情報</h3>
                    <p>ご注文確定後、お支払い情報をメールでお送りします。</p>
                    <p>コンビニでのお支払いが確認でき次第、商品を発送いたします。</p>
                  </div>
                )}
                
                <div className="form-actions">
                  <button className="btn secondary" onClick={handlePrevStep}>
                    戻る
                  </button>
                  <button
                    className="btn"
                    onClick={handleNextStep}
                    disabled={isNextButtonDisabled()}
                  >
                    次へ進む
                  </button>
                </div>
              </div>
            )}
            
            {/* ステップ3: 注文確認 */}
            {activeStep === 3 && (
              <div className="checkout-section">
                <h2 className="section-title">注文内容の確認</h2>
                
                {isGuest && (
                  <div className="confirmation-section">
                    <h3>お客様情報</h3>
                    <div className="confirmation-details">
                      <p>メールアドレス: {addressForm.email}</p>
                    </div>
                  </div>
                )}
                
                <div className="confirmation-section">
                  <h3>配送先情報</h3>
                  <div className="confirmation-details">
                    <p>{addressForm.lastName} {addressForm.firstName}</p>
                    <p>〒{addressForm.postalCode}</p>
                    <p>{addressForm.prefecture}{addressForm.city}</p>
                    <p>{addressForm.address1} {addressForm.address2}</p>
                    <p>電話番号: {addressForm.phone}</p>
                  </div>
                  <button className="edit-button" onClick={() => setActiveStep(1)}>
                    編集
                  </button>
                </div>
                
                <div className="confirmation-section">
                  <h3>お支払い方法</h3>
                  <div className="confirmation-details">
                    {paymentMethod === 'credit-card' && (
                      <div>
                        <p>クレジットカード</p>
                        <p>カード番号: **** **** **** {cardInfo.cardNumber.slice(-4)}</p>
                        <p>有効期限: {cardInfo.expiry}</p>
                      </div>
                    )}
                    {paymentMethod === 'bank-transfer' && <p>銀行振込</p>}
                    {paymentMethod === 'convenience-store' && <p>コンビニ決済</p>}
                  </div>
                  <button className="edit-button" onClick={() => setActiveStep(2)}>
                    編集
                  </button>
                </div>
                
                {!isGuest && (
                  <div className="confirmation-section">
                    <h3>ポイント利用</h3>
                    <div className="confirmation-details">
                      <div className="points-section">
                        <p>利用可能ポイント: {availablePoints}ポイント</p>
                        <div className="points-toggle">
                          <input
                            type="checkbox"
                            id="use-points"
                            checked={usePoints}
                            onChange={handleTogglePoints}
                          />
                          <label htmlFor="use-points">
                            ポイントを使用する (1ポイント = 1円)
                          </label>
                        </div>
                        {usePoints && (
                          <p className="points-used">
                            {availablePoints}ポイントを使用 (-¥{availablePoints.toLocaleString()})
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="terms-agreement">
                  <input
                    type="checkbox"
                    id="terms-agreed"
                    checked={termsAgreed}
                    onChange={() => setTermsAgreed(!termsAgreed)}
                  />
                  <label htmlFor="terms-agreed">
                    <a href="/terms" target="_blank" rel="noopener noreferrer">
                      利用規約
                    </a>
                    および
                    <a href="/privacy" target="_blank" rel="noopener noreferrer">
                      プライバシーポリシー
                    </a>
                    に同意します
                  </label>
                </div>
                
                <div className="form-actions">
                  <button className="btn secondary" onClick={handlePrevStep}>
                    戻る
                  </button>
                  <button
                    className="btn"
                    onClick={handlePlaceOrder}
                    disabled={isPlaceOrderButtonDisabled()}
                  >
                    注文を確定する
                  </button>
                </div>
              </div>
            )}
          </div>
          
          {/* 注文サマリー */}
          <div className="checkout-sidebar">
            <div className="order-summary">
              <h2 className="summary-title">注文内容</h2>
              
              <div className="order-items">
                {orderSummary.items.map(item => (
                  <div className="order-item" key={item.id}>
                    <div className="item-details">
                      <h3 className="item-name">{item.name}</h3>
                      {item.options && (
                        <div className="item-options">
                          {item.options.size && <span>サイズ: {item.options.size}</span>}
                          {item.options.color && <span>カラー: {item.options.color}</span>}
                        </div>
                      )}
                      <div className="item-quantity">数量: {item.quantity}</div>
                    </div>
                    <div className="item-price">
                      ¥{(item.price * item.quantity).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="summary-details">
                <div className="summary-row">
                  <span>小計</span>
                  <span>¥{orderSummary.subtotal.toLocaleString()}</span>
                </div>
                <div className="summary-row">
                  <span>送料</span>
                  <span>¥{orderSummary.shippingFee.toLocaleString()}</span>
                </div>
                <div className="summary-row">
                  <span>消費税</span>
                  <span>¥{orderSummary.tax.toLocaleString()}</span>
                </div>
                
                {usePoints && !isGuest && (
                  <div className="summary-row discount">
                    <span>ポイント使用</span>
                    <span>-¥{availablePoints.toLocaleString()}</span>
                  </div>
                )}
                
                <div className="summary-row total">
                  <span>合計</span>
                  <span>¥{finalTotal.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
