import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { booksAPI, authorsAPI } from '../services/api';
import { useSorting } from '../hooks/useSorting';
import './Common.css';

const BooksList = () => {
  const [books, setBooks] = useState([]);
  const [authors, setAuthors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [yearFrom, setYearFrom] = useState('');
  const [yearTo, setYearTo] = useState('');
  const [selectedAuthor, setSelectedAuthor] = useState('');
  const [hasIsbnFilter, setHasIsbnFilter] = useState('all');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [bookToDelete, setBookToDelete] = useState(null);
  const { handleSort, sortData, getSortIndicator } = useSorting('title', 'asc');

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
      
      // Загружаем связи книг и авторов отдельно с обработкой ошибок
      try {
        const bookAuthorsRes = await fetch('http://localhost:3001/api/book-authors');
        window.bookAuthors = bookAuthorsRes.ok ? await bookAuthorsRes.json() : [];
      } catch (e) {
        console.warn('Не удалось загрузить связи авторов:', e);
        window.bookAuthors = [];
      }
      
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
    // Текстовый поиск
    const matchesSearch = search === '' || 
      book.title.toLowerCase().includes(search.toLowerCase()) ||
      book.isbn?.includes(search) ||
      book.publisher?.toLowerCase().includes(search.toLowerCase());
    
    // Фильтр по году издания
    const matchesYearFrom = yearFrom === '' || (book.year_published && book.year_published >= parseInt(yearFrom));
    const matchesYearTo = yearTo === '' || (book.year_published && book.year_published <= parseInt(yearTo));
    
    // Фильтр по автору
    const bookAuthors = authors.filter(a => a.book_id === book.id);
    const matchesAuthor = selectedAuthor === '' || bookAuthors.some(a => a.id === parseInt(selectedAuthor));
    
    // Фильтр по наличию ISBN
    const matchesIsbn = hasIsbnFilter === 'all' || 
      (hasIsbnFilter === 'yes' && book.isbn) || 
      (hasIsbnFilter === 'no' && !book.isbn);

    return matchesSearch && matchesYearFrom && matchesYearTo && matchesAuthor && matchesIsbn;
  });

  const getBookAuthors = (bookId) => {
    // Прямой запрос на каждого автора книги - самый надежный способ
    const cacheKey = `book_authors_${bookId}`;
    
    if (window[cacheKey]) {
      return window[cacheKey];
    }
    
    // Загружаем авторы книги напрямую
    fetch(`http://localhost:3001/api/books/${bookId}/authors`)
      .then(res => res.json())
      .then(data => {
        if (data && data.length > 0) {
          window[cacheKey] = data.map(a => a.name).join(', ');
          // Принудительно обновляем компонент
          setBooks([...books]);
        }
      })
      .catch(e => {});
    
    return 'Загрузка...';
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
        
        <div className="filter-row">
          <div className="filter-group">
            <label>Год издания от:</label>
            <input
              type="number"
              placeholder="от"
              value={yearFrom}
              onChange={(e) => setYearFrom(e.target.value)}
              className="filter-input"
            />
          </div>
          
          <div className="filter-group">
            <label>до:</label>
            <input
              type="number"
              placeholder="до"
              value={yearTo}
              onChange={(e) => setYearTo(e.target.value)}
              className="filter-input"
            />
          </div>
          
          <div className="filter-group">
            <label>Автор:</label>
            <select
              value={selectedAuthor}
              onChange={(e) => setSelectedAuthor(e.target.value)}
              className="filter-select"
            >
              <option value="">Все авторы</option>
              {[...new Map(authors.map(a => [a.id, a])).values()]
                .sort((a, b) => a.name.localeCompare(b.name))
                .map(author => (
                  <option key={author.id} value={author.id}>{author.name}</option>
                ))
              }
            </select>
          </div>
          
          <div className="filter-group">
            <label>Наличие ISBN:</label>
            <select
              value={hasIsbnFilter}
              onChange={(e) => setHasIsbnFilter(e.target.value)}
              className="filter-select"
            >
              <option value="all">Все</option>
              <option value="yes">Есть ISBN</option>
              <option value="no">Нет ISBN</option>
            </select>
          </div>
          
          <button 
            className="btn btn-secondary"
            onClick={() => {
              setSearch('');
              setYearFrom('');
              setYearTo('');
              setSelectedAuthor('');
              setHasIsbnFilter('all');
            }}
          >
            ✕ Сбросить фильтры
          </button>
        </div>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th onClick={() => handleSort('id')} style={{cursor: 'pointer'}}>ID{getSortIndicator('id')}</th>
              <th onClick={() => handleSort('title')} style={{cursor: 'pointer'}}>Название{getSortIndicator('title')}</th>
              <th>Авторы</th>
              <th onClick={() => handleSort('publisher')} style={{cursor: 'pointer'}}>Издательство{getSortIndicator('publisher')}</th>
              <th onClick={() => handleSort('year_published')} style={{cursor: 'pointer'}}>Год издания{getSortIndicator('year_published')}</th>
              <th onClick={() => handleSort('isbn')} style={{cursor: 'pointer'}}>ISBN{getSortIndicator('isbn')}</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {sortData(filteredBooks).length === 0 ? (
              <tr>
                <td colSpan="7" className="no-data">Книги не найдены</td>
              </tr>
            ) : (
              sortData(filteredBooks).map(book => (
                <tr key={book.id}>
                  <td>{book.id}</td>
                  <td>{book.title}</td>
                  <td>{getBookAuthors(book.id)}</td>
                  <td>{book.publisher || '-'}</td>
                  <td>{book.year_published || '-'}</td>
                  <td>{book.isbn || '-'}</td>
                  <td className="actions">
                    <Link to={`/books/${book.id}`} className="btn btn-sm">Изменить</Link>
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