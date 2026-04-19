import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { readersAPI, readerCategoriesAPI } from '../services/api';
import './Common.css';

const ReadersList = () => {
  const [readers, setReaders] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [readerToDelete, setReaderToDelete] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [readersRes, categoriesRes] = await Promise.all([
        readersAPI.getAll(),
        readerCategoriesAPI.getAll(),
      ]);
      setReaders(readersRes.data || []);
      setCategories(categoriesRes.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!readerToDelete) return;
    try {
      await readersAPI.delete(readerToDelete);
      setReaders(readers.filter(r => r.id !== readerToDelete));
      setShowDeleteModal(false);
    } catch (error) {
      console.error('Error deleting reader:', error);
      alert('Ошибка при удалении читателя');
    }
  };

  const filteredReaders = readers.filter(reader => {
    const matchesSearch = search === '' || 
      `${reader.last_name} ${reader.first_name} ${reader.middle_name}`.toLowerCase().includes(search.toLowerCase()) ||
      reader.phone?.includes(search) ||
      reader.email?.toLowerCase().includes(search.toLowerCase());
    
    const matchesCategory = categoryFilter === '' || reader.category_id === parseInt(categoryFilter);
    
    return matchesSearch && matchesCategory;
  });

  const getCategoryName = (categoryId) => {
    const category = categories.find(c => c.id === categoryId);
    return category?.name || 'Не указано';
  };

  if (loading) return <div className="loading">Загрузка...</div>;

  return (
    <div className="list-page">
      <div className="page-header">
        <h1>Читатели</h1>
        <Link to="/readers/new" className="btn btn-primary">+ Добавить читателя</Link>
      </div>

      <div className="filters">
        <input
          type="text"
          placeholder="Поиск по ФИО, телефону, email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="search-input"
        />
        <select 
          value={categoryFilter} 
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="filter-select"
        >
          <option value="">Все категории</option>
          {categories.map(cat => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>ФИО</th>
              <th>Категория</th>
              <th>Телефон</th>
              <th>Email</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {filteredReaders.length === 0 ? (
              <tr>
                <td colSpan="6" className="no-data">Читатели не найдены</td>
              </tr>
            ) : (
              filteredReaders.map(reader => (
                <tr key={reader.id}>
                  <td>{reader.id}</td>
                  <td>{`${reader.last_name} ${reader.first_name} ${reader.middle_name || ''}`}</td>
                  <td>{getCategoryName(reader.category_id)}</td>
                  <td>{reader.phone || '-'}</td>
                  <td>{reader.email || '-'}</td>
                  <td className="actions">
                    <Link to={`/readers/${reader.id}`} className="btn btn-sm">Изменить</Link>
                    <button 
                      className="btn btn-sm btn-danger"
                      onClick={() => { setReaderToDelete(reader.id); setShowDeleteModal(true); }}
                    >
                      Удалить
                    </button>
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
            <p>Вы уверены, что хотите удалить этого читателя?</p>
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

export default ReadersList;