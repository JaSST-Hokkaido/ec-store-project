import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../../../context/AdminAuthContext';

// カテゴリの型定義
interface Category {
  id: string;
  name: string;
  parentId: string | null;
  level: number;
  order: number;
  children?: Category[];
  isExpanded?: boolean;
  isEditing?: boolean;
}

const CategoryManagementPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentAdmin, checkPermission } = useAdminAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [flatCategories, setFlatCategories] = useState<Category[]>([]);
  const [newCategoryForm, setNewCategoryForm] = useState({ name: '', parentId: '' });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [draggedItem, setDraggedItem] = useState<Category | null>(null);
  
  // システム管理者権限のチェック
  useEffect(() => {
    if (currentAdmin?.role !== 'system_admin') {
      navigate('/admin/dashboard');
    }
  }, [currentAdmin, navigate]);
  
  // カテゴリデータの取得
  useEffect(() => {
    // 実際はAPIからデータを取得
    const fetchCategories = async () => {
      try {
        // ダミーのカテゴリデータ
        const dummyCategories: Category[] = [
          { id: 'cat-1', name: '衣類', parentId: null, level: 0, order: 0 },
          { id: 'cat-1-1', name: 'Tシャツ', parentId: 'cat-1', level: 1, order: 0 },
          { id: 'cat-1-2', name: 'パーカー', parentId: 'cat-1', level: 1, order: 1 },
          { id: 'cat-1-3', name: 'ジャケット', parentId: 'cat-1', level: 1, order: 2 },
          { id: 'cat-2', name: 'アクセサリー', parentId: null, level: 0, order: 1 },
          { id: 'cat-2-1', name: 'バッグ', parentId: 'cat-2', level: 1, order: 0 },
          { id: 'cat-2-2', name: '帽子', parentId: 'cat-2', level: 1, order: 1 },
          { id: 'cat-3', name: '文房具', parentId: null, level: 0, order: 2 },
          { id: 'cat-3-1', name: 'ノート', parentId: 'cat-3', level: 1, order: 0 },
          { id: 'cat-3-2', name: 'ペン', parentId: 'cat-3', level: 1, order: 1 },
          { id: 'cat-3-1-1', name: 'リングノート', parentId: 'cat-3-1', level: 2, order: 0 },
          { id: 'cat-4', name: '本・メディア', parentId: null, level: 0, order: 3 },
          { id: 'cat-5', name: 'その他', parentId: null, level: 0, order: 4 }
        ];
        
        setFlatCategories(dummyCategories);
        
        // 階層構造に変換
        const hierarchicalCategories = buildCategoryTree(dummyCategories);
        setCategories(hierarchicalCategories);
      } catch (error) {
        console.error('カテゴリデータの取得エラー:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCategories();
  }, []);
  
  // フラットなカテゴリリストから階層構造を構築
  const buildCategoryTree = (flatList: Category[]): Category[] => {
    const tree: Category[] = [];
    const map: Record<string, Category> = {};
    
    // 全てのカテゴリをマップに格納
    flatList.forEach(cat => {
      map[cat.id] = { ...cat, children: [], isExpanded: true };
    });
    
    // 階層構造を構築
    flatList.forEach(cat => {
      const category = map[cat.id];
      if (cat.parentId === null) {
        // ルートカテゴリ
        tree.push(category);
      } else if (map[cat.parentId]) {
        // 親カテゴリが存在する場合、子として追加
        map[cat.parentId].children?.push(category);
      }
    });
    
    // 各レベルでの順序をソート
    const sortChildren = (items: Category[]) => {
      items.sort((a, b) => a.order - b.order);
      items.forEach(item => {
        if (item.children && item.children.length > 0) {
          sortChildren(item.children);
        }
      });
    };
    
    sortChildren(tree);
    return tree;
  };
  
  // フォーム入力変更ハンドラー
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (editingCategory) {
      setEditingCategory({ ...editingCategory, [name]: value });
    } else {
      setNewCategoryForm({ ...newCategoryForm, [name]: value });
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
  
  // 新規カテゴリのバリデーション
  const validateCategoryForm = () => {
    const errors: Record<string, string> = {};
    
    const name = editingCategory ? editingCategory.name : newCategoryForm.name;
    
    if (!name.trim()) {
      errors.name = 'カテゴリ名は必須です';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  // 新規カテゴリ追加処理
  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateCategoryForm()) return;
    
    // 実際はAPIで作成処理
    // ここではフロントエンドだけで処理
    const parentCategory = newCategoryForm.parentId
      ? flatCategories.find(cat => cat.id === newCategoryForm.parentId)
      : null;
    
    const level = parentCategory ? parentCategory.level + 1 : 0;
    
    // 同じレベル・親の中での最大order値を取得
    const siblingCategories = flatCategories.filter(cat => 
      cat.parentId === (parentCategory ? parentCategory.id : null)
    );
    const maxOrder = siblingCategories.length > 0
      ? Math.max(...siblingCategories.map(cat => cat.order))
      : -1;
    
    const newCategory: Category = {
      id: `cat-${Date.now()}`,
      name: newCategoryForm.name,
      parentId: newCategoryForm.parentId || null,
      level,
      order: maxOrder + 1
    };
    
    // フラットなリストを更新
    const updatedFlatCategories = [...flatCategories, newCategory];
    setFlatCategories(updatedFlatCategories);
    
    // 階層構造を再構築
    const updatedTree = buildCategoryTree(updatedFlatCategories);
    setCategories(updatedTree);
    
    // フォームをリセット
    setNewCategoryForm({ name: '', parentId: '' });
    setSuccessMessage('カテゴリを追加しました');
    
    // 一定時間後にメッセージをクリア
    setTimeout(() => {
      setSuccessMessage('');
    }, 3000);
  };
  
  // カテゴリ編集モード切替
  const handleEditCategory = (category: Category) => {
    setEditingCategory({ ...category });
    setSuccessMessage('');
  };
  
  // カテゴリ更新処理
  const handleUpdateCategory = () => {
    if (!editingCategory || !validateCategoryForm()) return;
    
    // 実際はAPIで更新処理
    // ここではフロントエンドだけで処理
    const updatedFlatCategories = flatCategories.map(cat => 
      cat.id === editingCategory.id ? { ...cat, name: editingCategory.name } : cat
    );
    
    setFlatCategories(updatedFlatCategories);
    
    // 階層構造を再構築
    const updatedTree = buildCategoryTree(updatedFlatCategories);
    setCategories(updatedTree);
    
    // 編集モードを終了
    setEditingCategory(null);
    setSuccessMessage('カテゴリを更新しました');
    
    // 一定時間後にメッセージをクリア
    setTimeout(() => {
      setSuccessMessage('');
    }, 3000);
  };
  
  // カテゴリ削除処理
  const handleDeleteCategory = (categoryId: string) => {
    // 削除対象のカテゴリとその子カテゴリを取得
    const targetCategory = flatCategories.find(cat => cat.id === categoryId);
    if (!targetCategory) return;
    
    // 子カテゴリのIDを再帰的に取得
    const getChildrenIds = (parentId: string): string[] => {
      const directChildren = flatCategories.filter(cat => cat.parentId === parentId);
      const childrenIds = directChildren.map(child => child.id);
      
      // 子カテゴリの子カテゴリも取得
      directChildren.forEach(child => {
        const grandChildrenIds = getChildrenIds(child.id);
        childrenIds.push(...grandChildrenIds);
      });
      
      return childrenIds;
    };
    
    const childrenIds = getChildrenIds(categoryId);
    const idsToRemove = [categoryId, ...childrenIds];
    
    // 削除確認
    if (childrenIds.length > 0) {
      if (!window.confirm(`このカテゴリには${childrenIds.length}個のサブカテゴリがあります。すべて削除してもよろしいですか？`)) {
        return;
      }
    } else {
      if (!window.confirm(`カテゴリ「${targetCategory.name}」を削除してもよろしいですか？`)) {
        return;
      }
    }
    
    // 実際はAPIで削除処理
    // ここではフロントエンドだけで処理
    const updatedFlatCategories = flatCategories.filter(cat => !idsToRemove.includes(cat.id));
    setFlatCategories(updatedFlatCategories);
    
    // 階層構造を再構築
    const updatedTree = buildCategoryTree(updatedFlatCategories);
    setCategories(updatedTree);
    
    setSuccessMessage(`カテゴリを削除しました`);
    
    // 一定時間後にメッセージをクリア
    setTimeout(() => {
      setSuccessMessage('');
    }, 3000);
  };
  
  // カテゴリの展開/折りたたみ切替
  const handleToggleExpand = (categoryId: string) => {
    const updateExpandState = (items: Category[]): Category[] => {
      return items.map(item => {
        if (item.id === categoryId) {
          return { ...item, isExpanded: !item.isExpanded };
        }
        if (item.children && item.children.length > 0) {
          return { ...item, children: updateExpandState(item.children) };
        }
        return item;
      });
    };
    
    setCategories(updateExpandState(categories));
  };
  
  // ドラッグ＆ドロップのハンドラー
  const handleDragStart = (category: Category) => {
    setIsDragging(true);
    setDraggedItem(category);
  };
  
  const handleDragOver = (e: React.DragEvent, category: Category) => {
    e.preventDefault();
    e.stopPropagation();
  };
  
  const handleDrop = (e: React.DragEvent, targetCategory: Category) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!draggedItem || draggedItem.id === targetCategory.id) {
      setIsDragging(false);
      setDraggedItem(null);
      return;
    }
    
    // 実際はAPIで更新処理
    // ここではフロントエンドだけで処理
    
    // ドラッグしたカテゴリが自分の親または先祖の場合は無効
    const isAncestor = (child: string, potentialParent: string): boolean => {
      const parent = flatCategories.find(cat => cat.id === child)?.parentId;
      if (!parent) return false;
      if (parent === potentialParent) return true;
      return isAncestor(parent, potentialParent);
    };
    
    if (isAncestor(targetCategory.id, draggedItem.id)) {
      alert('カテゴリを自身の子カテゴリに移動することはできません');
      setIsDragging(false);
      setDraggedItem(null);
      return;
    }
    
    // 同じ親の場合は順序の入れ替え、異なる親の場合は親の変更
    const updatedFlatCategories = flatCategories.map(cat => {
      if (cat.id === draggedItem.id) {
        // ドラッグ元の順序を更新
        const isSameParent = cat.parentId === targetCategory.parentId;
        
        if (isSameParent) {
          // 同じ親内での順序変更
          return { ...cat, order: targetCategory.order };
        } else {
          // 親の変更
          return { 
            ...cat, 
            parentId: targetCategory.parentId, 
            level: targetCategory.level,
            order: targetCategory.order 
          };
        }
      }
      
      // ドラッグ先以外のカテゴリで、同じ親を持つものの順序を調整
      if (cat.parentId === targetCategory.parentId && cat.id !== targetCategory.id) {
        // ドラッグ先の順序より大きい場合は+1
        if (cat.order >= targetCategory.order) {
          return { ...cat, order: cat.order + 1 };
        }
      }
      
      return cat;
    });
    
    setFlatCategories(updatedFlatCategories);
    
    // 階層構造を再構築
    const updatedTree = buildCategoryTree(updatedFlatCategories);
    setCategories(updatedTree);
    
    setIsDragging(false);
    setDraggedItem(null);
    setSuccessMessage('カテゴリの順序を更新しました');
    
    // 一定時間後にメッセージをクリア
    setTimeout(() => {
      setSuccessMessage('');
    }, 3000);
  };
  
  // 編集モードのキャンセル
  const handleCancelEdit = () => {
    setEditingCategory(null);
    setFormErrors({});
  };
  
  // カテゴリツリーの再帰的レンダリング
  const renderCategoryTree = (categoryItems: Category[], depth = 0) => {
    return categoryItems.map(category => (
      <div
        key={category.id}
        className={`category-item ${isDragging ? 'draggable' : ''} ${draggedItem && draggedItem.id === category.id ? 'dragging' : ''}`}
        style={{ marginLeft: `${depth * 20}px` }}
        draggable
        onDragStart={() => handleDragStart(category)}
        onDragOver={(e) => handleDragOver(e, category)}
        onDrop={(e) => handleDrop(e, category)}
      >
        <div className="category-content">
          {category.children && category.children.length > 0 && (
            <button
              className={`expand-button ${category.isExpanded ? 'expanded' : 'collapsed'}`}
              onClick={() => handleToggleExpand(category.id)}
            >
              {category.isExpanded ? '▼' : '►'}
            </button>
          )}
          
          {editingCategory && editingCategory.id === category.id ? (
            <div className="category-edit-form">
              <input
                type="text"
                name="name"
                value={editingCategory.name}
                onChange={handleInputChange}
                placeholder="カテゴリ名"
                className="form-control"
              />
              {formErrors.name && <div className="error-text">{formErrors.name}</div>}
              
              <div className="edit-actions">
                <button
                  type="button"
                  className="btn small primary"
                  onClick={handleUpdateCategory}
                >
                  保存
                </button>
                <button
                  type="button"
                  className="btn small"
                  onClick={handleCancelEdit}
                >
                  キャンセル
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="category-name">
                <span className="drag-handle">⋮⋮</span>
                {category.name}
              </div>
              
              <div className="category-actions">
                <button
                  className="btn-icon small"
                  onClick={() => handleEditCategory(category)}
                  title="編集"
                >
                  ✏️
                </button>
                <button
                  className="btn-icon small danger"
                  onClick={() => handleDeleteCategory(category.id)}
                  title="削除"
                >
                  🗑️
                </button>
              </div>
            </>
          )}
        </div>
        
        {category.children && category.children.length > 0 && category.isExpanded && (
          <div className="category-children">
            {renderCategoryTree(category.children, depth + 1)}
          </div>
        )}
      </div>
    ));
  };
  
  if (isLoading) {
    return <div className="loading">読み込み中...</div>;
  }
  
  return (
    <div className="category-management-page">
      <div className="page-actions">
        <h1>カテゴリ構成管理</h1>
      </div>

      {successMessage && (
        <div className="success-message">
          {successMessage}
        </div>
      )}
      
      <div className="category-management-container">
        <div className="category-tree-section">
          <h2>カテゴリ階層</h2>
          <div className="category-description">
            ドラッグ＆ドロップでカテゴリの順序を変更できます。
          </div>
          
          <div className="category-tree">
            {categories.length > 0 ? (
              renderCategoryTree(categories)
            ) : (
              <div className="empty-state">
                <p>カテゴリがありません。新しいカテゴリを追加してください。</p>
              </div>
            )}
          </div>
        </div>
        
        <div className="category-form-section">
          <h2>新規カテゴリ追加</h2>
          
          <form onSubmit={handleAddCategory} className="category-form">
            <div className="form-group">
              <label htmlFor="name">
                カテゴリ名 <span className="required">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={newCategoryForm.name}
                onChange={handleInputChange}
                placeholder="新しいカテゴリ名"
                className="form-control"
                required
              />
              {formErrors.name && <div className="error-text">{formErrors.name}</div>}
            </div>
            
            <div className="form-group">
              <label htmlFor="parentId">親カテゴリ</label>
              <select
                id="parentId"
                name="parentId"
                value={newCategoryForm.parentId}
                onChange={handleInputChange}
                className="form-control"
              >
                <option value="">ルートカテゴリ（親なし）</option>
                {flatCategories.map(category => (
                  <option key={category.id} value={category.id}>
                    {Array(category.level + 1).join('　')}
                    {category.name}
                  </option>
                ))}
              </select>
              <div className="form-text">
                親カテゴリを選択しない場合、ルートカテゴリとして追加されます。
              </div>
            </div>
            
            <div className="form-actions">
              <button
                type="submit"
                className="btn primary"
              >
                カテゴリを追加
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CategoryManagementPage;
