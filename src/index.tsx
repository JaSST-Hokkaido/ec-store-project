import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './styles/index.css';
import App from './App';
import reportWebVitals from './utils/reportWebVitals';
import { Amplify } from 'aws-amplify';
import './aws-config';

// AWS Amplify設定はaws-config.tsファイルで行われています

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);

// パフォーマンス計測
reportWebVitals();
