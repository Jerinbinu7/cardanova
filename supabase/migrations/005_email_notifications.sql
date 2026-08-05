-- ============================================================
-- Cardanova Spices — Transactional Email & Webhook Trigger (005)
-- Run AFTER 001_schema.sql
-- ============================================================

-- Function to handle quote notification webhooks (can trigger Edge Function or Resend)
CREATE OR REPLACE FUNCTION public.handle_new_quote_request()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- This function is executed automatically whenever a new quote is submitted.
  -- In Supabase Dashboard -> Database -> Webhooks, attach this table 'quote_requests'
  -- to trigger your Resend / SendGrid / Email Edge Function.
  RETURN NEW;
END;
$$;

-- Trigger definition
DROP TRIGGER IF EXISTS trigger_on_new_quote ON public.quote_requests;
CREATE TRIGGER trigger_on_new_quote
  AFTER INSERT ON public.quote_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_quote_request();
