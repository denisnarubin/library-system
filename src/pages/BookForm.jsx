import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { booksAPI, authorsAPI } from '../services/api';
import './Common.css';

const BookForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [authors, setAuthors] = useState([]);
  const [newAuthorName, setNewAuthorName] = useState('');
  const [showNewAuthorInput, setShowNewAuthorInput] = useState(false);
const [formData, setFormData] = useState({
    title: '',
    publisher: '',
    year_published: '',
    year_arrived: '',
    isbn: '',
  });
  const [selectedAuthors, setSelectedAuthors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

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
    setTouched(prev => ({ ...prev, [name]: true }));
    
    // Валидация в реальном времени при вводе
    const error = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const handleAuthorToggle = (authorId) => {
    setSelectedAuthors(prev => 
      prev.includes(authorId) 
        ? prev.filter(id => id !== authorId)
        : [...prev, authorId]
    );
  };

  const handleAddNewAuthor = async () => {
    if (!newAuthorName.trim()) return;
    
    try {
      setLoading(true);
      const res = await authorsAPI.create({ name: newAuthorName.trim() });
      const newAuthor = res.data;
      setAuthors(prev => [...prev, newAuthor]);
      setSelectedAuthors(prev => [...prev, newAuthor.id]);
      setNewAuthorName('');
      setShowNewAuthorInput(false);
    } catch (error) {
      console.error('Error creating author:', error);
      alert('Ошибка при создании автора');
    } finally {
      setLoading(false);
    }
  };

const validateField = (name, value) => {
    switch (name) {
      case 'title':
        if (!value.trim()) return 'Название обязательно';
        if (value.trim().length < 2) return 'Название слишком короткое';
        if (/\d/.test(value.trim())) return 'Название не должно содержать цифры';
        return '';
      case 'publisher':
        if (value.trim().length > 0 && value.trim().length < 2) return 'Название издательства слишком короткое';
        if (/\d/.test(value.trim())) return 'Название издательства не должно содержать цифры';
        return '';
      case 'year_published':
        if (value && (value < 1800 || value > new Date().getFullYear())) return 'Недопустимый год издания';
        return '';
      case 'year_arrived':
        if (value && (value < 1800 || value > new Date().getFullYear())) return 'Недопустимый год поступления';
        return '';
      case 'isbn':
        if (value.trim().length > 0 && !/^\d{10}(\d{3})?$/.test(value.trim())) return 'Недопустимый ISBN (10 или 13 цифр)';
        return '';
      default:
        return '';
    }
  };

  const validateForm = () => {
    const newErrors = {};
    const allTouched = {};
    
    Object.keys(formData).forEach(field => {
      allTouched[field] = true;
      const error = validateField(field, formData[field]);
      if (error) newErrors[field] = error;
    });
    
    setTouched(allTouched);
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const isFormValid = validateForm();
    if (!isFormValid) {
      return;
    }
    try {
      setLoading(true);
      if (isEdit) {
        await booksAPI.update(id, formData);
      } else {
        await booksAPI.create(formData);
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
              {errors.title && touched.title && (
                <span className="error">{errors.title}</span>
              )}
            </div>
            <div className="form-group">
<label>Издательство</label>
              <input
                type="text"
                name="publisher"
                value={formData.publisher}
                onChange={handleChange}
              />
              {errors.publisher && touched.publisher && (
                <span className="error">{errors.publisher}</span>
              )}
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
              {errors.year_published && touched.year_published && (
                <span className="error">{errors.year_published}</span>
              )}
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
              {errors.year_arrived && touched.year_arrived && (
                <span className="error">{errors.year_arrived}</span>
              )}
            </div>
            <div className="form-group">
<label>ISBN</label>
              <input
                type="text"
                name="isbn"
                value={formData.isbn}
                onChange={handleChange}
              />
              {errors.isbn && touched.isbn && (
                <span className="error">{errors.isbn}</span>
              )}
            </div>
            
            {/* Authors Section */}
            <div className="form-group full-width">
<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <label style={{ margin: 0 }}>Авторы</label>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
                {authors.length === 0 ? (
                  <span style={{ color: '#95a5a6', fontStyle: 'italic' }}>Нет доступных авторов</span>
                ) : (
                  authors.map(author => (
                    <label 
                      key={author.id} 
                      style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '4px',
                        padding: '4px 8px',
                        backgroundColor: selectedAuthors.includes(author.id) ? '#d4edda' : '#f8f9fa',
                        border: selectedAuthors.includes(author.id) ? '1px solid #27ae60' : '1px solid #e0e0e0',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '0.85rem'
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={selectedAuthors.includes(author.id)}
                        onChange={() => handleAuthorToggle(author.id)}
                        style={{ cursor: 'pointer', accentColor: '#27ae60' }}
                      />
                      {author.name}
                    </label>
                  ))
                )}
              </div>
<div style={{ display: 'flex', justifyContent: 'flex-start', gap: '8px', marginTop: '12px' }}>
                {!showNewAuthorInput && (
                  <button 
                    type="button" 
                    className="btn btn-primary btn-lg"
                    onClick={() => setShowNewAuthorInput(true)}
                    style={{ width: 'auto', display: 'inline-block', padding: '12px 24px', fontSize: '1.1rem' }}
                  >
                    + Новый автор
                  </button>
                )}
              </div>
              
              {/* Add New Author Input */}
              {showNewAuthorInput && (
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <input
                    type="text"
                    value={newAuthorName}
                    onChange={(e) => setNewAuthorName(e.target.value)}
                    placeholder="Введите имя нового автора"
                    style={{ flex: 1, padding: '8px 12px', border: '1px solid #ddd', borderRadius: '4px' }}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddNewAuthor())}
                  />
                  <button 
                    type="button" 
                    className="btn btn-primary btn-sm"
                    onClick={handleAddNewAuthor}
                    disabled={loading || !newAuthorName.trim()}
                  >
                    Добавить
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-sm"
                    onClick={() => {
                      setShowNewAuthorInput(false);
                      setNewAuthorName('');
                    }}
                  >
                    Отмена
                  </button>
                </div>
              )}
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