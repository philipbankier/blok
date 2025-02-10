/*
  # Add feedback system
  
  1. New Tables
    - `feedback`
      - `id` (uuid, primary key)
      - `type` (text: 'feedback' or 'issue')
      - `title` (text)
      - `description` (text)
      - `status` (text: 'new', 'in-progress', 'resolved')
      - `user_id` (uuid, optional, references auth.users)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `feedback` table
    - Add policies for:
      - Anyone can create feedback (authenticated or not)
      - Users can read their own feedback if authenticated
      - Admins can read all feedback (future use)
*/

-- Create feedback table
CREATE TABLE IF NOT EXISTS public.feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL CHECK (type IN ('feedback', 'issue')),
  title text NOT NULL,
  description text NOT NULL,
  status text NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'in-progress', 'resolved')),
  user_id uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_feedback_user_id ON feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_feedback_status ON feedback(status);

-- Enable RLS
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can create feedback"
  ON feedback
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Users can read own feedback"
  ON feedback
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Add a policy for future admin access
CREATE POLICY "Admins can read all feedback"
  ON feedback
  FOR SELECT
  TO authenticated
  USING (
    (SELECT role FROM auth.users WHERE id = auth.uid()) = 'admin'
  );