-- Migration: Coach Requests and Ratings
-- Adds coach profiles, coach requests, and coach reviews for sport activities

-- 1. Coach Profiles Table
CREATE TABLE IF NOT EXISTS public.coach_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_key text NOT NULL UNIQUE,
  display_name text NOT NULL,
  city text,
  bio text,
  sports text[] NOT NULL DEFAULT '{}',
  languages text[] NOT NULL DEFAULT '{}',
  price_from integer,
  price_currency text NOT NULL DEFAULT 'CZK',
  is_verified boolean NOT NULL DEFAULT false,
  is_active boolean NOT NULL DEFAULT true,
  rating_avg numeric(3,2) NOT NULL DEFAULT 0,
  rating_count integer NOT NULL DEFAULT 0,
  rating_weighted numeric(3,2) NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 2. Coach Requests Table
CREATE TABLE IF NOT EXISTS public.coach_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_id uuid NOT NULL REFERENCES public.activities(id) ON DELETE CASCADE,
  requester_user_key text NOT NULL,
  coach_profile_id uuid REFERENCES public.coach_profiles(id) ON DELETE SET NULL,
  request_type text NOT NULL DEFAULT 'organizer_request',
  sport_type text,
  goal text,
  level text,
  budget_min integer,
  budget_max integer,
  payment_mode text NOT NULL DEFAULT 'split',
  status text NOT NULL DEFAULT 'pending',
  admin_note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT coach_requests_request_type_check CHECK (request_type IN ('organizer_request', 'participant_interest')),
  CONSTRAINT coach_requests_status_check CHECK (status IN ('pending', 'matched', 'confirmed', 'cancelled', 'completed', 'rejected')),
  CONSTRAINT coach_requests_payment_mode_check CHECK (payment_mode IN ('organizer', 'split', 'free', 'unknown')),
  UNIQUE(activity_id, requester_user_key, request_type)
);

-- 3. Coach Reviews Table
CREATE TABLE IF NOT EXISTS public.coach_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_profile_id uuid NOT NULL REFERENCES public.coach_profiles(id) ON DELETE CASCADE,
  activity_id uuid NOT NULL REFERENCES public.activities(id) ON DELETE CASCADE,
  reviewer_user_key text NOT NULL,
  overall_rating integer NOT NULL CHECK (overall_rating BETWEEN 1 AND 5),
  communication_rating integer CHECK (communication_rating BETWEEN 1 AND 5),
  punctuality_rating integer CHECK (punctuality_rating BETWEEN 1 AND 5),
  training_quality_rating integer CHECK (training_quality_rating BETWEEN 1 AND 5),
  beginner_friendliness_rating integer CHECK (beginner_friendliness_rating BETWEEN 1 AND 5),
  tags text[] NOT NULL DEFAULT '{}',
  comment text,
  is_public boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(coach_profile_id, activity_id, reviewer_user_key)
);

-- 4. Enable RLS
ALTER TABLE public.coach_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coach_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coach_reviews ENABLE ROW LEVEL SECURITY;

-- 5. Coach Profiles RLS Policies
CREATE POLICY "coach_profiles_read_active" ON public.coach_profiles
  FOR SELECT USING (is_active = true OR go_irl_request_user_key() = user_key OR go_irl_request_can_moderate());

CREATE POLICY "coach_profiles_insert_own" ON public.coach_profiles
  FOR INSERT WITH CHECK (user_key = go_irl_request_user_key());

CREATE POLICY "coach_profiles_update_own" ON public.coach_profiles
  FOR UPDATE USING (user_key = go_irl_request_user_key() OR go_irl_request_can_moderate())
  WITH CHECK (user_key = go_irl_request_user_key() OR go_irl_request_can_moderate());

-- 6. Coach Requests RLS Policies
CREATE POLICY "coach_requests_read_own" ON public.coach_requests
  FOR SELECT USING (requester_user_key = go_irl_request_user_key() OR go_irl_request_can_moderate() OR
    EXISTS (SELECT 1 FROM activities WHERE id = activity_id AND organizer_key = go_irl_request_user_key()));

CREATE POLICY "coach_requests_insert_own" ON public.coach_requests
  FOR INSERT WITH CHECK (requester_user_key = go_irl_request_user_key());

CREATE POLICY "coach_requests_update_own_cancel" ON public.coach_requests
  FOR UPDATE USING (requester_user_key = go_irl_request_user_key() AND status = 'pending')
  WITH CHECK (status IN ('cancelled', 'pending'));

CREATE POLICY "coach_requests_update_organizer" ON public.coach_requests
  FOR UPDATE USING (EXISTS (SELECT 1 FROM activities WHERE id = activity_id AND organizer_key = go_irl_request_user_key()))
  WITH CHECK (EXISTS (SELECT 1 FROM activities WHERE id = activity_id AND organizer_key = go_irl_request_user_key()));

CREATE POLICY "coach_requests_update_admin" ON public.coach_requests
  FOR UPDATE USING (go_irl_request_can_moderate())
  WITH CHECK (go_irl_request_can_moderate());

-- 7. Coach Reviews RLS Policies
CREATE POLICY "coach_reviews_read_public" ON public.coach_reviews
  FOR SELECT USING (is_public = true OR reviewer_user_key = go_irl_request_user_key() OR go_irl_request_can_moderate());

CREATE POLICY "coach_reviews_insert_own" ON public.coach_reviews
  FOR INSERT WITH CHECK (reviewer_user_key = go_irl_request_user_key());

CREATE POLICY "coach_reviews_update_own" ON public.coach_reviews
  FOR UPDATE USING (reviewer_user_key = go_irl_request_user_key() OR go_irl_request_can_moderate())
  WITH CHECK (reviewer_user_key = go_irl_request_user_key() OR go_irl_request_can_moderate());

-- 8. Rating Calculation Function
CREATE OR REPLACE FUNCTION public.go_irl_recalculate_coach_rating(p_coach_profile_id uuid)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  WITH review_stats AS (
    SELECT
      COUNT(*) as v,
      AVG(overall_rating)::numeric(3,2) as R
    FROM coach_reviews
    WHERE coach_profile_id = p_coach_profile_id AND is_public = true
  ),
  global_avg AS (
    SELECT
      COALESCE(AVG(overall_rating)::numeric(3,2), 4.5) as C
    FROM coach_reviews
    WHERE is_public = true
  ),
  weighted_calc AS (
    SELECT
      CASE
        WHEN review_stats.v > 0
        THEN (review_stats.v::numeric / (review_stats.v::numeric + 5)) * review_stats.R +
             (5::numeric / (review_stats.v::numeric + 5)) * global_avg.C
        ELSE 0
      END as weighted_rating
    FROM review_stats, global_avg
  )
  UPDATE coach_profiles
  SET
    rating_avg = COALESCE((SELECT R FROM review_stats), 0),
    rating_count = COALESCE((SELECT v FROM review_stats), 0),
    rating_weighted = COALESCE((SELECT weighted_rating FROM weighted_calc), 0),
    updated_at = now()
  WHERE id = p_coach_profile_id;
$$;

-- 9. Trigger to Recalculate Rating on Review Change
CREATE OR REPLACE FUNCTION public.go_irl_trigger_recalculate_coach_rating()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  PERFORM go_irl_recalculate_coach_rating(COALESCE(NEW.coach_profile_id, OLD.coach_profile_id));
  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS coach_reviews_update_rating ON coach_reviews;

CREATE TRIGGER coach_reviews_update_rating
  AFTER INSERT OR UPDATE OR DELETE ON coach_reviews
  FOR EACH ROW
  EXECUTE FUNCTION go_irl_trigger_recalculate_coach_rating();

-- 10. Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_coach_profiles_user_key ON coach_profiles(user_key);
CREATE INDEX IF NOT EXISTS idx_coach_profiles_is_active ON coach_profiles(is_active);
CREATE INDEX IF NOT EXISTS idx_coach_requests_activity_id ON coach_requests(activity_id);
CREATE INDEX IF NOT EXISTS idx_coach_requests_requester ON coach_requests(requester_user_key);
CREATE INDEX IF NOT EXISTS idx_coach_requests_coach_id ON coach_requests(coach_profile_id);
CREATE INDEX IF NOT EXISTS idx_coach_reviews_coach_id ON coach_reviews(coach_profile_id);
CREATE INDEX IF NOT EXISTS idx_coach_reviews_activity_id ON coach_reviews(activity_id);
