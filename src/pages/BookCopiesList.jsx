import { useState, useEffect } from 'react';
import { bookCopiesAPI, booksAPI, publicationPointsAPI } from '../services/api';
import './Common.css';

const BookCopiesList = () => {
  const [copies, setCopies] = useState([]);
  const [books, setBooks] = useState([]);
  const [points, setPoints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [copiesRes, booksRes, pointsRes] = await Promise.all([
        bookCopiesAPI.getAll(),
        booksAPI.getAll(),
        publicationPointsAPI.getAll(),
      ]);
      setCopies(copiesRes.data || []);
      setBooks(booksRes.data || []);
      setPoints(pointsRes.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCopies = copies.filter(copy => {
    const book = books.find(b => b.id === copy.book_id);
    const matchesSearch = search === '' || 
      book?.title.toLowerCase().includes(search.toLowerCase()) ||
      copy.inventory_number?.includes(search);
    const matchesStatus = statusFilter === '' || copy.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getBookTitle = (bookId) => books.find(b => b.id === bookId)?.title || '-';
  const getPointName = (pointId) => points.find(p => p.id === pointId)?.name || '-';

  if (loading) return <div className="loading">Загрузка...</div>;

  return (
    <div className="list-page">
      <div className="page-header">
        <h1>Экземпляры книг</h1>
      </div>

      <div className="filters">
        <input
          type="text"
          placeholder="Поиск по названию или инвентарному номеру..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="search-input"
        />
        <select 
          value={statusFilter} 
          onChange={(e) => setStatusFilter(e.target.value)}
          className="filter-select"
        >
          <option value="">Все статусы</option>
          <option value="available">Доступен</option>
          <option value="loaned">Выдан</option>
          <option value="lost">Утерян</option>
        </select>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Инвентарный номер</th>
              <th>Книга</th>
              <th>Пункт выдачи</th>
              <th>Статус</th>
            </tr>
          </thead>
          <tbody>
            {filteredCopies.length === 0 ? (
              <tr><td colSpan="5" className="no-data">Экземпляры не найдены</td></tr>
            ) : (
              filteredCopies.map(copy => (
                <tr key={copy.id}>
                  <td>{copy.id}</td>
                  <td>{copy.inventory_number}</td>
                  <td>{getBookTitle(copy.book_id)}</td>
                  <td>{getPointName(copy.point_id)}</td>
                  <td>
                    <span className={`status-badge ${copy.status}`}>
                      {copy.status === 'available' && 'Доступен'}
                      {copy.status === 'loaned' && 'Выдан'}
                      {copy.status === 'lost' && 'Утерян'}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BookCopiesList;