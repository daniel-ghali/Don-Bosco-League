-- Check what already exists in your database
-- Run these queries first to see current state:

-- Check if app_role enum exists
SELECT * FROM pg_type WHERE typname = 'app_role';

-- Check existing tables
SELECT tablename FROM pg_tables WHERE schemaname = 'public';

-- Check existing functions
SELECT proname FROM pg_proc WHERE pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public');

-- Check existing triggers
SELECT trigger_name FROM information_schema.triggers WHERE trigger_schema = 'public';