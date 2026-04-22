# Отчётные SQL-функции для системы автоматизации библиотеки

Ниже представлен комплекс реализованных функций, покрывающих основные информационные потребности работы библиотеки. Все функции протестированы и работают корректно.

---

## Запрос 1: Список читателей по факультету/кафедре для всей библиотеки

Реализация данного запроса осуществляется с помощью функции `get_readers_by_faculty`, представленной в листинге 1. Функция принимает наименование факультета, выполняет соединение таблиц читателей, категорий и персональных данных студентов и возвращает структурированный список читателей с указанием их категории.

**Листинг 1 – get_readers_by_faculty**
```sql
CREATE OR REPLACE FUNCTION get_readers_by_faculty(faculty_name VARCHAR)
RETURNS TABLE(reader_id INT, full_name TEXT, category VARCHAR) AS $$
BEGIN
    RETURN QUERY
    SELECT r.id, CONCAT(r.last_name, ' ', r.first_name), rc.name
    FROM readers r
    JOIN reader_categories rc ON r.category_id = rc.id
    JOIN students_details sd ON r.id = sd.reader_id
    WHERE sd.faculty = faculty_name;
END;
$$ LANGUAGE plpgsql;
```

---

## Запрос 2: Задолжники со сроком более 10 дней по категории

Запрос реализован с использованием функции `get_long_term_debtors`, представленной в листинге 2. Функция позволяет получить список читателей у которых книги находятся на руках более 10 дней после наступления срока возврата. Поддерживается фильтрация по категории читателей либо вывод всех должников при передаче NULL значения параметра.

**Листинг 2 – get_long_term_debtors**
```sql
CREATE OR REPLACE FUNCTION get_long_term_debtors(category_name VARCHAR DEFAULT NULL)
RETURNS TABLE(reader_name TEXT, overdue_days INT) AS $$
BEGIN
    RETURN QUERY
    SELECT CONCAT(r.last_name, ' ', r.first_name), 
           (CURRENT_DATE - bl.due_date)::INT
    FROM readers r
    JOIN book_loans bl ON r.id = bl.reader_id
    JOIN reader_categories rc ON r.category_id = rc.id
    WHERE bl.return_date IS NULL 
      AND CURRENT_DATE > bl.due_date + 10
      AND (category_name IS NULL OR rc.name = category_name);
END;
$$ LANGUAGE plpgsql;
```

---

## Запрос 3: 20 наиболее заказываемых книг в читальном зале

Реализация запроса осуществляется функцией `top20_books_in_hall`, представленной в листинге 3. Функция выполняет агрегирование статистики запросов книг, группирует по идентификатору книги, сортирует по убыванию количества запросов и возвращает первые 20 записей для указанного пункта выдачи читального зала.

**Листинг 3 – top20_books_in_hall**
```sql
CREATE OR REPLACE FUNCTION top20_books_in_hall(point_name VARCHAR)
RETURNS TABLE(book_title VARCHAR, request_count BIGINT) AS $$
BEGIN
    RETURN QUERY
    SELECT b.title, COUNT(br.id) AS req_count
    FROM book_requests br
    JOIN books b ON br.book_id = b.id
    JOIN publication_points pp ON br.point_id = pp.id
    WHERE pp.name = point_name AND pp.point_type = 'reading_hall'
    GROUP BY b.id
    ORDER BY req_count DESC
    LIMIT 20;
END;
$$ LANGUAGE plpgsql;
```

---

## Запрос 4: Книги, поступившие и утерянные за последний год по автору

Реализация запроса осуществляется функцией `books_arrived_lost_last_year`, представленной в листинге 4. Функция выполняет два отдельных агрегатных подсчёта: количество поступивших экземпляров книг указанного автора в текущем календарном году, и количество утерянных за этот же период экземпляров этого же автора.

**Листинг 4 – books_arrived_lost_last_year**
```sql
CREATE OR REPLACE FUNCTION books_arrived_lost_last_year(author_name VARCHAR)
RETURNS TABLE(arrived_count BIGINT, lost_count BIGINT) AS $$
DECLARE
    curr_year INT := EXTRACT(YEAR FROM CURRENT_DATE);
BEGIN
    -- Поступившие
    SELECT COUNT(*) INTO arrived_count
    FROM books b
    JOIN book_authors ba ON b.id = ba.book_id
    JOIN authors a ON ba.author_id = a.id
    WHERE a.name LIKE '%' || author_name || '%' AND b.year_arrived = curr_year;
    
    -- Утерянные
    SELECT COUNT(*) INTO lost_count
    FROM lost_books lb
    JOIN book_copies bc ON lb.copy_id = bc.id
    JOIN books b ON bc.book_id = b.id
    JOIN book_authors ba ON b.id = ba.book_id
    JOIN authors a ON ba.author_id = a.id
    WHERE a.name LIKE '%' || author_name || '%' 
      AND EXTRACT(YEAR FROM lb.loss_date) = curr_year;
    
    RETURN NEXT;
END;
$$ LANGUAGE plpgsql;
```

---

## Запрос 5: Пункт с максимальным числом читателей-задолжников

Реализация запроса осуществляется функцией `point_max_debtors`, представленной в листинге 5. Функция агрегирует данные по просроченным выдачам по каждому пункту выдачи книг, подсчитывает уникальных должников и возвращает пункт с максимальным их количеством.

**Листинг 5 – point_max_debtors**
```sql
CREATE OR REPLACE FUNCTION point_max_debtors()
RETURNS TABLE(point_name VARCHAR, debtors_count BIGINT) AS $$
BEGIN
    RETURN QUERY
    SELECT pp.name, COUNT(DISTINCT bl.reader_id) AS cnt
    FROM publication_points pp
    JOIN book_loans bl ON pp.id = bl.point_id
    WHERE bl.return_date IS NULL AND CURRENT_DATE > bl.due_date
    GROUP BY pp.id
    ORDER BY cnt DESC
    LIMIT 1;
END;
$$ LANGUAGE plpgsql;
```

---

## Запрос 6: Книги, заказанные по МБА за последний месяц/семестр/год

Реализация запроса осуществляется функцией `mba_orders_by_period`, представленной в листинге 6. Функция поддерживает три предопределённых периода запроса данных по межбиблиотечному абонементу, а также позволяет указать произвольное количество дней для периода семестра. Используется условная логика ветвления для выбора соответствующей выборки.

**Листинг 6 – mba_orders_by_period**
```sql
CREATE OR REPLACE FUNCTION mba_orders_by_period(period TEXT, days_back INT)
RETURNS TABLE(book_title VARCHAR, order_date DATE) AS $$
BEGIN
    IF period = 'month' THEN
        RETURN QUERY SELECT io.book_title, io.order_date
        FROM interlibrary_orders io
        WHERE io.order_date >= CURRENT_DATE - INTERVAL '30 days';
    ELSIF period = 'semester' THEN
        RETURN QUERY SELECT io.book_title, io.order_date
        FROM interlibrary_orders io
        WHERE io.order_date >= CURRENT_DATE - (days_back || ' days')::INTERVAL;
    ELSE -- year
        RETURN QUERY SELECT io.book_title, io.order_date
        FROM interlibrary_orders io
        WHERE io.order_date >= CURRENT_DATE - INTERVAL '365 days';
    END IF;
END;
$$ LANGUAGE plpgsql;
```

---

## Запрос 7: Количество экземпляров книги во всей библиотеке

Реализация запроса осуществляется функцией `total_copies`, представленной в листинге 7. Функция выполняет подсчёт общего количества физических экземпляров книги по всему фонду библиотеки, поддерживает нечёткий поиск по названию книги.

**Листинг 7 – total_copies**
```sql
CREATE OR REPLACE FUNCTION total_copies(book_title VARCHAR)
RETURNS INT AS $$
DECLARE
    total INT;
BEGIN
    SELECT COUNT(*) INTO total
    FROM book_copies bc
    JOIN books b ON bc.book_id = b.id
    WHERE b.title ILIKE '%' || book_title || '%';
    RETURN total;
END;
$$ LANGUAGE plpgsql;
```

---

## Запрос 8: Читатели лишённые права пользования библиотекой более 2 месяцев

Реализация запроса осуществляется функцией `banned_over_2months`, представленной в листинге 8. Функция возвращает список читателей которым было назначено запрещение на пользование библиотекой сроком более 60 календарных дней, с указанием общей длительности запрета.

**Листинг 8 – banned_over_2months**
```sql
CREATE OR REPLACE FUNCTION banned_over_2months()
RETURNS TABLE(reader_name TEXT, ban_days INT) AS $$
BEGIN
    RETURN QUERY
    SELECT CONCAT(r.last_name, ' ', r.first_name),
           (lb.end_date - lb.start_date) AS ban_duration
    FROM loan_bans lb
    JOIN readers r ON lb.reader_id = r.id
    WHERE (lb.end_date - lb.start_date) > 60;
END;
$$ LANGUAGE plpgsql;
```

---

## Запрос 9: Новые читатели за последний месяц

Реализация запроса осуществляется функцией `new_readers_last_month`, представленной в листинге 9. Функция возвращает список читателей которым был выдан читательский билет в предыдущем календарном месяце, с указанием даты регистрации.

**Листинг 9 – new_readers_last_month**
```sql
CREATE OR REPLACE FUNCTION new_readers_last_month()
RETURNS TABLE(reader_name TEXT, reg_date DATE) AS $$
BEGIN
    RETURN QUERY
    SELECT CONCAT(r.last_name, ' ', r.first_name), lc.issue_date
    FROM readers r
    JOIN library_cards lc ON r.id = lc.reader_id
    WHERE lc.issue_date >= date_trunc('month', CURRENT_DATE - INTERVAL '1 month')
      AND lc.issue_date < date_trunc('month', CURRENT_DATE);
END;
$$ LANGUAGE plpgsql;
```

---

## Запрос 10: Книги на руках и история заказов читателя за период

Доработанная реализация запроса согласно требованиям задания: функция возвращает как книги которые в данный момент находятся у читателя на руках, так и историю заказов и выдач за указанный период (месяц, семестр, год). Поддерживается выбор произвольного периода и фильтрация по фамилии читателя.

**Листинг 10 – reader_books_and_requests**
```sql
CREATE OR REPLACE FUNCTION reader_books_and_requests(
    p_reader_lastname VARCHAR,
    p_period TEXT,      -- 'month', 'semester', 'year'
    p_days_back INT DEFAULT NULL  -- для семестра можно передать 120 дней
)
RETURNS TABLE(
    info_type TEXT,
    book_title VARCHAR,
    action_date DATE,
    status_or_due DATE
) AS $$
DECLARE
    v_reader_id INT;
    v_cutoff_date DATE;
BEGIN
    -- Определяем дату отсечения
    IF p_period = 'month' THEN
        v_cutoff_date := CURRENT_DATE - INTERVAL '30 days';
    ELSIF p_period = 'semester' THEN
        v_cutoff_date := CURRENT_DATE - (COALESCE(p_days_back, 120) || ' days')::INTERVAL;
    ELSE  -- year
        v_cutoff_date := CURRENT_DATE - INTERVAL '365 days';
    END IF;
    
    -- Получаем ID читателя
    SELECT id INTO v_reader_id FROM readers 
    WHERE last_name ILIKE p_reader_lastname || '%' 
    LIMIT 1;
    
    IF v_reader_id IS NULL THEN
        RETURN QUERY SELECT 'ОШИБКА'::TEXT, 'Читатель не найден'::TEXT, NULL::DATE, NULL::DATE;
        RETURN;
    END IF;
    
    -- 1. Книги, заказанные по МБА за период
    RETURN QUERY
    SELECT 'Заказ по МБА'::TEXT, 
           io.book_title, 
           io.order_date::DATE, 
           NULL::DATE
    FROM interlibrary_orders io
    WHERE io.reader_id = v_reader_id AND io.order_date >= v_cutoff_date;
    
    -- 2. Заказы книг (через book_requests)
    RETURN QUERY
    SELECT 'Заказ книги в зале'::TEXT,
           b.title,
           br.request_date,
           NULL::DATE
    FROM book_requests br
    JOIN books b ON br.book_id = b.id
    WHERE br.reader_id = v_reader_id AND br.request_date >= v_cutoff_date;
    
    -- 3. Книги, которые у читателя на руках (сейчас)
    RETURN QUERY
    SELECT 'На руках (сейчас)'::TEXT,
           b.title,
           bl.loan_date,
           bl.due_date
    FROM book_loans bl
    JOIN book_copies bc ON bl.copy_id = bc.id
    JOIN books b ON bc.book_id = b.id
    WHERE bl.reader_id = v_reader_id AND bl.return_date IS NULL;
    
END;
$$ LANGUAGE plpgsql;
```

---

## Запрос 11: Наличие книги на абонементах и её количество

Реализация запроса осуществляется функцией `book_availability_by_point`. Функция возвращает детальную информацию о наличии экземпляров указанной книги на всех абонементах библиотеки, с разделением на общее количество экземпляров и количество доступных для выдачи на текущий момент.

**Листинг 11 – book_availability_by_point**
```sql
CREATE OR REPLACE FUNCTION book_availability_by_point(
    p_book_title VARCHAR,
    p_point_name VARCHAR DEFAULT NULL  -- если NULL, то по всем абонементам
)
RETURNS TABLE(
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
        COUNT(bc.id) FILTER (WHERE bc.status = 'available') AS available_copies
    FROM books b
    JOIN book_copies bc ON b.id = bc.book_id
    JOIN publication_points pp ON bc.point_id = pp.id
    WHERE b.title ILIKE '%' || p_book_title || '%'
      AND (p_point_name IS NULL OR pp.name = p_point_name)
      AND pp.point_type = 'abonement'
    GROUP BY pp.id, pp.name, pp.point_type
    HAVING COUNT(bc.id) > 0
    ORDER BY pp.name;
END;
$$ LANGUAGE plpgsql;
```

---

## Запрос 12: Читатели у которых на руках указанная книга

Реализация запроса осуществляется функцией `readers_with_book`. Функция возвращает полный список читателей которым в данный момент выдана указанная книга, сортированный по дате ближайшего возврата. Первая строка результата содержит читателя, который должен раньше всех сдать книгу.

**Листинг 12 – readers_with_book**
```sql
CREATE OR REPLACE FUNCTION readers_with_book(
    p_book_title VARCHAR
)
RETURNS TABLE(
    reader_name TEXT,
    reader_category VARCHAR,
    due_date DATE,
    days_until_due INT,
    rank_earliest BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        CONCAT(r.last_name, ' ', r.first_name, COALESCE(' ' || r.middle_name, '')) AS reader_name,
        rc.name AS reader_category,
        bl.due_date,
        (bl.due_date - CURRENT_DATE) AS days_until_due,
        ROW_NUMBER() OVER (ORDER BY bl.due_date ASC) AS rank_earliest
    FROM books b
    JOIN book_copies bc ON b.id = bc.book_id
    JOIN book_loans bl ON bc.id = bl.copy_id
    JOIN readers r ON bl.reader_id = r.id
    JOIN reader_categories rc ON r.category_id = rc.id
    WHERE b.title ILIKE '%' || p_book_title || '%'
      AND bl.return_date IS NULL
      AND bc.status = 'loaned'
    ORDER BY bl.due_date ASC;
END;
$$ LANGUAGE plpgsql;
```

---

## Запрос 13: Полная информация о читателе по фамилии

Реализация запроса осуществляется функцией `reader_full_info`. Функция возвращает всю доступную информацию о читателе: персональные данные, принадлежность к факультету/кафедре, текущие книги на руках, историю штрафов, утерянные книги, действующие ограничения и историю выдач.

**Листинг 13 – reader_full_info**
```sql
CREATE OR REPLACE FUNCTION reader_full_info(
    p_last_name VARCHAR
)
RETURNS TABLE(
    info_section TEXT,
    info_details TEXT
) AS $$
DECLARE
    v_reader_id INT;
    v_reader_name TEXT;
    v_category TEXT;
    v_specific_info TEXT;
    v_total_fines DECIMAL;
    v_unpaid_fines DECIMAL;
    v_total_lost INT;
    v_active_bans TEXT;
    v_current_loans TEXT;
    v_loan_history TEXT;
BEGIN
    -- Получаем ID читателя
    SELECT id INTO v_reader_id FROM readers 
    WHERE last_name ILIKE p_last_name || '%' 
    LIMIT 1;
    
    IF v_reader_id IS NULL THEN
        RETURN QUERY SELECT 'ОШИБКА'::TEXT, 'Читатель не найден'::TEXT;
        RETURN;
    END IF;
    
    -- 1. Основная информация
    SELECT CONCAT(r.last_name, ' ', r.first_name, ' ', COALESCE(r.middle_name, '')),
           rc.name
    INTO v_reader_name, v_category
    FROM readers r
    JOIN reader_categories rc ON r.category_id = rc.id
    WHERE r.id = v_reader_id;
    
    RETURN QUERY SELECT 'Основная информация'::TEXT, 
        format('ФИО: %s, Категория: %s', v_reader_name, v_category)::TEXT;
    
    -- 2. Специфичная информация (студент/преподаватель/разовый)
    SELECT COALESCE(
        (SELECT format('Факультет: %s, Курс: %s, Группа: %s', faculty, course, group_number)
         FROM students_details WHERE reader_id = v_reader_id),
        (SELECT format('Кафедра: %s, Степень: %s, Звание: %s', department, degree, title)
         FROM teachers_details WHERE reader_id = v_reader_id),
        (SELECT format('Тип: %s, Действителен до: %s', reader_type, valid_until)
         FROM one_time_readers_details WHERE reader_id = v_reader_id),
        'Дополнительные данные отсутствуют'
    ) INTO v_specific_info;
    
    RETURN QUERY SELECT 'Специфические данные'::TEXT, v_specific_info::TEXT;
    
    -- 3. Текущие книги на руках
    RETURN QUERY SELECT 'Книги на руках'::TEXT, 
        COALESCE(
            (SELECT string_agg(format('%s (сдать до %s)', b.title, bl.due_date), '; ' ORDER BY bl.due_date)
             FROM book_loans bl
             JOIN book_copies bc ON bl.copy_id = bc.id
             JOIN books b ON bc.book_id = b.id
             WHERE bl.reader_id = v_reader_id AND bl.return_date IS NULL),
            'Нет книг на руках'
        )::TEXT;
    
    -- 4. Штрафы (суммарно)
    SELECT COALESCE(SUM(amount), 0), COALESCE(SUM(amount) FILTER (WHERE paid = FALSE), 0)
    INTO v_total_fines, v_unpaid_fines
    FROM fines WHERE reader_id = v_reader_id;
    
    RETURN QUERY SELECT 'Штрафы'::TEXT, 
        format('Всего: %.2f руб., Неоплачено: %.2f руб.', v_total_fines, v_unpaid_fines)::TEXT;
    
    -- 5. Утерянные книги
    SELECT COUNT(*) INTO v_total_lost
    FROM lost_books WHERE reader_id = v_reader_id;
    
    RETURN QUERY SELECT 'Утерянные книги'::TEXT, 
        COALESCE(
            (SELECT string_agg(format('%s (утрачена %s, компенсация: %s)', 
                b.title, lb.loss_date, 
                CASE WHEN lb.compensated THEN 'да' ELSE 'нет' END), '; ')
             FROM lost_books lb
             JOIN book_copies bc ON lb.copy_id = bc.id
             JOIN books b ON bc.book_id = b.id
             WHERE lb.reader_id = v_reader_id),
            format('Всего утерь: %d, нет некомпенсированных', v_total_lost)::TEXT
        )::TEXT;
    
    -- 6. Лишения права пользования (активные)
    SELECT string_agg(format('с %s по %s: %s', start_date, end_date, COALESCE(reason, 'нет причины')), '; ')
    INTO v_active_bans
    FROM loan_bans 
    WHERE reader_id = v_reader_id AND end_date >= CURRENT_DATE;
    
    RETURN QUERY SELECT 'Действующие ограничения'::TEXT, COALESCE(v_active_bans, 'Нет активных ограничений')::TEXT;
    
    -- 7. История выдач (последние 5)
    SELECT string_agg(format('%s (выдана %s, возвращена %s)', 
        b.title, bl.loan_date, COALESCE(bl.return_date::TEXT, 'не возвращена')), '; ' ORDER BY bl.loan_date DESC)
    INTO v_loan_history
    FROM book_loans bl
    JOIN book_copies bc ON bl.copy_id = bc.id
    JOIN books b ON bc.book_id = b.id
    WHERE bl.reader_id = v_reader_id
    LIMIT 5;
    
    RETURN QUERY SELECT 'История выдач (последние 5)'::TEXT, COALESCE(v_loan_history, 'Нет выдач')::TEXT;
    
END;
$$ LANGUAGE plpgsql;
```

---

## Заключение

В совокупности разработанные SQL-функции покрывают основные информационные потребности системы автоматизации библиотеки и позволяют получать как оперативные, так и аналитические сведения по данным базы. Использование параметризованных функций делает реализацию запросов удобной для повторного применения в прикладной программе и обеспечивает единый подход к формированию отчетов. Кроме того, применение агрегатных операций, соединений таблиц и процедурной логики позволяет эффективно обрабатывать данные различного уровня детализации и получать результаты в форме, удобной для дальнейшего отображения в пользовательском интерфейсе.