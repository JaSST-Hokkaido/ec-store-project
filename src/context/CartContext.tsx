import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// カート用のデータ型
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
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: number) => void;
  updateQuantity: (id: number, quantity: number) => void;
  clearCart: () => void;
  getCartCount: () => number;
  getSubtotal: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

// ローカルストレージのキー
const CART_STORAGE_KEY = 'ecommerce_cart_items';

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  // ローカルストレージからカートデータを読み込む
  useEffect(() => {
    const storedCart = localStorage.getItem(CART_STORAGE_KEY);
    if (storedCart) {
      try {
        setCartItems(JSON.parse(storedCart));
      } catch (error) {
        console.error('カートデータの読み込みに失敗しました:', error);
        localStorage.removeItem(CART_STORAGE_KEY);
      }
    }
  }, []);

  // カートデータをローカルストレージに保存
  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
  }, [cartItems]);

  // カートに商品を追加
  const addToCart = (item: CartItem) => {
    setCartItems(prevItems => {
      // 同じIDの商品が既にカートに存在するか確認
      const existingItemIndex = prevItems.findIndex(
        cartItem => cartItem.id === item.id && 
          JSON.stringify(cartItem.options) === JSON.stringify(item.options)
      );

      if (existingItemIndex !== -1) {
        // 既存のアイテムの数量を更新
        const updatedItems = [...prevItems];
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: updatedItems[existingItemIndex].quantity + item.quantity
        };
        return updatedItems;
      } else {
        // 新しいアイテムをカートに追加
        return [...prevItems, item];
      }
    });
  };

  // カートから商品を削除
  const removeFromCart = (id: number) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== id));
  };

  // 商品の数量を更新
  const updateQuantity = (id: number, quantity: number) => {
    if (quantity < 1) return;
    
    setCartItems(prevItems => 
      prevItems.map(item => 
        item.id === id ? { ...item, quantity } : item
      )
    );
  };

  // カートを空にする
  const clearCart = () => {
    setCartItems([]);
  };

  // カート内の商品数を取得
  const getCartCount = () => {
    return cartItems.reduce((count, item) => count + item.quantity, 0);
  };

  // 小計を計算
  const getSubtotal = () => {
    return cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartCount,
        getSubtotal
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
