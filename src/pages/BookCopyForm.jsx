import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { bookCopiesAPI, booksAPI, publicationPointsAPI } from '../services/api';
import './Common.css';

const BookCopyForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [books, setBooks] = useState([]);
  const [points, setPoints] = useState([]);
  const [formData, setFormData] = useState({
    book_id: '',
    point_id: '',
    inventory_number: '',
    status: 'available',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchData();
    if (isEdit) fetchCopy();
  }, [id]);

  const fetchData = async () => {
    try {
      const [booksRes, pointsRes] = await Promise.all([
        booksAPI.getAll(),
        publicationPointsAPI.getAll(),
      ]);
      setBooks(booksRes.data || []);
      setPoints(pointsRes.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const fetchCopy = async () => {
    try {
      setLoading(true);
      const res = await bookCopiesAPI.getById(id);
      setFormData(res.data);
    } catch (error) {
      console.error('Error fetching copy:', error);
    } finally {
      setLoading(false);
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
      if (isEdit) {
        await bookCopiesAPI.update(id, formData);
      } else {
        await bookCopiesAPI.create(formData);
      }
      navigate('/book-copies');
    } catch (error) {
      console.error('Error saving copy:', error);
      alert('Ошибка при сохранении экземпляра');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !formData.inventory_number) return <div className="loading">Загрузка...</div>;

  return (
    <div className="form-page">
      <div className="page-header">
        <h1>{isEdit ? 'Редактирование экземпляра' : 'Новый экземпляр книги'}</h1>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-container">
          <h2 className="form-title">Информация об экземпляре</h2>
          <div className="form-grid">
            <div className="form-group full-width">
              <label>Книга *</label>
              <select
                name="book_id"
                value={formData.book_id}
                onChange={handleChange}
                required
              >
                <option value="">Выберите книгу</option>
                {books.sort((a,b) => a.title.localeCompare(b.title)).map(book => (
                  <option key={book.id} value={book.id}>{book.title}</option>
                ))}
              </select>
            </div>
            
            <div className="form-group full-width">
              <label>Пункт выдачи *</label>
              <select
                name="point_id"
                value={formData.point_id}
                onChange={handleChange}
                required
              >
                <option value="">Выберите пункт выдачи</option>
                {points.map(point => (
                  <option key={point.id} value={point.id}>{point.name}</option>
                ))}
              </select>
            </div>
            
            <div className="form-group">
              <label>Инвентарный номер *</label>
              <input
                type="text"
                name="inventory_number"
                value={formData.inventory_number}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label>Статус</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
              >
                <option value="available">Доступен</option>
                <option value="loaned">Выдан</option>
                <option value="lost">Утерян</option>
              </select>
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Сохранение...' : 'Сохранить'}
          </button>
          <button type="button" className="btn" onClick={() => navigate('/book-copies')}>
            Отмена
          </button>
        </div>
      </form>
    </div>
  );
};

export default BookCopyForm;