
-- Add fantasy_points to player_match_stats
ALTER TABLE public.player_match_stats ADD COLUMN IF NOT EXISTS fantasy_points decimal(5,2) DEFAULT 0.00;

-- Add total_fantasy_points to player_season_stats
ALTER TABLE public.player_season_stats ADD COLUMN IF NOT EXISTS total_fantasy_points decimal(7,2) DEFAULT 0.00;

-- Fantasy_Leagues table
CREATE TABLE IF NOT EXISTS public.fantasy_leagues (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  max_participants integer DEFAULT 20,
  entry_fee decimal(6,2) DEFAULT 0.00,
  prize_pool decimal(8,2) DEFAULT 0.00,
  season_id uuid REFERENCES public.seasons(id),
  created_by uuid NOT NULL REFERENCES public.profiles(id),
  created_at timestamptz DEFAULT now(),
  start_date date,
  end_date date,
  status text DEFAULT 'active' CHECK (status IN ('draft', 'active', 'completed'))
);

-- Fantasy_Teams table
CREATE TABLE IF NOT EXISTS public.fantasy_teams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  league_id uuid REFERENCES public.fantasy_leagues(id) ON DELETE CASCADE,
  name text NOT NULL,
  budget numeric(8,2) DEFAULT 70.00,
  free_transfers integer DEFAULT 1,
  total_points decimal(8,2) DEFAULT 0.00,
  created_at timestamptz DEFAULT now()
);

-- Fantasy_Team_Players table
CREATE TABLE IF NOT EXISTS public.fantasy_team_players (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  fantasy_team_id uuid NOT NULL REFERENCES public.fantasy_teams(id) ON DELETE CASCADE,
  player_id uuid NOT NULL REFERENCES public.players(id),
  is_captain boolean DEFAULT false,
  is_vice_captain boolean DEFAULT false,
  is_benched boolean DEFAULT false,
  bench_order integer DEFAULT 0,
  purchase_price decimal(6,2) NOT NULL,
  gameweek_joined integer,
  UNIQUE(fantasy_team_id, player_id)
);

-- Enable RLS on all fantasy tables
ALTER TABLE public.fantasy_leagues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fantasy_teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fantasy_team_players ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Fantasy Leagues
CREATE POLICY "Anyone can read fantasy leagues" ON public.fantasy_leagues FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can create fantasy leagues" ON public.fantasy_leagues FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);
CREATE POLICY "League creators can update their leagues" ON public.fantasy_leagues FOR UPDATE TO authenticated USING (auth.uid() = created_by);

-- RLS Policies for Fantasy Teams
CREATE POLICY "Users can read fantasy teams in their leagues" ON public.fantasy_teams FOR SELECT TO authenticated USING (
  fantasy_teams.league_id IS NULL OR EXISTS (
    SELECT 1 FROM public.fantasy_leagues WHERE id = fantasy_teams.league_id AND (
      created_by = auth.uid() OR EXISTS (SELECT 1 FROM public.fantasy_teams WHERE league_id = fantasy_leagues.id AND user_id = auth.uid())
    )
  )
);
CREATE POLICY "Users can create their own fantasy teams" ON public.fantasy_teams FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own fantasy teams" ON public.fantasy_teams FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- RLS Policies for Fantasy Team Players
CREATE POLICY "Users can read players in their teams" ON public.fantasy_team_players FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.fantasy_teams WHERE id = fantasy_team_id AND user_id = auth.uid())
);
CREATE POLICY "Users can manage players in their teams" ON public.fantasy_team_players FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM public.fantasy_teams WHERE id = fantasy_team_id AND user_id = auth.uid())
);
