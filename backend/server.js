require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// PostgreSQL connection pool
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'library',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
});

// Test database connection
pool.connect((err, client, release) => {
  if (err) {
    console.error('❌ Database connection error:', err.stack);
  } else {
    console.log('✅ Connected to PostgreSQL database');
    release();
  }
});

// Helper function for async queries
const query = (text, params) => pool.query(text, params);

// ==================== ROUTES ====================

// Reader Categories
app.get('/api/reader-categories', async (req, res) => {
  try {
    const result = await query('SELECT * FROM reader_categories ORDER BY id');
    res.json(result.rows);
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/reader-categories/:id', async (req, res) => {
  try {
    const result = await query('SELECT * FROM reader_categories WHERE id = $1', [req.params.id]);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/reader-categories', async (req, res) => {
  try {
    const { name, max_books_abonement, loan_days } = req.body;
    const result = await query(
      'INSERT INTO reader_categories (name, max_books_abonement, loan_days) VALUES ($1, $2, $3) RETURNING *',
      [name, max_books_abonement, loan_days]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/reader-categories/:id', async (req, res) => {
  try {
    const { name, max_books_abonement, loan_days } = req.body;
    const result = await query(
      'UPDATE reader_categories SET name = $1, max_books_abonement = $2, loan_days = $3 WHERE id = $4 RETURNING *',
      [name, max_books_abonement, loan_days, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/reader-categories/:id', async (req, res) => {
  try {
    await query('DELETE FROM reader_categories WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Readers
app.get('/api/readers', async (req, res) => {
  try {
    const result = await query('SELECT * FROM readers ORDER BY id');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/readers/:id', async (req, res) => {
  try {
    const result = await query('SELECT * FROM readers WHERE id = $1', [req.params.id]);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/readers', async (req, res) => {
  try {
    const { last_name, first_name, middle_name, category_id, phone, email } = req.body;
    const result = await query(
      'INSERT INTO readers (last_name, first_name, middle_name, category_id, phone, email) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [last_name, first_name, middle_name, category_id, phone, email]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/readers/:id', async (req, res) => {
  try {
    const { last_name, first_name, middle_name, category_id, phone, email } = req.body;
    const result = await query(
      'UPDATE readers SET last_name = $1, first_name = $2, middle_name = $3, category_id = $4, phone = $5, email = $6 WHERE id = $7 RETURNING *',
      [last_name, first_name, middle_name, category_id, phone, email, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/readers/:id', async (req, res) => {
  try {
    await query('DELETE FROM readers WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Students Details
app.get('/api/students/:readerId', async (req, res) => {
  try {
    const result = await query('SELECT * FROM students_details WHERE reader_id = $1', [req.params.readerId]);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/students', async (req, res) => {
  try {
    const { reader_id, faculty, course, group_number } = req.body;
    const result = await query(
      'INSERT INTO students_details (reader_id, faculty, course, group_number) VALUES ($1, $2, $3, $4) RETURNING *',
      [reader_id, faculty, course, group_number]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/students/:readerId', async (req, res) => {
  try {
    const { faculty, course, group_number } = req.body;
    const result = await query(
      'UPDATE students_details SET faculty = $1, course = $2, group_number = $3 WHERE reader_id = $4 RETURNING *',
      [faculty, course, group_number, req.params.readerId]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Teachers Details
app.get('/api/teachers/:readerId', async (req, res) => {
  try {
    const result = await query('SELECT * FROM teachers_details WHERE reader_id = $1', [req.params.readerId]);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/teachers', async (req, res) => {
  try {
    const { reader_id, department, degree, title } = req.body;
    const result = await query(
      'INSERT INTO teachers_details (reader_id, department, degree, title) VALUES ($1, $2, $3, $4) RETURNING *',
      [reader_id, department, degree, title]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/teachers/:readerId', async (req, res) => {
  try {
    const { department, degree, title } = req.body;
    const result = await query(
      'UPDATE teachers_details SET department = $1, degree = $2, title = $3 WHERE reader_id = $4 RETURNING *',
      [department, degree, title, req.params.readerId]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// One-time Readers Details
app.get('/api/one-time-readers/:readerId', async (req, res) => {
  try {
    const result = await query('SELECT * FROM one_time_readers_details WHERE reader_id = $1', [req.params.readerId]);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/one-time-readers', async (req, res) => {
  try {
    const { reader_id, reader_type, valid_until } = req.body;
    const result = await query(
      'INSERT INTO one_time_readers_details (reader_id, reader_type, valid_until) VALUES ($1, $2, $3) RETURNING *',
      [reader_id, reader_type, valid_until]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/one-time-readers/:readerId', async (req, res) => {
  try {
    const { reader_type, valid_until } = req.body;
    const result = await query(
      'UPDATE one_time_readers_details SET reader_type = $1, valid_until = $2 WHERE reader_id = $3 RETURNING *',
      [reader_type, valid_until, req.params.readerId]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Publication Points
app.get('/api/publication-points', async (req, res) => {
  try {
    const result = await query('SELECT * FROM publication_points ORDER BY id');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/publication-points/:id', async (req, res) => {
  try {
    const result = await query('SELECT * FROM publication_points WHERE id = $1', [req.params.id]);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/publication-points', async (req, res) => {
  try {
    const { name, point_type, address } = req.body;
    const result = await query(
      'INSERT INTO publication_points (name, point_type, address) VALUES ($1, $2, $3) RETURNING *',
      [name, point_type, address]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/publication-points/:id', async (req, res) => {
  try {
    const { name, point_type, address } = req.body;
    const result = await query(
      'UPDATE publication_points SET name = $1, point_type = $2, address = $3 WHERE id = $4 RETURNING *',
      [name, point_type, address, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/publication-points/:id', async (req, res) => {
  try {
    await query('DELETE FROM publication_points WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Library Cards
app.get('/api/library-cards', async (req, res) => {
  try {
    const result = await query('SELECT * FROM library_cards ORDER BY id');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/library-cards/:id', async (req, res) => {
  try {
    const result = await query('SELECT * FROM library_cards WHERE id = $1', [req.params.id]);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/library-cards', async (req, res) => {
  try {
    const { reader_id, point_id, issue_date, renewal_date, is_active } = req.body;
    const result = await query(
      'INSERT INTO library_cards (reader_id, point_id, issue_date, renewal_date, is_active) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [reader_id, point_id, issue_date, renewal_date, is_active]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Books
app.get('/api/books', async (req, res) => {
  try {
    const result = await query('SELECT * FROM books ORDER BY id');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/books/:id', async (req, res) => {
  try {
    const result = await query('SELECT * FROM books WHERE id = $1', [req.params.id]);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/books', async (req, res) => {
  try {
    const { title, publisher, year_published, year_arrived, isbn } = req.body;
    const result = await query(
      'INSERT INTO books (title, publisher, year_published, year_arrived, isbn) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [title, publisher, year_published, year_arrived, isbn]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/books/:id', async (req, res) => {
  try {
    const { title, publisher, year_published, year_arrived, isbn } = req.body;
    const result = await query(
      'UPDATE books SET title = $1, publisher = $2, year_published = $3, year_arrived = $4, isbn = $5 WHERE id = $6 RETURNING *',
      [title, publisher, year_published, year_arrived, isbn, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/books/:id', async (req, res) => {
  try {
    await query('DELETE FROM books WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Authors
app.get('/api/authors', async (req, res) => {
  try {
    const result = await query('SELECT * FROM authors ORDER BY id');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/authors/:id', async (req, res) => {
  try {
    const result = await query('SELECT * FROM authors WHERE id = $1', [req.params.id]);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/authors', async (req, res) => {
  try {
    const { name } = req.body;
    const result = await query('INSERT INTO authors (name) VALUES ($1) RETURNING *', [name]);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/authors/:id', async (req, res) => {
  try {
    const { name } = req.body;
    const result = await query('UPDATE authors SET name = $1 WHERE id = $2 RETURNING *', [name, req.params.id]);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/authors/:id', async (req, res) => {
  try {
    await query('DELETE FROM authors WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Book Copies
app.get('/api/book-copies', async (req, res) => {
  try {
    const result = await query('SELECT * FROM book_copies ORDER BY id');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/book-copies/:id', async (req, res) => {
  try {
    const result = await query('SELECT * FROM book_copies WHERE id = $1', [req.params.id]);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/book-copies', async (req, res) => {
  try {
    const { book_id, point_id, inventory_number, status } = req.body;
    const result = await query(
      'INSERT INTO book_copies (book_id, point_id, inventory_number, status) VALUES ($1, $2, $3, $4) RETURNING *',
      [book_id, point_id, inventory_number, status]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/book-copies/:id', async (req, res) => {
  try {
    const { book_id, point_id, inventory_number, status } = req.body;
    const result = await query(
      'UPDATE book_copies SET book_id = $1, point_id = $2, inventory_number = $3, status = $4 WHERE id = $5 RETURNING *',
      [book_id, point_id, inventory_number, status, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/book-copies/:id', async (req, res) => {
  try {
    await query('DELETE FROM book_copies WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Book Loans
app.get('/api/book-loans', async (req, res) => {
  try {
    const result = await query('SELECT * FROM book_loans ORDER BY id DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/book-loans/:id', async (req, res) => {
  try {
    const result = await query('SELECT * FROM book_loans WHERE id = $1', [req.params.id]);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/book-loans', async (req, res) => {
  try {
    const { copy_id, reader_id, loan_date, due_date, point_id } = req.body;
    const result = await query(
      'INSERT INTO book_loans (copy_id, reader_id, loan_date, due_date, point_id) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [copy_id, reader_id, loan_date, due_date, point_id]
    );
    // Update book copy status
    await query("UPDATE book_copies SET status = 'loaned' WHERE id = $1", [copy_id]);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/book-loans/:id/return', async (req, res) => {
  try {
    const { return_date } = req.body;
    const result = await query(
      'UPDATE book_loans SET return_date = $1 WHERE id = $2 RETURNING *',
      [return_date || new Date().toISOString().split('T')[0], req.params.id]
    );
    // Update book copy status
    await query("UPDATE book_copies SET status = 'available' WHERE id = (SELECT copy_id FROM book_loans WHERE id = $1)", [req.params.id]);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/book-loans/:id', async (req, res) => {
  try {
    const { copy_id, reader_id, loan_date, due_date, return_date, point_id } = req.body;
    const result = await query(
      'UPDATE book_loans SET copy_id = $1, reader_id = $2, loan_date = $3, due_date = $4, return_date = $5, point_id = $6 WHERE id = $7 RETURNING *',
      [copy_id, reader_id, loan_date, due_date, return_date, point_id, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/book-loans/:id', async (req, res) => {
  try {
    await query('DELETE FROM book_loans WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Fines
app.get('/api/fines', async (req, res) => {
  try {
    const result = await query('SELECT * FROM fines ORDER BY id DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/fines/:id', async (req, res) => {
  try {
    const result = await query('SELECT * FROM fines WHERE id = $1', [req.params.id]);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/fines/:id/pay', async (req, res) => {
  try {
    const result = await query('UPDATE fines SET paid = true WHERE id = $1 RETURNING *', [req.params.id]);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Lost Books
app.get('/api/lost-books', async (req, res) => {
  try {
    const result = await query('SELECT * FROM lost_books ORDER BY id DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/lost-books/:id/compensate', async (req, res) => {
  try {
    const result = await query('UPDATE lost_books SET compensated = true WHERE id = $1 RETURNING *', [req.params.id]);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Loan Bans
app.get('/api/loan-bans', async (req, res) => {
  try {
    const result = await query('SELECT * FROM loan_bans ORDER BY id DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Interlibrary Orders
app.get('/api/interlibrary-orders', async (req, res) => {
  try {
    const result = await query('SELECT * FROM interlibrary_orders ORDER BY id DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Statistics endpoints (calling PostgreSQL functions)
app.get('/api/statistics/top-books', async (req, res) => {
  try {
    const result = await query("SELECT * FROM top20_books_in_hall($1)", [req.query.pointName]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/statistics/long-term-debtors', async (req, res) => {
  try {
    const result = await query("SELECT * FROM get_long_term_debtors($1)", [req.query.categoryName]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/statistics/books-arrived-lost', async (req, res) => {
  try {
    const result = await query("SELECT * FROM books_arrived_lost_last_year($1)", [req.query.authorName]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/statistics/point-max-debtors', async (req, res) => {
  try {
    const result = await query('SELECT * FROM point_max_debtors()');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/statistics/mba-orders', async (req, res) => {
  try {
    const result = await query("SELECT * FROM mba_orders_by_period($1, $2)", [req.query.period, req.query.daysBack]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/statistics/total-copies', async (req, res) => {
  try {
    const result = await query("SELECT total_copies($1) as total", [req.query.bookTitle]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/statistics/banned-over-2months', async (req, res) => {
  try {
    const result = await query('SELECT * FROM banned_over_2months()');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/statistics/new-readers-last-month', async (req, res) => {
  try {
    const result = await query('SELECT * FROM new_readers_last_month()');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/statistics/readers-by-faculty', async (req, res) => {
  try {
    const result = await query("SELECT * FROM get_readers_by_faculty($1)", [req.query.facultyName]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/statistics/reader-current-books', async (req, res) => {
  try {
    const result = await query("SELECT * FROM reader_current_books($1)", [req.query.readerLastname]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==================== START SERVER ====================

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📚 API available at http://localhost:${PORT}/api`);
});