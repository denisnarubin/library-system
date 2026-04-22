import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { authorsAPI } from '../services/api';
import { useSorting } from '../hooks/useSorting';
import './Common.css';

const AuthorsList = () => {
  const [authors, setAuthors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const { handleSort, sortData, getSortIndicator } = useSorting('name', 'asc');

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await authorsAPI.getAll();
      setAuthors(res.data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;
    try {
      await authorsAPI.delete(itemToDelete);
      setAuthors(authors.filter(a => a.id !== itemToDelete));
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
        <h1>Авторы</h1>
        <Link to="/authors/new" className="btn btn-primary">+ Добавить автора</Link>
      </div>
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th onClick={() => handleSort('id')} style={{cursor: 'pointer'}}>ID{getSortIndicator('id')}</th>
              <th onClick={() => handleSort('name')} style={{cursor: 'pointer'}}>ФИО{getSortIndicator('name')}</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {sortData(authors).length === 0 ? (
              <tr><td colSpan="3" className="no-data">Авторы не найдены</td></tr>
            ) : (
              sortData(authors).map(author => (
                <tr key={author.id}>
                  <td>{author.id}</td><td>{author.name}</td>
                  <td className="actions">
                    <Link to={`/authors/${author.id}`} className="btn btn-sm">Изменить</Link>
                    <button className="btn btn-sm btn-danger" onClick={() => { setItemToDelete(author.id); setShowDeleteModal(true); }}>Удалить</button>
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
            <h3>Подтверждение удаления</h3><p>Вы уверены?</p>
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

export default AuthorsList;