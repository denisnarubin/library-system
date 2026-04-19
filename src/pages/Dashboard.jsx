import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { bookLoansAPI, readersAPI, booksAPI, finesAPI } from '../services/api';
import './Dashboard.css';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalReaders: 0,
    totalBooks: 0,
    activeLoans: 0,
    overdueLoans: 0,
    unpaidFines: 0,
    newReadersThisMonth: 0,
  });
  const [recentLoans, setRecentLoans] = useState([]);
  const [debtors, setDebtors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      // Fetch all data in parallel
      const [readersRes, booksRes, loansRes, finesRes] = await Promise.all([
        readersAPI.getAll(),
        booksAPI.getAll(),
        bookLoansAPI.getAll(),
        finesAPI.getAll(),
      ]);

      const readers = readersRes.data || [];
      const books = booksRes.data || [];
      const loans = loansRes.data || [];
      const fines = finesRes.data || [];

      const today = new Date();
      const activeLoans = loans.filter(loan => !loan.return_date);
      const overdueLoans = activeLoans.filter(loan => new Date(loan.due_date) < today);
      const unpaidFines = fines.filter(fine => !fine.paid);
      
      const currentMonth = today.getMonth();
      const currentYear = today.getFullYear();
      const newReadersThisMonth = readers.filter(reader => {
        const joinDate = new Date(reader.created_at || reader.join_date);
        return joinDate.getMonth() === currentMonth && joinDate.getFullYear() === currentYear;
      });

      setStats({
        totalReaders: readers.length,
        totalBooks: books.length,
        activeLoans: activeLoans.length,
        overdueLoans: overdueLoans.length,
        unpaidFines: unpaidFines.length,
        newReadersThisMonth: newReadersThisMonth.length,
      });

      // Get recent loans (last 5)
      const sortedLoans = [...loans].sort((a, b) => 
        new Date(b.loan_date) - new Date(a.loan_date)
      ).slice(0, 5);
      setRecentLoans(sortedLoans);

      // Get debtors
      const debtorList = activeLoans
        .filter(loan => new Date(loan.due_date) < today)
        .map(loan => ({
          ...loan,
          overdueDays: Math.floor((today - new Date(loan.due_date)) / (1000 * 60 * 60 * 24)),
        }))
        .sort((a, b) => b.overdueDays - a.overdueDays)
        .slice(0, 5);
      setDebtors(debtorList);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="spinner"></div>
        <p>Загрузка данных...</p>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <h1 className="dashboard-title">Панель управления библиотекой</h1>
      
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon readers">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
          </div>
          <div className="stat-info">
            <span className="stat-value">{stats.totalReaders}</span>
            <span className="stat-label">Всего читателей</span>
          </div>
          <Link to="/readers" className="stat-link">Подробнее →</Link>
        </div>

        <div className="stat-card">
          <div className="stat-icon books">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
            </svg>
          </div>
          <div className="stat-info">
            <span className="stat-value">{stats.totalBooks}</span>
            <span className="stat-label">Всего книг</span>
          </div>
          <Link to="/books" className="stat-link">Подробнее →</Link>
        </div>

        <div className="stat-card">
          <div className="stat-icon loans">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
              <polyline points="10 9 9 9 8 9"/>
            </svg>
          </div>
          <div className="stat-info">
            <span className="stat-value">{stats.activeLoans}</span>
            <span className="stat-label">Книг на руках</span>
          </div>
          <Link to="/loans" className="stat-link">Подробнее →</Link>
        </div>

        <div className="stat-card warning">
          <div className="stat-icon overdue">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
          </div>
          <div className="stat-info">
            <span className="stat-value">{stats.overdueLoans}</span>
            <span className="stat-label">Просрочено</span>
          </div>
          <Link to="/loans?filter=overdue" className="stat-link">Подробнее →</Link>
        </div>

        <div className="stat-card warning">
          <div className="stat-icon fines">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="1" x2="12" y2="23"/>
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
            </svg>
          </div>
          <div className="stat-info">
            <span className="stat-value">{stats.unpaidFines}</span>
            <span className="stat-label">Неоплаченные штрафы</span>
          </div>
          <Link to="/fines" className="stat-link">Подробнее →</Link>
        </div>

        <div className="stat-card success">
          <div className="stat-icon new">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="8.5" cy="7" r="4"/>
              <line x1="20" y1="8" x2="20" y2="14"/>
              <line x1="23" y1="11" x2="17" y2="11"/>
            </svg>
          </div>
          <div className="stat-info">
            <span className="stat-value">{stats.newReadersThisMonth}</span>
            <span className="stat-label">Новых читателей в этом месяце</span>
          </div>
          <Link to="/readers?filter=new" className="stat-link">Подробнее →</Link>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-section">
          <h2 className="section-title">Последние выдачи книг</h2>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Читатель</th>
                  <th>Книга</th>
                  <th>Дата выдачи</th>
                  <th>Срок возврата</th>
                </tr>
              </thead>
              <tbody>
                {recentLoans.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="no-data">Нет данных</td>
                  </tr>
                ) : (
                  recentLoans.map(loan => (
                    <tr key={loan.id}>
                      <td>Читатель #{loan.reader_id}</td>
                      <td>Экземпляр #{loan.copy_id}</td>
                      <td>{new Date(loan.loan_date).toLocaleDateString('ru-RU')}</td>
                      <td>{new Date(loan.due_date).toLocaleDateString('ru-RU')}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="dashboard-section">
          <h2 className="section-title">Задолжники</h2>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Читатель</th>
                  <th>Дней просрочки</th>
                  <th>Действие</th>
                </tr>
              </thead>
              <tbody>
                {debtors.length === 0 ? (
                  <tr>
                    <td colSpan="3" className="no-data">Нет задолжников</td>
                  </tr>
                ) : (
                  debtors.map(debtor => (
                    <tr key={debtor.id} className={debtor.overdueDays > 30 ? 'danger' : ''}>
                      <td>Читатель #{debtor.reader_id}</td>
                      <td className={debtor.overdueDays > 30 ? 'text-danger' : ''}>
                        {debtor.overdueDays} дн.
                      </td>
                      <td>
                        <Link to={`/loans/${debtor.id}/return`} className="btn btn-sm">
                          Вернуть
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="quick-actions">
        <h2 className="section-title">Быстрые действия</h2>
        <div className="actions-grid">
          <Link to="/readers/new" className="action-card">
            <span className="action-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="8.5" cy="7" r="4"/>
                <line x1="20" y1="8" x2="20" y2="14"/>
                <line x1="23" y1="11" x2="17" y2="11"/>
              </svg>
            </span>
            <span>Новый читатель</span>
          </Link>
          <Link to="/books/new" className="action-card">
            <span className="action-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
              </svg>
            </span>
            <span>Добавить книгу</span>
          </Link>
          <Link to="/loans/new" className="action-card">
            <span className="action-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
              </svg>
            </span>
            <span>Выдать книгу</span>
          </Link>
          <Link to="/statistics" className="action-card">
            <span className="action-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="20" x2="18" y2="10"/>
                <line x1="12" y1="20" x2="12" y2="4"/>
                <line x1="6" y1="20" x2="6" y2="14"/>
              </svg>
            </span>
            <span>Статистика</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;