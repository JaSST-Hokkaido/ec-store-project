// LocalStorage操作の基本サービス

export const KEYS = {
  USER_PREFIX: 'ec-user-',
  CART_PREFIX: 'ec-cart-',
  ORDERS_PREFIX: 'ec-orders-',
  SHARED_STOCK: 'ec-shared-stock',
  DEMO_LOGS: 'ec-demo-logs',
  SESSION_ID: 'ec-session-id'
};

// データ取得関数
export const getItem = <T>(key: string, defaultValue: T): T => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error getting item ${key}:`, error);
    return defaultValue;
  }
};

// データ保存関数
export const setItem = <T>(key: string, value: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error setting item ${key}:`, error);
  }
};

// データ削除関数
export const removeItem = (key: string): void => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error(`Error removing item ${key}:`, error);
  }
};

// 特定プレフィックスのアイテム全取得
export const getAllItems = (prefix: string): Record<string, any> => {
  const items: Record<string, any> = {};
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith(prefix)) {
      items[key] = getItem(key, null);
    }
  }
  return items;
};

// 特定プレフィックスの全アイテムクリア
export const clearItems = (prefix: string): void => {
  const keysToRemove: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith(prefix)) {
      keysToRemove.push(key);
    }
  }
  keysToRemove.forEach(key => removeItem(key));
};

// ユーザー固有のキー生成
export const getUserKey = (userId: string, type: string): string => {
  return `${type}${userId}`;
};

// LocalStorageの使用容量を取得（概算）
export const getStorageUsage = (): number => {
  let total = 0;
  for (let key in localStorage) {
    if (localStorage.hasOwnProperty(key)) {
      total += localStorage[key].length + key.length;
    }
  }
  return total;
};

// LocalStorageの空き容量をチェック（5MB制限を仮定）
export const checkStorageSpace = (): { used: number; available: number; percentage: number } => {
  const maxSize = 5 * 1024 * 1024; // 5MB
  const used = getStorageUsage();
  const available = maxSize - used;
  const percentage = (used / maxSize) * 100;
  
  return {
    used,
    available,
    percentage
  };
};
