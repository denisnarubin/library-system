-- ✅ ИСПРАВЛЕННЫЙ СКРИПТ - безопасный, не падает если таблицы не существуют
-- Выполните этот скрипт один раз в вашей базе данных PostgreSQL

DO $$
BEGIN
    -- Исправляем teachers_details если она существует
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'teachers_details') THEN
        ALTER TABLE teachers_details DROP CONSTRAINT IF EXISTS teachers_details_reader_id_fkey;
        ALTER TABLE teachers_details 
        ADD CONSTRAINT teachers_details_reader_id_fkey 
        FOREIGN KEY (reader_id) REFERENCES readers(id) ON DELETE CASCADE;
    END IF;

    -- Исправляем one_time_readers_details если она существует
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'one_time_readers_details') THEN
        ALTER TABLE one_time_readers_details DROP CONSTRAINT IF EXISTS one_time_readers_details_reader_id_fkey;
        ALTER TABLE one_time_readers_details 
        ADD CONSTRAINT one_time_readers_details_reader_id_fkey 
        FOREIGN KEY (reader_id) REFERENCES readers(id) ON DELETE CASCADE;
    END IF;

    -- Исправляем students_details если она существует
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'students_details') THEN
        ALTER TABLE students_details DROP CONSTRAINT IF EXISTS students_details_reader_id_fkey;
        ALTER TABLE students_details 
        ADD CONSTRAINT students_details_reader_id_fkey 
        FOREIGN KEY (reader_id) REFERENCES readers(id) ON DELETE CASCADE;
    END IF;

    -- ✅ Теперь ДЛЯ ВСЕХ таблиц проверка на существование:

    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'library_cards') THEN
        ALTER TABLE library_cards DROP CONSTRAINT IF EXISTS library_cards_reader_id_fkey;
        ALTER TABLE library_cards 
        ADD CONSTRAINT library_cards_reader_id_fkey 
        FOREIGN KEY (reader_id) REFERENCES readers(id) ON DELETE CASCADE;
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'book_loans') THEN
        ALTER TABLE book_loans DROP CONSTRAINT IF EXISTS book_loans_reader_id_fkey;
        ALTER TABLE book_loans 
        ADD CONSTRAINT book_loans_reader_id_fkey 
        FOREIGN KEY (reader_id) REFERENCES readers(id) ON DELETE CASCADE;
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'fines') THEN
        ALTER TABLE fines DROP CONSTRAINT IF EXISTS fines_reader_id_fkey;
        ALTER TABLE fines 
        ADD CONSTRAINT fines_reader_id_fkey 
        FOREIGN KEY (reader_id) REFERENCES readers(id) ON DELETE CASCADE;
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'lost_books') THEN
        ALTER TABLE lost_books DROP CONSTRAINT IF EXISTS lost_books_reader_id_fkey;
        ALTER TABLE lost_books 
        ADD CONSTRAINT lost_books_reader_id_fkey 
        FOREIGN KEY (reader_id) REFERENCES readers(id) ON DELETE CASCADE;
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'loan_bans') THEN
        ALTER TABLE loan_bans DROP CONSTRAINT IF EXISTS loan_bans_reader_id_fkey;
        ALTER TABLE loan_bans 
        ADD CONSTRAINT loan_bans_reader_id_fkey 
        FOREIGN KEY (reader_id) REFERENCES readers(id) ON DELETE CASCADE;
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'book_requests') THEN
        ALTER TABLE book_requests DROP CONSTRAINT IF EXISTS book_requests_reader_id_fkey;
        ALTER TABLE book_requests 
        ADD CONSTRAINT book_requests_reader_id_fkey 
        FOREIGN KEY (reader_id) REFERENCES readers(id) ON DELETE CASCADE;
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'interlibrary_orders') THEN
        ALTER TABLE interlibrary_orders DROP CONSTRAINT IF EXISTS interlibrary_orders_reader_id_fkey;
        ALTER TABLE interlibrary_orders 
        ADD CONSTRAINT interlibrary_orders_reader_id_fkey 
        FOREIGN KEY (reader_id) REFERENCES readers(id) ON DELETE CASCADE;
    END IF;

END $$;

-- ✅ ГОТОВО!
-- Теперь скрипт пропускает несуществующие таблицы и не падает с ошибками
-- После выполнения удаление читателей будет работать идеально
