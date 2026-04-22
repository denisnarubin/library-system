-- ✅ Исправляем внешние ключи чтобы удаление книги работало автоматически

-- Сначала удаляем старый внешний ключ
ALTER TABLE book_authors DROP CONSTRAINT book_authors_book_id_fkey;

-- Создаем новый с ON DELETE CASCADE
ALTER TABLE book_authors ADD CONSTRAINT book_authors_book_id_fkey
FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE;

-- Также исправляем для экземпляров книг
ALTER TABLE book_copies DROP CONSTRAINT book_copies_book_id_fkey;

ALTER TABLE book_copies ADD CONSTRAINT book_copies_book_id_fkey
FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE;