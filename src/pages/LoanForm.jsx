import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { bookLoansAPI, readersAPI, bookCopiesAPI } from '../services/api';
import './Common.css';

const LoanForm = ({ isReturn = false }) => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [readers, setReaders] = useState([]);
  const [copies, setCopies] = useState([]);
  const [formData, setFormData] = useState({
    reader_id: '',
    copy_id: '',
    loan_date: new Date().toISOString().split('T')[0],
    due_date: '',
    return_date: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchData();
    if (id && isReturn) fetchLoan();
  }, [id]);

  const fetchData = async () => {
    try {
      const [readersRes, copiesRes] = await Promise.all([
        readersAPI.getAll(),
        bookCopiesAPI.getAll({ status: 'available' }),
      ]);
      setReaders(readersRes.data || []);
      setCopies(copiesRes.data || []);
      
      // Set default due date (14 days from now)
      const defaultDue = new Date();
      defaultDue.setDate(defaultDue.getDate() + 14);
      setFormData(prev => ({ ...prev, due_date: defaultDue.toISOString().split('T')[0] }));
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const fetchLoan = async () => {
    try {
      setLoading(true);
      const res = await bookLoansAPI.getById(id);
      const loan = res.data;
      setFormData({
        reader_id: loan.reader_id,
        copy_id: loan.copy_id,
        loan_date: loan.loan_date,
        due_date: loan.due_date,
        return_date: loan.return_date || '',
      });
    } catch (error) {
      console.error('Error fetching loan:', error);
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
      if (isReturn) {
        await bookLoansAPI.returnBook(id, { return_date: formData.return_date || new Date().toISOString().split('T')[0] });
      } else {
        await bookLoansAPI.issueLoan({
          ...formData,
          point_id: 1, // Default point
        });
      }
      navigate('/loans');
    } catch (error) {
      console.error('Error saving loan:', error);
      alert('Ошибка при сохранении');
    } finally {
      setLoading(false);
    }
  };

  const getReaderName = (readerId) => {
    const reader = readers.find(r => r.id === readerId);
    return reader ? `${reader.last_name} ${reader.first_name}` : '';
  };

  if (loading && !formData.reader_id) return <div className="loading">Загрузка...</div>;

  return (
    <div className="form-page">
      <div className="page-header">
        <h1>{isReturn ? 'Возврат книги' : 'Выдача книги'}</h1>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-container">
          <h2 className="form-title">Информация о выдаче</h2>
          <div className="form-grid">
            {!isReturn ? (
              <>
                <div className="form-group">
                  <label>Читатель *</label>
                  <select
                    name="reader_id"
                    value={formData.reader_id}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Выберите читателя</option>
                    {readers.map(reader => (
                      <option key={reader.id} value={reader.id}>
                        {`${reader.last_name} ${reader.first_name}`}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Экземпляр книги *</label>
                  <select
                    name="copy_id"
                    value={formData.copy_id}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Выберите экземпляр</option>
                    {copies.map(copy => (
                      <option key={copy.id} value={copy.id}>
                        {copy.inventory_number} (#{copy.id})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Дата выдачи *</label>
                  <input
                    type="date"
                    name="loan_date"
                    value={formData.loan_date}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Срок возврата *</label>
                  <input
                    type="date"
                    name="due_date"
                    value={formData.due_date}
                    onChange={handleChange}
                    required
                  />
                </div>
              </>
            ) : (
              <>
                <div className="form-group">
                  <label>Читатель</label>
                  <input type="text" value={getReaderName(formData.reader_id)} disabled />
                </div>
                <div className="form-group">
                  <label>Дата возврата</label>
                  <input
                    type="date"
                    name="return_date"
                    value={formData.return_date}
                    onChange={handleChange}
                    min={formData.due_date}
                  />
                </div>
              </>
            )}
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Сохранение...' : (isReturn ? 'Подтвердить возврат' : 'Выдать книгу')}
          </button>
          <button type="button" className="btn" onClick={() => navigate('/loans')}>
            Отмена
          </button>
        </div>
      </form>
    </div>
  );
};

export default LoanForm;