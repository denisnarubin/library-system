-- ✅ ВЫПОЛНИТЕ ТОЛЬКО ЭТУ КОМАНДУ ПРЯМО СЕЙЧАС
-- Это единственная команда которая нужна чтобы исправить вашу ошибку прямо сейчас

ALTER TABLE book_loans DROP CONSTRAINT book_loans_reader_id_fkey;

ALTER TABLE book_loans 
ADD CONSTRAINT book_loans_reader_id_fkey 
FOREIGN KEY (reader_id) REFERENCES readers(id) ON DELETE CASCADE;

-- ✅ ВСЁ. После выполнения этих двух строк удаление читателей начнёт работать.