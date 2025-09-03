-- Check if the 'role' column exists before renaming it to 'position'
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'contacts' AND column_name = 'role'
  ) THEN
    ALTER TABLE contacts RENAME COLUMN role TO position;
  END IF;
END $$;