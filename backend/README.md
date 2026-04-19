# Backend для библиотечной системы

Backend сервер на Node.js + Express для подключения к PostgreSQL базе данных.

## Установка

1. Установите зависимости:
```bash
cd backend
npm install
```

2. Настройте подключение к базе данных в файле `.env`:
```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=library
DB_USER=postgres
DB_PASSWORD=ваш_пароль
PORT=3001
```

3. Запустите сервер:
```bash
npm start
```

Сервер запустится на http://localhost:3001

## Проверка подключения

После запуска сервера проверьте подключение:

1. Откройте браузер и перейдите на http://localhost:3001/api/readers
2. Если подключено к БД - увидите список читателей (может быть пустым)
3. Если ошибка подключения - проверьте настройки в .env

## API Endpoints

Все endpoints доступны по адресу http://localhost:3001/api/

### Основные ресурсы:
- `GET /reader-categories` - список категорий читателей
- `GET /readers` - список читателей
- `GET /books` - список книг
- `GET /book-copies` - список экземпляров
- `GET /book-loans` - список выдач
- `GET /fines` - список штрафов
- `GET /statistics/*` - статистические запросы

## Интеграция с фронтендом

Фронтенд автоматически подключится к этому серверу, так как в `src/services/api.js` указан адрес `http://localhost:3001/api`.

## Требования к базе данных

Сервер ожидает PostgreSQL базу данных со следующей структурой (см. задание):
- reader_categories
- readers
- students_details
- teachers_details
- one_time_readers_details
- publication_points
- library_cards
- books
- authors
- book_authors
- book_copies
- book_loans
- fines
- lost_books
- loan_bans
- interlibrary_orders
- book_requests

А также функции PostgreSQL из задания (для статистики).