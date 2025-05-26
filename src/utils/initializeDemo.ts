// デモ環境初期化スクリプト
import { initializeStockData } from '../services/productService';
import { resetDemoData } from '../services/demoService';

export const initializeDemoEnvironment = async () => {
  try {
    console.log('デモ環境を初期化しています...');
    
    // 在庫データの初期化
    await initializeStockData();
    console.log('✓ 在庫データを初期化しました');
    
    console.log('デモ環境の初期化が完了しました');
  } catch (error) {
    console.error('デモ環境の初期化に失敗しました:', error);
  }
};

// 完全リセット（管理者用）
export const resetDemoEnvironment = async () => {
  try {
    console.log('デモ環境をリセットしています...');
    
    // すべてのデータをリセット
    await resetDemoData();
    console.log('✓ すべてのデータをリセットしました');
    
    console.log('デモ環境のリセットが完了しました');
  } catch (error) {
    console.error('デモ環境のリセットに失敗しました:', error);
  }
};
