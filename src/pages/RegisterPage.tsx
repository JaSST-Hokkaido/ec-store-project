import React, { useState } from 'react';
import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { register, login } = useAuth();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    phone: '',
    termsAccepted: false,
    address: {
      postalCode: '',
      prefecture: '',
      city: '',
      address1: '',
      address2: ''
    }
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showAddressFields, setShowAddressFields] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  
  // URLからリダイレクト先を取得
  const redirectTo = searchParams.get('redirect') || '/';

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { id, value, type } = e.target as HTMLInputElement;
    
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
    } else if (type === 'checkbox') {
      // チェックボックスの場合
      const { checked } = e.target as HTMLInputElement;
      setFormData({
        ...formData,
        [id]: checked
      });
    } else {
      // 通常のフィールド
      setFormData({
        ...formData,
        [id]: value
      });
    }
  };

  const toggleAddressFields = () => {
    setShowAddressFields(!showAddressFields);
  };
  
  const validateForm = () => {
    if (!formData.email.trim() || !formData.password.trim() || !formData.name.trim()) {
      setError('すべての必須項目を入力してください');
      return false;
    }
    
    if (formData.password !== formData.confirmPassword) {
      setError('パスワードが一致しません');
      return false;
    }
    
    if (formData.password.length < 8) {
      setError('パスワードは8文字以上で入力してください');
      return false;
    }
    
    // メールアドレスの基本的な検証
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('有効なメールアドレスを入力してください');
      return false;
    }
    
    if (!formData.termsAccepted) {
      setError('利用規約とプライバシーポリシーに同意してください');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    setError('');
    
    try {
      // 住所情報を整理
      let addressData = undefined;
      
      if (showAddressFields) {
        addressData = {
          postalCode: formData.address.postalCode,
          prefecture: formData.address.prefecture,
          city: formData.address.city,
          address1: formData.address.address1,
          address2: formData.address.address2
        };
      }
      
      // 会員登録処理
      const userData = {
        email: formData.email,
        password: formData.password,
        name: formData.name,
        phone: formData.phone || undefined,
        address: addressData
      };
      
      const result = await register(userData);
      
      if (result.success) {
        // 登録成功
        setRegistrationSuccess(true);
        
        // 自動ログイン処理
        await login(formData.email, formData.password);
        
        // 5秒後にリダイレクト
        setTimeout(() => {
          navigate(redirectTo === 'checkout' ? '/checkout' : `/${redirectTo}`);
        }, 3000);
      } else {
        setError(result.message || '会員登録に失敗しました');
      }
    } catch (err: any) {
      console.error('会員登録エラー:', err);
      setError(err.message || '会員登録に失敗しました。もう一度お試しください。');
    } finally {
      setIsLoading(false);
    }
  };

  // 登録成功画面
  if (registrationSuccess) {
    return (
      <div className="auth-page register-success-page">
        <div className="container">
          <div className="auth-container">
            <div className="auth-header">
              <h1>会員登録完了</h1>
              <p>ようこそ {formData.name} さん！</p>
            </div>
            
            <div className="success-message">
              <div className="success-icon">✓</div>
              <p>会員登録が完了しました。自動的にホームページに移動します。</p>
            </div>
            
            <div className="auth-footer">
              <Link to="/" className="btn">
                ホームページへ
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 会員登録フォーム
  return (
    <div className="auth-page register-page">
      <div className="container">
        <div className="auth-container">
          <div className="auth-header">
            <h1>新規会員登録</h1>
            <p>アカウントを作成して、お買い物をお楽しみください</p>
          </div>
          
          {error && (
            <div className="auth-error">
              {error}
            </div>
          )}
          
          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name">お名前</label>
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
              <label htmlFor="email">メールアドレス</label>
              <input
                type="email"
                id="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="your@email.com"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="password">パスワード</label>
              <input
                type="password"
                id="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="8文字以上"
                required
                minLength={8}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="confirmPassword">パスワード (確認)</label>
              <input
                type="password"
                id="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="もう一度入力"
                required
                minLength={8}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="phone">電話番号 (任意)</label>
              <input
                type="tel"
                id="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="090-1234-5678"
              />
            </div>
            
            <div className="address-toggle">
              <button 
                type="button"
                className="toggle-btn"
                onClick={toggleAddressFields}
              >
                {showAddressFields ? '住所情報を隠す' : '住所情報を入力する (任意)'}
              </button>
            </div>
            
            {showAddressFields && (
              <div className="address-fields">
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
                  <label htmlFor="address.address2">部屋番号など (任意)</label>
                  <input
                    type="text"
                    id="address.address2"
                    value={formData.address.address2}
                    onChange={handleChange}
                  />
                </div>
              </div>
            )}
            
            <div className="form-terms">
              <input 
                type="checkbox" 
                id="termsAccepted" 
                checked={formData.termsAccepted}
                onChange={handleChange}
                required
              />
              <label htmlFor="termsAccepted">
                <Link to="/terms" target="_blank" rel="noopener noreferrer">
                  利用規約
                </Link>
                と
                <Link to="/privacy" target="_blank" rel="noopener noreferrer">
                  プライバシーポリシー
                </Link>
                に同意します
              </label>
            </div>
            
            <button 
              type="submit" 
              className="btn auth-btn" 
              disabled={isLoading}
            >
              {isLoading ? '登録中...' : '登録する'}
            </button>
            
            <div className="auth-divider">
              <span>または</span>
            </div>
            
            {/* ソーシャル登録ボタン（後で実装） */}
            <div className="social-login">
              <button type="button" className="btn social-btn google">
                <span className="social-icon">G</span>
                Googleで登録
              </button>
              <button type="button" className="btn social-btn facebook">
                <span className="social-icon">f</span>
                Facebookで登録
              </button>
            </div>
          </form>
          
          <div className="auth-footer">
            <p>
              すでにアカウントをお持ちですか？{' '}
              <Link to={`/login${redirectTo ? `?redirect=${redirectTo}` : ''}`}>
                ログイン
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
