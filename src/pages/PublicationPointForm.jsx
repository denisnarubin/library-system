import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { publicationPointsAPI } from '../services/api';
import './Common.css';

const PublicationPointForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [formData, setFormData] = useState({
    name: '',
    point_type: '',
    address: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isEdit) fetchPoint();
  }, [id]);

  const fetchPoint = async () => {
    try {
      setLoading(true);
      const res = await publicationPointsAPI.getById(id);
      setFormData(res.data);
    } catch (error) {
      console.error('Error fetching point:', error);
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
        await publicationPointsAPI.update(id, formData);
      } else {
        await publicationPointsAPI.create(formData);
      }
      navigate('/publication-points');
    } catch (error) {
      console.error('Error saving point:', error);
      alert('Ошибка при сохранении');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !formData.name) return <div className="loading">Загрузка...</div>;

  return (
    <div className="form-page">
      <div className="page-header">
        <h1>{isEdit ? 'Редактирование пункта' : 'Новый пункт выдачи'}</h1>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-container">
          <div className="form-grid">
            <div className="form-group">
              <label>Название *</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Тип *</label>
              <select name="point_type" value={formData.point_type} onChange={handleChange} required>
                <option value="">Выберите тип</option>
                <option value="abonement">Абонемент</option>
                <option value="reading_hall">Читальный зал</option>
              </select>
            </div>
            <div className="form-group full-width">
              <label>Адрес</label>
              <input type="text" name="address" value={formData.address} onChange={handleChange} />
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Сохранение...' : 'Сохранить'}
          </button>
          <button type="button" className="btn" onClick={() => navigate('/publication-points')}>Отмена</button>
        </div>
      </form>
    </div>
  );
};

export default PublicationPointForm;