-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE milestones ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can delete their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view their own events" ON events;
DROP POLICY IF EXISTS "Users can create their own events" ON events;
DROP POLICY IF EXISTS "Users can update their own events" ON events;
DROP POLICY IF EXISTS "Users can delete their own events" ON events;
DROP POLICY IF EXISTS "Users can view milestones for their events" ON milestones;
DROP POLICY IF EXISTS "Users can create milestones for their events" ON milestones;
DROP POLICY IF EXISTS "Users can update milestones for their events" ON milestones;
DROP POLICY IF EXISTS "Users can delete milestones for their events" ON milestones;

-- Profiles policies - user owns their row
CREATE POLICY "profiles_select_own" ON profiles
  FOR SELECT USING (id = auth.uid());

CREATE POLICY "profiles_upsert_own" ON profiles
  FOR INSERT WITH CHECK (id = auth.uid());

CREATE POLICY "profiles_update_own" ON profiles
  FOR UPDATE USING (id = auth.uid()) WITH CHECK (id = auth.uid());

-- Events policies - user scoped
CREATE POLICY "events_select_own" ON events
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "events_insert_own" ON events
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "events_update_own" ON events
  FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- Allow soft delete on events
CREATE POLICY "events_delete_own" ON events
  FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- Milestones policies - user scoped
CREATE POLICY "milestones_select_own" ON milestones
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "milestones_insert_own" ON milestones
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "milestones_update_own" ON milestones
  FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());