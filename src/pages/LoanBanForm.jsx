import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { loanBansAPI, readersAPI } from '../services/api';
import './Common.css';

const LoanBanForm = () => {
  const navigate = useNavigate();

  const [readers, setReaders] = useState([]);
  const [formData, setFormData] = useState({
    reader_id: '',
    start_date: new Date().toISOString().split('T')[0],
    end_date: '',
    reason: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const readersRes = await readersAPI.getAll();
      setReaders(readersRes.data || []);
      
      // Set default end date (30 days from now)
      const defaultEnd = new Date();
      defaultEnd.setDate(defaultEnd.getDate() + 30);
      setFormData(prev => ({ ...prev, end_date: defaultEnd.toISOString().split('T')[0] }));
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
      await loanBansAPI.create(formData);
      navigate('/loan-bans');
    } catch (error) {
      console.error('Error saving loan ban:', error);
      alert('Ошибка при сохранении');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Загрузка...</div>;

  return (
    <div className="form-page">
      <div className="page-header">
        <h1>Блокировка читателя</h1>
        <button className="btn btn-secondary" onClick={() => navigate('/loan-bans')}>
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
              <label>Дата начала блокировки</label>
              <input
                type="date"
                name="start_date"
                value={formData.start_date}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Дата окончания блокировки</label>
              <input
                type="date"
                name="end_date"
                value={formData.end_date}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group full-width">
              <label>Причина блокировки</label>
                <textarea
                  name="reason"
                  value={formData.reason}
                  onChange={handleChange}
                  placeholder="Опишите причину блокировки..."
                  rows={3}
                  required
                />
            </div>

            <div className="form-group full-width">
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Сохранение...' : 'Заблокировать читателя'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoanBanForm;