CREATE OR REPLACE FUNCTION public.get_preferred_method_counts(user_id_param uuid)
RETURNS TABLE(method text, count bigint)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    c.preferred_contact_method,
    COUNT(c.id) AS count
  FROM
    public.contacts c
  WHERE
    c.user_id = user_id_param AND c.preferred_contact_method IS NOT NULL
  GROUP BY
    c.preferred_contact_method;
END;
$$;

-- Grant execution to authenticated users
GRANT EXECUTE ON FUNCTION public.get_preferred_method_counts(uuid) TO authenticated;