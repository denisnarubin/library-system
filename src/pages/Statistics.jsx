import { useState } from 'react';
import { statisticsAPI } from '../services/api';
import './Common.css';

const Statistics = () => {
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedQuery, setSelectedQuery] = useState('');
  const [params, setParams] = useState({});
  const [errors, setErrors] = useState({});

  // Названия полей на русском для всех запросов
  const fieldTranslations = {
    'total': 'Всего',
    'reader_id': 'Номер читателя',
    'full_name': 'ФИО',
    'category': 'Категория',
    'book_title': 'Название книги',
    'order_date': 'Дата заказа',
    'request_count': 'Количество запросов',
    'reader_name': 'Читатель',
    'overdue_days': 'Дней просрочки',
    'ban_days': 'Дней блокировки',
    'reg_date': 'Дата регистрации',
    'due_date': 'Срок возврата',
    'arrived_count': 'Поступило',
    'lost_count': 'Утеряно',
    'point_name': 'Пункт выдачи',
    'debtors_count': 'Количество должников',
    'title': 'Название книги'
  };

  const queries = [
    { 
      id: 'top20', 
      label: '20 наиболее заказываемых книг в читальном зале', 
      needsParam: true, 
      paramLabel: 'Название пункта выдачи',
      placeholder: 'Например: Читальный зал №1, Абонемент 1',
      hint: 'Выберите из списка пунктов'
    },
    { 
      id: 'debtors', 
      label: 'Задолжники со сроком просрочки более 10 дней', 
      needsParam: false,
      hint: 'Показывает всех читателей, которые задерживают книги больше 10 дней'
    },
    { 
      id: 'arrived_lost', 
      label: 'Книги, поступившие и утерянные за текущий год', 
      needsParam: true, 
      paramLabel: 'Автор',
      placeholder: 'Например: Пушкин, Достоевский, Толстой',
      hint: 'Можно вводить часть фамилии'
    },
    { 
      id: 'point_max_debtors', 
      label: 'Пункт с максимальным числом задолжников', 
      needsParam: false,
      hint: 'Автоматически определяет пункт с наибольшим количеством должников'
    },
    { 
      id: 'mba_orders', 
      label: 'Межбиблиотечные заказы за период', 
      needsParam: true, 
      paramLabel: 'Период',
      isSelect: true,
      options: [
        { value: 'month', label: 'За последний месяц' },
        { value: 'semester', label: 'За полугодие' },
        { value: 'year', label: 'За год' }
      ],
      hint: 'Выберите период из списка'
    },
    { 
      id: 'total_copies', 
      label: 'Общее количество экземпляров книги', 
      needsParam: true, 
      paramLabel: 'Название книги',
      placeholder: 'Например: Война и мир, Преступление и наказание',
      hint: 'Можно вводить часть названия'
    },
    { 
      id: 'banned', 
      label: 'Читатели лишённые права пользования > 2 месяцев', 
      needsParam: false,
      hint: 'Показывает всех кто заблокирован более чем на 60 дней'
    },
    { 
      id: 'new_readers', 
      label: 'Новые читатели за прошлый месяц', 
      needsParam: false,
      hint: 'Показывает читателей зарегистрированных в прошлом календарном месяце'
    },
    { 
      id: 'readers_faculty', 
      label: 'Читатели по факультету', 
      needsParam: true, 
      paramLabel: 'Факультет',
      isSelect: true,
      options: [
        { value: 'Факультет информационных технологий', label: 'Факультет информационных технологий' },
        { value: 'Факультет автоматизации и робототехники', label: 'Факультет автоматизации и робототехники' },
        { value: 'Факультет радиоэлектроники', label: 'Факультет радиоэлектроники' },
        { value: 'Факультет экономики и менеджмента', label: 'Факультет экономики и менеджмента' },
        { value: 'Факультет прикладной математики', label: 'Факультет прикладной математики' },
        { value: 'Факультет энергетики', label: 'Факультет энергетики' },
        { value: 'Факультет строительства и архитектуры', label: 'Факультет строительства и архитектуры' }
      ],
      hint: 'Выберите факультет из списка'
    },
    { 
      id: 'reader_books', 
      label: 'Книги которые сейчас на руках у читателя', 
      needsParam: true, 
      paramLabel: 'Фамилия читателя',
      placeholder: 'Например: Иванов, Петрова, Сидоров',
      hint: 'Можно вводить только первые буквы фамилии'
    },
  ];

  const handleRun = async () => {
    if (!selectedQuery) return;
    
    // Проверка заполненности обязательного поля
    const queryConfig = queries.find(q => q.id === selectedQuery);
    if (queryConfig?.needsParam && !params.value?.trim()) {
      setErrors({ param: 'Поле обязательно для заполнения' });
      return;
    }
    
    setErrors({});
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
          <select value={selectedQuery} onChange={(e) => {
            setSelectedQuery(e.target.value);
            setParams({ value: '' });
          }} className="filter-select" style={{ width: '100%' }}>
              <option value="">Выберите запрос...</option>
              {queries.map(q => (
                <option key={q.id} value={q.id}>{q.label}</option>
              ))}
            </select>
          </div>
          {selectedQuery && (
            <div className="form-group full-width" style={{marginTop: '8px', padding: '12px', background: '#f8f9fa', borderRadius: '6px'}}>
              <p style={{margin: '0 0 8px 0', fontSize: '14px', color: '#666', fontStyle: 'italic'}}>
                💡 {queries.find(q => q.id === selectedQuery)?.hint}
              </p>
            </div>
          )}

          {selectedQuery && queries.find(q => q.id === selectedQuery)?.needsParam && (
            <div className="form-group full-width">
              <label style={{fontWeight: '500'}}>{queries.find(q => q.id === selectedQuery)?.paramLabel}</label>
              
              {queries.find(q => q.id === selectedQuery)?.isSelect ? (
                <select 
                  value={params.value || ''} 
                  onChange={(e) => {
                    handleParamChange(e);
                    setErrors({});
                  }}
                  className="filter-select"
                  style={{ 
                    width: '100%', 
                    padding: '10px',
                    border: errors.param ? '2px solid #dc3545' : undefined
                  }}
                >
                  <option value="">Выберите значение...</option>
              {queries.find(q => q.id === selectedQuery)?.options?.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
                </select>
              ) : (
                <input 
                  type="text" 
                  value={params.value || ''} 
                  onChange={(e) => {
                    handleParamChange(e);
                    setErrors({});
                  }}
                  placeholder={queries.find(q => q.id === selectedQuery)?.placeholder}
                  style={{
                    padding: '10px', 
                    fontSize: '15px',
                    border: errors.param ? '2px solid #dc3545' : undefined
                  }}
                />
              )}
              {errors.param && (
                <p style={{color: '#dc3545', margin: '4px 0 0 0', fontSize: '13px'}}>
                  ⚠️ {errors.param}
                </p>
              )}
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
          <h2 className="form-title" style={{marginTop: '8px', marginBottom: '20px', marginLeft: '4px'}}>Результаты</h2>
          {Array.isArray(results) && results.length > 0 ? (
            <table className="data-table">
              <thead>
                <tr>
                  {Object.keys(results[0] || {}).map(key => (
                    <th key={key}>{fieldTranslations[key] || key}</th>
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
          ) : Array.isArray(results) && results.length === 0 ? (
            <div style={{
              padding: '40px 20px',
              textAlign: 'center',
              background: '#f8f9fa',
              borderRadius: '8px',
              color: '#6c757d',
              fontSize: '16px'
            }}>
              <p style={{margin: '0 0 12px 0', fontSize: '48px'}}>📭</p>
              <p style={{margin: 0, fontWeight: '500', fontSize: '17px'}}>По данному запросу ничего не найдено</p>
            </div>
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