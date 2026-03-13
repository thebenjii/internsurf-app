-- Drop old source check constraint and replace with updated one
ALTER TABLE internships DROP CONSTRAINT IF EXISTS internships_source_check;
ALTER TABLE internships ADD CONSTRAINT internships_source_check
  CHECK (source IN ('internal', 'adzuna', 'remotive', 'themuse', 'arbeitnow', 'jobicy'));
