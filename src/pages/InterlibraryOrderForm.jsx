import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { interlibraryOrdersAPI, readersAPI } from '../services/api';
import './Common.css';

const InterlibraryOrderForm = () => {
  const navigate = useNavigate();

  const [readers, setReaders] = useState([]);
  const [formData, setFormData] = useState({
    reader_id: '',
    book_title: '',
    author_name: '',
    order_date: new Date().toISOString().split('T')[0]
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const readersRes = await readersAPI.getAll();
      setReaders(readersRes.data || []);
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
      await interlibraryOrdersAPI.create(formData);
      navigate('/interlibrary-orders');
    } catch (error) {
      console.error('Error saving interlibrary order:', error);
      alert('Ошибка при сохранении');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Загрузка...</div>;

  return (
    <div className="form-page">
      <div className="page-header">
        <h1>Создать МБА заказ</h1>
        <button className="btn btn-secondary" onClick={() => navigate('/interlibrary-orders')}>
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
              <label>Название книги</label>
              <input
                type="text"
                name="book_title"
                value={formData.book_title}
                onChange={handleChange}
                placeholder="Введите название книги"
                required
              />
            </div>

            <div className="form-group">
              <label>Автор</label>
              <input
                type="text"
                name="author_name"
                value={formData.author_name}
                onChange={handleChange}
                placeholder="Введите автора"
                required
              />
            </div>

            <div className="form-group">
              <label>Дата заказа</label>
              <input
                type="date"
                name="order_date"
                value={formData.order_date}
                onChange={handleChange}
                required
              />
            </div>


            <div className="form-group full-width">
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Сохранение...' : 'Создать заказ'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InterlibraryOrderForm;