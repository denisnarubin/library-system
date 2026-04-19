import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { loanBansAPI, readersAPI } from '../services/api';
import './Common.css';

const LoanBansList = () => {
  const navigate = useNavigate();
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

  const handleRevoke = async (banId) => {
    if (!window.confirm('Снять блокировку досрочно?')) return;
    
    try {
      await loanBansAPI.revoke(banId);
      fetchData();
    } catch (error) {
      console.error('Error revoking ban:', error);
      alert('Ошибка при снятии блокировки');
    }
  };

  if (loading) return <div className="loading">Загрузка...</div>;

  return (
    <div className="list-page">
      <div className="page-header">
        <h1>Блокировка читателя</h1>
        <button className="btn btn-primary" onClick={() => navigate('/loan-bans/new')}>
          Добавить блокировку
        </button>
      </div>
      <div className="table-container">
        <table className="data-table">
          <thead><tr><th>ID</th><th>Читатель</th><th>Начало</th><th>Конец</th><th>Причина</th><th>Статус</th><th></th></tr></thead>
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
                  <td>
                    {isActive(ban) && (
                      <button className="btn btn-sm btn-secondary" onClick={() => handleRevoke(ban.id)}>
                        Снять
                      </button>
                    )}
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

export default LoanBansList;