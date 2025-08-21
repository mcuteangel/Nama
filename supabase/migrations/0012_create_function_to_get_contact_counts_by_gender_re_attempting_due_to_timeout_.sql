CREATE OR REPLACE FUNCTION public.get_gender_counts(user_id_param uuid)
RETURNS TABLE(gender text, count bigint)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    c.gender,
    COUNT(c.id) AS count
  FROM
    public.contacts c
  WHERE
    c.user_id = user_id_param
  GROUP BY
    c.gender;
END;
$$;

-- Grant execution to authenticated users
GRANT EXECUTE ON FUNCTION public.get_gender_counts(uuid) TO authenticated;