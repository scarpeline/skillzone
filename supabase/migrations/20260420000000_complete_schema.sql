-- ============================================================
-- SKILLZONE — Schema Completo
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

CREATE TABLE IF NOT EXISTS public.user_roles (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role       text NOT NULL CHECK (role IN ('admin','moderator','vip','player')),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own roles" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role text)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

CREATE POLICY "Admins manage roles" ON public.user_roles FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin'));

CREATE TABLE IF NOT EXISTS public.profiles (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  username         text NOT NULL UNIQUE,
  display_name     text,
  avatar_url       text,
  bio              text,
  cash_balance     numeric(12,2) NOT NULL DEFAULT 0 CHECK (cash_balance >= 0),
  credits_balance  integer       NOT NULL DEFAULT 100 CHECK (credits_balance >= 0),
  xp               integer NOT NULL DEFAULT 0,
  tokens           integer NOT NULL DEFAULT 0,
  tickets          integer NOT NULL DEFAULT 0,
  vip_level        text    NOT NULL DEFAULT 'bronze' CHECK (vip_level IN ('bronze','silver','gold','platinum','diamond')),
  vip_points       integer NOT NULL DEFAULT 0,
  current_streak   integer NOT NULL DEFAULT 0,
  longest_streak   integer NOT NULL DEFAULT 0,
  last_played_at   timestamptz,
  total_matches    integer NOT NULL DEFAULT 0,
  total_wins       integer NOT NULL DEFAULT 0,
  total_earnings   numeric(12,2) NOT NULL DEFAULT 0,
  referral_code    text UNIQUE DEFAULT encode(gen_random_bytes(4),'hex'),
  referred_by      uuid REFERENCES public.profiles(id),
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read profiles" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Own profile update"   ON public.profiles FOR UPDATE TO authenticated USING (user_id = auth.uid());
CREATE TRIGGER trg_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  _username text;
  _display  text;
BEGIN
  _display  := COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email,'@',1));
  _username := lower(regexp_replace(_display, '[^a-zA-Z0-9]', '', 'g'));
  WHILE EXISTS (SELECT 1 FROM public.profiles WHERE username = _username) LOOP
    _username := _username || floor(random()*1000)::text;
  END LOOP;
  INSERT INTO public.profiles (user_id, username, display_name) VALUES (NEW.id, _username, _display);
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'player');
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE TABLE IF NOT EXISTS public.transactions (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type        text NOT NULL CHECK (type IN ('credit','debit','prize','entry','withdraw','bonus','refund','donation')),
  wallet      text NOT NULL CHECK (wallet IN ('cash','credits')),
  amount      numeric(12,2) NOT NULL,
  description text,
  reference   text,
  status      text NOT NULL DEFAULT 'completed' CHECK (status IN ('pending','completed','failed','reversed')),
  created_at  timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own transactions"       ON public.transactions FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Insert own transaction" ON public.transactions FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Admins see all tx"      ON public.transactions FOR ALL    TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE INDEX idx_transactions_user ON public.transactions(user_id, created_at DESC);

CREATE TABLE IF NOT EXISTS public.matches (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id       text NOT NULL,
  player1_id    uuid NOT NULL REFERENCES auth.users(id),
  player2_id    uuid REFERENCES auth.users(id),
  status        text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','active','completed','cancelled')),
  player1_score integer,
  player2_score integer,
  winner_id     uuid REFERENCES auth.users(id),
  stake_amount  numeric(12,2) NOT NULL DEFAULT 0,
  prize_amount  numeric(12,2) NOT NULL DEFAULT 0,
  wallet        text NOT NULL DEFAULT 'credits' CHECK (wallet IN ('cash','credits')),
  game_data     jsonb,
  started_at    timestamptz,
  ended_at      timestamptz,
  created_at    timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Players see own matches" ON public.matches FOR SELECT TO authenticated USING (player1_id = auth.uid() OR player2_id = auth.uid());
CREATE POLICY "Insert match"            ON public.matches FOR INSERT TO authenticated WITH CHECK (player1_id = auth.uid());
CREATE POLICY "Update own match"        ON public.matches FOR UPDATE TO authenticated USING (player1_id = auth.uid() OR player2_id = auth.uid());
CREATE POLICY "Admins see all matches"  ON public.matches FOR ALL    TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE INDEX idx_matches_player1 ON public.matches(player1_id, created_at DESC);
CREATE INDEX idx_matches_game    ON public.matches(game_id, created_at DESC);

CREATE TABLE IF NOT EXISTS public.tournaments (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name                text NOT NULL,
  description         text,
  game_id             text NOT NULL,
  game_icon           text NOT NULL DEFAULT '🎮',
  entry_fee           numeric(12,2) NOT NULL DEFAULT 0,
  entry_wallet        text NOT NULL DEFAULT 'cash' CHECK (entry_wallet IN ('cash','credits')),
  max_players         integer NOT NULL DEFAULT 100,
  min_players         integer NOT NULL DEFAULT 2,
  guaranteed_prize    numeric(12,2) NOT NULL DEFAULT 0,
  prize_distribution  jsonb NOT NULL DEFAULT '[{"position":1,"percent":40,"label":"🥇 1º Lugar"},{"position":2,"percent":25,"label":"🥈 2º Lugar"},{"position":3,"percent":15,"label":"🥉 3º Lugar"},{"position":4,"percent":10,"label":"4º Lugar"},{"position":5,"percent":10,"label":"5º Lugar"}]'::jsonb,
  rebuy_allowed       boolean NOT NULL DEFAULT true,
  rebuy_fee           numeric(12,2) NOT NULL DEFAULT 0,
  max_rebuys          integer NOT NULL DEFAULT 2,
  status              text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','registering','starting','live','finished','cancelled')),
  starts_at           timestamptz NOT NULL,
  ends_at             timestamptz,
  created_by          uuid REFERENCES auth.users(id),
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.tournaments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read tournaments"   ON public.tournaments FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins manage tournaments" ON public.tournaments FOR ALL    TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER trg_tournaments_updated_at BEFORE UPDATE ON public.tournaments
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE IF NOT EXISTS public.tournament_registrations (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id uuid NOT NULL REFERENCES public.tournaments(id) ON DELETE CASCADE,
  user_id       uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status        text NOT NULL DEFAULT 'registered' CHECK (status IN ('registered','playing','eliminated','winner','refunded')),
  score         integer NOT NULL DEFAULT 0,
  position      integer,
  rebuys        integer NOT NULL DEFAULT 0,
  prize_won     numeric(12,2),
  registered_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(tournament_id, user_id)
);
ALTER TABLE public.tournament_registrations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own registrations"       ON public.tournament_registrations FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Insert registration"     ON public.tournament_registrations FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Update own registration" ON public.tournament_registrations FOR UPDATE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Admins manage regs"      ON public.tournament_registrations FOR ALL    TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE INDEX idx_treg_tournament ON public.tournament_registrations(tournament_id);
CREATE INDEX idx_treg_user       ON public.tournament_registrations(user_id);

CREATE OR REPLACE VIEW public.tournament_player_counts AS
SELECT tournament_id, COUNT(*) AS player_count
FROM public.tournament_registrations
WHERE status NOT IN ('refunded')
GROUP BY tournament_id;

CREATE TABLE IF NOT EXISTS public.rankings (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  game_id    text NOT NULL DEFAULT 'global',
  period     text NOT NULL DEFAULT 'all_time' CHECK (period IN ('daily','weekly','monthly','all_time')),
  score      integer NOT NULL DEFAULT 0,
  position   integer,
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, game_id, period)
);
ALTER TABLE public.rankings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read rankings"   ON public.rankings FOR SELECT TO authenticated USING (true);
CREATE POLICY "System update rankings" ON public.rankings FOR ALL    TO authenticated USING (public.has_role(auth.uid(),'admin'));

CREATE TABLE IF NOT EXISTS public.achievements (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type        text NOT NULL,
  title       text NOT NULL,
  description text,
  icon        text,
  unlocked_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, type)
);
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own achievements"   ON public.achievements FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Insert achievement" ON public.achievements FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

CREATE TABLE IF NOT EXISTS public.notifications (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type       text NOT NULL,
  title      text NOT NULL,
  body       text,
  data       jsonb,
  read       boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own notifications" ON public.notifications FOR ALL TO authenticated USING (user_id = auth.uid());
CREATE INDEX idx_notifications_user ON public.notifications(user_id, created_at DESC);

CREATE TABLE IF NOT EXISTS public.affiliates (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  referred_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  commission  numeric(12,2) NOT NULL DEFAULT 0,
  status      text NOT NULL DEFAULT 'active',
  created_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE(referrer_id, referred_id)
);
ALTER TABLE public.affiliates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own affiliates" ON public.affiliates FOR SELECT TO authenticated USING (referrer_id = auth.uid());

CREATE TABLE IF NOT EXISTS public.game_sessions (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  game_id         text NOT NULL,
  wallet          text NOT NULL DEFAULT 'credits' CHECK (wallet IN ('cash','credits')),
  initial_balance numeric(12,2) NOT NULL,
  final_balance   numeric(12,2),
  total_bet       numeric(12,2) NOT NULL DEFAULT 0,
  total_won       numeric(12,2) NOT NULL DEFAULT 0,
  spins           integer NOT NULL DEFAULT 0,
  status          text NOT NULL DEFAULT 'active' CHECK (status IN ('active','ended')),
  started_at      timestamptz NOT NULL DEFAULT now(),
  ended_at        timestamptz
);
ALTER TABLE public.game_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own sessions" ON public.game_sessions FOR ALL TO authenticated USING (user_id = auth.uid());
CREATE INDEX idx_sessions_user ON public.game_sessions(user_id, started_at DESC);

CREATE OR REPLACE FUNCTION public.record_match_result(
  p_game_id text, p_player_id uuid, p_score integer,
  p_stake numeric, p_prize numeric,
  p_wallet text DEFAULT 'credits', p_won boolean DEFAULT true
) RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE _xp_gain integer := 25 + CASE WHEN p_stake > 0 THEN 15 ELSE 0 END;
BEGIN
  INSERT INTO public.matches (game_id, player1_id, status, player1_score, winner_id, stake_amount, prize_amount, wallet, started_at, ended_at)
  VALUES (p_game_id, p_player_id, 'completed', p_score, CASE WHEN p_won THEN p_player_id ELSE NULL END, p_stake, p_prize, p_wallet, now(), now());
  UPDATE public.profiles SET
    total_matches   = total_matches + 1,
    total_wins      = total_wins + CASE WHEN p_won THEN 1 ELSE 0 END,
    xp              = xp + _xp_gain,
    last_played_at  = now(),
    cash_balance    = CASE WHEN p_wallet = 'cash'    THEN cash_balance    + p_prize - p_stake ELSE cash_balance    END,
    credits_balance = CASE WHEN p_wallet = 'credits' THEN credits_balance + p_prize::integer - p_stake::integer ELSE credits_balance END,
    total_earnings  = CASE WHEN p_wallet = 'cash' AND p_prize > 0 THEN total_earnings + p_prize ELSE total_earnings END
  WHERE user_id = p_player_id;
  IF p_prize > 0 THEN
    INSERT INTO public.transactions (user_id, type, wallet, amount, description, reference)
    VALUES (p_player_id, 'prize', p_wallet, p_prize, 'Prêmio - ' || p_game_id, p_game_id);
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.register_tournament(p_tournament_id uuid, p_user_id uuid)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  _t       public.tournaments%ROWTYPE;
  _profile public.profiles%ROWTYPE;
  _count   integer;
BEGIN
  SELECT * INTO _t FROM public.tournaments WHERE id = p_tournament_id;
  IF NOT FOUND THEN RETURN '{"error":"Torneio não encontrado"}'::jsonb; END IF;
  IF _t.status NOT IN ('registering','draft') THEN RETURN '{"error":"Inscrições encerradas"}'::jsonb; END IF;
  SELECT * INTO _profile FROM public.profiles WHERE user_id = p_user_id;
  IF NOT FOUND THEN RETURN '{"error":"Perfil não encontrado"}'::jsonb; END IF;
  IF _t.entry_wallet = 'cash'    AND _profile.cash_balance    < _t.entry_fee THEN RETURN '{"error":"Saldo insuficiente"}'::jsonb; END IF;
  IF _t.entry_wallet = 'credits' AND _profile.credits_balance < _t.entry_fee THEN RETURN '{"error":"Créditos insuficientes"}'::jsonb; END IF;
  SELECT COUNT(*) INTO _count FROM public.tournament_registrations WHERE tournament_id = p_tournament_id AND status != 'refunded';
  IF _count >= _t.max_players THEN RETURN '{"error":"Torneio lotado"}'::jsonb; END IF;
  INSERT INTO public.tournament_registrations (tournament_id, user_id) VALUES (p_tournament_id, p_user_id) ON CONFLICT DO NOTHING;
  IF _t.entry_fee > 0 THEN
    UPDATE public.profiles SET
      cash_balance    = CASE WHEN _t.entry_wallet = 'cash'    THEN cash_balance    - _t.entry_fee ELSE cash_balance    END,
      credits_balance = CASE WHEN _t.entry_wallet = 'credits' THEN credits_balance - _t.entry_fee::integer ELSE credits_balance END
    WHERE user_id = p_user_id;
    INSERT INTO public.transactions (user_id, type, wallet, amount, description, reference)
    VALUES (p_user_id, 'entry', _t.entry_wallet, -_t.entry_fee, 'Inscrição: ' || _t.name, p_tournament_id::text);
  END IF;
  RETURN '{"success":true}'::jsonb;
END;
$$;

INSERT INTO public.tournaments (name, description, game_id, game_icon, entry_fee, max_players, guaranteed_prize, starts_at, status) VALUES
  ('Torneio Tigrinho Semanal',      'Os 5 melhores dividem o prêmio!', 'slot-tiger',       '🐯', 50,  100, 3000,  now() + interval '2 hours',   'registering'),
  ('Gates of Olympus Championship', 'Cluster pays ao vivo!',           'gates-of-olympus', '⚡', 100, 50,  8000,  now() + interval '4 hours',   'registering'),
  ('Crash Masters',                 'Saque antes do crash!',           'crash',            '✈️', 25,  200, 5000,  now() + interval '1 hour',    'registering'),
  ('Mines Tournament',              'Evite as minas e ganhe!',         'mines',            '💣', 30,  150, 4000,  now() + interval '3 hours',   'registering'),
  ('Plinko Grand Prix',             'Bolinha de ouro!',                'plinko',           '🎯', 20,  300, 6000,  now() + interval '30 minutes','registering'),
  ('Fortune Ox Free Spins Cup',     'Free spins valem mais!',          'fortune-ox',       '🐂', 75,  80,  10000, now() + interval '6 hours',   'registering'),
  ('Campeonato de Xadrez',          'Estratégia pura!',                'chess',            '♛', 50,  128, 25000, now() + interval '1 day',     'registering'),
  ('Quiz Night Champions',          'Conhecimento é poder!',           'quiz',             '❓', 25,  200, 8000,  now() + interval '5 hours',   'registering')
ON CONFLICT DO NOTHING;
- -   t r i g g e r  
 