
-- System settings table for admin configurations (payment gateways, etc.)
CREATE TABLE public.system_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_by uuid REFERENCES auth.users(id)
);

ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- Only admins can read/write settings
CREATE POLICY "Admins can manage settings" ON public.system_settings
FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Public read for non-sensitive settings
CREATE POLICY "Public can read payment gateway status" ON public.system_settings
FOR SELECT TO authenticated
USING (key IN ('payment_gateway', 'platform_fees', 'min_withdraw'));

-- Insert default payment gateway config
INSERT INTO public.system_settings (key, value) VALUES
('payment_gateway', '{"primary": "asaas", "secondary": "stripe", "tertiary": "pix_manual", "asaas_enabled": true, "stripe_enabled": true, "pix_manual_enabled": true, "auto_fallback": true}'::jsonb),
('platform_fees', '{"withdraw_fee_percent": 0, "deposit_fee_percent": 0, "min_withdraw": 10, "max_withdraw": 50000, "min_deposit": 5}'::jsonb),
('platform_status', '{"maintenance": false, "registration_open": true, "competitions_enabled": true, "withdrawals_enabled": true}'::jsonb);
