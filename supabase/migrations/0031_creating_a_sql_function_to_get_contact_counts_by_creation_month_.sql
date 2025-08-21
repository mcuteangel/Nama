CREATE OR REPLACE FUNCTION public.get_contacts_by_creation_month(user_id_param uuid)
 RETURNS TABLE(month_year text, count bigint)
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  RETURN QUERY
  SELECT
    TO_CHAR(c.created_at, 'YYYY-MM') AS month_year,
    COUNT(c.id) AS count
  FROM
    public.contacts c
  WHERE
    c.user_id = user_id_param
  GROUP BY
    month_year
  ORDER BY
    month_year;
END;
$function$;