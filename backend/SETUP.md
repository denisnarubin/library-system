# Настройка PostgreSQL для библиотечной системы

## 🔧 Требования

1. Установленный PostgreSQL
2. Запущенный сервер PostgreSQL
3. База данных `library`

## 🚀 Быстрая настройка

### 1. Проверьте запущен ли PostgreSQL

**Windows:**
```bash
# Откройте Services (Службы)
services.msc

# Найдите "postgresql-x64-15" (или другая версия)
# Убедитесь, что статус "Выполняется"
```

**Или через командную строку:**
```bash
net start | findstr postgres
```

### 2. Создайте базу данных (если нет)

Откройте pgAdmin или psql:

```sql
-- Создайте базу данных
CREATE DATABASE library;

-- Создайте пользователя (если нужно)
CREATE USER postgres WITH PASSWORD 'postgres';
GRANT ALL PRIVILEGES ON DATABASE library TO postgres;
```

### 3. Проверьте подключение

```bash
# Проверка подключения
psql -h localhost -U postgres -d library -c "SELECT version();"
```

### 4. Запустите сервер

```bash
cd backend
npm start
```

## 📋 Альтернативные решения

### Вариант 1: Изменить порт PostgreSQL

Если стандартный порт 5432 занят:

1. Найдите PostgreSQL в Services
2. Кликните ПКМ → Свойства
3. Измените путь запуска, добавив `-p 5433`
4. Перезапустите службу

### Вариант 2: Использовать другой пользователь

Измените `.env`:
```
DB_USER=ваш_пользователь
DB_PASSWORD=ваш_пароль
```

### Вариант 3: Использовать Docker

```bash
docker run --name postgres-library -e POSTGRES_DB=library -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres -p 5432:5432 -d postgres:15
```

## ✅ Проверка работы

После настройки:

1. Запустите бэкенд: `npm start`
2. Должно быть: `✅ Connected to PostgreSQL database`
3. Откройте: http://localhost:3001/api/readers
4. Должен быть пустой массив `[]` или список читателей

## 🐛 Возможные проблемы

- **"Connection refused"** - PostgreSQL не запущен
- **"Access denied"** - неправильный пароль
- **"Database does not exist"** - база не создана
- **"Port already in use"** - порт занят другим процессом