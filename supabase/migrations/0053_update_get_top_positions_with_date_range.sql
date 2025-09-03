-- Update get_top_positions function to accept date range parameters
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