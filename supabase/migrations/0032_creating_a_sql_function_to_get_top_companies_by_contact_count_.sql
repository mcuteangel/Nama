CREATE OR REPLACE FUNCTION public.get_top_companies(user_id_param uuid, limit_param integer DEFAULT 5)
 RETURNS TABLE(company text, count bigint)
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  RETURN QUERY
  SELECT
    c.company,
    COUNT(c.id) AS count
  FROM
    public.contacts c
  WHERE
    c.user_id = user_id_param AND c.company IS NOT NULL AND c.company != ''
  GROUP BY
    c.company
  ORDER BY
    count DESC, c.company ASC
  LIMIT limit_param;
END;
$function$;