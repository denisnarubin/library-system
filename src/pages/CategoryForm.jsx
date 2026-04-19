import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { readerCategoriesAPI } from '../services/api';
import './Common.css';

const CategoryForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const [formData, setFormData] = useState({ name: '', max_books_abonement: '', loan_days: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isEdit) {
      readerCategoriesAPI.getById(id).then(res => setFormData(res.data));
    }
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      if (isEdit) await readerCategoriesAPI.update(id, formData);
      else await readerCategoriesAPI.create(formData);
      navigate('/categories');
    } catch (error) {
      console.error('Error:', error);
      alert('Ошибка при сохранении');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-page">
      <div className="page-header">
        <h1>{isEdit ? 'Редактирование категории' : 'Новая категория'}</h1>
      </div>
      <form onSubmit={handleSubmit}>
        <div className="form-container">
          <div className="form-grid">
            <div className="form-group"><label>Название *</label><input type="text" name="name" value={formData.name} onChange={handleChange} required /></div>
            <div className="form-group"><label>Макс. книг на абонементе</label><input type="number" name="max_books_abonement" value={formData.max_books_abonement} onChange={handleChange} /></div>
            <div className="form-group"><label>Срок пользования (дней)</label><input type="number" name="loan_days" value={formData.loan_days} onChange={handleChange} /></div>
          </div>
        </div>
        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Сохранение...' : 'Сохранить'}</button>
          <button type="button" className="btn" onClick={() => navigate('/categories')}>Отмена</button>
        </div>
      </form>
    </div>
  );
};

export default CategoryForm;