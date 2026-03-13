-- Add photo column to players table
ALTER TABLE public.players ADD COLUMN photo TEXT;

-- Update RLS policy if needed
-- Since it's admin only, no change needed