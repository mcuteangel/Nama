-- Update get_preferred_method_counts function to accept date range parameters
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