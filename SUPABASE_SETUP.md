# Supabase Project Organization Guide

## Current Project Structure
Your Supabase project is already configured with:
- **Project ID**: llxlruzfbsonmkrcqlpa
- **URL**: https://llxlruzfbsonmkrcqlpa.supabase.co
- **7 Migrations** ready to be applied
- **1 Edge Function** (calculate-fantasy-points)

## Step-by-Step Migration Process

### Option 1: Using Supabase CLI (Recommended)

1. **Install Supabase CLI** (if not already done):
   ```bash
   # Download from: https://github.com/supabase/cli/releases
   # Extract and add to PATH, or use npx
   ```

2. **Login to Supabase**:
   ```bash
   npx supabase login
   ```
   - This will open your browser for authentication

3. **Link your project**:
   ```bash
   npx supabase link --project-ref llxlruzfbsonmkrcqlpa
   ```

4. **Push migrations**:
   ```bash
   npx supabase db push
   ```

5. **Deploy Edge Function**:
   ```bash
   npx supabase functions deploy calculate-fantasy-points
   ```

### Option 2: Manual Migration via Dashboard

1. Go to [Supabase SQL Editor](https://supabase.com/dashboard/project/llxlruzfbsonmkrcqlpa/sql/new)

2. Copy and paste each migration file in order:
   - `20260222232653_dc598859-fce0-480e-a309-d042f0d1091f.sql`
   - `20260302163529_2c90da3b-35f9-4070-9323-aa50fe0e3d42.sql`
   - `20260304164050_a4fcd84f-8f16-4cc2-b035-b4990d52c077.sql`
   - `20260305215644_668bfaba-e833-4664-975e-3acb5790dd9e.sql`
   - `20260310184254_88fa0e1b-4ed7-47ee-8936-432eca20187d.sql`
   - `20260313110000_fix_players_rls_policies.sql`

3. For the Edge Function, go to [Edge Functions](https://supabase.com/dashboard/project/cfpiwcmqoferqkbtqmgq/functions) and create a new function.

## Migration Summary

Your migrations include:
- Initial database schema setup
- User roles and permissions
- Fantasy football system
- Player management with photos
- RLS (Row Level Security) policies

## Environment Variables

Your `.env` file is already configured with:
- `VITE_SUPABASE_PROJECT_ID`
- `VITE_SUPABASE_PUBLISHABLE_KEY`
- `VITE_SUPABASE_URL`

## Next Steps

1. Apply all migrations to your remote Supabase project
2. Deploy the Edge Function
3. Test your application with the live database
4. Consider setting up automated deployments for future migrations

## Best Practices

- Always test migrations on a development database first
- Keep migration files in chronological order
- Use descriptive names for migration files
- Never modify existing migration files (create new ones instead)
- Backup your database before applying migrations</content>
<parameter name="filePath">d:\school-league-stats-main\SUPABASE_SETUP.md