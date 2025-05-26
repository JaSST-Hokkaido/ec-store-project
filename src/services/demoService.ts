// デモ管理サービス
import { getItem, setItem, clearItems, checkStorageSpace } from './storageService';
import { getAllUsers } from './userService';
import { initializeStockData } from './productService';
import { getAllOrders } from './orderService';

const DEMO_LOGS_KEY = 'ec-demo-logs';
const DEMO_CONFIG_KEY = 'ec-demo-config';

// デモ設定
interface DemoConfig {
  resetTime: string;  // 前回のリセット時間
  isActive: boolean;  // デモが進行中か
  startTime: string;  // デモ開始時間
}

// ユーザー活動ログ
export interface UserActivity {
  timestamp: string;
  userId: string;
  action: string;
  data: any;
}

// ユーザー活動記録（userServiceから呼び出される）
export const logUserActivity = (userId: string, action: string, data: any): void => {
  const logs = getItem<UserActivity[]>(DEMO_LOGS_KEY, []);
  
  logs.push({
    timestamp: new Date().toISOString(),
    userId,
    action,
    data
  });
  
  // ログが多すぎる場合は古いものを削除（最新1000件保持）
  const trimmedLogs = logs.slice(-1000);
  setItem(DEMO_LOGS_KEY, trimmedLogs);
};

// 全アクティビティログ取得
export const getAllLogs = (): UserActivity[] => {
  return getItem<UserActivity[]>(DEMO_LOGS_KEY, []);
};

// ユーザー別アクティビティログ取得
export const getUserLogs = (userId: string): UserActivity[] => {
  const logs = getAllLogs();
  return logs.filter(log => log.userId === userId);
};

// アクション別ログ取得
export const getLogsByAction = (action: string): UserActivity[] => {
  const logs = getAllLogs();
  return logs.filter(log => log.action === action);
};

// デモデータリセット（管理用）
export const resetDemoData = async (): Promise<void> => {
  // ユーザー関連データをクリア
  clearItems('ec-user-');
  clearItems('ec-cart-');
  clearItems('ec-orders-');
  
  // セッションストレージもクリア
  if (typeof sessionStorage !== 'undefined') {
    sessionStorage.clear();
  }
  
  // 初期在庫データ再読み込み
  await initializeStockData();
  
  // デモ設定更新
  const config: DemoConfig = {
    resetTime: new Date().toISOString(),
    isActive: true,
    startTime: new Date().toISOString()
  };
  
  setItem(DEMO_CONFIG_KEY, config);
  
  // リセット操作もログに記録
  logUserActivity('admin', 'RESET_DEMO', {});
};

// デモ状態取得
export const getDemoConfig = (): DemoConfig => {
  return getItem<DemoConfig>(DEMO_CONFIG_KEY, {
    resetTime: '',
    isActive: false,
    startTime: ''
  });
};

// デモ統計情報取得
export const getDemoStats = (): {
  registrations: number;
  activeUsers: number;
  totalOrders: number;
  totalSales: number;
  cartAdditions: number;
  conversionRate: string;
  storageUsage: ReturnType<typeof checkStorageSpace>;
  popularActions: { action: string; count: number }[];
} => {
  const logs = getAllLogs();
  const users = getAllUsers();
  const orders = getAllOrders();
  
  // ユーザー登録数
  const registrations = logs.filter(log => log.action === 'REGISTER').length;
  
  // アクティブユーザー数（最近ログインしたユーザー）
  const recentLoginTime = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const activeUsers = Object.values(users).filter(user => user.lastLogin > recentLoginTime).length;
  
  // 注文数・金額
  const totalOrders = orders.length;
  const totalSales = orders
    .filter(order => order.status !== 'cancelled')
    .reduce((sum, order) => sum + order.totalAmount, 0);
  
  // カート追加回数
  const cartAdditions = logs.filter(log => log.action === 'ADD_TO_CART').length;
  
  // コンバージョン率
  const conversionRate = cartAdditions > 0 
    ? (totalOrders / cartAdditions * 100).toFixed(2) + '%' 
    : '0%';
  
  // ストレージ使用状況
  const storageUsage = checkStorageSpace();
  
  // 人気アクション集計
  const actionCounts = new Map<string, number>();
  logs.forEach(log => {
    actionCounts.set(log.action, (actionCounts.get(log.action) || 0) + 1);
  });
  
  const popularActions = Array.from(actionCounts.entries())
    .map(([action, count]) => ({ action, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);
  
  return {
    registrations,
    activeUsers,
    totalOrders,
    totalSales,
    cartAdditions,
    conversionRate,
    storageUsage,
    popularActions
  };
};

// 時間帯別アクティビティ取得
export const getHourlyActivity = (): { hour: number; count: number }[] => {
  const logs = getAllLogs();
  const hourlyCount = new Array(24).fill(0);
  
  logs.forEach(log => {
    const hour = new Date(log.timestamp).getHours();
    hourlyCount[hour]++;
  });
  
  return hourlyCount.map((count, hour) => ({ hour, count }));
};

// ユーザー行動分析
export const analyzeUserBehavior = (userId: string): {
  totalActions: number;
  lastActivity: string | null;
  favoriteActions: { action: string; count: number }[];
  sessionDuration: number;
  purchaseRate: number;
} => {
  const userLogs = getUserLogs(userId);
  
  if (userLogs.length === 0) {
    return {
      totalActions: 0,
      lastActivity: null,
      favoriteActions: [],
      sessionDuration: 0,
      purchaseRate: 0
    };
  }
  
  // 最後のアクティビティ
  const lastActivity = userLogs[userLogs.length - 1].timestamp;
  
  // よく使うアクション
  const actionCounts = new Map<string, number>();
  userLogs.forEach(log => {
    actionCounts.set(log.action, (actionCounts.get(log.action) || 0) + 1);
  });
  
  const favoriteActions = Array.from(actionCounts.entries())
    .map(([action, count]) => ({ action, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
  
  // セッション時間（最初のログから最後のログまで）
  const firstLog = new Date(userLogs[0].timestamp).getTime();
  const lastLog = new Date(userLogs[userLogs.length - 1].timestamp).getTime();
  const sessionDuration = Math.floor((lastLog - firstLog) / 1000 / 60); // 分単位
  
  // 購入率
  const cartAddCount = userLogs.filter(log => log.action === 'ADD_TO_CART').length;
  const orderCount = userLogs.filter(log => log.action === 'CREATE_ORDER').length;
  const purchaseRate = cartAddCount > 0 ? (orderCount / cartAddCount) * 100 : 0;
  
  return {
    totalActions: userLogs.length,
    lastActivity,
    favoriteActions,
    sessionDuration,
    purchaseRate
  };
};

// エラーログ取得
export const getErrorLogs = (): UserActivity[] => {
  const logs = getAllLogs();
  return logs.filter(log => 
    log.action.includes('ERROR') || 
    log.data?.error || 
    log.data?.failed
  );
};

// デモデータエクスポート（バックアップ用）
export const exportDemoData = (): string => {
  const data = {
    users: getAllUsers(),
    orders: getAllOrders(),
    logs: getAllLogs(),
    config: getDemoConfig(),
    exportDate: new Date().toISOString()
  };
  
  return JSON.stringify(data, null, 2);
};

// ストレージクリーンアップ（古いログを削除）
export const cleanupOldLogs = (daysToKeep: number = 7): void => {
  const cutoffDate = new Date(Date.now() - daysToKeep * 24 * 60 * 60 * 1000).toISOString();
  const logs = getAllLogs();
  const recentLogs = logs.filter(log => log.timestamp > cutoffDate);
  
  setItem(DEMO_LOGS_KEY, recentLogs);
  
  logUserActivity('system', 'CLEANUP_LOGS', {
    removed: logs.length - recentLogs.length,
    remaining: recentLogs.length
  });
};
