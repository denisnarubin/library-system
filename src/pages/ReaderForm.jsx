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
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

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
        } catch { /* not found */ }
      } else if (reader.category_id === 2) { // Teacher
        try {
          const res = await teachersAPI.getByReaderId(id);
          setTeacherData(res.data || teacherData);
        } catch { /* not found */ }
      } else if (reader.category_id === 3) { // One-time
        try {
          const res = await oneTimeReadersAPI.getByReaderId(id);
          setOneTimeData(res.data || oneTimeData);
        } catch { /* not found */ }
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
    setTouched(prev => ({ ...prev, [name]: true }));
    
    // Валидация в реальном времени при вводе
    const error = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const handleCategoryChange = (e) => {
    const categoryId = parseInt(e.target.value);
    setFormData(prev => ({ ...prev, category_id: categoryId }));
  };

const validateField = (name, value) => {
    switch (name) {
      case 'last_name':
        if (!value.trim()) return 'Фамилия обязательна';
        if (value.trim().length < 2) return 'Фамилия слишком короткая';
        if (/\d/.test(value.trim())) return 'Фамилия не должна содержать цифры';
        return '';
      case 'first_name':
        if (!value.trim()) return 'Имя обязательно';
        if (value.trim().length < 2) return 'Имя слишком короткое';
        if (/\d/.test(value.trim())) return 'Имя не должно содержать цифры';
        return '';
      case 'middle_name':
        if (value.trim().length > 0 && value.trim().length < 2) return 'Отчество слишком короткое';
        if (/\d/.test(value.trim())) return 'Отчество не должно содержать цифры';
        return '';
      case 'category_id':
        if (!value) return 'Категория обязательна';
        return '';
      case 'phone':
        if (value.trim().length > 0 && !/^\+?\d{10,15}$/.test(value.trim().replace(/\s/g, ''))) return 'Недопустимый формат телефона';
        return '';
      case 'email':
        if (value.trim().length > 0 && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) return 'Недопустимый формат email';
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
              {errors.last_name && touched.last_name && (
                <span className="error">{errors.last_name}</span>
              )}
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
              {errors.first_name && touched.first_name && (
                <span className="error">{errors.first_name}</span>
              )}
            </div>
            <div className="form-group">
<label>Отчество</label>
              <input
                type="text"
                name="middle_name"
                value={formData.middle_name}
                onChange={handleChange}
              />
              {errors.middle_name && touched.middle_name && (
                <span className="error">{errors.middle_name}</span>
              )}
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
              {errors.category_id && touched.category_id && (
                <span className="error">{errors.category_id}</span>
              )}
            </div>
            <div className="form-group">
<label>Телефон</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
              />
              {errors.phone && touched.phone && (
                <span className="error">{errors.phone}</span>
              )}
            </div>
            <div className="form-group">
<label>Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
              />
              {errors.email && touched.email && (
                <span className="error">{errors.email}</span>
              )}
            </div>
          </div>

          {/* Category-specific fields */}
          {formData.category_id === 1 && (
            <>
              <h2 className="form-title" style={{ marginTop: '24px' }}>Данные студента</h2>
              <div className="form-grid">
                <div className="form-group">
                  <label>Факультет</label>
                  <select
                    value={studentData.faculty}
                    onChange={(e) => setStudentData(prev => ({ ...prev, faculty: e.target.value }))}
                  >
                    <option value="">Выберите факультет</option>
                    <option value="Факультет информационных технологий">Факультет информационных технологий</option>
                    <option value="Факультет автоматизации и робототехники">Факультет автоматизации и робототехники</option>
                    <option value="Факультет радиоэлектроники">Факультет радиоэлектроники</option>
                    <option value="Факультет экономики и менеджмента">Факультет экономики и менеджмента</option>
                    <option value="Факультет прикладной математики">Факультет прикладной математики</option>
                    <option value="Факультет энергетики">Факультет энергетики</option>
                    <option value="Факультет строительства и архитектуры">Факультет строительства и архитектуры</option>
                  </select>
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
                  <select
                    value={teacherData.department}
                    onChange={(e) => setTeacherData(prev => ({ ...prev, department: e.target.value }))}
                  >
                    <option value="">Выберите кафедру</option>
                    <option value="Технологий программирования">Технологий программирования</option>
                    <option value="Вычислительные системы">Вычислительные системы</option>
                    <option value="Информационная безопасность">Информационная безопасность</option>
                    <option value="Прикладная математика">Прикладная математика</option>
                    <option value="Искусственный интеллект">Искусственный интеллект</option>
                    <option value="Телекоммуникационные системы">Телекоммуникационные системы</option>
                  </select>
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