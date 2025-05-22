import React from 'react';
import { Helmet } from 'react-helmet';

interface PageTitleProps {
  title: string;
  description?: string;
}

/**
 * ページごとにブラウザのタブに表示するタイトルを設定するコンポーネント
 * @param title ページタイトル
 * @param description メタディスクリプション（省略可）
 */
const PageTitle: React.FC<PageTitleProps> = ({ title, description }) => {
  const fullTitle = `${title} | JaSST Hokkaidoストア`;
  
  return (
    <Helmet>
      <title>{fullTitle}</title>
      {description && <meta name="description" content={description} />}
    </Helmet>
  );
};

export default PageTitle;
