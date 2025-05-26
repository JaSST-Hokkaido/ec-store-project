// 注文管理サービス
import { getItem, setItem, KEYS } from './storageService';
import { getCurrentUser, addPoints, usePoints } from './userService';
import { logUserActivity } from './demoService';
import { updateProductStock, Product, getProductById } from './productService';
import { getUserCart, clearCart, CartItem } from './cartService';

// 型定義
export interface OrderItem extends CartItem {
  price: number;
  memberPrice: number;
  appliedPrice: number;
}

export interface ShippingAddress {
  fullName: string;
  postalCode: string;
  prefecture: string;
  city: string;
  address: string;
  building?: string;
  phoneNumber: string;
}

export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  pointsUsed: number;
  shipping: number;
  totalAmount: number;
  shippingAddress: ShippingAddress;
  paymentMethod: 'credit' | 'convenience' | 'cod';
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  orderDate: string;
  pointsEarned: number;
  couponCode?: string;
  notes?: string;
}

// ユニークな注文IDを生成
const generateOrderId = (): string => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substr(2, 5).toUpperCase();
  return `ORD-${timestamp}-${random}`;
};

// 注文作成
export const createOrder = async (
  shippingAddress: ShippingAddress,
  paymentMethod: 'credit' | 'convenience' | 'cod',
  notes?: string
): Promise<Order | null> => {
  const user = getCurrentUser();
  if (!user) return null;
  
  const cart = getUserCart();
  if (cart.items.length === 0) return null;
  
  // カート内の商品情報を取得
  const orderItems: OrderItem[] = [];
  let subtotal = 0;
  
  for (const cartItem of cart.items) {
    const product = await getProductById(cartItem.productId);
    if (!product) continue;
    
    // 在庫確認と更新
    const stockUpdated = updateProductStock(cartItem.productId, cartItem.quantity);
    if (!stockUpdated) {
      // 在庫不足の場合は処理を中断
      console.error(`商品ID ${cartItem.productId} の在庫が不足しています`);
      return null;
    }
    
    const appliedPrice = user ? product.memberPrice : product.price;
    const orderItem: OrderItem = {
      ...cartItem,
      price: product.price,
      memberPrice: product.memberPrice,
      appliedPrice
    };
    
    orderItems.push(orderItem);
    subtotal += appliedPrice * cartItem.quantity;
  }
  
  // クーポン割引計算
  let discount = 0;
  if (cart.couponCode) {
    switch (cart.couponCode) {
      case 'WELCOME10':
        discount = Math.floor(subtotal * 0.1);
        break;
      case 'MEMBER15':
        discount = Math.floor(subtotal * 0.15);
        break;
      case 'JASST20':
        discount = Math.floor(subtotal * 0.2);
        break;
    }
  }
  
  // 送料計算（5000円以上で無料）
  const shipping = subtotal >= 5000 ? 0 : 500;
  
  // 合計金額
  const totalAmount = Math.max(0, subtotal - discount - cart.pointsUsed + shipping);
  
  // ポイント計算（1%還元）
  const pointsEarned = Math.floor(totalAmount * 0.01);
  
  // 注文オブジェクト作成
  const orderId = generateOrderId();
  const now = new Date().toISOString();
  
  const order: Order = {
    id: orderId,
    userId: user.id,
    items: orderItems,
    subtotal,
    discount,
    pointsUsed: cart.pointsUsed,
    shipping,
    totalAmount,
    shippingAddress,
    paymentMethod,
    status: 'pending',
    orderDate: now,
    pointsEarned,
    couponCode: cart.couponCode,
    notes
  };
  
  // 注文を保存
  const userOrders = getUserOrders();
  userOrders.push(order);
  setItem(`${KEYS.ORDERS_PREFIX}${user.id}`, userOrders);
  
  // ポイント処理
  if (cart.pointsUsed > 0) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    usePoints(user.id, cart.pointsUsed, `注文 ${orderId} で使用`);
  }
  addPoints(user.id, pointsEarned, `注文 ${orderId} のポイント還元`);
  
  // カートをクリア
  clearCart();
  
  // アクティビティログ
  logUserActivity(user.id, 'CREATE_ORDER', {
    orderId,
    amount: totalAmount,
    itemCount: orderItems.length,
    paymentMethod
  });
  
  return order;
};

// ユーザーの注文履歴取得
export const getUserOrders = (): Order[] => {
  const user = getCurrentUser();
  if (!user) return [];
  
  return getItem<Order[]>(`${KEYS.ORDERS_PREFIX}${user.id}`, []);
};

// 注文詳細取得
export const getOrderById = (orderId: string): Order | null => {
  const orders = getUserOrders();
  return orders.find(order => order.id === orderId) || null;
};

// 注文ステータス更新
export const updateOrderStatus = (
  orderId: string,
  newStatus: Order['status']
): boolean => {
  const user = getCurrentUser();
  if (!user) return false;
  
  const orders = getUserOrders();
  const orderIndex = orders.findIndex(order => order.id === orderId);
  
  if (orderIndex < 0) return false;
  
  orders[orderIndex].status = newStatus;
  setItem(`${KEYS.ORDERS_PREFIX}${user.id}`, orders);
  
  logUserActivity(user.id, 'UPDATE_ORDER_STATUS', { orderId, newStatus });
  
  return true;
};

// 注文キャンセル
export const cancelOrder = async (orderId: string): Promise<boolean> => {
  const user = getCurrentUser();
  if (!user) return false;
  
  const order = getOrderById(orderId);
  if (!order) return false;
  
  // キャンセル可能なステータスかチェック
  if (order.status !== 'pending' && order.status !== 'processing') {
    console.error('この注文はキャンセルできません');
    return false;
  }
  
  // 在庫を戻す
  for (const item of order.items) {
    const product = await getProductById(item.productId);
    if (product) {
      const { restoreProductStock } = await import('./productService');
      restoreProductStock(item.productId, item.quantity);
    }
  }
  
  // ポイントを戻す
  if (order.pointsUsed > 0) {
    addPoints(user.id, order.pointsUsed, `注文 ${orderId} のキャンセル`);
  }
  
  // 獲得予定ポイントを取り消す
  if (order.pointsEarned > 0) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    usePoints(user.id, order.pointsEarned, `注文 ${orderId} のキャンセルによる取り消し`);
  }
  
  // ステータスを更新
  updateOrderStatus(orderId, 'cancelled');
  
  logUserActivity(user.id, 'CANCEL_ORDER', { orderId });
  
  return true;
};

// 全注文取得（管理用）
export const getAllOrders = (): Order[] => {
  const allOrders: Order[] = [];
  
  // 全ユーザーの注文を集計
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith(KEYS.ORDERS_PREFIX)) {
      const orders = getItem<Order[]>(key, []);
      allOrders.push(...orders);
    }
  }
  
  // 日付順にソート（新しい順）
  return allOrders.sort((a, b) => 
    new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime()
  );
};

// 注文統計取得（管理用）
export const getOrderStats = (): {
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  ordersByStatus: Record<string, number>;
  ordersByPaymentMethod: Record<string, number>;
} => {
  const allOrders = getAllOrders();
  
  const stats = {
    totalOrders: allOrders.length,
    totalRevenue: 0,
    averageOrderValue: 0,
    ordersByStatus: {} as Record<string, number>,
    ordersByPaymentMethod: {} as Record<string, number>
  };
  
  allOrders.forEach(order => {
    // 売上集計（キャンセル以外）
    if (order.status !== 'cancelled') {
      stats.totalRevenue += order.totalAmount;
    }
    
    // ステータス別集計
    stats.ordersByStatus[order.status] = (stats.ordersByStatus[order.status] || 0) + 1;
    
    // 支払い方法別集計
    stats.ordersByPaymentMethod[order.paymentMethod] = 
      (stats.ordersByPaymentMethod[order.paymentMethod] || 0) + 1;
  });
  
  // 平均注文金額
  const activeOrders = allOrders.filter(o => o.status !== 'cancelled');
  stats.averageOrderValue = activeOrders.length > 0 
    ? Math.floor(stats.totalRevenue / activeOrders.length)
    : 0;
  
  return stats;
};

// 商品別売上集計
export const getProductSales = async (): Promise<{
  productId: number;
  product: Product | undefined;
  quantity: number;
  revenue: number;
}[]> => {
  const allOrders = getAllOrders();
  const salesMap = new Map<number, { quantity: number; revenue: number }>();
  
  // 注文データを集計
  allOrders.forEach(order => {
    if (order.status !== 'cancelled') {
      order.items.forEach(item => {
        const existing = salesMap.get(item.productId) || { quantity: 0, revenue: 0 };
        existing.quantity += item.quantity;
        existing.revenue += item.appliedPrice * item.quantity;
        salesMap.set(item.productId, existing);
      });
    }
  });
  
  // 商品情報と結合
  const results = [];
  const entries = Array.from(salesMap.entries());
  for (const [productId, sales] of entries) {
    const product = await getProductById(productId);
    results.push({
      productId,
      product,
      quantity: sales.quantity,
      revenue: sales.revenue
    });
  }
  
  // 売上順にソート
  return results.sort((a, b) => b.revenue - a.revenue);
};
