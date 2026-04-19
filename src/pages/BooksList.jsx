import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { booksAPI, authorsAPI } from '../services/api';
import './Common.css';

const BooksList = () => {
  const [books, setBooks] = useState([]);
  const [authors, setAuthors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [bookToDelete, setBookToDelete] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [booksRes, authorsRes] = await Promise.all([
        booksAPI.getAll(),
        authorsAPI.getAll(),
      ]);
      setBooks(booksRes.data || []);
      setAuthors(authorsRes.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!bookToDelete) return;
    try {
      await booksAPI.delete(bookToDelete);
      setBooks(books.filter(b => b.id !== bookToDelete));
      setShowDeleteModal(false);
    } catch (error) {
      console.error('Error deleting book:', error);
      alert('Ошибка при удалении книги');
    }
  };

  const filteredBooks = books.filter(book => {
    return search === '' || 
      book.title.toLowerCase().includes(search.toLowerCase()) ||
      book.isbn?.includes(search) ||
      book.publisher?.toLowerCase().includes(search.toLowerCase());
  });

  const getBookAuthors = (bookId) => {
    return authors
      .filter(a => a.book_id === bookId)
      .map(a => a.name)
      .join(', ') || '-';
  };

  if (loading) return <div className="loading">Загрузка...</div>;

  return (
    <div className="list-page">
      <div className="page-header">
        <h1>Книги</h1>
        <Link to="/books/new" className="btn btn-primary">+ Добавить книгу</Link>
      </div>

      <div className="filters">
        <input
          type="text"
          placeholder="Поиск по названию, ISBN, издательству..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="search-input"
        />
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Название</th>
              <th>Авторы</th>
              <th>Издательство</th>
              <th>Год издания</th>
              <th>ISBN</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {filteredBooks.length === 0 ? (
              <tr>
                <td colSpan="7" className="no-data">Книги не найдены</td>
              </tr>
            ) : (
              filteredBooks.map(book => (
                <tr key={book.id}>
                  <td>{book.id}</td>
                  <td>{book.title}</td>
                  <td>{getBookAuthors(book.id)}</td>
                  <td>{book.publisher || '-'}</td>
                  <td>{book.year_published || '-'}</td>
                  <td>{book.isbn || '-'}</td>
                  <td className="actions">
                    <Link to={`/books/${book.id}`} className="btn btn-sm">Изменить</Link>
                    <button 
                      className="btn btn-sm btn-danger"
                      onClick={() => { setBookToDelete(book.id); setShowDeleteModal(true); }}
                    >
                      Удалить
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showDeleteModal && (
        <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Подтверждение удаления</h3>
            <p>Вы уверены, что хотите удалить эту книгу?</p>
            <div className="modal-actions">
              <button className="btn btn-danger" onClick={handleDelete}>Удалить</button>
              <button className="btn" onClick={() => setShowDeleteModal(false)}>Отмена</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BooksList;