import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { readersAPI, readerCategoriesAPI, studentsAPI, teachersAPI, oneTimeReadersAPI } from '../services/api';
import './Common.css';

const ReaderForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    last_name: '',
    first_name: '',
    middle_name: '',
    category_id: '',
    phone: '',
    email: '',
  });

  // Category-specific fields
  const [studentData, setStudentData] = useState({ faculty: '', course: '', group_number: '' });
  const [teacherData, setTeacherData] = useState({ department: '', degree: '', title: '' });
  const [oneTimeData, setOneTimeData] = useState({ reader_type: '', valid_until: '' });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCategories();
    if (isEdit) {
      fetchReader();
    }
  }, [id]);

  const fetchCategories = async () => {
    try {
      const res = await readerCategoriesAPI.getAll();
      setCategories(res.data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchReader = async () => {
    try {
      setLoading(true);
      const readerRes = await readersAPI.getById(id);
      const reader = readerRes.data;
      setFormData(reader);

      // Fetch category-specific data
      if (reader.category_id === 1) { // Student
        try {
          const res = await studentsAPI.getByReaderId(id);
          setStudentData(res.data || studentData);
        } catch (e) { /* not found */ }
      } else if (reader.category_id === 2) { // Teacher
        try {
          const res = await teachersAPI.getByReaderId(id);
          setTeacherData(res.data || teacherData);
        } catch (e) { /* not found */ }
      } else if (reader.category_id === 3) { // One-time
        try {
          const res = await oneTimeReadersAPI.getByReaderId(id);
          setOneTimeData(res.data || oneTimeData);
        } catch (e) { /* not found */ }
      }
    } catch (error) {
      console.error('Error fetching reader:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCategoryChange = (e) => {
    const categoryId = parseInt(e.target.value);
    setFormData(prev => ({ ...prev, category_id: categoryId }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      if (isEdit) {
        await readersAPI.update(id, formData);
        // Update category-specific data
        if (formData.category_id === 1) {
          await studentsAPI.update(id, studentData);
        } else if (formData.category_id === 2) {
          await teachersAPI.update(id, teacherData);
        } else if (formData.category_id === 3) {
          await oneTimeReadersAPI.update(id, oneTimeData);
        }
      } else {
        const res = await readersAPI.create(formData);
        const readerId = res.data.id;
        // Create category-specific data
        if (formData.category_id === 1) {
          await studentsAPI.create({ reader_id: readerId, ...studentData });
        } else if (formData.category_id === 2) {
          await teachersAPI.create({ reader_id: readerId, ...teacherData });
        } else if (formData.category_id === 3) {
          await oneTimeReadersAPI.create({ reader_id: readerId, ...oneTimeData });
        }
      }
      navigate('/readers');
    } catch (error) {
      console.error('Error saving reader:', error);
      alert('Ошибка при сохранении читателя');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !formData.last_name) {
    return <div className="loading">Загрузка...</div>;
  }

  return (
    <div className="form-page">
      <div className="page-header">
        <h1>{isEdit ? 'Редактирование читателя' : 'Новый читатель'}</h1>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-container">
          <h2 className="form-title">Основная информация</h2>
          <div className="form-grid">
            <div className="form-group">
              <label>Фамилия *</label>
              <input
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Имя *</label>
              <input
                type="text"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Отчество</label>
              <input
                type="text"
                name="middle_name"
                value={formData.middle_name}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label>Категория *</label>
              <select
                name="category_id"
                value={formData.category_id}
                onChange={handleCategoryChange}
                required
              >
                <option value="">Выберите категорию</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Телефон</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Category-specific fields */}
          {formData.category_id === 1 && (
            <>
              <h2 className="form-title" style={{ marginTop: '24px' }}>Данные студента</h2>
              <div className="form-grid">
                <div className="form-group">
                  <label>Факультет</label>
                  <input
                    type="text"
                    value={studentData.faculty}
                    onChange={(e) => setStudentData(prev => ({ ...prev, faculty: e.target.value }))}
                  />
                </div>
                <div className="form-group">
                  <label>Курс</label>
                  <input
                    type="number"
                    min="1"
                    max="6"
                    value={studentData.course}
                    onChange={(e) => setStudentData(prev => ({ ...prev, course: e.target.value }))}
                  />
                </div>
                <div className="form-group">
                  <label>Номер группы</label>
                  <input
                    type="text"
                    value={studentData.group_number}
                    onChange={(e) => setStudentData(prev => ({ ...prev, group_number: e.target.value }))}
                  />
                </div>
              </div>
            </>
          )}

          {formData.category_id === 2 && (
            <>
              <h2 className="form-title" style={{ marginTop: '24px' }}>Данные преподавателя</h2>
              <div className="form-grid">
                <div className="form-group">
                  <label>Кафедра</label>
                  <input
                    type="text"
                    value={teacherData.department}
                    onChange={(e) => setTeacherData(prev => ({ ...prev, department: e.target.value }))}
                  />
                </div>
                <div className="form-group">
                  <label>Ученая степень</label>
                  <select
                    value={teacherData.degree}
                    onChange={(e) => setTeacherData(prev => ({ ...prev, degree: e.target.value }))}
                  >
                    <option value="">Не указано</option>
                    <option value="кандидат">Кандидат наук</option>
                    <option value="доктор">Доктор наук</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Ученое звание</label>
                  <select
                    value={teacherData.title}
                    onChange={(e) => setTeacherData(prev => ({ ...prev, title: e.target.value }))}
                  >
                    <option value="">Не указано</option>
                    <option value="доцент">Доцент</option>
                    <option value="профессор">Профессор</option>
                  </select>
                </div>
              </div>
            </>
          )}

          {formData.category_id === 3 && (
            <>
              <h2 className="form-title" style={{ marginTop: '24px' }}>Данные разового читателя</h2>
              <div className="form-grid">
                <div className="form-group">
                  <label>Тип читателя</label>
                  <select
                    value={oneTimeData.reader_type}
                    onChange={(e) => setOneTimeData(prev => ({ ...prev, reader_type: e.target.value }))}
                  >
                    <option value="">Выберите тип</option>
                    <option value="Абитуриент">Абитуриент</option>
                    <option value="Стажёр">Стажёр</option>
                    <option value="Слушатель ФПК">Слушатель ФПК</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Действителен до</label>
                  <input
                    type="date"
                    value={oneTimeData.valid_until}
                    onChange={(e) => setOneTimeData(prev => ({ ...prev, valid_until: e.target.value }))}
                  />
                </div>
              </div>
            </>
          )}
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Сохранение...' : 'Сохранить'}
          </button>
          <button type="button" className="btn" onClick={() => navigate('/readers')}>
            Отмена
          </button>
        </div>
      </form>
    </div>
  );
};

export default ReaderForm;