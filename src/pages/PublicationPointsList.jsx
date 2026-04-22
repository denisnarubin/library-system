import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { publicationPointsAPI } from '../services/api';
import { useSorting } from '../hooks/useSorting';
import './Common.css';

const PublicationPointsList = () => {
  const [points, setPoints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [pointToDelete, setPointToDelete] = useState(null);
  const { handleSort, sortData, getSortIndicator } = useSorting('name', 'asc');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await publicationPointsAPI.getAll();
      setPoints(res.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!pointToDelete) return;
    try {
      await publicationPointsAPI.delete(pointToDelete);
      setPoints(points.filter(p => p.id !== pointToDelete));
      setShowDeleteModal(false);
    } catch (error) {
      console.error('Error deleting point:', error);
      alert('Ошибка при удалении');
    }
  };

  if (loading) return <div className="loading">Загрузка...</div>;

  return (
    <div className="list-page">
      <div className="page-header">
        <h1>Пункты выдачи</h1>
        <Link to="/publication-points/new" className="btn btn-primary">+ Добавить пункт</Link>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th onClick={() => handleSort('id')} style={{cursor: 'pointer'}}>ID{getSortIndicator('id')}</th>
              <th onClick={() => handleSort('name')} style={{cursor: 'pointer'}}>Название{getSortIndicator('name')}</th>
              <th onClick={() => handleSort('point_type')} style={{cursor: 'pointer'}}>Тип{getSortIndicator('point_type')}</th>
              <th onClick={() => handleSort('address')} style={{cursor: 'pointer'}}>Адрес{getSortIndicator('address')}</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {sortData(points).length === 0 ? (
              <tr><td colSpan="5" className="no-data">Пункты не найдены</td></tr>
            ) : (
              sortData(points).map(point => (
                <tr key={point.id}>
                  <td>{point.id}</td>
                  <td>{point.name}</td>
                  <td>
                    <span className={`status-badge ${point.point_type === 'abonement' ? 'available' : 'loaned'}`}>
                      {point.point_type === 'abonement' ? 'Абонемент' : 'Читальный зал'}
                    </span>
                  </td>
                  <td>{point.address || '-'}</td>
                  <td className="actions">
                    <Link to={`/publication-points/${point.id}`} className="btn btn-sm">Изменить</Link>
                    <button className="btn btn-sm btn-danger" onClick={() => { setPointToDelete(point.id); setShowDeleteModal(true); }}>Удалить</button>
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
            <p>Вы уверены, что хотите удалить этот пункт?</p>
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

export default PublicationPointsList;