import { useState, useEffect } from 'react';
import { loanBansAPI, readersAPI } from '../services/api';
import './Common.css';

const LoanBansList = () => {
  const [bans, setBans] = useState([]);
  const [readers, setReaders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [bansRes, readersRes] = await Promise.all([loanBansAPI.getAll(), readersAPI.getAll()]);
      setBans(bansRes.data || []);
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

  const isActive = (ban) => {
    const now = new Date();
    return new Date(ban.start_date) <= now && new Date(ban.end_date) >= now;
  };

  if (loading) return <div className="loading">Загрузка...</div>;

  return (
    <div className="list-page">
      <div className="page-header"><h1>Лишение права пользования</h1></div>
      <div className="table-container">
        <table className="data-table">
          <thead><tr><th>ID</th><th>Читатель</th><th>Начало</th><th>Конец</th><th>Причина</th><th>Статус</th></tr></thead>
          <tbody>
            {bans.length === 0 ? (
              <tr><td colSpan="6" className="no-data">Записей не найдено</td></tr>
            ) : (
              bans.map(ban => (
                <tr key={ban.id}>
                  <td>{ban.id}</td><td>{getReaderName(ban.reader_id)}</td>
                  <td>{new Date(ban.start_date).toLocaleDateString('ru-RU')}</td>
                  <td>{new Date(ban.end_date).toLocaleDateString('ru-RU')}</td>
                  <td>{ban.reason || '-'}</td>
                  <td><span className={`status-badge ${isActive(ban) ? 'loaned' : 'available'}`}>{isActive(ban) ? 'Активен' : 'Истёк'}</span></td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LoanBansList;