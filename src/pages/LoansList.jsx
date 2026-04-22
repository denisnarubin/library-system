import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { bookLoansAPI, readersAPI, booksAPI } from '../services/api';
import { useSorting } from '../hooks/useSorting';
import './Common.css';

const LoansList = () => {
  const [loans, setLoans] = useState([]);
  const [readers, setReaders] = useState([]);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const { handleSort, sortData, getSortIndicator } = useSorting('loan_date', 'desc');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [loansRes, readersRes, booksRes] = await Promise.all([
        bookLoansAPI.getAll(),
        readersAPI.getAll(),
        booksAPI.getAll(),
      ]);
      setLoans(loansRes.data || []);
      setReaders(readersRes.data || []);
      setBooks(booksRes.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredLoans = loans.filter(loan => {
    if (statusFilter === 'active') return !loan.return_date;
    if (statusFilter === 'returned') return !!loan.return_date;
    if (statusFilter === 'overdue') {
      return !loan.return_date && new Date(loan.due_date) < new Date();
    }
    return true;
  });

  const getReaderName = (readerId) => {
    const reader = readers.find(r => r.id === readerId);
    return reader ? `${reader.last_name} ${reader.first_name}` : '-';
  };

  const getBookTitle = (copyId) => {
    // In real app, would need book_copies data
    return `Экземпляр #${copyId}`;
  };

  const isOverdue = (loan) => {
    return !loan.return_date && new Date(loan.due_date) < new Date();
  };

  if (loading) return <div className="loading">Загрузка...</div>;

  return (
    <div className="list-page">
      <div className="page-header">
        <h1>Выдача книг</h1>
        <Link to="/loans/new" className="btn btn-primary">+ Выдать книгу</Link>
      </div>

      <div className="filters">
        <select 
          value={statusFilter} 
          onChange={(e) => setStatusFilter(e.target.value)}
          className="filter-select"
        >
          <option value="">Все выдачи</option>
          <option value="active">На руках</option>
          <option value="returned">Возвращенные</option>
          <option value="overdue">Просроченные</option>
        </select>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th onClick={() => handleSort('id')} style={{cursor: 'pointer'}}>ID{getSortIndicator('id')}</th>
              <th>Читатель</th>
              <th>Книга</th>
              <th onClick={() => handleSort('loan_date')} style={{cursor: 'pointer'}}>Дата выдачи{getSortIndicator('loan_date')}</th>
              <th onClick={() => handleSort('due_date')} style={{cursor: 'pointer'}}>Срок возврата{getSortIndicator('due_date')}</th>
              <th onClick={() => handleSort('return_date')} style={{cursor: 'pointer'}}>Дата возврата{getSortIndicator('return_date')}</th>
              <th>Статус</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {sortData(filteredLoans).length === 0 ? (
              <tr><td colSpan="8" className="no-data">Выдачи не найдены</td></tr>
            ) : (
              sortData(filteredLoans).map(loan => (
                <tr key={loan.id} className={isOverdue(loan) ? 'danger' : ''}>
                  <td>{loan.id}</td>
                  <td>{getReaderName(loan.reader_id)}</td>
                  <td>{getBookTitle(loan.copy_id)}</td>
                  <td>{new Date(loan.loan_date).toLocaleDateString('ru-RU')}</td>
                  <td>{new Date(loan.due_date).toLocaleDateString('ru-RU')}</td>
                  <td>{loan.return_date ? new Date(loan.return_date).toLocaleDateString('ru-RU') : '-'}</td>
                  <td>
                    {loan.return_date ? (
                      <span className="status-badge available">Возвращена</span>
                    ) : isOverdue(loan) ? (
                      <span className="status-badge lost">Просрочена</span>
                    ) : (
                      <span className="status-badge loaned">На руках</span>
                    )}
                  </td>
                  <td className="actions">
                    {!loan.return_date && (
                      <Link to={`/loans/${loan.id}/return`} className="btn btn-sm btn-success">
                        Вернуть
                      </Link>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LoansList;