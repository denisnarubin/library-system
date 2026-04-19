import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { finesAPI, readersAPI, bookLoansAPI } from '../services/api';
import './Common.css';

const FineForm = () => {
  const navigate = useNavigate();

  const [readers, setReaders] = useState([]);
  const [loans, setLoans] = useState([]);
  const [formData, setFormData] = useState({
    reader_id: '',
    loan_id: '',
    amount: '',
    reason: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [readersRes, loansRes] = await Promise.all([
        readersAPI.getAll(),
        bookLoansAPI.getAll()
      ]);
      setReaders(readersRes.data || []);
      setLoans(loansRes.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const dataToSend = {
        ...formData,
        loan_id: formData.loan_id || null
      };
      await finesAPI.create(dataToSend);
      navigate('/fines');
    } catch (error) {
      console.error('Error saving fine:', error);
      alert('Ошибка при сохранении');
    } finally {
      setLoading(false);
    }
  };

  const getReaderName = (readerId) => {
    const reader = readers.find(r => r.id === parseInt(readerId));
    return reader ? `${reader.last_name} ${reader.first_name}` : '';
  };

  if (loading) return <div className="loading">Загрузка...</div>;

  return (
    <div className="form-page">
      <div className="page-header">
        <h1>Добавить штраф</h1>
        <button className="btn btn-secondary" onClick={() => navigate('/fines')}>
          Назад
        </button>
      </div>

      <div className="form-container">
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group">
              <label>Читатель</label>
              <select
                name="reader_id"
                value={formData.reader_id}
                onChange={handleChange}
                required
              >
                <option value="">Выберите читателя...</option>
                {readers.map(reader => (
                  <option key={reader.id} value={reader.id}>
                    {reader.last_name} {reader.first_name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Связанный заказ</label>
              <select
                name="loan_id"
                value={formData.loan_id}
                onChange={handleChange}
              >
                <option value="">Не привязан</option>
                {loans.filter(l => l.reader_id === parseInt(formData.reader_id) || !formData.reader_id).map(loan => (
                  <option key={loan.id} value={loan.id}>
                    Заказ #{loan.id} - {new Date(loan.loan_date).toLocaleDateString()}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Сумма штрафа</label>
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                placeholder="0.00"
                min="0"
                step="0.01"
                required
              />
            </div>

            <div className="form-group full-width">
              <label>Причина</label>
              <textarea
                name="reason"
                value={formData.reason}
                onChange={handleChange}
                placeholder="Опишите причину штрафа..."
                rows={3}
              />
            </div>

            <div className="form-group full-width">
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Сохранение...' : 'Сохранить'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FineForm;