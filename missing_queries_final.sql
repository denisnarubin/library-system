-- =================================================
-- ✅ ИТОГОВЫЕ ИСПРАВЛЕННЫЕ ФУНКЦИИ 100% СООТВЕТСТВУЮТ ВАШЕЙ СХЕМЕ БД
-- =================================================

-- =================================================
-- ✅ ФУНКЦИЯ 1: Новые читатели за период
-- ✅ ВСЕ ИМЕНА ТОЧНО КАК В ВАШЕЙ БД
-- =================================================
CREATE OR REPLACE FUNCTION get_readers_changes_by_period(period_type TEXT)
RETURNS TABLE (
    status TEXT,
    reader_name TEXT,
    event_date DATE,
    faculty TEXT,
    course INT,
    group_name TEXT
) AS $$
DECLARE
    start_date DATE;
BEGIN
    CASE period_type
        WHEN 'month' THEN start_date := date_trunc('month', CURRENT_DATE);
        WHEN 'semester' THEN start_date := CURRENT_DATE - INTERVAL '6 months';
        WHEN 'year' THEN start_date := date_trunc('year', CURRENT_DATE);
        ELSE start_date := date_trunc('month', CURRENT_DATE);
    END CASE;

    RETURN QUERY
    SELECT 
        'Новый'::TEXT AS status,
        CONCAT(r.last_name, ' ', r.first_name)::TEXT AS reader_name,
        lc.issue_date AS event_date,
        sd.faculty,
        sd.course,
        CAST(sd.group_number AS TEXT) AS group_name
    FROM readers r
    JOIN library_cards lc ON r.id = lc.reader_id
    LEFT JOIN students_details sd ON r.id = sd.reader_id
    WHERE lc.issue_date >= start_date
    ORDER BY lc.issue_date DESC;
END;
$$ LANGUAGE plpgsql;


-- =================================================
-- ✅ ФУНКЦИЯ 2: Наличие книги на пунктах выдачи
-- ✅ ВСЕ ИМЕНА ТОЧНО КАК В ВАШЕЙ БД
-- =================================================
CREATE OR REPLACE FUNCTION check_book_availability(book_title VARCHAR)
RETURNS TABLE (
    point_name VARCHAR,
    point_type VARCHAR,
    total_copies BIGINT,
    available_copies BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        pp.name AS point_name,
        pp.point_type,
        COUNT(bc.id) AS total_copies,
        COUNT(bc.id) - COUNT(bl.id) AS available_copies
    FROM books b
    JOIN book_copies bc ON b.id = bc.book_id
    JOIN publication_points pp ON bc.point_id = pp.id
    LEFT JOIN book_loans bl ON bc.id = bl.copy_id AND bl.return_date IS NULL
    WHERE b.title ILIKE '%' || book_title || '%'
    GROUP BY pp.id, pp.name, pp.point_type
    ORDER BY available_copies DESC;
END;
$$ LANGUAGE plpgsql;


-- =================================================
-- ✅ ФУНКЦИЯ 3: Читатели у которых находится книга
-- ✅ ВСЕ ИМЕНА ТОЧНО КАК В ВАШЕЙ БД
-- =================================================
CREATE OR REPLACE FUNCTION get_book_holders(book_id INT)
RETURNS TABLE (
    reader_name TEXT,
    faculty TEXT,
    due_date DATE,
    days_remaining INT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        CONCAT(r.last_name, ' ', r.first_name) AS reader_name,
        sd.faculty,
        bl.due_date,
        (bl.due_date - CURRENT_DATE)::INT AS days_remaining
    FROM book_loans bl
    JOIN book_copies bc ON bl.copy_id = bc.id
    JOIN readers r ON bl.reader_id = r.id
    LEFT JOIN students_details sd ON r.id = sd.reader_id
    WHERE bc.book_id = book_id
      AND bl.return_date IS NULL
    ORDER BY bl.due_date ASC;
END;
$$ LANGUAGE plpgsql;


-- =================================================
-- ✅ ФУНКЦИЯ 4: Полная информация о читателе
-- ✅ ВСЕ ИМЕНА ТОЧНО КАК В ВАШЕЙ БД
-- =================================================
CREATE OR REPLACE FUNCTION get_reader_full_info(reader_lastname VARCHAR)
RETURNS TABLE (
    full_name TEXT,
    category VARCHAR,
    faculty TEXT,
    course INT,
    group_name TEXT,
    card_number VARCHAR,
    registration_date DATE,
    current_books_count BIGINT,
    total_loans BIGINT,
    total_fines DECIMAL,
    unpaid_fines DECIMAL,
    lost_books_count BIGINT,
    bans_count BIGINT,
    active_ban BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        CONCAT(r.last_name, ' ', r.first_name) AS full_name,
        rc.name AS category,
        sd.faculty,
        sd.course,
        sd.group_number AS group_name,
        CAST(lc.id AS VARCHAR) AS card_number,
        lc.issue_date AS registration_date,
        COUNT(DISTINCT bl.id) FILTER (WHERE bl.return_date IS NULL) AS current_books_count,
        COUNT(DISTINCT bl.id) AS total_loans,
        COALESCE(SUM(f.amount), 0) AS total_fines,
        COALESCE(SUM(f.amount) FILTER (WHERE f.paid = false), 0) AS unpaid_fines,
        COUNT(DISTINCT lb.id) AS lost_books_count,
        COUNT(DISTINCT lban.id) AS bans_count,
        EXISTS (
            SELECT 1 FROM loan_bans 
            WHERE reader_id = r.id 
              AND start_date <= CURRENT_DATE 
              AND end_date >= CURRENT_DATE
        ) AS active_ban
    FROM readers r
    JOIN reader_categories rc ON r.category_id = rc.id
    LEFT JOIN students_details sd ON r.id = sd.reader_id
    JOIN library_cards lc ON r.id = lc.reader_id
    LEFT JOIN book_loans bl ON r.id = bl.reader_id
    LEFT JOIN fines f ON r.id = f.reader_id
    LEFT JOIN lost_books lb ON r.id = lb.reader_id
    LEFT JOIN loan_bans lban ON r.id = lban.reader_id
    WHERE r.last_name ILIKE reader_lastname || '%'
    GROUP BY r.id, rc.name, sd.faculty, sd.course, sd.group_number, lc.id, lc.issue_date;
END;
$$ LANGUAGE plpgsql;


-- =================================================
-- ✅ ФУНКЦИЯ 5: История заказов читателя
-- ✅ ВСЕ ИМЕНА ТОЧНО КАК В ВАШЕЙ БД
-- =================================================
CREATE OR REPLACE FUNCTION get_reader_loan_history(reader_lastname VARCHAR, period_type TEXT)
RETURNS TABLE (
    book_title VARCHAR,
    loan_date DATE,
    due_date DATE,
    return_date DATE,
    is_overdue BOOLEAN
) AS $$
DECLARE
    start_date DATE;
BEGIN
    CASE period_type
        WHEN 'month' THEN start_date := CURRENT_DATE - INTERVAL '30 days';
        WHEN 'semester' THEN start_date := CURRENT_DATE - INTERVAL '180 days';
        WHEN 'year' THEN start_date := CURRENT_DATE - INTERVAL '365 days';
        ELSE start_date := CURRENT_DATE - INTERVAL '30 days';
    END CASE;

    RETURN QUERY
    SELECT 
        b.title AS book_title,
        bl.loan_date,
        bl.due_date,
        bl.return_date,
        (bl.return_date IS NULL AND CURRENT_DATE > bl.due_date) AS is_overdue
    FROM book_loans bl
    JOIN book_copies bc ON bl.copy_id = bc.id
    JOIN books b ON bc.book_id = b.id
    JOIN readers r ON bl.reader_id = r.id
    WHERE r.last_name ILIKE reader_lastname || '%'
      AND bl.loan_date >= start_date
    ORDER BY bl.loan_date DESC;
END;
$$ LANGUAGE plpgsql;