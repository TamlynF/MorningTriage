-- Create users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  preferences JSONB DEFAULT '{"skip_greeting": false, "energy_level_check": true}'
);

-- Create enum for dump item types
CREATE TYPE dump_item_type AS ENUM ('task', 'reply_needed', 'worry', 'idea', 'someday');

-- Create dump_items table
CREATE TABLE dump_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  raw_text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  type dump_item_type NOT NULL,
  times_deferred INTEGER DEFAULT 0,
  user_priority_flag BOOLEAN DEFAULT FALSE,
  last_seen_in_big3 DATE,
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- Create enum for energy check levels
CREATE TYPE energy_level AS ENUM ('low', 'normal', null);

-- Create enum for user check-in response
CREATE TYPE check_in_response AS ENUM ('low', 'normal', 'none');

-- Create morning_plans table
CREATE TABLE morning_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  plan_date DATE NOT NULL,
  greeting TEXT,
  big_3 JSONB NOT NULL,
  avoided_thing JSONB,
  deferred_count INTEGER,
  deferred_note TEXT,
  energy_check energy_level,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_check_in check_in_response DEFAULT 'none',
  UNIQUE(user_id, plan_date)
);

-- Create calendar_events table
CREATE TABLE calendar_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  location TEXT,
  source TEXT DEFAULT 'manual'
);

-- Create yesterday_outcomes table (optional, for tracking completion)
CREATE TABLE yesterday_outcomes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  morning_plan_id UUID NOT NULL REFERENCES morning_plans(id) ON DELETE CASCADE,
  task_id TEXT,
  title TEXT NOT NULL,
  completed BOOLEAN DEFAULT FALSE
);

-- Create indices for better query performance
CREATE INDEX idx_dump_items_user_id ON dump_items(user_id);
CREATE INDEX idx_dump_items_created_at ON dump_items(created_at);
CREATE INDEX idx_morning_plans_user_id ON morning_plans(user_id);
CREATE INDEX idx_morning_plans_plan_date ON morning_plans(plan_date);
CREATE INDEX idx_calendar_events_user_id ON calendar_events(user_id);
CREATE INDEX idx_calendar_events_start_time ON calendar_events(start_time);

-- Enable RLS (Row Level Security)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE dump_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE morning_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE yesterday_outcomes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Users can view their own record"
  ON users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own record"
  ON users FOR UPDATE
  USING (auth.uid() = id);

-- RLS Policies for dump_items table
CREATE POLICY "Users can view their own dump items"
  ON dump_items FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create dump items"
  ON dump_items FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own dump items"
  ON dump_items FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own dump items"
  ON dump_items FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for morning_plans table
CREATE POLICY "Users can view their own morning plans"
  ON morning_plans FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create morning plans"
  ON morning_plans FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own morning plans"
  ON morning_plans FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for calendar_events table
CREATE POLICY "Users can view their own calendar events"
  ON calendar_events FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create calendar events"
  ON calendar_events FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own calendar events"
  ON calendar_events FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own calendar events"
  ON calendar_events FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for yesterday_outcomes table
CREATE POLICY "Users can view yesterday_outcomes for their morning plans"
  ON yesterday_outcomes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM morning_plans
      WHERE morning_plans.id = yesterday_outcomes.morning_plan_id
      AND morning_plans.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create yesterday_outcomes for their morning plans"
  ON yesterday_outcomes FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM morning_plans
      WHERE morning_plans.id = yesterday_outcomes.morning_plan_id
      AND morning_plans.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update yesterday_outcomes for their morning plans"
  ON yesterday_outcomes FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM morning_plans
      WHERE morning_plans.id = yesterday_outcomes.morning_plan_id
      AND morning_plans.user_id = auth.uid()
    )
  );
