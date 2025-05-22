import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../../../context/AdminAuthContext';

// 管理者アカウントの型定義
interface AdminAccount {
  id: string;
  name: string;
  email: string;
  role: string;
  roleName: string;
  storeId?: string;
  storeName?: string;
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
}

const SystemAdminPromotionPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentAdmin, checkPermission } = useAdminAuth();
  const [accounts, setAccounts] = useState<AdminAccount[]>([]);
  const [filteredAccounts, setFilteredAccounts] = useState<AdminAccount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAccount, setSelectedAccount] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [confirmCode, setConfirmCode] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  // システム管理者権限のチェック
  useEffect(() => {
    if (currentAdmin?.role !== 'system_admin') {
      navigate('/admin/dashboard');
    }
  }, [currentAdmin, navigate]);
  
  // アカウントデータの取得
  useEffect(() => {
    // 実際はAPIからデータを取得
    const fetchAccounts = async () => {
      try {
        // ダミーデータ
        const dummyAccounts: AdminAccount[] = [
          {
            id: 'admin-001',
            name: 'システム管理者',
            email: 'admin@example.com',
            role: 'system_admin',
            roleName: 'システム管理者',
            isActive: true,
            lastLogin: '2025-05-20T10:30:00Z',
            createdAt: '2025-01-01T00:00:00Z'
          },
          {
            id: 'store-001',
            name: '山田 店長',
            email: 'store@example.com',
            role: 'store_admin',
            roleName: '店舗管理者',
            storeId: 'store-tokyo-1',
            storeName: '東京本店',
            isActive: true,
            lastLogin: '2025-05-19T16:45:00Z',
            createdAt: '2025-01-10T09:00:00Z'
          },
          {
            id: 'product-001',
            name: '鈴木 商品担当',
            email: 'product@example.com',
            role: 'product_manager',
            roleName: '商品管理者',
            storeId: 'store-tokyo-1',
            storeName: '東京本店',
            isActive: true,
            lastLogin: '2025-05-15T11:20:00Z',
            createdAt: '2025-02-01T10:30:00Z'
          },
          {
            id: 'order-001',
            name: '佐藤 注文担当',
            email: 'order@example.com',
            role: 'order_manager',
            roleName: '注文管理者',
            storeId: 'store-osaka-1',
            storeName: '大阪支店',
            isActive: true,
            lastLogin: '2025-05-18T14:10:00Z',
            createdAt: '2025-02-15T13:45:00Z'
          },
          {
            id: 'support-001',
            name: '田中 サポート',
            email: 'support@example.com',
            role: 'customer_support',
            roleName: 'カスタマーサポート',
            isActive: true,
            lastLogin: '2025-05-10T09:30:00Z',
            createdAt: '2025-03-01T09:15:00Z'
          }
        ];
        
        // システム管理者以外のアカウントをフィルタリング
        const nonAdminAccounts = dummyAccounts.filter(account => account.role !== 'system_admin');
        setAccounts(nonAdminAccounts);
        setFilteredAccounts(nonAdminAccounts);
      } catch (error) {
        console.error('アカウントデータの取得エラー:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchAccounts();
  }, []);
  
  // 検索フィルタリング
  useEffect(() => {
    if (!searchTerm) {
      setFilteredAccounts(accounts);
      return;
    }
    
    const term = searchTerm.toLowerCase();
    const filtered = accounts.filter(account => {
      return (
        account.name.toLowerCase().includes(term) ||
        account.email.toLowerCase().includes(term) ||
        account.roleName.toLowerCase().includes(term) ||
        (account.storeName && account.storeName.toLowerCase().includes(term))
      );
    });
    
    setFilteredAccounts(filtered);
  }, [accounts, searchTerm]);
  
  // 検索入力ハンドラー
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };
  
  // アカウント選択ハンドラー
  const handleAccountSelect = (accountId: string) => {
    setSelectedAccount(accountId);
    setError('');
    setConfirmPassword('');
    setConfirmCode('');
    setShowConfirmModal(true);
  };
  
  // モーダルを閉じる
  const handleCloseModal = () => {
    setShowConfirmModal(false);
    setSelectedAccount('');
    setConfirmPassword('');
    setConfirmCode('');
    setError('');
  };
  
  // 入力フォーム変更ハンドラー
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (name === 'password') {
      setConfirmPassword(value);
    } else if (name === 'code') {
      setConfirmCode(value);
    }
    
    setError('');
  };
  
  // システム管理者昇格処理
  const handlePromoteToAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // バリデーション
    if (!confirmPassword) {
      setError('パスワードを入力してください');
      return;
    }
    
    if (!confirmCode) {
      setError('認証コードを入力してください');
      return;
    }
    
    if (confirmCode !== '123456') { // 実際はより複雑な認証方法を使用
      setError('認証コードが正しくありません');
      return;
    }
    
    try {
      // 実際はAPIで更新処理
      // ここではフロントエンドだけで処理
      
      // 選択されたアカウントを取得
      const account = accounts.find(acc => acc.id === selectedAccount);
      if (!account) {
        throw new Error('アカウントが見つかりません');
      }
      
      // アカウントリストから削除（システム管理者になるため、このページでは表示しなくなる）
      const updatedAccounts = accounts.filter(acc => acc.id !== selectedAccount);
      setAccounts(updatedAccounts);
      setFilteredAccounts(updatedAccounts.filter(acc => {
        if (!searchTerm) return true;
        
        const term = searchTerm.toLowerCase();
        return (
          acc.name.toLowerCase().includes(term) ||
          acc.email.toLowerCase().includes(term) ||
          acc.roleName.toLowerCase().includes(term) ||
          (acc.storeName && acc.storeName.toLowerCase().includes(term))
        );
      }));
      
      // モーダルを閉じる
      setShowConfirmModal(false);
      setSelectedAccount('');
      setConfirmPassword('');
      setConfirmCode('');
      
      // 成功メッセージを表示
      setSuccessMessage(`${account.name}にシステム管理者権限を付与しました`);
      
      // 3秒後にメッセージを消す
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
      
    } catch (error) {
      console.error('権限付与エラー:', error);
      setError('システム管理者権限の付与に失敗しました');
    }
  };
  
  // 日付フォーマット
  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    
    return new Date(dateString).toLocaleString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  if (isLoading) {
    return <div className="loading">読み込み中...</div>;
  }
  
  return (
    <div className="system-admin-promotion-page">
      <div className="page-header">
        <h1>システム管理者権限付与</h1>
        <div className="page-description">
          <p>
            <strong>重要:</strong> システム管理者はすべての機能にアクセスでき、あらゆる設定を変更できます。
            この権限は必要な場合にのみ付与してください。
          </p>
          <p>
            システム管理者権限の付与は、監査ログに記録され、セキュリティ管理者に通知されます。
          </p>
        </div>
      </div>
      
      {successMessage && (
        <div className="success-message">
          {successMessage}
        </div>
      )}
      
      <div className="search-bar">
        <input
          type="text"
          placeholder="名前、メールアドレス、役割、店舗で検索"
          value={searchTerm}
          onChange={handleSearchChange}
          className="form-control"
        />
      </div>
      
      <div className="account-list">
        {filteredAccounts.length > 0 ? (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>名前</th>
                  <th>メールアドレス</th>
                  <th>現在の権限</th>
                  <th>所属店舗</th>
                  <th>最終ログイン</th>
                  <th>アカウント作成日</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {filteredAccounts.map(account => (
                  <tr key={account.id}>
                    <td>{account.name}</td>
                    <td>{account.email}</td>
                    <td>{account.roleName}</td>
                    <td>{account.storeName || '-'}</td>
                    <td>{formatDate(account.lastLogin)}</td>
                    <td>{formatDate(account.createdAt)}</td>
                    <td>
                      <button
                        className="btn small primary"
                        onClick={() => handleAccountSelect(account.id)}
                      >
                        管理者権限付与
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">
            <p>アカウントが見つかりませんでした。検索条件を変更してください。</p>
          </div>
        )}
      </div>
      
      {/* 確認モーダル */}
      {showConfirmModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>システム管理者権限付与の確認</h2>
            
            <div className="warning-message">
              <p>
                <strong>警告:</strong> システム管理者はシステム全体の設定を変更でき、すべての機能にアクセスできます。
                この操作は取り消せません。
              </p>
            </div>
            
            <div className="selected-account">
              <h3>選択されたアカウント</h3>
              {accounts.find(acc => acc.id === selectedAccount) && (
                <div className="account-info">
                  <p><strong>名前:</strong> {accounts.find(acc => acc.id === selectedAccount)?.name}</p>
                  <p><strong>メールアドレス:</strong> {accounts.find(acc => acc.id === selectedAccount)?.email}</p>
                  <p><strong>現在の役割:</strong> {accounts.find(acc => acc.id === selectedAccount)?.roleName}</p>
                </div>
              )}
            </div>
            
            <form onSubmit={handlePromoteToAdmin}>
              <div className="form-group">
                <label htmlFor="password">
                  あなたのパスワードを入力 <span className="required">*</span>
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={confirmPassword}
                  onChange={handleInputChange}
                  placeholder="本人確認のためパスワードを入力してください"
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="code">
                  認証コード <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="code"
                  name="code"
                  value={confirmCode}
                  onChange={handleInputChange}
                  placeholder="認証アプリまたはSMSで受け取った6桁のコード"
                  required
                />
                <div className="form-text">
                  認証コードはセキュリティアプリまたはSMSで送信されます。
                </div>
              </div>
              
              {error && (
                <div className="error-message">
                  {error}
                </div>
              )}
              
              <div className="modal-actions">
                <button
                  type="button"
                  className="btn secondary"
                  onClick={handleCloseModal}
                >
                  キャンセル
                </button>
                <button
                  type="submit"
                  className="btn danger"
                >
                  システム管理者権限を付与
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SystemAdminPromotionPage;
