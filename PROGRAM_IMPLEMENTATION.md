# 6.3 Выполнение программного кода для системы автоматизации библиотеки

Программная часть информационной системы библиотеки реализована на языке JavaScript с использованием платформы Node.js, фреймворка Express и реляционной базы данных PostgreSQL. Основная логика работы приложения сосредоточена на бэкенд-сервере, который принимает запросы от клиентской части, выполняет валидацию и проверку бизнес-правил, осуществляет операции с данными через пул соединений к базе данных. Такой подход позволяет хранить всю бизнес-логику на стороне сервера, упростить сопровождение кода, обеспечить единый способ работы с данными и независимость клиентского интерфейса.

В системе реализованы все стандартные операции с данными: добавление, получение, изменение и удаление записей для всех сущностей предметной области. Для каждой категории объектов предусмотрены отдельные группы маршрутов, реализующие необходимый функционал согласно требованиям библиотеки. Пример реализации операции выдачи книги читателю приведен в листинге 6.1.

Листинг 6.1 – Регистрация выдачи книги читателю
```javascript
app.post('/api/book-loans', async (req, res) => {
  try {
    const { copy_id, reader_id, loan_date, due_date, point_id } = req.body;
    const result = await query(
      'INSERT INTO book_loans (copy_id, reader_id, loan_date, due_date, point_id) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [copy_id, reader_id, loan_date, due_date, point_id]
    );
    
    // Автоматическое обновление статуса экземпляра книги
    await query("UPDATE book_copies SET status = 'loaned' WHERE id = $1", [copy_id]);
    
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
```

Для возврата книги используется расширенная логика, включающая автоматический расчет штрафов при просрочке возврата. При этом все операции выполняются в определенной последовательности с соблюдением целостности данных. Пример реализации процедуры возврата книги показан в листинге 6.2.

Листинг 6.2 – Операция возврата книги с расчетом штрафа
```javascript
app.post('/api/book-loans/:id/return', async (req, res) => {
  try {
    const { return_date } = req.body;
    const actualReturnDate = return_date || new Date().toISOString().split('T')[0];
    const loanResult = await query('SELECT * FROM book_loans WHERE id = $1', [req.params.id]);
    const loan = loanResult.rows[0];
    await query(
      'UPDATE book_loans SET return_date = $1 WHERE id = $2',
      [actualReturnDate, req.params.id]
    );
    await query("UPDATE book_copies SET status = 'available' WHERE id = $1", [loan.copy_id]);
    if (actualReturnDate > loan.due_date) {
      const overdue_days = Math.ceil((new Date(actualReturnDate) - new Date(loan.due_date)) / (1000 * 60 * 60 * 24));
      const fine_amount = overdue_days * 5.0;
      await query(
        'INSERT INTO fines (loan_id, reader_id, amount, reason, paid) VALUES ($1, $2, $3, $4, false)',
        [loan.id, loan.reader_id, fine_amount, 'overdue']
      );
    }
    return NoContent();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
```

Получение списков данных и отчетов реализовано через вызов встроенных функций и представлений базы данных. При этом для сложных отчетов выполняются объединения нескольких таблиц, что позволяет сразу получить все необходимые сведения в готовом для отображения виде. Пример регистрации утерянной книги с использованием транзакций приведен в листинге 6.3.

Листинг 6.3 – Регистрация утерянной книги с транзакцией
```javascript
app.post('/api/lost-books', async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await client.query(
      'INSERT INTO lost_books (copy_id, reader_id, loss_date, compensation_amount, compensated) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [copy_id, reader_id, loss_date, 5000, false]
    );
    await client.query("UPDATE book_copies SET status = 'lost' WHERE id = $1", [copy_id]);
    await client.query(
      "UPDATE book_loans SET return_date = $1 WHERE copy_id = $2 AND return_date IS NULL",
      [loss_date, copy_id]
    );
    await client.query(
      'INSERT INTO fines (loan_id, reader_id, amount, reason, paid) VALUES ($1, $2, $3, $4, false)',
      [loan_id, reader_id, 5000, 'lost_book']
    );
    await client.query('COMMIT');
    res.json(result.rows[0]);
  } catch (txErr) {
    await client.query('ROLLBACK');
    throw txErr;
  } finally {
    client.release();
  }
});
```

Удаление данных также реализовано с учетом ограничений предметной области и требований к целостности данных. Например, перед удалением читателя системы автоматически удаляются все связанные с ним записи в правильной последовательности, исключая нарушение внешних ключей. Пример такой операции показан в листинге 6.4.

Листинг 6.4 – Удаление читателя с соблюдением целостности данных
```javascript
app.delete('/api/readers/:id', async (req, res) => {
  try {
    const readerId = req.params.id;
    
    // Удаление всех связанных записей в правильном порядке
    await query('DELETE FROM fines WHERE reader_id = $1', [readerId]);
    await query('DELETE FROM loan_bans WHERE reader_id = $1', [readerId]);
    await query('DELETE FROM book_requests WHERE reader_id = $1', [readerId]);
    await query('DELETE FROM interlibrary_orders WHERE reader_id = $1', [readerId]);
    await query('DELETE FROM lost_books WHERE reader_id = $1', [readerId]);
    await query('DELETE FROM book_loans WHERE reader_id = $1', [readerId]);
    await query('DELETE FROM library_cards WHERE reader_id = $1', [readerId]);
    await query('DELETE FROM students_details WHERE reader_id = $1', [readerId]);
    await query('DELETE FROM teachers_details WHERE reader_id = $1', [readerId]);
    await query('DELETE FROM one_time_readers_details WHERE reader_id = $1', [readerId]);
    
    // Удаление самой записи читателя
    await query('DELETE FROM readers WHERE id = $1', [readerId]);
    
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
```

В процессе выполнения программы используются асинхронные методы работы с базой данных, что позволяет не блокировать обработку запросов и обеспечивает высокую производительность системы при одновременной работе большого числа пользователей. Для формирования отчетов и статистики используются предопределенные функции базы данных, что позволяет перенести вычислительную нагрузку на уровень СУБД и значительно ускорить формирование сложных отчетов.

В процессе тестирования были проверены все основные функциональные части программы, включая корректность выполнения операций добавления, изменения, удаления и отображения данных. Тестирование проводилось в следующих сценариях:
− добавление новых читателей, книг, экземпляров и других записей в систему;
− регистрация выдач и возвратов книг, включая просроченные возвраты;
− регистрация утерянных книг и компенсации ущерба;
− фильтрация данных по нескольким критериям и формирование отчетов;
− удаление данных с учетом ограничений целостности данных;
− работа с транзакциями при выполнении комплексных операций.