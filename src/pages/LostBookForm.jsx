import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { lostBooksAPI, bookCopiesAPI, bookLoansAPI, readersAPI } from '../services/api';
import './Common.css';

const LostBookForm = () => {
  const navigate = useNavigate();

  const [readers, setReaders] = useState([]);
  const [copies, setCopies] = useState([]);
  const [loans, setLoans] = useState([]);
  const [formData, setFormData] = useState({
    copy_id: '',
    reader_id: '',
    loan_id: '',
    loss_date: new Date().toISOString().split('T')[0],
    compensation_amount: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [readersRes, copiesRes, loansRes] = await Promise.all([
        readersAPI.getAll(),
        bookCopiesAPI.getAll(),
        bookLoansAPI.getAll()
      ]);
      setReaders(readersRes.data || []);
      setCopies(copiesRes.data || []);
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
        loan_id: formData.loan_id || null,
        compensation_amount: formData.compensation_amount || null
      };
      await lostBooksAPI.create(dataToSend);
      navigate('/lost-books');
    } catch (error) {
      console.error('Error saving lost book:', error);
      alert('Ошибка при сохранении');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Загрузка...</div>;

  return (
    <div className="form-page">
      <div className="page-header">
        <h1>Регистрация утерянной книги</h1>
        <button className="btn btn-secondary" onClick={() => navigate('/lost-books')}>
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
              <label>Экземпляр книги</label>
              <select
                name="copy_id"
                value={formData.copy_id}
                onChange={handleChange}
                required
              >
                <option value="">Выберите экземпляр...</option>
                {copies.map(copy => (
                  <option key={copy.id} value={copy.id}>
                    #{copy.inventory_number} - {
                      copy.status === 'available' ? 'Доступна' :
                      copy.status === 'loaned' ? 'Выдана' :
                      copy.status === 'lost' ? 'Утеряна' : copy.status
                    }
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
                {loans.map(loan => (
                  <option key={loan.id} value={loan.id}>
                    Заказ #{loan.id} - {new Date(loan.loan_date).toLocaleDateString()}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Дата потери</label>
              <input
                type="date"
                name="loss_date"
                value={formData.loss_date}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Сумма компенсации</label>
              <input
                type="number"
                name="compensation_amount"
                value={formData.compensation_amount}
                onChange={handleChange}
                placeholder="0.00"
                min="0"
                step="0.01"
              />
            </div>

            <div className="form-group full-width">
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Сохранение...' : 'Зарегистрировать потерю'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LostBookForm;