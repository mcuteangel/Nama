CREATE OR REPLACE FUNCTION public.get_upcoming_birthdays(user_id_param uuid)
 RETURNS TABLE(id uuid, first_name text, last_name text, birthday date, days_until_birthday integer)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public', pg_temp
AS $function$
DECLARE
    current_month INTEGER;
    current_day INTEGER;
BEGIN
    -- Get current month and day in Gregorian calendar
    SELECT EXTRACT(MONTH FROM NOW()), EXTRACT(DAY FROM NOW()) INTO current_month, current_day;

    RETURN QUERY
    SELECT
        c.id::uuid, -- Explicitly cast to uuid
        c.first_name::text, -- Explicitly cast to text
        c.last_name::text, -- Explicitly cast to text
        c.birthday::date, -- Explicitly cast to date
        (CASE
            WHEN (EXTRACT(MONTH FROM c.birthday) > current_month) OR (EXTRACT(MONTH FROM c.birthday) = current_month AND EXTRACT(DAY FROM c.birthday) >= current_day)
            THEN (EXTRACT(DOY FROM MAKE_DATE(EXTRACT(YEAR FROM NOW())::INTEGER, EXTRACT(MONTH FROM c.birthday)::INTEGER, EXTRACT(DAY FROM c.birthday)::INTEGER)) - EXTRACT(DOY FROM NOW()))
            ELSE (EXTRACT(DOY FROM MAKE_DATE((EXTRACT(YEAR FROM NOW()) + 1)::INTEGER, EXTRACT(MONTH FROM c.birthday)::INTEGER, EXTRACT(DAY FROM c.birthday)::INTEGER)) - EXTRACT(DOY FROM NOW()))
        END)::integer AS days_until_birthday -- Explicitly cast to integer
    FROM
        public.contacts c
    WHERE
        c.user_id = user_id_param AND c.birthday IS NOT NULL
    ORDER BY
        days_until_birthday ASC
    LIMIT 10;
END;
$function$;