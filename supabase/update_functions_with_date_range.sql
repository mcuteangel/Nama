-- Update all statistics functions to accept date range parameters
-- This file can be run directly in the Supabase SQL editor

-- Update get_gender_counts function
CREATE OR REPLACE FUNCTION public.get_gender_counts(
    user_id_param uuid,
    start_date_param date DEFAULT NULL,
    end_date_param date DEFAULT NULL
)
RETURNS TABLE(gender text, count bigint)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', pg_temp
AS $function$
BEGIN
  RETURN QUERY
  SELECT
    c.gender::text, -- Explicitly cast to text
    COUNT(c.id)::bigint AS count -- Explicitly cast to bigint
  FROM
    public.contacts c
  WHERE
    c.user_id = user_id_param
    AND (start_date_param IS NULL OR c.created_at >= start_date_param)
    AND (end_date_param IS NULL OR c.created_at <= end_date_param)
  GROUP BY
    c.gender;
END;
$function$;

-- Update get_contacts_by_group_counts function
CREATE OR REPLACE FUNCTION public.get_contacts_by_group_counts(
    user_id_param uuid,
    start_date_param date DEFAULT NULL,
    end_date_param date DEFAULT NULL
)
RETURNS TABLE(name text, color text, count bigint)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', pg_temp
AS $function$
BEGIN
  RETURN QUERY
  SELECT
    COALESCE(g.name, 'بدون گروه')::text AS name,
    COALESCE(g.color, '#cccccc')::text AS color, -- Default color for 'بدون گروه'
    COUNT(c.id)::bigint AS count
  FROM
    public.contacts c
  LEFT JOIN
    public.contact_groups cg ON c.id = cg.contact_id AND c.user_id = cg.user_id
  LEFT JOIN
    public.groups g ON cg.group_id = g.id AND cg.user_id = g.user_id
  WHERE
    c.user_id = user_id_param
    AND (start_date_param IS NULL OR c.created_at >= start_date_param)
    AND (end_date_param IS NULL OR c.created_at <= end_date_param)
  GROUP BY
    COALESCE(g.name, 'بدون گروه'), COALESCE(g.color, '#cccccc')
  ORDER BY
    count DESC;
END;
$function$;

-- Update get_preferred_method_counts function
CREATE OR REPLACE FUNCTION public.get_preferred_method_counts(
    user_id_param uuid,
    start_date_param date DEFAULT NULL,
    end_date_param date DEFAULT NULL
)
RETURNS TABLE(method text, count bigint)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', pg_temp
AS $function$
BEGIN
  RETURN QUERY
  SELECT
    c.preferred_contact_method::text,
    COUNT(c.id)::bigint AS count
  FROM
    public.contacts c
  WHERE
    c.user_id = user_id_param 
    AND c.preferred_contact_method IS NOT NULL
    AND (start_date_param IS NULL OR c.created_at >= start_date_param)
    AND (end_date_param IS NULL OR c.created_at <= end_date_param)
  GROUP BY
    c.preferred_contact_method;
END;
$function$;

-- Update get_upcoming_birthdays function
CREATE OR REPLACE FUNCTION public.get_upcoming_birthdays(
    user_id_param uuid,
    start_date_param date DEFAULT NULL,
    end_date_param date DEFAULT NULL
)
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
        c.id,
        c.first_name,
        c.last_name,
        c.birthday,
        CASE
            WHEN (EXTRACT(MONTH FROM c.birthday) > current_month) OR (EXTRACT(MONTH FROM c.birthday) = current_month AND EXTRACT(DAY FROM c.birthday) >= current_day)
            THEN (EXTRACT(DOY FROM MAKE_DATE(EXTRACT(YEAR FROM NOW())::INTEGER, EXTRACT(MONTH FROM c.birthday)::INTEGER, EXTRACT(DAY FROM c.birthday)::INTEGER)) - EXTRACT(DOY FROM NOW()))
            ELSE (EXTRACT(DOY FROM MAKE_DATE((EXTRACT(YEAR FROM NOW()) + 1)::INTEGER, EXTRACT(MONTH FROM c.birthday)::INTEGER, EXTRACT(DAY FROM c.birthday)::INTEGER)) - EXTRACT(DOY FROM NOW()))
        END AS days_until_birthday
    FROM
        public.contacts c
    WHERE
        c.user_id = user_id_param 
        AND c.birthday IS NOT NULL
        AND (start_date_param IS NULL OR c.created_at >= start_date_param)
        AND (end_date_param IS NULL OR c.created_at <= end_date_param)
    ORDER BY
        days_until_birthday ASC
    LIMIT 10;
END;
$function$;

-- Update get_contacts_by_creation_month function
CREATE OR REPLACE FUNCTION public.get_contacts_by_creation_month(
    user_id_param uuid,
    start_date_param date DEFAULT NULL,
    end_date_param date DEFAULT NULL
)
RETURNS TABLE(month_year text, count bigint)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', pg_temp
AS $function$
BEGIN
  RETURN QUERY
  SELECT
    TO_CHAR(c.created_at, 'YYYY-MM')::text AS month_year, -- Explicitly cast to text
    COUNT(c.id)::bigint AS count -- Explicitly cast to bigint
  FROM
    public.contacts c
  WHERE
    c.user_id = user_id_param
    AND (start_date_param IS NULL OR c.created_at >= start_date_param)
    AND (end_date_param IS NULL OR c.created_at <= end_date_param)
  GROUP BY
    month_year
  ORDER BY
    month_year;
END;
$function$;

-- Update get_top_companies function
CREATE OR REPLACE FUNCTION public.get_top_companies(
    user_id_param uuid,
    limit_param integer DEFAULT 5,
    start_date_param date DEFAULT NULL,
    end_date_param date DEFAULT NULL
)
RETURNS TABLE(company text, count bigint)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', pg_temp
AS $function$
BEGIN
  RETURN QUERY
  SELECT
    c.company::text, -- Explicitly cast to text
    COUNT(c.id)::bigint AS count -- Explicitly cast to bigint
  FROM
    public.contacts c
  WHERE
    c.user_id = user_id_param 
    AND c.company IS NOT NULL 
    AND c.company != ''
    AND (start_date_param IS NULL OR c.created_at >= start_date_param)
    AND (end_date_param IS NULL OR c.created_at <= end_date_param)
  GROUP BY
    c.company
  ORDER BY
    count DESC, c.company ASC
  LIMIT limit_param;
END;
$function$;

-- Update get_top_positions function
CREATE OR REPLACE FUNCTION public.get_top_positions(
    user_id_param uuid,
    limit_param integer DEFAULT 5,
    start_date_param date DEFAULT NULL,
    end_date_param date DEFAULT NULL
)
RETURNS TABLE("position" text, count bigint)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', pg_temp
AS $function$
BEGIN
  RETURN QUERY
  SELECT
    c."position"::text, -- Explicitly cast to text
    COUNT(c.id)::bigint AS count -- Explicitly cast to bigint
  FROM
    public.contacts c
  WHERE
    c.user_id = user_id_param 
    AND c."position" IS NOT NULL 
    AND c."position" != ''
    AND (start_date_param IS NULL OR c.created_at >= start_date_param)
    AND (end_date_param IS NULL OR c.created_at <= end_date_param)
  GROUP BY
    c."position"
  ORDER BY
    count DESC, c."position" ASC
  LIMIT limit_param;
END;
$function$;