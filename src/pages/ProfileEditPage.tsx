import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAdminAuth } from '../context/AdminAuthContext';

const ProfileEditPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, updateUserProfile } = useAuth();
  const { login: adminLogin } = useAdminAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [showDevTools, setShowDevTools] = useState(false);
  const [adminCode, setAdminCode] = useState('');
  const [adminCodeError, setAdminCodeError] = useState('');
  const [adminSuccess, setAdminSuccess] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: {
      postalCode: '',
      prefecture: '',
      city: '',
      address1: '',
      address2: ''
    }
  });
  
  // 現在のユーザー情報を初期値として設定
  useEffect(() => {
    if (currentUser) {
      setFormData({
        name: currentUser.name || '',
        email: currentUser.email || '',
        phone: currentUser.phone || '',
        address: {
          postalCode: currentUser.address?.postalCode || '',
          prefecture: currentUser.address?.prefecture || '',
          city: currentUser.address?.city || '',
          address1: currentUser.address?.address1 || '',
          address2: currentUser.address?.address2 || ''
        }
      });
    } else {
      // ユーザーがログインしていない場合はマイページへリダイレクト
      navigate('/mypage');
    }
  }, [currentUser, navigate]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    
    if (id.includes('.')) {
      // 住所情報のフィールド
      const [parent, child] = id.split('.');
      setFormData({
        ...formData,
        [parent]: {
          ...formData[parent as keyof typeof formData] as object,
          [child]: value
        }
      });
    } else {
      // 通常のフィールド
      setFormData({
        ...formData,
        [id]: value
      });
    }
  };
  
  const validateForm = () => {
    if (!formData.name.trim()) {
      setError('お名前は必須項目です');
      return false;
    }
    
    if (!formData.email.trim()) {
      setError('メールアドレスは必須項目です');
      return false;
    }
    
    // メールアドレスの基本的な検証
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('有効なメールアドレスを入力してください');
      return false;
    }
    
    return true;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    setError('');
    setSuccess(false);
    
    try {
      // 更新するユーザー情報
      const userData = {
        name: formData.name,
        phone: formData.phone,
        address: {
          postalCode: formData.address.postalCode,
          prefecture: formData.address.prefecture,
          city: formData.address.city,
          address1: formData.address.address1,
          address2: formData.address.address2
        }
      };
      
      const result = await updateUserProfile(userData);
      
      if (result.success) {
        setSuccess(true);
        // 3秒後にマイページに戻る
        setTimeout(() => {
          navigate('/mypage');
        }, 3000);
      } else {
        setError(result.message || '会員情報の更新に失敗しました');
      }
    } catch (err: any) {
      console.error('プロフィール更新エラー:', err);
      setError(err.message || '会員情報の更新に失敗しました。もう一度お試しください。');
    } finally {
      setIsLoading(false);
    }
  };
  // 開発者ツール表示の切り替え
  const toggleDevTools = () => {
    setShowDevTools(!showDevTools);
    setAdminCode('');
    setAdminCodeError('');
    setAdminSuccess('');
  };
  
  // 管理者権限付与処理
  const handleAdminPromotion = () => {
    if (!adminCode) {
      setAdminCodeError('コードを入力してください');
      return;
    }
    
    // 特定のコードでシステム管理者権限を付与（開発環境でのみ機能）
    if (adminCode === 'DEV-ADMIN-1234') {
      try {
        // 管理者権限でログイン
        adminLogin(currentUser?.email || '', 'admin-password');  // 実際の実装では適切な認証方法を使用
        
        setAdminSuccess('システム管理者権限が付与されました。管理画面にアクセスできます。');
        setAdminCodeError('');
        
        // 3秒後に管理画面へリダイレクト
        setTimeout(() => {
          navigate('/admin/dashboard');
        }, 3000);
      } catch (err) {
        setAdminCodeError('権限付与に失敗しました');
      }
    } else {
      setAdminCodeError('認証コードが正しくありません');
    }
  };
  
  return (
    <div className="profile-edit-page">
      <div className="container">
        <h1 className="page-title">会員情報編集</h1>
        
        {error && (
          <div className="auth-error">
            {error}
          </div>
        )}
        
        {success && (
          <div className="auth-success">
            会員情報を更新しました。マイページに戻ります。
          </div>
        )}
        
        <form className="edit-form" onSubmit={handleSubmit}>
          <div className="form-section">
            <h2 className="section-title">基本情報</h2>
            
            <div className="form-group">
              <label htmlFor="name">お名前 <span className="required">*</span></label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="山田 太郎"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="email">メールアドレス <span className="required">*</span></label>
              <input
                type="email"
                id="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="your@email.com"
                disabled // メールアドレスは変更不可
              />
              <small className="form-text">メールアドレスは変更できません</small>
            </div>
            
            <div className="form-group">
              <label htmlFor="phone">電話番号</label>
              <input
                type="tel"
                id="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="090-1234-5678"
              />
            </div>
          </div>
          
          <div className="form-section">
            <h2 className="section-title">住所情報</h2>
            
            <div className="form-group">
              <label htmlFor="address.postalCode">郵便番号</label>
              <input
                type="text"
                id="address.postalCode"
                value={formData.address.postalCode}
                onChange={handleChange}
                placeholder="123-4567"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="address.prefecture">都道府県</label>
              <select
                id="address.prefecture"
                value={formData.address.prefecture}
                onChange={handleChange}
              >
                <option value="">選択してください</option>
                <option value="北海道">北海道</option>
                <option value="東京都">東京都</option>
                <option value="大阪府">大阪府</option>
                {/* 他の都道府県も追加 */}
              </select>
            </div>
            
            <div className="form-group">
              <label htmlFor="address.city">市区町村</label>
              <input
                type="text"
                id="address.city"
                value={formData.address.city}
                onChange={handleChange}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="address.address1">番地・建物名</label>
              <input
                type="text"
                id="address.address1"
                value={formData.address.address1}
                onChange={handleChange}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="address.address2">部屋番号など</label>
              <input
                type="text"
                id="address.address2"
                value={formData.address.address2}
                onChange={handleChange}
              />
            </div>
          </div>
          
          <div className="form-actions">
            <button 
              type="button" 
              className="btn secondary"
              onClick={() => navigate('/mypage')}
            >
              キャンセル
            </button>
            <button 
              type="submit" 
              className="btn primary"
              disabled={isLoading}
            >
              {isLoading ? '更新中...' : '更新する'}
            </button>
          </div>
        </form>
        
        {/* 開発モード切り替えボタン - 本番環境では削除されるコンポーネント */}
        <div className="dev-tools-toggle">
          <button 
            type="button" 
            className="btn text-only"
            onClick={toggleDevTools}
          >
            {showDevTools ? '開発者モードを隠す' : '開発者モードを表示'}
          </button>
        </div>
        
        {/* 開発者ツール - 暫定的な管理者権限付与機能 */}
        {showDevTools && (
          <div className="dev-tools-panel">
            <div className="dev-tools-warning">
              <h3>⚠️ 開発者モード（暫定機能）</h3>
              <p>この機能は開発環境でのテスト用です。本番環境では削除されます。</p>
            </div>
            
            <div className="admin-promotion-section">
              <h4>システム管理者権限付与（開発テスト用）</h4>
              
              {adminSuccess && (
                <div className="admin-success-message">
                  {adminSuccess}
                </div>
              )}
              
              {adminCodeError && (
                <div className="admin-error-message">
                  {adminCodeError}
                </div>
              )}
              
              <div className="admin-code-input">
                <input
                  type="text"
                  placeholder="開発用認証コード"
                  value={adminCode}
                  onChange={(e) => setAdminCode(e.target.value)}
                />
                <button 
                  type="button" 
                  className="btn danger"
                  onClick={handleAdminPromotion}
                >
                  管理者権限付与
                </button>
              </div>
              
              <div className="admin-code-hint">
                <small>ヒント: 開発用認証コードは 'DEV-ADMIN-1234' です</small>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileEditPage;
