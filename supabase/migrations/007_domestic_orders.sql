-- 007_domestic_orders.sql
-- Table for Domestic Retail Packet orders with direct UPI payments

CREATE TABLE IF NOT EXISTS public.domestic_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT NOT NULL UNIQUE,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_email TEXT,
  shipping_address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  pincode TEXT NOT NULL,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  total_amount_inr NUMERIC(12, 2) NOT NULL,
  shipping_fee_inr NUMERIC(12, 2) NOT NULL DEFAULT 0,
  final_amount_inr NUMERIC(12, 2) NOT NULL,
  payment_method TEXT NOT NULL DEFAULT 'UPI',
  payment_status TEXT NOT NULL DEFAULT 'pending_verification' CHECK (payment_status IN ('pending_verification', 'paid', 'failed', 'refunded')),
  order_status TEXT NOT NULL DEFAULT 'received' CHECK (order_status IN ('received', 'confirmed', 'dispatched', 'delivered', 'cancelled')),
  upi_reference_utr TEXT,
  courier_tracking_number TEXT,
  courier_name TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for speedy queries
CREATE INDEX IF NOT EXISTS idx_domestic_orders_order_number ON public.domestic_orders(order_number);
CREATE INDEX IF NOT EXISTS idx_domestic_orders_phone ON public.domestic_orders(customer_phone);
CREATE INDEX IF NOT EXISTS idx_domestic_orders_created_at ON public.domestic_orders(created_at DESC);

-- Enable RLS
ALTER TABLE public.domestic_orders ENABLE ROW LEVEL SECURITY;

-- Allow anonymous shoppers to submit new orders
CREATE POLICY "Public can insert domestic orders"
  ON public.domestic_orders
  FOR INSERT
  WITH CHECK (true);

-- Allow anonymous shoppers to update their order with UTR reference
CREATE POLICY "Public can update domestic order UTR"
  ON public.domestic_orders
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Authenticated admins can view and manage all domestic orders
CREATE POLICY "Admins can view domestic orders"
  ON public.domestic_orders
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can update domestic orders"
  ON public.domestic_orders
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);
