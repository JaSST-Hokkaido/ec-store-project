import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

// カート用のデータ型
interface CartItem {
  id: number;
  name: string;
  price: number;
  imageUrl: string;
  quantity: number;
  options?: {
    size?: string;
    color?: string;
  };
}

const CartPage: React.FC = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // テスト用のダミーデータ
  useEffect(() => {
    // 実際のアプリでは、LocalStorageやContextからカートデータを取得
    const dummyCartItems: CartItem[] = [
      {
        id: 1,
        name: 'テクノベーシック Tシャツ',
        price: 3500,
        imageUrl: 'https://placehold.jp/300x200.png',
        quantity: 2,
        options: {
          size: 'M',
          color: 'ブラック'
        }
      },
      {
        id: 3,
        name: 'テクノラボ ステッカーセット',
        price: 980,
        imageUrl: 'https://placehold.jp/300x200.png',
        quantity: 1
      }
    ];

    setCartItems(dummyCartItems);
    setIsLoading(false);
  }, []);

  // 合計金額の計算
  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shippingFee = subtotal >= 5000 ? 0 : 500; // 5000円以上で送料無料
  const total = subtotal + shippingFee;

  // 数量変更のハンドラー
  const handleQuantityChange = (id: number, newQuantity: number) => {
    if (newQuantity < 1) return;
    
    setCartItems(prevItems => 
      prevItems.map(item => 
        item.id === id ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  // 商品削除のハンドラー
  const handleRemoveItem = (id: number) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== id));
  };

  // チェックアウトへ進むハンドラー
  const handleProceedToCheckout = () => {
    // 仮のログイン状態チェック（後でContextから取得）
    const isLoggedIn = false;
    
    if (isLoggedIn) {
      navigate('/checkout');
    } else {
      navigate('/login?redirect=checkout');
    }
  };

  if (isLoading) {
    return <div className="loading">読み込み中...</div>;
  }

  if (cartItems.length === 0) {
    return (
      <div className="cart-page">
        <div className="container">
          <h1 className="page-title">ショッピングカート</h1>
          <div className="empty-cart">
            <div className="empty-cart-icon">🛒</div>
            <h2>カートに商品がありません</h2>
            <p>商品をカートに追加して、お買い物をお楽しみください。</p>
            <Link to="/products" className="btn">
              商品一覧に戻る
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="container">
        <h1 className="page-title">ショッピングカート</h1>
        
        <div className="cart-container">
          <div className="cart-items">
            <div className="cart-header">
              <div className="cart-header-product">商品</div>
              <div className="cart-header-price">価格</div>
              <div className="cart-header-quantity">数量</div>
              <div className="cart-header-total">小計</div>
              <div className="cart-header-action"></div>
            </div>
            
            {cartItems.map(item => (
              <div className="cart-item" key={item.id}>
                <div className="cart-item-product">
                  <div className="cart-item-image">
                    <img src={item.imageUrl} alt={item.name} />
                  </div>
                  <div className="cart-item-details">
                    <h3 className="cart-item-name">{item.name}</h3>
                    {item.options && (
                      <div className="cart-item-options">
                        {item.options.size && <span>サイズ: {item.options.size}</span>}
                        {item.options.color && <span>カラー: {item.options.color}</span>}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="cart-item-price">
                  ¥{item.price.toLocaleString()}
                </div>
                
                <div className="cart-item-quantity">
                  <button 
                    className="quantity-btn" 
                    onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                    disabled={item.quantity <= 1}
                  >
                    -
                  </button>
                  <span className="quantity-value">{item.quantity}</span>
                  <button 
                    className="quantity-btn" 
                    onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                  >
                    +
                  </button>
                </div>
                
                <div className="cart-item-subtotal">
                  ¥{(item.price * item.quantity).toLocaleString()}
                </div>
                
                <div className="cart-item-remove">
                  <button 
                    className="remove-btn" 
                    onClick={() => handleRemoveItem(item.id)}
                  >
                    ×
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          <div className="cart-summary">
            <h2 className="summary-title">注文内容</h2>
            
            <div className="summary-row">
              <span>小計</span>
              <span>¥{subtotal.toLocaleString()}</span>
            </div>
            
            <div className="summary-row">
              <span>送料</span>
              <span>
                {shippingFee === 0 
                  ? <span className="free-shipping">無料</span> 
                  : `¥${shippingFee.toLocaleString()}`
                }
              </span>
            </div>
            
            {shippingFee > 0 && (
              <div className="shipping-notice">
                あと¥{(5000 - subtotal).toLocaleString()}のお買い上げで送料無料になります
              </div>
            )}
            
            <div className="summary-row total">
              <span>合計</span>
              <span>¥{total.toLocaleString()}</span>
            </div>
            
            <button 
              className="btn checkout-btn" 
              onClick={handleProceedToCheckout}
            >
              レジに進む
            </button>
            
            <div className="continue-shopping">
              <Link to="/products" className="continue-link">
                買い物を続ける
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
