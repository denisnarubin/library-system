import { useState, useEffect } from 'react';
import { lostBooksAPI, readersAPI } from '../services/api';
import './Common.css';

const LostBooksList = () => {
  const [lostBooks, setLostBooks] = useState([]);
  const [readers, setReaders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [lostRes, readersRes] = await Promise.all([lostBooksAPI.getAll(), readersAPI.getAll()]);
      setLostBooks(lostRes.data || []);
      setReaders(readersRes.data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getReaderName = (readerId) => {
    const reader = readers.find(r => r.id === readerId);
    return reader ? `${reader.last_name} ${reader.first_name}` : '-';
  };

  const handleCompensate = async (id) => {
    try {
      await lostBooksAPI.markCompensated(id);
      setLostBooks(lostBooks.map(l => l.id === id ? { ...l, compensated: true } : l));
    } catch (error) {
      console.error('Error:', error);
    }
  };

  if (loading) return <div className="loading">Загрузка...</div>;

  return (
    <div className="list-page">
      <div className="page-header"><h1>Утерянные книги</h1></div>
      <div className="table-container">
        <table className="data-table">
          <thead><tr><th>ID</th><th>Читатель</th><th>Дата утери</th><th>Компенсация</th><th>Сумма</th><th>Действия</th></tr></thead>
          <tbody>
            {lostBooks.length === 0 ? (
              <tr><td colSpan="6" className="no-data">Утерянных книг не найдено</td></tr>
            ) : (
              lostBooks.map(lost => (
                <tr key={lost.id}>
                  <td>{lost.id}</td><td>{getReaderName(lost.reader_id)}</td>
                  <td>{lost.loss_date ? new Date(lost.loss_date).toLocaleDateString('ru-RU') : '-'}</td>
                  <td><span className={`status-badge ${lost.compensated ? 'available' : 'loaned'}`}>{lost.compensated ? 'Да' : 'Нет'}</span></td>
                  <td>{lost.compensation_amount ? `${lost.compensation_amount} ₽` : '-'}</td>
                  <td>{!lost.compensated && <button className="btn btn-sm btn-success" onClick={() => handleCompensate(lost.id)}>Отметить</button>}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LostBooksList;