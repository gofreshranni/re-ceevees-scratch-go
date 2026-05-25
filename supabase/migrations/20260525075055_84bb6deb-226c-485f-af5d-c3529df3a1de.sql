
CREATE TABLE public.registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  mobile text NOT NULL UNIQUE,
  email text,
  cash_amount integer NOT NULL,
  coupon_code text,
  scratched boolean NOT NULL DEFAULT false,
  shared boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX registrations_mobile_idx ON public.registrations (mobile);
CREATE INDEX registrations_created_at_idx ON public.registrations (created_at DESC);

ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;
-- No policies → no anon/auth access. Access only via server functions using the service role.

CREATE OR REPLACE FUNCTION public.tg_set_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END $$;

CREATE TRIGGER registrations_set_updated_at
BEFORE UPDATE ON public.registrations
FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();
