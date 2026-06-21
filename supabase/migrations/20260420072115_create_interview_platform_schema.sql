/*
  # AI Interview Platform Schema

  ## Summary
  Creates the full database schema for the AI Interview Intelligence & Coaching Platform.

  ## New Tables

  1. `profiles`
     - Extends auth.users with user profile data
     - Stores full name, avatar, target role, and career level

  2. `interviews`
     - Each interview session a user takes
     - Type (technical/HR/behavioral/communication), role, difficulty, status

  3. `interview_questions`
     - Questions generated for each interview session
     - Ordered list linked to an interview

  4. `interview_answers`
     - User's recorded answers for each question
     - Stores transcript and duration

  5. `interview_feedback`
     - AI-generated feedback for each completed interview
     - Scores, analysis, suggestions, improved answers as JSONB

  ## Security
  - RLS enabled on all tables
  - Users can only access their own data
  - Authenticated-only access throughout
*/

CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text DEFAULT '',
  avatar_url text DEFAULT '',
  target_role text DEFAULT '',
  career_level text DEFAULT 'mid',
  interviews_completed integer DEFAULT 0,
  avg_confidence_score integer DEFAULT 0,
  avg_communication_score integer DEFAULT 0,
  avg_technical_score integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE TABLE IF NOT EXISTS interviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type text NOT NULL DEFAULT 'technical',
  role text NOT NULL DEFAULT '',
  difficulty text NOT NULL DEFAULT 'medium',
  status text NOT NULL DEFAULT 'pending',
  question_count integer DEFAULT 5,
  duration_seconds integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  completed_at timestamptz
);

ALTER TABLE interviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own interviews"
  ON interviews FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own interviews"
  ON interviews FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own interviews"
  ON interviews FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS interview_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  interview_id uuid REFERENCES interviews(id) ON DELETE CASCADE NOT NULL,
  question_text text NOT NULL,
  question_order integer NOT NULL DEFAULT 0,
  category text DEFAULT 'general',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE interview_questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own interview questions"
  ON interview_questions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM interviews
      WHERE interviews.id = interview_questions.interview_id
      AND interviews.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own interview questions"
  ON interview_questions FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM interviews
      WHERE interviews.id = interview_questions.interview_id
      AND interviews.user_id = auth.uid()
    )
  );

CREATE TABLE IF NOT EXISTS interview_answers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id uuid REFERENCES interview_questions(id) ON DELETE CASCADE NOT NULL,
  interview_id uuid REFERENCES interviews(id) ON DELETE CASCADE NOT NULL,
  transcript text DEFAULT '',
  duration_seconds integer DEFAULT 0,
  word_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE interview_answers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own interview answers"
  ON interview_answers FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM interviews
      WHERE interviews.id = interview_answers.interview_id
      AND interviews.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own interview answers"
  ON interview_answers FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM interviews
      WHERE interviews.id = interview_answers.interview_id
      AND interviews.user_id = auth.uid()
    )
  );

CREATE TABLE IF NOT EXISTS interview_feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  interview_id uuid REFERENCES interviews(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  confidence_score integer DEFAULT 0,
  communication_score integer DEFAULT 0,
  technical_score integer DEFAULT 0,
  overall_score integer DEFAULT 0,
  analysis jsonb DEFAULT '{}',
  voice_metrics jsonb DEFAULT '{}',
  behavior_metrics jsonb DEFAULT '{}',
  suggestions jsonb DEFAULT '[]',
  question_feedback jsonb DEFAULT '[]',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE interview_feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own feedback"
  ON interview_feedback FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own feedback"
  ON interview_feedback FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_interviews_user_id ON interviews(user_id);
CREATE INDEX IF NOT EXISTS idx_interviews_created_at ON interviews(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_interview_questions_interview_id ON interview_questions(interview_id);
CREATE INDEX IF NOT EXISTS idx_interview_answers_interview_id ON interview_answers(interview_id);
CREATE INDEX IF NOT EXISTS idx_interview_feedback_user_id ON interview_feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_interview_feedback_interview_id ON interview_feedback(interview_id);
