import { useState } from 'react';
import { statisticsAPI } from '../services/api';
import './Common.css';

const Statistics = () => {
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedQuery, setSelectedQuery] = useState('');
  const [params, setParams] = useState({});

  const queries = [
    { id: 'top20', label: '20 наиболее заказываемых книг в читальном зале', needsParam: true, paramLabel: 'Название пункта' },
    { id: 'debtors', label: 'Задолжники со сроком более 10 дней', needsParam: false },
    { id: 'arrived_lost', label: 'Книги, поступившие и утерянные за последний год', needsParam: true, paramLabel: 'Имя автора' },
    { id: 'point_max_debtors', label: 'Пункт с максимальным числом задолжников', needsParam: false },
    { id: 'mba_orders', label: 'МБА заказы за период', needsParam: true, paramLabel: 'Период (month/semester/year)' },
    { id: 'total_copies', label: 'Количество экземпляров книги', needsParam: true, paramLabel: 'Название книги' },
    { id: 'banned', label: 'Лишённые права > 2 месяцев', needsParam: false },
    { id: 'new_readers', label: 'Новые читатели за последний месяц', needsParam: false },
    { id: 'readers_faculty', label: 'Читатели по факультету', needsParam: true, paramLabel: 'Название факультета' },
    { id: 'reader_books', label: 'Книги на руках у читателя', needsParam: true, paramLabel: 'Фамилия читателя' },
  ];

  const handleRun = async () => {
    if (!selectedQuery) return;
    try {
      setLoading(true);
      let result;
      switch (selectedQuery) {
        case 'top20':
          result = await statisticsAPI.getTopBooksInHall(params.value);
          break;
        case 'debtors':
          result = await statisticsAPI.getLongTermDebtors();
          break;
        case 'arrived_lost':
          result = await statisticsAPI.getBooksArrivedLost(params.value);
          break;
        case 'point_max_debtors':
          result = await statisticsAPI.getPointMaxDebtors();
          break;
        case 'mba_orders':
          result = await statisticsAPI.getMbaOrders(params.value, 180);
          break;
        case 'total_copies':
          result = await statisticsAPI.getTotalCopies(params.value);
          break;
        case 'banned':
          result = await statisticsAPI.getBannedOver2Months();
          break;
        case 'new_readers':
          result = await statisticsAPI.getNewReadersLastMonth();
          break;
        case 'readers_faculty':
          result = await statisticsAPI.getReadersByFaculty(params.value);
          break;
        case 'reader_books':
          result = await statisticsAPI.getReaderCurrentBooks(params.value);
          break;
        default:
          return;
      }
      setResults(result?.data || []);
    } catch (error) {
      console.error('Error:', error);
      setResults(null);
    } finally {
      setLoading(false);
    }
  };

  const handleParamChange = (e) => {
    setParams({ value: e.target.value });
  };

  return (
    <div className="list-page">
      <div className="page-header"><h1>Статистика и отчёты</h1></div>
      
      <div className="form-container" style={{ marginBottom: '24px' }}>
        <h2 className="form-title">Выберите запрос</h2>
        <div className="form-grid">
          <div className="form-group full-width">
            <label>Запрос</label>
            <select value={selectedQuery} onChange={(e) => setSelectedQuery(e.target.value)} className="filter-select" style={{ width: '100%' }}>
              <option value="">Выберите запрос...</option>
              {queries.map(q => (
                <option key={q.id} value={q.id}>{q.label}</option>
              ))}
            </select>
          </div>
          {selectedQuery && queries.find(q => q.id === selectedQuery)?.needsParam && (
            <div className="form-group full-width">
              <label>{queries.find(q => q.id === selectedQuery)?.paramLabel}</label>
              <input type="text" value={params.value || ''} onChange={handleParamChange} placeholder="Введите значение..." />
            </div>
          )}
          <div className="form-group full-width">
            <button className="btn btn-primary" onClick={handleRun} disabled={!selectedQuery || loading}>
              {loading ? 'Загрузка...' : 'Выполнить'}
            </button>
          </div>
        </div>
      </div>

      {results && (
        <div className="table-container">
          <h2 className="form-title">Результаты</h2>
          {Array.isArray(results) ? (
            <table className="data-table">
              <thead>
                <tr>
                  {Object.keys(results[0] || {}).map(key => (
                    <th key={key}>{key}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {results.map((row, idx) => (
                  <tr key={idx}>
                    {Object.values(row).map((val, i) => (
                      <td key={i}>{val !== null && val !== undefined ? String(val) : '-'}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <pre style={{ background: '#f8f9fa', padding: '16px', borderRadius: '8px', overflow: 'auto' }}>
              {JSON.stringify(results, null, 2)}
            </pre>
          )}
        </div>
      )}
    </div>
  );
};

export default Statistics;