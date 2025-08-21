CREATE OR REPLACE FUNCTION public.get_contacts_by_group_counts(user_id_param uuid)
 RETURNS TABLE(name text, color text, count bigint)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
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
  GROUP BY
    COALESCE(g.name, 'بدون گروه'), COALESCE(g.color, '#cccccc')
  ORDER BY
    count DESC;
END;
$function$;