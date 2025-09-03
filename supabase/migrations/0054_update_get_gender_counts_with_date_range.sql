-- Update get_gender_counts function to accept date range parameters
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