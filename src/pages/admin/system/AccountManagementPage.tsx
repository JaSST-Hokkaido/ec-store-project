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

const AccountManagementPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentAdmin, checkPermission } = useAdminAuth();
  const [accounts, setAccounts] = useState<AdminAccount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<AdminAccount | null>(null);
  
  // 新規アカウント用の初期値
  const initialAccountForm = {
    name: '',
    email: '',
    role: 'store_admin',
    storeId: '',
    storeName: '',
    password: ''
  };
  
  const [accountForm, setAccountForm] = useState(initialAccountForm);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  
  // ロール選択肢
  const roleOptions = [
    { value: 'store_admin', label: '店舗管理者' },
    { value: 'product_manager', label: '商品管理者' },
    { value: 'order_manager', label: '注文管理者' },
    { value: 'customer_support', label: 'カスタマーサポート' }
  ];
  
  // 店舗選択肢（実際はAPIから取得）
  const storeOptions = [
    { id: 'store-tokyo-1', name: '東京本店' },
    { id: 'store-osaka-1', name: '大阪支店' },
    { id: 'store-hokkaido-1', name: '北海道支店' }
  ];
  
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
            isActive: false,
            createdAt: '2025-03-01T09:15:00Z'
          }
        ];
        
        setAccounts(dummyAccounts);
      } catch (error) {
        console.error('アカウントデータの取得エラー:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchAccounts();
  }, []);
  
  // 検索フィルタリング
  const filteredAccounts = accounts.filter(account => {
    if (!searchTerm) return true;
    
    const term = searchTerm.toLowerCase();
    return (
      account.name.toLowerCase().includes(term) ||
      account.email.toLowerCase().includes(term) ||
      account.roleName.toLowerCase().includes(term) ||
      (account.storeName && account.storeName.toLowerCase().includes(term))
    );
  });
  
  // フォーム入力変更ハンドラー
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // 店舗IDが変更された場合、店舗名も更新
    if (name === 'storeId') {
      const selectedStore = storeOptions.find(store => store.id === value);
      setAccountForm(prev => ({
        ...prev,
        [name]: value,
        storeName: selectedStore?.name || ''
      }));
    } else {
      setAccountForm(prev => ({ ...prev, [name]: value }));
    }
    
    // エラーをクリア
    if (formErrors[name]) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };
  
  // フォームバリデーション
  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    if (!accountForm.name.trim()) {
      errors.name = '名前は必須です';
    }
    
    if (!accountForm.email.trim()) {
      errors.email = 'メールアドレスは必須です';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(accountForm.email)) {
      errors.email = '有効なメールアドレスを入力してください';
    }
    
    // 新規作成時のみパスワードは必須
    if (showCreateModal && !accountForm.password.trim()) {
      errors.password = 'パスワードは必須です';
    } else if (accountForm.password && accountForm.password.length < 8) {
      errors.password = 'パスワードは8文字以上にしてください';
    }
    
    // 店舗IDはroleによって必要かどうか変わる
    if (['store_admin', 'product_manager', 'order_manager'].includes(accountForm.role) && !accountForm.storeId) {
      errors.storeId = '店舗を選択してください';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  // 新規アカウント作成モーダル表示
  const handleShowCreateModal = () => {
    setAccountForm(initialAccountForm);
    setFormErrors({});
    setShowCreateModal(true);
  };
  
  // アカウント編集モーダル表示
  const handleShowEditModal = (account: AdminAccount) => {
    setSelectedAccount(account);
    setAccountForm({
      name: account.name,
      email: account.email,
      role: account.role,
      storeId: account.storeId || '',
      storeName: account.storeName || '',
      password: '' // 編集時はパスワード空欄
    });
    setFormErrors({});
    setShowEditModal(true);
  };
  
  // モーダルを閉じる
  const handleCloseModal = () => {
    setShowCreateModal(false);
    setShowEditModal(false);
    setSelectedAccount(null);
  };
  
  // アカウント作成処理
  const handleCreateAccount = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    // 実際はAPIで作成処理
    // ここではフロントエンドだけで処理
    
    const newAccount: AdminAccount = {
      id: `user-${Date.now()}`,
      name: accountForm.name,
      email: accountForm.email,
      role: accountForm.role,
      roleName: roleOptions.find(r => r.value === accountForm.role)?.label || '',
      storeId: accountForm.storeId || undefined,
      storeName: accountForm.storeName || undefined,
      isActive: true,
      createdAt: new Date().toISOString()
    };
    
    setAccounts(prev => [...prev, newAccount]);
    handleCloseModal();
    
    // 成功メッセージなどの表示
    alert(`アカウント「${accountForm.name}」を作成しました`);
  };
  
  // アカウント更新処理
  const handleUpdateAccount = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !selectedAccount) return;
    
    // 実際はAPIで更新処理
    // ここではフロントエンドだけで処理
    
    const updatedAccounts = accounts.map(account => {
      if (account.id === selectedAccount.id) {
        return {
          ...account,
          name: accountForm.name,
          email: accountForm.email,
          role: accountForm.role,
          roleName: roleOptions.find(r => r.value === accountForm.role)?.label || '',
          storeId: accountForm.storeId || undefined,
          storeName: accountForm.storeName || undefined
        };
      }
      return account;
    });
    
    setAccounts(updatedAccounts);
    handleCloseModal();
    
    // 成功メッセージなどの表示
    alert(`アカウント「${accountForm.name}」を更新しました`);
  };
  
  // アカウント有効/無効切り替え
  const handleToggleStatus = (id: string, currentStatus: boolean) => {
    // 実際はAPIで更新処理
    // ここではフロントエンドだけで処理
    
    // システム管理者は無効化できない
    const account = accounts.find(acc => acc.id === id);
    if (account?.role === 'system_admin') {
      alert('システム管理者アカウントのステータスは変更できません');
      return;
    }
    
    const updatedAccounts = accounts.map(account => {
      if (account.id === id) {
        return { ...account, isActive: !currentStatus };
      }
      return account;
    });
    
    setAccounts(updatedAccounts);
  };
  
  if (isLoading) {
    return <div className="loading">読み込み中...</div>;
  }
  
  return (
    <div className="account-management-page">
      <div className="page-actions">
        <h1>アカウント管理</h1>
        <button
          className="btn primary"
          onClick={handleShowCreateModal}
        >
          新規アカウント作成
        </button>
      </div>
      
      <div className="search-bar">
        <input
          type="text"
          placeholder="名前、メールアドレス、役割、店舗で検索"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
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
                  <th>権限</th>
                  <th>店舗</th>
                  <th>最終ログイン</th>
                  <th>ステータス</th>
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
                    <td>
                      {account.lastLogin
                        ? new Date(account.lastLogin).toLocaleString('ja-JP')
                        : '未ログイン'}
                    </td>
                    <td>
                      <span className={`status-badge status-${account.isActive ? '有効' : '無効'}`}>
                        {account.isActive ? '有効' : '無効'}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="btn-icon btn-edit"
                          onClick={() => handleShowEditModal(account)}
                          title="編集"
                        >
                          ✏️
                        </button>
                        {account.role !== 'system_admin' && (
                          <button
                            className="btn-icon"
                            onClick={() => handleToggleStatus(account.id, account.isActive)}
                            title={account.isActive ? '無効にする' : '有効にする'}
                          >
                            {account.isActive ? '🔒' : '🔓'}
                          </button>
                        )}
                      </div>
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
      
      {/* 新規アカウント作成モーダル */}
      {showCreateModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>新規アカウント作成</h2>
            <form onSubmit={handleCreateAccount}>
              <div className="form-group">
                <label htmlFor="name">
                  名前 <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={accountForm.name}
                  onChange={handleInputChange}
                  required
                />
                {formErrors.name && <div className="error-text">{formErrors.name}</div>}
              </div>
              
              <div className="form-group">
                <label htmlFor="email">
                  メールアドレス <span className="required">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={accountForm.email}
                  onChange={handleInputChange}
                  required
                />
                {formErrors.email && <div className="error-text">{formErrors.email}</div>}
              </div>
              
              <div className="form-group">
                <label htmlFor="password">
                  初期パスワード <span className="required">*</span>
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={accountForm.password}
                  onChange={handleInputChange}
                  required
                />
                {formErrors.password && <div className="error-text">{formErrors.password}</div>}
              </div>
              
              <div className="form-group">
                <label htmlFor="role">
                  権限 <span className="required">*</span>
                </label>
                <select
                  id="role"
                  name="role"
                  value={accountForm.role}
                  onChange={handleInputChange}
                  required
                >
                  {roleOptions.map(role => (
                    <option key={role.value} value={role.value}>
                      {role.label}
                    </option>
                  ))}
                </select>
              </div>
              
              {['store_admin', 'product_manager', 'order_manager'].includes(accountForm.role) && (
                <div className="form-group">
                  <label htmlFor="storeId">
                    所属店舗 <span className="required">*</span>
                  </label>
                  <select
                    id="storeId"
                    name="storeId"
                    value={accountForm.storeId}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">選択してください</option>
                    {storeOptions.map(store => (
                      <option key={store.id} value={store.id}>
                        {store.name}
                      </option>
                    ))}
                  </select>
                  {formErrors.storeId && <div className="error-text">{formErrors.storeId}</div>}
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
                  className="btn primary"
                >
                  作成
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* アカウント編集モーダル */}
      {showEditModal && selectedAccount && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>アカウント編集</h2>
            <form onSubmit={handleUpdateAccount}>
              <div className="form-group">
                <label htmlFor="name">
                  名前 <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={accountForm.name}
                  onChange={handleInputChange}
                  required
                />
                {formErrors.name && <div className="error-text">{formErrors.name}</div>}
              </div>
              
              <div className="form-group">
                <label htmlFor="email">
                  メールアドレス <span className="required">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={accountForm.email}
                  onChange={handleInputChange}
                  required
                />
                {formErrors.email && <div className="error-text">{formErrors.email}</div>}
              </div>
              
              <div className="form-group">
                <label htmlFor="password">
                  パスワード (変更する場合のみ)
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={accountForm.password}
                  onChange={handleInputChange}
                />
                {formErrors.password && <div className="error-text">{formErrors.password}</div>}
              </div>
              
              <div className="form-group">
                <label htmlFor="role">
                  権限 <span className="required">*</span>
                </label>
                <select
                  id="role"
                  name="role"
                  value={accountForm.role}
                  onChange={handleInputChange}
                  disabled={selectedAccount.role === 'system_admin'} // システム管理者は変更不可
                  required
                >
                  {roleOptions.map(role => (
                    <option key={role.value} value={role.value}>
                      {role.label}
                    </option>
                  ))}
                </select>
                {selectedAccount.role === 'system_admin' && (
                  <small className="form-text">システム管理者の権限は変更できません</small>
                )}
              </div>
              
              {['store_admin', 'product_manager', 'order_manager'].includes(accountForm.role) && (
                <div className="form-group">
                  <label htmlFor="storeId">
                    所属店舗 <span className="required">*</span>
                  </label>
                  <select
                    id="storeId"
                    name="storeId"
                    value={accountForm.storeId}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">選択してください</option>
                    {storeOptions.map(store => (
                      <option key={store.id} value={store.id}>
                        {store.name}
                      </option>
                    ))}
                  </select>
                  {formErrors.storeId && <div className="error-text">{formErrors.storeId}</div>}
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
                  className="btn primary"
                >
                  更新
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountManagementPage;
