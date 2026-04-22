import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { readerCategoriesAPI } from '../services/api';
import { useSorting } from '../hooks/useSorting';
import './Common.css';

const CategoriesList = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const { handleSort, sortData, getSortIndicator } = useSorting('name', 'asc');

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await readerCategoriesAPI.getAll();
      setCategories(res.data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;
    try {
      await readerCategoriesAPI.delete(itemToDelete);
      setCategories(categories.filter(c => c.id !== itemToDelete));
      setShowDeleteModal(false);
    } catch (error) {
      console.error('Error:', error);
      alert('Ошибка при удалении');
    }
  };

  if (loading) return <div className="loading">Загрузка...</div>;

  return (
    <div className="list-page">
      <div className="page-header">
        <h1>Категории читателей</h1>
        <Link to="/categories/new" className="btn btn-primary">+ Добавить категорию</Link>
      </div>
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th onClick={() => handleSort('id')} style={{cursor: 'pointer'}}>ID{getSortIndicator('id')}</th>
              <th onClick={() => handleSort('name')} style={{cursor: 'pointer'}}>Название{getSortIndicator('name')}</th>
              <th onClick={() => handleSort('max_books_abonement')} style={{cursor: 'pointer'}}>Макс. книг{getSortIndicator('max_books_abonement')}</th>
              <th onClick={() => handleSort('loan_days')} style={{cursor: 'pointer'}}>Срок (дней){getSortIndicator('loan_days')}</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {sortData(categories).length === 0 ? (
              <tr><td colSpan="5" className="no-data">Категории не найдены</td></tr>
            ) : (
              sortData(categories).map(cat => (
                <tr key={cat.id}>
                  <td>{cat.id}</td><td>{cat.name}</td><td>{cat.max_books_abonement || '∞'}</td><td>{cat.loan_days || '-'}</td>
                  <td className="actions">
                    <Link to={`/categories/${cat.id}`} className="btn btn-sm">Изменить</Link>
                    <button className="btn btn-sm btn-danger" onClick={() => { setItemToDelete(cat.id); setShowDeleteModal(true); }}>Удалить</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {showDeleteModal && (
        <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Подтверждение удаления</h3>
            <p>Вы уверены?</p>
            <div className="modal-actions">
              <button className="btn btn-danger" onClick={handleDelete}>Удалить</button>
              <button className="btn" onClick={() => setShowDeleteModal(false)}>Отмена</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoriesList;