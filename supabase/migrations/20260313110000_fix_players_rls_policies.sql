-- Fix RLS policies for players table - restrict to admins only

-- Drop existing policies
DROP POLICY IF EXISTS "Authenticated users can read players" ON public.players;
DROP POLICY IF EXISTS "Auth users can insert players" ON public.players;
DROP POLICY IF EXISTS "Auth users can update players" ON public.players;
DROP POLICY IF EXISTS "Auth users can delete players" ON public.players;

-- Create new admin-only policies
CREATE POLICY "Admins can read players"
  ON public.players FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert players"
  ON public.players FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update players"
  ON public.players FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete players"
  ON public.players FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));