import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { finesAPI, readersAPI } from '../services/api';
import './Common.css';

const FinesList = () => {
  const navigate = useNavigate();
  const [fines, setFines] = useState([]);
  const [readers, setReaders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [finesRes, readersRes] = await Promise.all([finesAPI.getAll(), readersAPI.getAll()]);
      setFines(finesRes.data || []);
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

  const handlePay = async (id) => {
    try {
      await finesAPI.pay(id);
      setFines(fines.map(f => f.id === id ? { ...f, paid: true } : f));
    } catch (error) {
      console.error('Error:', error);
      alert('Ошибка при оплате');
    }
  };

  const filteredFines = fines.filter(fine => {
    if (statusFilter === 'paid') return fine.paid;
    if (statusFilter === 'unpaid') return !fine.paid;
    return true;
  });

  if (loading) return <div className="loading">Загрузка...</div>;

  return (
    <div className="list-page">
      <div className="page-header">
        <h1>Штрафы</h1>
        <button className="btn btn-primary" onClick={() => navigate('/fines/new')}>
          Добавить штраф
        </button>
      </div>
      <div className="filters">
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="filter-select">
          <option value="">Все штрафы</option>
          <option value="paid">Оплаченные</option>
          <option value="unpaid">Неоплаченные</option>
        </select>
      </div>
      <div className="table-container">
        <table className="data-table">
          <thead><tr><th>ID</th><th>Читатель</th><th>Сумма</th><th>Причина</th><th>Статус</th><th>Действия</th></tr></thead>
          <tbody>
            {filteredFines.length === 0 ? (
              <tr><td colSpan="6" className="no-data">Штрафы не найдены</td></tr>
            ) : (
              filteredFines.map(fine => (
                <tr key={fine.id}>
                  <td>{fine.id}</td><td>{getReaderName(fine.reader_id)}</td><td>{fine.amount} ₽</td>
                  <td>{fine.reason === 'overdue' ? 'Просрочка' : fine.reason === 'lost_book' ? 'Утерян' : fine.reason}</td>
                  <td><span className={`status-badge ${fine.paid ? 'available' : 'loaned'}`}>{fine.paid ? 'Оплачен' : 'Не оплачен'}</span></td>
                  <td>{!fine.paid && <button className="btn btn-sm btn-success" onClick={() => handlePay(fine.id)}>Оплата</button>}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FinesList;