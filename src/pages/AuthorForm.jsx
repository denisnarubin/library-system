import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { authorsAPI } from '../services/api';
import './Common.css';

const AuthorForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const [formData, setFormData] = useState({ name: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isEdit) authorsAPI.getById(id).then(res => setFormData(res.data));
  }, [id]);

  const handleChange = (e) => setFormData(prev => ({ ...prev, name: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      if (isEdit) await authorsAPI.update(id, formData);
      else await authorsAPI.create(formData);
      navigate('/authors');
    } catch (error) {
      console.error('Error:', error);
      alert('Ошибка при сохранении');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-page">
      <div className="page-header"><h1>{isEdit ? 'Редактирование автора' : 'Новый автор'}</h1></div>
      <form onSubmit={handleSubmit}>
        <div className="form-container">
          <div className="form-grid">
            <div className="form-group"><label>ФИО *</label><input type="text" name="name" value={formData.name} onChange={handleChange} required /></div>
          </div>
        </div>
        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Сохранение...' : 'Сохранить'}</button>
          <button type="button" className="btn" onClick={() => navigate('/authors')}>Отмена</button>
        </div>
      </form>
    </div>
  );
};

export default AuthorForm;