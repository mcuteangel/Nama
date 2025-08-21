CREATE OR REPLACE FUNCTION public.get_upcoming_birthdays(user_id_param uuid)
RETURNS TABLE(first_name text, last_name text, birthday date)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    c.first_name,
    c.last_name,
    c.birthday
  FROM
    public.contacts c
  WHERE
    c.user_id = user_id_param
    AND c.birthday IS NOT NULL
    AND (
      (EXTRACT(MONTH FROM c.birthday) = EXTRACT(MONTH FROM NOW()) AND EXTRACT(DAY FROM c.birthday) >= EXTRACT(DAY FROM NOW()))
      OR
      (EXTRACT(MONTH FROM c.birthday) > EXTRACT(MONTH FROM NOW()))
    )
  ORDER BY
    EXTRACT(MONTH FROM c.birthday) ASC,
    EXTRACT(DAY FROM c.birthday) ASC;
END;
$$;