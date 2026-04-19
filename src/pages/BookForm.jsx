import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { booksAPI, authorsAPI } from '../services/api';
import './Common.css';

const BookForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [authors, setAuthors] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    publisher: '',
    year_published: '',
    year_arrived: '',
    isbn: '',
  });
  const [selectedAuthors, setSelectedAuthors] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAuthors();
    if (isEdit) fetchBook();
  }, [id]);

  const fetchAuthors = async () => {
    try {
      const res = await authorsAPI.getAll();
      setAuthors(res.data || []);
    } catch (error) {
      console.error('Error fetching authors:', error);
    }
  };

  const fetchBook = async () => {
    try {
      setLoading(true);
      const res = await booksAPI.getById(id);
      setFormData(res.data);
    } catch (error) {
      console.error('Error fetching book:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAuthorToggle = (authorId) => {
    setSelectedAuthors(prev => 
      prev.includes(authorId) 
        ? prev.filter(id => id !== authorId)
        : [...prev, authorId]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      if (isEdit) {
        await booksAPI.update(id, formData);
      } else {
        const res = await booksAPI.create(formData);
        // Could add author associations here
      }
      navigate('/books');
    } catch (error) {
      console.error('Error saving book:', error);
      alert('Ошибка при сохранении книги');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !formData.title) return <div className="loading">Загрузка...</div>;

  return (
    <div className="form-page">
      <div className="page-header">
        <h1>{isEdit ? 'Редактирование книги' : 'Новая книга'}</h1>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-container">
          <h2 className="form-title">Информация о книге</h2>
          <div className="form-grid">
            <div className="form-group full-width">
              <label>Название *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Издательство</label>
              <input
                type="text"
                name="publisher"
                value={formData.publisher}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label>Год издания</label>
              <input
                type="number"
                name="year_published"
                value={formData.year_published}
                onChange={handleChange}
                min="1800"
                max={new Date().getFullYear()}
              />
            </div>
            <div className="form-group">
              <label>Год поступления</label>
              <input
                type="number"
                name="year_arrived"
                value={formData.year_arrived}
                onChange={handleChange}
                min="1800"
                max={new Date().getFullYear()}
              />
            </div>
            <div className="form-group">
              <label>ISBN</label>
              <input
                type="text"
                name="isbn"
                value={formData.isbn}
                onChange={handleChange}
              />
            </div>
            <div className="form-group full-width">
              <label>Авторы</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '8px' }}>
                {authors.map(author => (
                  <label key={author.id} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <input
                      type="checkbox"
                      checked={selectedAuthors.includes(author.id)}
                      onChange={() => handleAuthorToggle(author.id)}
                    />
                    {author.name}
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Сохранение...' : 'Сохранить'}
          </button>
          <button type="button" className="btn" onClick={() => navigate('/books')}>
            Отмена
          </button>
        </div>
      </form>
    </div>
  );
};

export default BookForm;