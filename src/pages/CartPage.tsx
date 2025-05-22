import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import PageTitle from '../utils/PageTitle';

const CartPage: React.FC = () => {
  const navigate = useNavigate();
  const { cartItems, updateQuantity, removeFromCart, getSubtotal } = useCart();
  const { isAuthenticated } = useAuth();
  
  // 合計金額の計算
  const subtotal = getSubtotal();
  const shippingFee = subtotal >= 5000 ? 0 : 500; // 5000円以上で送料無料
  const total = subtotal + shippingFee;

  // 数量変更のハンドラー
  const handleQuantityChange = (id: number, newQuantity: number) => {
    if (newQuantity > 0) {
      updateQuantity(id, newQuantity);
    }
  };

  // 商品削除のハンドラー
  const handleRemoveItem = (id: number) => {
    removeFromCart(id);
  };
  
  // チェックアウトへ進むハンドラー
  const handleProceedToCheckout = () => {
    navigate('/checkout');
  };

  if (cartItems.length === 0) {
    return (
      <div className="cart-page">
        <PageTitle title="ショッピングカート" description="カートに追加した商品を確認できます。" />
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
      <PageTitle title="ショッピングカート" description="カートに追加した商品を確認できます。" />
      <div className="container">
        <h1 className="page-title">ショッピングカート</h1>
        
        {/* カートのステップ表示 */}
        <div className="cart-steps">
          <div className="cart-step active">
            <div className="step-number">1</div>
            <div className="step-label">カート</div>
          </div>
          <div className="step-divider"></div>
          <div className="cart-step">
            <div className="step-number">2</div>
            <div className="step-label">お届け先・支払方法</div>
          </div>
          <div className="step-divider"></div>
          <div className="cart-step">
            <div className="step-number">3</div>
            <div className="step-label">注文確認</div>
          </div>
          <div className="step-divider"></div>
          <div className="cart-step">
            <div className="step-number">4</div>
            <div className="step-label">完了</div>
          </div>
        </div>
        
        <div className="cart-container">
          {/* カート商品一覧 */}
          <div className="cart-items">
            <table className="cart-table">
              <thead>
                <tr>
                  <th>商品</th>
                  <th>価格</th>
                  <th>数量</th>
                  <th>小計</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {cartItems.map(item => (
                  <tr key={item.id} className="cart-item-row">
                    <td className="product-cell">
                      <div className="product-info">
                        <img src={item.imageUrl || "https://placehold.jp/300x200.png"} alt={item.name} className="product-image" />
                        <div className="product-details">
                          <h3 className="product-name">{item.name}</h3>
                          {item.options && (
                            <div className="product-options">
                              {item.options.size && <span>サイズ: {item.options.size}</span>}
                              {item.options.color && <span>カラー: {item.options.color}</span>}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="price-cell">¥{item.price.toLocaleString()}</td>
                    <td className="quantity-cell">
                      <div className="quantity-controls">
                        <button 
                          className="quantity-btn"
                          onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                        >-</button>
                        <input
                          type="text"
                          className="quantity-input"
                          value={item.quantity}
                          readOnly
                        />
                        <button 
                          className="quantity-btn"
                          onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                        >+</button>
                      </div>
                    </td>
                    <td className="subtotal-cell">¥{(item.price * item.quantity).toLocaleString()}</td>
                    <td className="remove-cell">
                      <button 
                        className="remove-btn"
                        onClick={() => handleRemoveItem(item.id)}
                        aria-label="商品を削除"
                      >×</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* 注文サマリー */}
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
            
            {!isAuthenticated && (
              <div className="login-suggestion">
                <Link to="/login?redirect=cart" className="login-link">
                  ログイン
                </Link>
                するとポイントが貯まります
              </div>
            )}
          
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
