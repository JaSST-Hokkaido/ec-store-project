import { Amplify } from 'aws-amplify';

// AWS Amplify設定
Amplify.configure({
  // AWS リージョン
  region: 'ap-northeast-1',
  
  // ユーザー認証
  Auth: {
    // Amazon Cognito ID プール: 認証されていないユーザーのアクセス許可用
    identityPoolId: 'ap-northeast-1:xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
    
    // Amazon Cognito ユーザープール: 認証されたユーザーの管理用
    userPoolId: 'ap-northeast-1_xxxxxxxxx',
    userPoolWebClientId: 'xxxxxxxxxxxxxxxxxxxxxxxxxx',
    
    // OAuth設定
    oauth: {
      domain: 'your-domain.auth.ap-northeast-1.amazoncognito.com',
      scope: ['email', 'profile', 'openid'],
      redirectSignIn: 'http://localhost:3000/',
      redirectSignOut: 'http://localhost:3000/',
      responseType: 'code' // 'code' または 'token'
    },
    
    // ソーシャルプロバイダ設定
    /*
    federationTarget: 'COGNITO_USER_POOLS',
    socialProviders: ['FACEBOOK', 'GOOGLE', 'AMAZON']
    */
  },
  
  // 安全な認証ストレージ
  storage: {
    // CookieStorage、LocalStorage、SessionStorageのいずれかを使用
    auth: {
      storage: window.localStorage
    }
  },
  
  // API Gateway 設定
  API: {
    endpoints: [
      {
        name: 'ecStoreAPI',
        endpoint: 'https://xxxxxxxx.execute-api.ap-northeast-1.amazonaws.com/prod',
        custom_header: async () => {
          return { Authorization: `Bearer ${(await Amplify.Auth.currentSession()).getIdToken().getJwtToken()}` };
        }
      }
    ]
  },
  
  // Amazon S3 設定（商品画像などのアセット用）
  Storage: {
    AWSS3: {
      bucket: 'your-s3-bucket-name',
      region: 'ap-northeast-1'
    }
  }
});

export default Amplify;
