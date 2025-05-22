import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
// import { Auth } from 'aws-amplify';

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: 基本情報入力, 2: 確認コード入力

  // URLからリダイレクト先を取得
  const searchParams = new URLSearchParams(location.search);
  const redirectTo = searchParams.get('redirect') || '/';

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value
    });
  };

  const validateForm = () => {
    if (!formData.email.trim() || !formData.password.trim() || !formData.name.trim()) {
      setError('すべての項目を入力してください');
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
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    setError('');
    
    try {
      // AWS Amplify Authでの会員登録を実装予定
      // await Auth.signUp({
      //   username: formData.email,
      //   password: formData.password,
      //   attributes: {
      //     name: formData.name,
      //     email: formData.email
      //   }
      // });
      
      // 確認コード入力ステップへ（開発中はダミーデータで代用）
      console.log('会員登録フォーム送信:', formData);
      setStep(2);
    } catch (err: any) {
      console.error('会員登録エラー:', err);
      setError(err.message || '会員登録に失敗しました。もう一度お試しください。');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsLoading(true);
    setError('');
    
    try {
      // 確認コード検証（開発中はダミーデータで代用）
      // await Auth.confirmSignUp(formData.email, confirmationCode);
      
      // 登録成功、ログイン状態にして指定されたページにリダイレクト
      console.log('確認コード検証成功');
      
      // 自動ログイン処理
      // await Auth.signIn(formData.email, formData.password);
      
      // リダイレクト先に遷移
      navigate(redirectTo === 'checkout' ? '/checkout' : `/${redirectTo}`);
    } catch (err: any) {
      console.error('確認コード検証エラー:', err);
      setError(err.message || '確認に失敗しました。コードを確認してもう一度お試しください。');
    } finally {
      setIsLoading(false);
    }
  };

  // 確認コード入力ステップ
  if (step === 2) {
    return (
      <div className="auth-page register-page">
        <div className="container">
          <div className="auth-container">
            <div className="auth-header">
              <h1>確認コード入力</h1>
              <p>メールアドレスに送信された確認コードを入力してください</p>
            </div>
            
            {error && (
              <div className="auth-error">
                {error}
              </div>
            )}
            
            <form className="auth-form" onSubmit={handleVerifyCode}>
              <div className="form-group">
                <label htmlFor="confirmationCode">確認コード</label>
                <input
                  type="text"
                  id="confirmationCode"
                  placeholder="123456"
                  required
                />
              </div>
              
              <button 
                type="submit" 
                className="btn auth-btn" 
                disabled={isLoading}
              >
                {isLoading ? '確認中...' : '確認する'}
              </button>
              
              <div className="form-actions">
                <button 
                  type="button" 
                  className="resend-code-link"
                  onClick={() => {
                    // 確認コードの再送信処理
                    // Auth.resendSignUp(formData.email);
                    alert('確認コードを再送信しました');
                  }}
                >
                  確認コードを再送信する
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // 基本情報入力ステップ
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
            
            <div className="form-terms">
              <input type="checkbox" id="terms" required />
              <label htmlFor="terms">
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
