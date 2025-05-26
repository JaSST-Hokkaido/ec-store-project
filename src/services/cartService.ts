// カート管理サービス
import { getItem, setItem, KEYS } from './storageService';
import { getCurrentUser } from './userService';
import { logUserActivity } from './demoService';
import { Product, getProductById, checkProductStock } from './productService';

// 型定義
export interface CartItem {
  productId: number;
  quantity: number;
  options?: {
    size?: string;
    color?: string;
  };
  addedAt: string;
}

export interface Cart {
  userId: string;
  items: CartItem[];
  lastUpdated: string;
  couponCode?: string;
  pointsUsed: number;
}

export interface CartDisplayItem extends CartItem {
  product: Product;
  subtotal: number;
}

// カート取得
export const getUserCart = (): Cart => {
  const user = getCurrentUser();
  if (!user) {
    // ゲストカートの場合
    return getItem<Cart>(`${KEYS.CART_PREFIX}guest`, {
      userId: 'guest',
      items: [],
      lastUpdated: new Date().toISOString(),
      pointsUsed: 0
    });
  }
  
  return getItem<Cart>(`${KEYS.CART_PREFIX}${user.id}`, {
    userId: user.id,
    items: [],
    lastUpdated: new Date().toISOString(),
    pointsUsed: 0
  });
};

// カート保存
const saveCart = (cart: Cart): void => {
  const user = getCurrentUser();
  const key = user ? `${KEYS.CART_PREFIX}${user.id}` : `${KEYS.CART_PREFIX}guest`;
  setItem(key, cart);
};

// カートに商品追加
export const addToCart = async (productId: number, quantity: number, options?: any): Promise<boolean> => {
  const user = getCurrentUser();
  const cart = getUserCart();
  
  // 在庫確認
  const availableStock = checkProductStock(productId);
  const existingItem = cart.items.find(item => 
    item.productId === productId && 
    JSON.stringify(item.options) === JSON.stringify(options)
  );
  
  const currentQuantity = existingItem ? existingItem.quantity : 0;
  const totalQuantity = currentQuantity + quantity;
  
  if (availableStock < totalQuantity) {
    console.error('在庫が不足しています');
    return false;
  }
  
  if (existingItem) {
    // 既存のアイテム更新
    existingItem.quantity = totalQuantity;
  } else {
    // 新規アイテム追加
    cart.items.push({
      productId,
      quantity,
      options,
      addedAt: new Date().toISOString()
    });
  }
  
  cart.lastUpdated = new Date().toISOString();
  saveCart(cart);
  
  if (user) {
    logUserActivity(user.id, 'ADD_TO_CART', { productId, quantity, options });
  }
  
  return true;
};

// カート内商品数量変更
export const updateCartItemQuantity = async (productId: number, quantity: number, options?: any): Promise<boolean> => {
  const user = getCurrentUser();
  const cart = getUserCart();
  
  const existingItemIndex = cart.items.findIndex(item => 
    item.productId === productId && 
    JSON.stringify(item.options) === JSON.stringify(options)
  );
  
  if (existingItemIndex < 0) return false;
  
  if (quantity <= 0) {
    // 数量0以下なら削除
    cart.items.splice(existingItemIndex, 1);
  } else {
    // 在庫確認
    const availableStock = checkProductStock(productId);
    if (availableStock < quantity) {
      console.error('在庫が不足しています');
      return false;
    }
    
    // 数量更新
    cart.items[existingItemIndex].quantity = quantity;
  }
  
  cart.lastUpdated = new Date().toISOString();
  saveCart(cart);
  
  if (user) {
    logUserActivity(user.id, 'UPDATE_CART', { productId, quantity, options });
  }
  
  return true;
};

// カートから商品削除
export const removeFromCart = async (productId: number, options?: any): Promise<boolean> => {
  return updateCartItemQuantity(productId, 0, options);
};

// カートクリア
export const clearCart = (): void => {
  const user = getCurrentUser();
  const cart = getUserCart();
  
  cart.items = [];
  cart.couponCode = undefined;
  cart.pointsUsed = 0;
  cart.lastUpdated = new Date().toISOString();
  
  saveCart(cart);
  
  if (user) {
    logUserActivity(user.id, 'CLEAR_CART', {});
  }
};

// クーポン適用
export const applyCoupon = (couponCode: string): boolean => {
  const user = getCurrentUser();
  const cart = getUserCart();
  
  // クーポン検証ロジック（デモでは簡易的に実装）
  const validCoupons = ['WELCOME10', 'MEMBER15', 'JASST20'];
  if (!validCoupons.includes(couponCode.toUpperCase())) {
    return false;
  }
  
  cart.couponCode = couponCode.toUpperCase();
  cart.lastUpdated = new Date().toISOString();
  
  saveCart(cart);
  
  if (user) {
    logUserActivity(user.id, 'APPLY_COUPON', { couponCode });
  }
  
  return true;
};

// クーポン削除
export const removeCoupon = (): void => {
  const user = getCurrentUser();
  const cart = getUserCart();
  
  cart.couponCode = undefined;
  cart.lastUpdated = new Date().toISOString();
  
  saveCart(cart);
  
  if (user) {
    logUserActivity(user.id, 'REMOVE_COUPON', {});
  }
};

// ポイント使用
export const usePoints = (points: number): boolean => {
  const user = getCurrentUser();
  if (!user) return false;
  
  const cart = getUserCart();
  
  // ポイント使用制限チェック
  if (user.points < points) return false;
  
  cart.pointsUsed = points;
  cart.lastUpdated = new Date().toISOString();
  
  saveCart(cart);
  logUserActivity(user.id, 'USE_POINTS', { points });
  
  return true;
};

// ポイント使用取り消し
export const clearPointsUsed = (): void => {
  const user = getCurrentUser();
  const cart = getUserCart();
  
  cart.pointsUsed = 0;
  cart.lastUpdated = new Date().toISOString();
  
  saveCart(cart);
  
  if (user) {
    logUserActivity(user.id, 'CLEAR_POINTS_USED', {});
  }
};

// カートの表示用データ取得
export const getCartDisplayItems = async (): Promise<CartDisplayItem[]> => {
  const cart = getUserCart();
  const user = getCurrentUser();
  const displayItems: CartDisplayItem[] = [];
  
  for (const item of cart.items) {
    const product = await getProductById(item.productId);
    if (product) {
      const price = user ? product.memberPrice : product.price;
      displayItems.push({
        ...item,
        product,
        subtotal: price * item.quantity
      });
    }
  }
  
  return displayItems;
};

// カートの合計金額計算
export const calculateCartTotal = async (): Promise<{
  subtotal: number;
  discount: number;
  pointsDiscount: number;
  shipping: number;
  total: number;
}> => {
  const cart = getUserCart();
  const user = getCurrentUser();
  const displayItems = await getCartDisplayItems();
  
  // 小計
  const subtotal = displayItems.reduce((sum, item) => sum + item.subtotal, 0);
  
  // クーポン割引
  let discount = 0;
  if (cart.couponCode) {
    switch (cart.couponCode) {
      case 'WELCOME10':
        discount = Math.floor(subtotal * 0.1);
        break;
      case 'MEMBER15':
        discount = user ? Math.floor(subtotal * 0.15) : 0;
        break;
      case 'JASST20':
        discount = Math.floor(subtotal * 0.2);
        break;
    }
  }
  
  // ポイント割引
  const pointsDiscount = cart.pointsUsed;
  
  // 送料（5000円以上で無料）
  const shipping = subtotal >= 5000 ? 0 : 500;
  
  // 合計
  const total = Math.max(0, subtotal - discount - pointsDiscount + shipping);
  
  return {
    subtotal,
    discount,
    pointsDiscount,
    shipping,
    total
  };
};

// カート内商品数
export const getCartItemCount = (): number => {
  const cart = getUserCart();
  return cart.items.reduce((count, item) => count + item.quantity, 0);
};

// ゲストカートをユーザーカートに移行
export const migrateGuestCart = (): void => {
  const user = getCurrentUser();
  if (!user) return;
  
  const guestCart = getItem<Cart | null>(`${KEYS.CART_PREFIX}guest`, null);
  if (!guestCart || guestCart.items.length === 0) return;
  
  const userCart = getItem<Cart>(`${KEYS.CART_PREFIX}${user.id}`, {
    userId: user.id,
    items: [],
    lastUpdated: new Date().toISOString(),
    pointsUsed: 0
  });
  
  // ゲストカートのアイテムをユーザーカートに追加
  for (const guestItem of guestCart.items) {
    const existingItem = userCart.items.find(item => 
      item.productId === guestItem.productId && 
      JSON.stringify(item.options) === JSON.stringify(guestItem.options)
    );
    
    if (existingItem) {
      existingItem.quantity += guestItem.quantity;
    } else {
      userCart.items.push(guestItem);
    }
  }
  
  userCart.lastUpdated = new Date().toISOString();
  setItem(`${KEYS.CART_PREFIX}${user.id}`, userCart);
  
  // ゲストカートをクリア
  setItem(`${KEYS.CART_PREFIX}guest`, {
    userId: 'guest',
    items: [],
    lastUpdated: new Date().toISOString(),
    pointsUsed: 0
  });
  
  logUserActivity(user.id, 'MIGRATE_GUEST_CART', { itemCount: guestCart.items.length });
};
