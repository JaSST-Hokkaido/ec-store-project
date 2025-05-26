import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  getUserCart,
  addToCart as serviceAddToCart,
  updateCartItemQuantity,
  removeFromCart as serviceRemoveFromCart,
  clearCart as serviceClearCart,
  getCartDisplayItems,
  calculateCartTotal,
  getCartItemCount,
  applyCoupon as serviceApplyCoupon,
  removeCoupon as serviceRemoveCoupon,
  usePoints as serviceUsePoints,
  clearPointsUsed as serviceClearPointsUsed,
  CartDisplayItem
} from '../services/cartService';
import { getCurrentUser } from '../services/userService';

// カート用のデータ型（後方互換性のため）
export interface CartItem {
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

interface CartContextType {
  cartItems: CartItem[];
  cartDisplayItems: CartDisplayItem[];
  addToCart: (item: CartItem) => Promise<boolean>;
  removeFromCart: (id: number) => void;
  updateQuantity: (id: number, quantity: number) => void;
  clearCart: () => void;
  getCartCount: () => number;
  getSubtotal: () => number;
  getCartItems: () => CartItem[];
  applyCoupon: (code: string) => boolean;
  removeCoupon: () => void;
  usePoints: (points: number) => boolean;
  clearPointsUsed: () => void;
  cartTotal: {
    subtotal: number;
    discount: number;
    pointsDiscount: number;
    shipping: number;
    total: number;
  };
  couponCode: string | null;
  pointsUsed: number;
  refreshCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [cartDisplayItems, setCartDisplayItems] = useState<CartDisplayItem[]>([]);
  const [cartTotal, setCartTotal] = useState({
    subtotal: 0,
    discount: 0,
    pointsDiscount: 0,
    shipping: 0,
    total: 0
  });
  const [couponCode, setCouponCode] = useState<string | null>(null);
  const [pointsUsed, setPointsUsed] = useState<number>(0);

  // カートデータを更新
  const refreshCart = async () => {
    try {
      const cart = getUserCart();
      const displayItems = await getCartDisplayItems();
      const total = await calculateCartTotal();
      
      // CartItem形式に変換（後方互換性のため）
      const items: CartItem[] = displayItems.map(item => ({
        id: item.productId,
        name: item.product.name,
        price: item.product.price,
        imageUrl: item.product.imageUrl,
        quantity: item.quantity,
        options: item.options
      }));
      
      setCartItems(items);
      setCartDisplayItems(displayItems);
      setCartTotal(total);
      setCouponCode(cart.couponCode || null);
      setPointsUsed(cart.pointsUsed);
    } catch (error) {
      console.error('カートデータの読み込みに失敗しました:', error);
    }
  };

  // 初期化と定期更新
  useEffect(() => {
    refreshCart();
    
    // localStorageの変更を監視
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key && (e.key.startsWith('ec-cart-') || e.key === 'ec-shared-stock')) {
        refreshCart();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // ユーザーの変更を監視
  useEffect(() => {
    const intervalId = setInterval(() => {
      const currentUser = getCurrentUser();
      if (currentUser || cartItems.length > 0) {
        refreshCart();
      }
    }, 1000);
    
    return () => clearInterval(intervalId);
  }, [cartItems.length]);

  // カートに商品を追加
  const addToCart = async (item: CartItem): Promise<boolean> => {
    try {
      const success = await serviceAddToCart(item.id, item.quantity, item.options);
      if (success) {
        await refreshCart();
      }
      return success;
    } catch (error) {
      console.error('カートへの追加に失敗しました:', error);
      return false;
    }
  };

  // カートから商品を削除
  const removeFromCart = async (id: number) => {
    try {
      await serviceRemoveFromCart(id);
      await refreshCart();
    } catch (error) {
      console.error('カートからの削除に失敗しました:', error);
    }
  };

  // 商品の数量を更新
  const updateQuantity = async (id: number, quantity: number) => {
    if (quantity < 1) return;
    
    try {
      await updateCartItemQuantity(id, quantity);
      await refreshCart();
    } catch (error) {
      console.error('数量の更新に失敗しました:', error);
    }
  };

  // カートを空にする
  const clearCart = () => {
    serviceClearCart();
    refreshCart();
  };

  // カート内の商品数を取得
  const getCartCount = () => {
    return getCartItemCount();
  };

  // 小計を計算
  const getSubtotal = () => {
    return cartTotal.subtotal;
  };

  // クーポン適用
  const applyCoupon = (code: string): boolean => {
    const success = serviceApplyCoupon(code);
    if (success) {
      refreshCart();
    }
    return success;
  };

  // クーポン削除
  const removeCoupon = () => {
    serviceRemoveCoupon();
    refreshCart();
  };

  // ポイント使用
  const usePoints = (points: number): boolean => {
    const success = serviceUsePoints(points);
    if (success) {
      refreshCart();
    }
    return success;
  };

  // ポイント使用取り消し
  const clearPointsUsed = () => {
    serviceClearPointsUsed();
    refreshCart();
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartDisplayItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartCount,
        getSubtotal,
        getCartItems: () => [...cartItems],
        applyCoupon,
        removeCoupon,
        usePoints,
        clearPointsUsed,
        cartTotal,
        couponCode,
        pointsUsed,
        refreshCart
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

// カスタムフック
export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
