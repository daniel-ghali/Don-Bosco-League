# 🚀 SUPABASE DEPLOYMENT GUIDE - Project: llxlruzfbsonmkrcqlpa

## ✅ CONFIGURATION UPDATED
- **Project ID**: `llxlruzfbsonmkrcqlpa`
- **URL**: `https://llxlruzfbsonmkrcqlpa.supabase.co`
- **Status**: Ready for deployment

## 📋 MANUAL DEPLOYMENT STEPS

### Step 1: Access SQL Editor
Go to: **https://supabase.com/dashboard/project/llxlruzfbsonmkrcqlpa/sql/new**

### Step 2: Apply Migrations in Order

Copy and paste each migration file content into the SQL editor and run them one by one:

#### **Migration 1: Core Tables**
```sql
-- Groups table
CREATE TABLE public.groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  number INTEGER NOT NULL UNIQUE
);

-- Seasons table
CREATE TABLE public.seasons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  number INTEGER NOT NULL UNIQUE
);

-- Teams table
CREATE TABLE public.teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE
);

-- Players table
CREATE TABLE public.players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  position TEXT NOT NULL,
  price NUMERIC(10,2) NOT NULL DEFAULT 0,
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE
);

-- GameWeeks table
CREATE TABLE public.gameweeks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  number INTEGER NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  season_id UUID NOT NULL REFERENCES public.seasons(id) ON DELETE CASCADE,
  UNIQUE(number, season_id)
);

-- Matches table (NO team1_score, team2_score - stored in Team_Match_Stats)
CREATE TABLE public.matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  gameweek_id UUID NOT NULL REFERENCES public.gameweeks(id) ON DELETE CASCADE,
  team1_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  team2_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE
);

-- Team_Season_Stats (NO goal_diff - calculated dynamically)
CREATE TABLE public.team_season_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  season_id UUID NOT NULL REFERENCES public.seasons(id) ON DELETE CASCADE,
  matches_played INTEGER DEFAULT 0,
  wins INTEGER DEFAULT 0,
  draws INTEGER DEFAULT 0,
  losses INTEGER DEFAULT 0,
  goals_for INTEGER DEFAULT 0,
  goals_against INTEGER DEFAULT 0,
  points INTEGER DEFAULT 0,
  UNIQUE(team_id, season_id)
);

-- Team_Match_Stats
CREATE TABLE public.team_match_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID NOT NULL REFERENCES public.matches(id) ON DELETE CASCADE,
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  goals INTEGER DEFAULT 0,
  shots INTEGER DEFAULT 0,
  shots_on_target INTEGER DEFAULT 0,
  possession INTEGER DEFAULT 0,
  passes INTEGER DEFAULT 0,
  pass_accuracy INTEGER DEFAULT 0,
  fouls INTEGER DEFAULT 0,
  yellow_cards INTEGER DEFAULT 0,
  red_cards INTEGER DEFAULT 0,
  offsides INTEGER DEFAULT 0,
  corners INTEGER DEFAULT 0,
  UNIQUE(match_id, team_id)
);

-- Player_Match_Stats
CREATE TABLE public.player_match_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID NOT NULL REFERENCES public.matches(id) ON DELETE CASCADE,
  player_id UUID NOT NULL REFERENCES public.players(id) ON DELETE CASCADE,
  minutes_played INTEGER DEFAULT 0,
  goals INTEGER DEFAULT 0,
  assists INTEGER DEFAULT 0,
  shots INTEGER DEFAULT 0,
  shots_on_target INTEGER DEFAULT 0,
  passes INTEGER DEFAULT 0,
  pass_accuracy INTEGER DEFAULT 0,
  tackles INTEGER DEFAULT 0,
  interceptions INTEGER DEFAULT 0,
  fouls_committed INTEGER DEFAULT 0,
  fouls_suffered INTEGER DEFAULT 0,
  yellow_cards INTEGER DEFAULT 0,
  red_cards INTEGER DEFAULT 0,
  saves INTEGER DEFAULT 0,
  clean_sheet BOOLEAN DEFAULT false,
  UNIQUE(match_id, player_id)
);

-- Player_Season_Stats
CREATE TABLE public.player_season_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID NOT NULL REFERENCES public.players(id) ON DELETE CASCADE,
  season_id UUID NOT NULL REFERENCES public.seasons(id) ON DELETE CASCADE,
  matches_played INTEGER DEFAULT 0,
  goals INTEGER DEFAULT 0,
  assists INTEGER DEFAULT 0,
  yellow_cards INTEGER DEFAULT 0,
  red_cards INTEGER DEFAULT 0,
  UNIQUE(player_id, season_id)
);
```

#### **Migration 2: User Roles & Permissions** (UPDATED - handles existing objects)
```sql
-- Create role enum (only if it doesn't exist)
DO $$ BEGIN
    CREATE TYPE public.app_role AS ENUM ('admin', 'student');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create user_roles table (only if it doesn't exist)
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);

-- Enable RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles (avoids RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- RLS: users can read their own roles
DROP POLICY IF EXISTS "Users can read own roles" ON public.user_roles;
CREATE POLICY "Users can read own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);
```

#### **Migration 3: User Profiles** (UPDATED - handles existing objects)
```sql
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  display_name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can read all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

CREATE POLICY "Users can read own profile" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users can read all profiles" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

CREATE OR REPLACE FUNCTION public.handle_new_user_profile()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  raw_name text;
  formatted_name text;
BEGIN
  raw_name := split_part(NEW.email, '@', 1);
  formatted_name := initcap(replace(raw_name, '.', ' '));
  INSERT INTO public.profiles (id, email, display_name)
  VALUES (NEW.id, NEW.email, formatted_name);
  RETURN NEW;
END;
$$;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created_profile ON auth.users;

CREATE TRIGGER on_auth_user_created_profile
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_profile();
```

#### **Migration 4: Fantasy Football System** (FIXED - column reference corrected)
```sql
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

-- Ensure all required columns exist (in case tables were created elsewhere)
ALTER TABLE public.fantasy_teams ADD COLUMN IF NOT EXISTS league_id uuid REFERENCES public.fantasy_leagues(id) ON DELETE CASCADE;
ALTER TABLE public.fantasy_teams ADD COLUMN IF NOT EXISTS total_points decimal(8,2) DEFAULT 0.00;
ALTER TABLE public.fantasy_team_players ADD COLUMN IF NOT EXISTS purchase_price decimal(6,2) DEFAULT 0.00;
ALTER TABLE public.fantasy_team_players ADD COLUMN IF NOT EXISTS gameweek_joined integer;

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
```

#### **Migration 5: Announcements System**
```sql
-- Create announcements table
CREATE TABLE IF NOT EXISTS public.announcements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  body TEXT,
  image_url TEXT,
  published BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can read published announcements
CREATE POLICY "Anyone can read published announcements"
  ON public.announcements FOR SELECT
  USING (published = true);

-- Admins can do everything
CREATE POLICY "Admins can manage announcements"
  ON public.announcements FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Create storage bucket for announcement images (only if it doesn't exist)
INSERT INTO storage.buckets (id, name, public) VALUES ('announcements', 'announcements', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to read announcement images
DROP POLICY IF EXISTS "Public read announcement images" ON storage.objects;
CREATE POLICY "Public read announcement images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'announcements');

-- Admins can upload announcement images
DROP POLICY IF EXISTS "Admins can upload announcement images" ON storage.objects;
CREATE POLICY "Admins can upload announcement images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'announcements' AND public.has_role(auth.uid(), 'admin'));

-- Admins can delete announcement images
DROP POLICY IF EXISTS "Admins can delete announcement images" ON storage.objects;
CREATE POLICY "Admins can delete announcement images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'announcements' AND public.has_role(auth.uid(), 'admin'));
```

#### **Migration 5: Additional Features + Player Photos**
```sql
-- =============================================
-- POSITIONS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.positions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE
);
ALTER TABLE public.positions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read positions" ON public.positions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage positions" ON public.positions FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

INSERT INTO public.positions (name) VALUES ('GK'), ('DEF'), ('MID'), ('FWD') ON CONFLICT (name) DO NOTHING;

-- =============================================
-- SEASONS: add start_date, end_date
-- =============================================
ALTER TABLE public.seasons ADD COLUMN IF NOT EXISTS start_date date;
ALTER TABLE public.seasons ADD COLUMN IF NOT EXISTS end_date date;

-- =============================================
-- MATCHES: add season_id, motm_player_id, is_played
-- =============================================
ALTER TABLE public.matches ADD COLUMN IF NOT EXISTS season_id uuid REFERENCES public.seasons(id);
ALTER TABLE public.matches ADD COLUMN IF NOT EXISTS motm_player_id uuid REFERENCES public.players(id) ON DELETE SET NULL;
ALTER TABLE public.matches ADD COLUMN IF NOT EXISTS is_played boolean DEFAULT false;

-- =============================================
-- PLAYER MATCH STATS: add clean_sheet, halfs_played, bonus_points
-- =============================================
ALTER TABLE public.player_match_stats ADD COLUMN IF NOT EXISTS clean_sheet boolean DEFAULT false;
ALTER TABLE public.player_match_stats ADD COLUMN IF NOT EXISTS halfs_played integer DEFAULT 0;
ALTER TABLE public.player_match_stats ADD COLUMN IF NOT EXISTS bonus_points integer DEFAULT 0;

-- =============================================
-- PLAYER SEASON STATS: add matches_played, total_motm
-- =============================================
ALTER TABLE public.player_season_stats ADD COLUMN IF NOT EXISTS matches_played integer DEFAULT 0;
ALTER TABLE public.player_season_stats ADD COLUMN IF NOT EXISTS total_motm integer DEFAULT 0;

-- =============================================
-- TEAM SEASON STATS: add matches_played
-- =============================================
ALTER TABLE public.team_season_stats ADD COLUMN IF NOT EXISTS matches_played integer DEFAULT 0;

-- =============================================
-- PLAYER SEASON PRICE
-- =============================================
CREATE TABLE IF NOT EXISTS public.player_season_price (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  season_id uuid NOT NULL REFERENCES public.seasons(id),
  player_id uuid NOT NULL REFERENCES public.players(id) ON DELETE CASCADE,
  price decimal(6,2) NOT NULL DEFAULT 5.00,
  UNIQUE(player_id, season_id)
);
ALTER TABLE public.player_season_price ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can read prices" ON public.player_season_price FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage prices" ON public.player_season_price FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- =============================================
-- FANTASY TEAMS
-- =============================================
CREATE TABLE IF NOT EXISTS public.fantasy_teams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  budget numeric(8,2) DEFAULT 70.00,
  free_transfers integer DEFAULT 1,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.fantasy_teams ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can read fantasy teams" ON public.fantasy_teams FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can insert own fantasy team" ON public.fantasy_teams FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own fantasy team" ON public.fantasy_teams FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own fantasy team" ON public.fantasy_teams FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage all fantasy teams" ON public.fantasy_teams FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- =============================================
-- FANTASY TEAM PLAYERS
-- =============================================
CREATE TABLE IF NOT EXISTS public.fantasy_team_players (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  fantasy_team_id uuid NOT NULL REFERENCES public.fantasy_teams(id) ON DELETE CASCADE,
  player_id uuid NOT NULL REFERENCES public.players(id),
  is_captain boolean DEFAULT false,
  is_vice_captain boolean DEFAULT false,
  is_benched boolean DEFAULT false,
  bench_order integer DEFAULT 0,
  UNIQUE(fantasy_team_id, player_id)
);
ALTER TABLE public.fantasy_team_players ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can read fantasy team players" ON public.fantasy_team_players FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can manage own team players" ON public.fantasy_team_players FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM public.fantasy_teams WHERE id = fantasy_team_id AND user_id = auth.uid())
) WITH CHECK (
  EXISTS (SELECT 1 FROM public.fantasy_teams WHERE id = fantasy_team_id AND user_id = auth.uid())
);
CREATE POLICY "Admins can manage all team players" ON public.fantasy_team_players FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- =============================================
-- ADD PHOTO COLUMN TO PLAYERS TABLE
-- =============================================
ALTER TABLE public.players ADD COLUMN photo TEXT;
```

#### **Migration 6: RLS Security Policies**
```sql
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
```

### Step 3: Deploy Edge Function

1. Go to **Edge Functions**: https://supabase.com/dashboard/project/llxlruzfbsonmkrcqlpa/functions
2. Click **"Create a new function"**
3. Name it: `calculate-fantasy-points`
4. Copy the function code from: `supabase/functions/calculate-fantasy-points/index.ts`
5. Deploy the function

### Step 4: Verify Deployment

1. Check that all tables were created in the **Table Editor**
2. Test the Edge Function in the **Edge Functions** section
3. Update your application to use the new Supabase project

## ✅ DEPLOYMENT COMPLETE

Your Supabase project `llxlruzfbsonmkrcqlpa` will now have:
- ✅ Complete database schema
- ✅ User authentication & roles
- ✅ Fantasy football system
- ✅ Announcements system
- ✅ RLS security policies
- ✅ Edge function deployed

**Ready to connect your application!** 🚀