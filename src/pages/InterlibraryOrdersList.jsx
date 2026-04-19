import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { interlibraryOrdersAPI, readersAPI } from '../services/api';
import './Common.css';

const InterlibraryOrdersList = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [readers, setReaders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [ordersRes, readersRes] = await Promise.all([interlibraryOrdersAPI.getAll(), readersAPI.getAll()]);
      setOrders(ordersRes.data || []);
      setReaders(readersRes.data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getReaderName = (readerId) => {
    const reader = readers.find(r => r.id === readerId);
    return reader ? `${reader.last_name} ${reader.first_name}` : '-';
  };

  if (loading) return <div className="loading">Загрузка...</div>;

  return (
    <div className="list-page">
      <div className="page-header">
        <h1>МБА заказы</h1>
        <button className="btn btn-primary" onClick={() => navigate('/interlibrary-orders/new')}>
          Создать заказ
        </button>
      </div>
      <div className="table-container">
        <table className="data-table">
          <thead><tr><th>ID</th><th>Читатель</th><th>Книга</th><th>Автор</th><th>Дата заказа</th><th>Получено</th><th>Возврат</th></tr></thead>
          <tbody>
            {orders.length === 0 ? (
              <tr><td colSpan="7" className="no-data">Заказы не найдены</td></tr>
            ) : (
              orders.map(order => (
                <tr key={order.id}>
                  <td>{order.id}</td><td>{getReaderName(order.reader_id)}</td><td>{order.book_title}</td>
                  <td>{order.author_name}</td><td>{new Date(order.order_date).toLocaleDateString('ru-RU')}</td>
                  <td>{order.received_date ? new Date(order.received_date).toLocaleDateString('ru-RU') : '-'}</td>
                  <td>{order.return_date ? new Date(order.return_date).toLocaleDateString('ru-RU') : '-'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InterlibraryOrdersList;