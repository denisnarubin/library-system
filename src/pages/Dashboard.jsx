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
          <div className="stat-icon readers">👥</div>
          <div className="stat-info">
            <span className="stat-value">{stats.totalReaders}</span>
            <span className="stat-label">Всего читателей</span>
          </div>
          <Link to="/readers" className="stat-link">Подробнее →</Link>
        </div>

        <div className="stat-card">
          <div className="stat-icon books">📚</div>
          <div className="stat-info">
            <span className="stat-value">{stats.totalBooks}</span>
            <span className="stat-label">Всего книг</span>
          </div>
          <Link to="/books" className="stat-link">Подробнее →</Link>
        </div>

        <div className="stat-card">
          <div className="stat-icon loans">📝</div>
          <div className="stat-info">
            <span className="stat-value">{stats.activeLoans}</span>
            <span className="stat-label">Книг на руках</span>
          </div>
          <Link to="/loans" className="stat-link">Подробнее →</Link>
        </div>

        <div className="stat-card warning">
          <div className="stat-icon overdue">⚠️</div>
          <div className="stat-info">
            <span className="stat-value">{stats.overdueLoans}</span>
            <span className="stat-label">Просрочено</span>
          </div>
          <Link to="/loans?filter=overdue" className="stat-link">Подробнее →</Link>
        </div>

        <div className="stat-card warning">
          <div className="stat-icon fines">💰</div>
          <div className="stat-info">
            <span className="stat-value">{stats.unpaidFines}</span>
            <span className="stat-label">Неоплаченные штрафы</span>
          </div>
          <Link to="/fines" className="stat-link">Подробнее →</Link>
        </div>

        <div className="stat-card success">
          <div className="stat-icon new">🎉</div>
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
                    <td colSpan="3" className="no-data">Нет задолжников 🎉</td>
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
            <span className="action-icon">➕</span>
            <span>Новый читатель</span>
          </Link>
          <Link to="/books/new" className="action-card">
            <span className="action-icon">📖</span>
            <span>Добавить книгу</span>
          </Link>
          <Link to="/loans/new" className="action-card">
            <span className="action-icon">📝</span>
            <span>Выдать книгу</span>
          </Link>
          <Link to="/statistics" className="action-card">
            <span className="action-icon">📈</span>
            <span>Статистика</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;