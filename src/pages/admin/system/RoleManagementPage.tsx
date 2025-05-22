import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../../../context/AdminAuthContext';

// 権限タイプの定義
interface Permission {
  id: string;
  name: string;
  description: string;
  category: string;
}

// ロールの定義
interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  isSystem?: boolean;
}

// アカウントデータの型定義
interface AdminAccount {
  id: string;
  name: string;
  email: string;
  role: string;
  roleName: string;
  permissions: string[];
  storeId?: string;
  storeName?: string;
  isActive: boolean;
}

const RoleManagementPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentAdmin, checkPermission } = useAdminAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [accounts, setAccounts] = useState<AdminAccount[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<string>('');
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [showAddRoleModal, setShowAddRoleModal] = useState(false);
  const [newRoleForm, setNewRoleForm] = useState({ name: '', description: '', permissions: [] as string[] });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState('');

  // 権限カテゴリ
  const permissionCategories = [
    { id: 'products', name: '商品管理' },
    { id: 'orders', name: '注文管理' },
    { id: 'customers', name: '顧客管理' },
    { id: 'system', name: 'システム管理' }
  ];
  
  // システム管理者権限のチェック
  useEffect(() => {
    if (currentAdmin?.role !== 'system_admin') {
      navigate('/admin/dashboard');
    }
  }, [currentAdmin, navigate]);
  
  // データの取得
  useEffect(() => {
    const fetchData = async () => {
      try {
        // 権限データ（実際はAPIから取得）
        const dummyPermissions: Permission[] = [
          { id: 'view_products', name: '商品閲覧', description: '商品情報を閲覧できます', category: 'products' },
          { id: 'manage_products', name: '商品編集', description: '商品の追加・編集・削除ができます', category: 'products' },
          { id: 'manage_inventory', name: '在庫管理', description: '在庫数の更新ができます', category: 'products' },
          { id: 'manage_prices', name: '価格管理', description: '価格・割引の設定ができます', category: 'products' },
          { id: 'view_orders', name: '注文閲覧', description: '注文情報を閲覧できます', category: 'orders' },
          { id: 'manage_orders', name: '注文処理', description: '注文のステータス更新・キャンセル処理ができます', category: 'orders' },
          { id: 'view_customers', name: '顧客閲覧', description: '顧客情報を閲覧できます', category: 'customers' },
          { id: 'manage_customers', name: '顧客編集', description: '顧客情報の編集ができます', category: 'customers' },
          { id: 'view_inquiries', name: '問い合わせ閲覧', description: '問い合わせを閲覧できます', category: 'customers' },
          { id: 'manage_inquiries', name: '問い合わせ対応', description: '問い合わせへの返信ができます', category: 'customers' },
          { id: 'view_analytics', name: '分析閲覧', description: '売上・トラフィック分析を閲覧できます', category: 'system' },
          { id: 'manage_settings', name: '設定変更', description: 'システム設定を変更できます', category: 'system' }
        ];

        // ロールデータ（実際はAPIから取得）
        const dummyRoles: Role[] = [
          {
            id: 'system_admin',
            name: 'システム管理者',
            description: 'すべての機能にアクセスできます',
            permissions: ['all'],
            isSystem: true
          },
          {
            id: 'store_admin',
            name: '店舗管理者',
            description: '店舗の運営に必要な基本機能にアクセスできます',
            permissions: [
              'view_products', 'manage_products', 'manage_inventory', 'manage_prices',
              'view_orders', 'manage_orders', 'view_customers', 'view_inquiries', 'manage_inquiries'
            ]
          },
          {
            id: 'product_manager',
            name: '商品管理者',
            description: '商品関連の機能のみアクセスできます',
            permissions: ['view_products', 'manage_products', 'manage_inventory', 'manage_prices']
          },
          {
            id: 'order_manager',
            name: '注文管理者',
            description: '注文関連の機能のみアクセスできます',
            permissions: ['view_orders', 'manage_orders']
          },
          {
            id: 'customer_support',
            name: 'カスタマーサポート',
            description: '顧客対応に必要な機能にアクセスできます',
            permissions: ['view_products', 'view_orders', 'view_customers', 'view_inquiries', 'manage_inquiries']
          }
        ];

        // アカウントデータ（実際はAPIから取得）
        const dummyAccounts: AdminAccount[] = [
          {
            id: 'admin-001',
            name: 'システム管理者',
            email: 'admin@example.com',
            role: 'system_admin',
            roleName: 'システム管理者',
            permissions: ['all'],
            isActive: true
          },
          {
            id: 'store-001',
            name: '山田 店長',
            email: 'store@example.com',
            role: 'store_admin',
            roleName: '店舗管理者',
            permissions: [
              'view_products', 'manage_products', 'manage_inventory', 'manage_prices',
              'view_orders', 'manage_orders', 'view_customers', 'view_inquiries', 'manage_inquiries'
            ],
            storeId: 'store-tokyo-1',
            storeName: '東京本店',
            isActive: true
          },
          {
            id: 'product-001',
            name: '鈴木 商品担当',
            email: 'product@example.com',
            role: 'product_manager',
            roleName: '商品管理者',
            permissions: ['view_products', 'manage_products', 'manage_inventory'],
            storeId: 'store-tokyo-1',
            storeName: '東京本店',
            isActive: true
          },
          {
            id: 'order-001',
            name: '佐藤 注文担当',
            email: 'order@example.com',
            role: 'order_manager',
            roleName: '注文管理者',
            permissions: ['view_orders', 'manage_orders'],
            storeId: 'store-osaka-1',
            storeName: '大阪支店',
            isActive: true
          },
          {
            id: 'support-001',
            name: '田中 サポート',
            email: 'support@example.com',
            role: 'customer_support',
            roleName: 'カスタマーサポート',
            permissions: ['view_products', 'view_orders', 'view_customers', 'view_inquiries', 'manage_inquiries'],
            isActive: true
          }
        ];

        setPermissions(dummyPermissions);
        setRoles(dummyRoles);
        setAccounts(dummyAccounts);
      } catch (error) {
        console.error('データの取得エラー:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // アカウント選択時の処理
  useEffect(() => {
    if (selectedAccount) {
      const account = accounts.find(acc => acc.id === selectedAccount);
      if (account) {
        setSelectedPermissions(account.permissions);
      }
    } else {
      setSelectedPermissions([]);
    }
  }, [selectedAccount, accounts]);

  // アカウント選択ハンドラー
  const handleAccountSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedAccount(e.target.value);
    setSuccessMessage('');
  };

  // 権限チェックボックス変更ハンドラー
  const handlePermissionChange = (permissionId: string, checked: boolean) => {
    if (checked) {
      setSelectedPermissions(prev => [...prev, permissionId]);
    } else {
      setSelectedPermissions(prev => prev.filter(id => id !== permissionId));
    }
    setSuccessMessage('');
  };

  // 権限更新処理
  const handleUpdatePermissions = () => {
    if (!selectedAccount) {
      alert('アカウントが選択されていません');
      return;
    }

    // 実際はAPIで更新処理
    // ここではフロントエンドだけで処理
    const updatedAccounts = accounts.map(account => {
      if (account.id === selectedAccount) {
        return { ...account, permissions: selectedPermissions };
      }
      return account;
    });

    setAccounts(updatedAccounts);
    setSuccessMessage('権限を更新しました');
  };

  // 新規ロール追加のフォーム処理
  const handleRoleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewRoleForm(prev => ({ ...prev, [name]: value }));
    
    // エラーをクリア
    if (formErrors[name]) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // 新規ロールの権限チェックボックス変更
  const handleRolePermissionChange = (permissionId: string, checked: boolean) => {
    if (checked) {
      setNewRoleForm(prev => ({
        ...prev,
        permissions: [...prev.permissions, permissionId]
      }));
    } else {
      setNewRoleForm(prev => ({
        ...prev,
        permissions: prev.permissions.filter(id => id !== permissionId)
      }));
    }
  };

  // 新規ロール追加のバリデーション
  const validateRoleForm = () => {
    const errors: Record<string, string> = {};
    
    if (!newRoleForm.name.trim()) {
      errors.name = 'ロール名は必須です';
    }
    
    if (!newRoleForm.description.trim()) {
      errors.description = '説明は必須です';
    }
    
    if (newRoleForm.permissions.length === 0) {
      errors.permissions = '少なくとも1つの権限を選択してください';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // 新規ロール追加処理
  const handleAddRole = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateRoleForm()) return;
    
    // 実際はAPIで作成処理
    // ここではフロントエンドだけで処理
    const newRole: Role = {
      id: `role-${Date.now()}`,
      name: newRoleForm.name,
      description: newRoleForm.description,
      permissions: newRoleForm.permissions
    };
    
    setRoles(prev => [...prev, newRole]);
    setShowAddRoleModal(false);
    setNewRoleForm({ name: '', description: '', permissions: [] });
    setSuccessMessage('新しいロールを追加しました');
  };

  // ロール選択時の処理
  const handleRoleSelect = (roleId: string) => {
    if (!selectedAccount) {
      alert('アカウントが選択されていません');
      return;
    }

    const role = roles.find(r => r.id === roleId);
    if (role) {
      setSelectedPermissions(role.permissions);
    }
  };

  if (isLoading) {
    return <div className="loading">読み込み中...</div>;
  }

  return (
    <div className="role-management-page">
      <div className="page-actions">
        <h1>権限設定</h1>
        <button
          className="btn primary"
          onClick={() => setShowAddRoleModal(true)}
        >
          新規ロール追加
        </button>
      </div>

      {successMessage && (
        <div className="success-message">
          {successMessage}
        </div>
      )}

      <div className="role-management-container">
        <div className="permissions-section">
          <h2>アカウント権限設定</h2>
          
          <div className="form-group">
            <label htmlFor="account-select">アカウント選択</label>
            <select
              id="account-select"
              value={selectedAccount}
              onChange={handleAccountSelect}
              className="form-control"
            >
              <option value="">アカウントを選択してください</option>
              {accounts.map(account => (
                <option key={account.id} value={account.id}>
                  {account.name} ({account.email}) - {account.roleName}
                </option>
              ))}
            </select>
          </div>

          {selectedAccount && (
            <>
              <div className="quick-roles">
                <label>ロールをセット:</label>
                <div className="role-buttons">
                  {roles.map(role => (
                    <button
                      key={role.id}
                      type="button"
                      className="btn small"
                      onClick={() => handleRoleSelect(role.id)}
                    >
                      {role.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="permissions-list">
                {permissionCategories.map(category => (
                  <div key={category.id} className="permission-category">
                    <h3>{category.name}</h3>
                    <div className="permission-items">
                      {permissions
                        .filter(perm => perm.category === category.id)
                        .map(permission => {
                          // システム管理者は'all'権限を持つため個別に全選択状態にする
                          const isSystemAdmin = accounts.find(acc => acc.id === selectedAccount)?.role === 'system_admin';
                          const isChecked = isSystemAdmin || selectedPermissions.includes(permission.id);
                          const isDisabled = isSystemAdmin; // システム管理者は権限変更不可
                          
                          return (
                            <div key={permission.id} className="permission-item">
                              <label className="checkbox-label">
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={(e) => handlePermissionChange(permission.id, e.target.checked)}
                                  disabled={isDisabled}
                                />
                                <span className="permission-name">{permission.name}</span>
                              </label>
                              <span className="permission-description">{permission.description}</span>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                ))}
              </div>

              <div className="form-actions">
                <button
                  className="btn primary"
                  onClick={handleUpdatePermissions}
                  disabled={accounts.find(acc => acc.id === selectedAccount)?.role === 'system_admin'}
                >
                  権限を更新
                </button>
                {accounts.find(acc => acc.id === selectedAccount)?.role === 'system_admin' && (
                  <div className="form-text">
                    システム管理者の権限は変更できません。
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        <div className="roles-section">
          <h2>ロール一覧</h2>
          
          <div className="roles-list">
            {roles.map(role => (
              <div key={role.id} className="role-card">
                <div className="role-header">
                  <h3>{role.name}</h3>
                  {role.isSystem && <span className="system-tag">システムロール</span>}
                </div>
                <div className="role-description">{role.description}</div>
                <div className="role-permissions">
                  <h4>付与される権限:</h4>
                  <ul>
                    {role.permissions.includes('all') ? (
                      <li>すべての権限</li>
                    ) : (
                      role.permissions.map(permId => {
                        const perm = permissions.find(p => p.id === permId);
                        return perm ? (
                          <li key={permId}>{perm.name}</li>
                        ) : null;
                      })
                    )}
                  </ul>
                </div>
                {!role.isSystem && (
                  <div className="role-actions">
                    <button className="btn small">編集</button>
                    <button className="btn small danger">削除</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 新規ロール追加モーダル */}
      {showAddRoleModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>新規ロール追加</h2>
            <form onSubmit={handleAddRole}>
              <div className="form-group">
                <label htmlFor="name">
                  ロール名 <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={newRoleForm.name}
                  onChange={handleRoleFormChange}
                  required
                />
                {formErrors.name && <div className="error-text">{formErrors.name}</div>}
              </div>
              
              <div className="form-group">
                <label htmlFor="description">
                  説明 <span className="required">*</span>
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={newRoleForm.description}
                  onChange={handleRoleFormChange}
                  required
                />
                {formErrors.description && <div className="error-text">{formErrors.description}</div>}
              </div>
              
              <div className="form-group">
                <label>
                  権限 <span className="required">*</span>
                </label>
                {formErrors.permissions && <div className="error-text">{formErrors.permissions}</div>}
                
                <div className="permissions-list">
                  {permissionCategories.map(category => (
                    <div key={category.id} className="permission-category">
                      <h3>{category.name}</h3>
                      <div className="permission-items">
                        {permissions
                          .filter(perm => perm.category === category.id)
                          .map(permission => (
                            <div key={permission.id} className="permission-item">
                              <label className="checkbox-label">
                                <input
                                  type="checkbox"
                                  checked={newRoleForm.permissions.includes(permission.id)}
                                  onChange={(e) => handleRolePermissionChange(permission.id, e.target.checked)}
                                />
                                <span className="permission-name">{permission.name}</span>
                              </label>
                              <span className="permission-description">{permission.description}</span>
                            </div>
                          ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="modal-actions">
                <button
                  type="button"
                  className="btn secondary"
                  onClick={() => setShowAddRoleModal(false)}
                >
                  キャンセル
                </button>
                <button
                  type="submit"
                  className="btn primary"
                >
                  追加
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoleManagementPage;
