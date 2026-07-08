-- ============================================================================
-- Security + profile hardening migration
-- Run this ENTIRE script in your Supabase SQL Editor.
--
-- What it does:
--   1. Adds phone/address columns to profiles (so profile edits persist).
--   2. Enables Row-Level Security (RLS) on the core tables and adds policies
--      so the public anon key can no longer read or modify everyone's data.
--   3. Moves stock decrement server-side via a trigger, so buyers don't need
--      write access to other sellers' product rows.
--
-- IMPORTANT: With RLS OFF (the previous state) any visitor could read/modify
-- every order, profile and product through the public API. After running this,
-- test the buyer + seller flows end-to-end and adjust policies if a legitimate
-- query is blocked.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1. Profile columns
-- ---------------------------------------------------------------------------
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS address JSONB;

-- ---------------------------------------------------------------------------
-- 2. SECURITY DEFINER helpers
-- These run as the table owner and therefore bypass RLS on the tables they
-- read. We use them inside policies to avoid the "infinite recursion detected
-- in policy" error that happens when orders and order_items policies reference
-- each other directly.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.user_owns_order(oid UUID)
RETURNS BOOLEAN LANGUAGE SQL SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.orders o WHERE o.id = oid AND o.user_id = auth.uid());
$$;

CREATE OR REPLACE FUNCTION public.user_is_seller_on_order(oid UUID)
RETURNS BOOLEAN LANGUAGE SQL SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.order_items oi WHERE oi.order_id = oid AND oi.seller_id = auth.uid());
$$;

-- ---------------------------------------------------------------------------
-- 3. Server-side stock decrement (so buyers don't need UPDATE on products)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.decrement_product_stock()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  UPDATE public.products
     SET stock = GREATEST(0, stock - NEW.quantity),
         updated_at = timezone('utc'::text, now())
   WHERE id = NEW.product_id;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_decrement_stock ON public.order_items;
CREATE TRIGGER trg_decrement_stock
  AFTER INSERT ON public.order_items
  FOR EACH ROW EXECUTE FUNCTION public.decrement_product_stock();

-- ---------------------------------------------------------------------------
-- 4. Enable RLS
-- ---------------------------------------------------------------------------
ALTER TABLE public.profiles    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------------------
-- PROFILES — a user can only see and manage their own row.
-- (Seller display names/avatars are read from products.seller_name, not here.)
-- The signup trigger handle_new_user() is SECURITY DEFINER, so it still inserts
-- new rows regardless of these policies.
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS profiles_select ON public.profiles;
CREATE POLICY profiles_select ON public.profiles
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS profiles_insert ON public.profiles;
CREATE POLICY profiles_insert ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS profiles_update ON public.profiles;
CREATE POLICY profiles_update ON public.profiles
  FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS profiles_delete ON public.profiles;
CREATE POLICY profiles_delete ON public.profiles
  FOR DELETE USING (auth.uid() = id);

-- ---------------------------------------------------------------------------
-- PRODUCTS — public storefront (anyone can read), only the owning seller writes.
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS products_select ON public.products;
CREATE POLICY products_select ON public.products
  FOR SELECT USING (true);

DROP POLICY IF EXISTS products_insert ON public.products;
CREATE POLICY products_insert ON public.products
  FOR INSERT WITH CHECK (auth.uid() = seller_id);

DROP POLICY IF EXISTS products_update ON public.products;
CREATE POLICY products_update ON public.products
  FOR UPDATE USING (auth.uid() = seller_id) WITH CHECK (auth.uid() = seller_id);

DROP POLICY IF EXISTS products_delete ON public.products;
CREATE POLICY products_delete ON public.products
  FOR DELETE USING (auth.uid() = seller_id);

-- ---------------------------------------------------------------------------
-- ORDERS — the buyer who placed it, plus any seller who has an item in it.
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS orders_select ON public.orders;
CREATE POLICY orders_select ON public.orders
  FOR SELECT USING (auth.uid() = user_id OR public.user_is_seller_on_order(id));

DROP POLICY IF EXISTS orders_insert ON public.orders;
CREATE POLICY orders_insert ON public.orders
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Buyer can update their own order (e.g. cancel); seller can advance status of
-- an order that contains their items.
DROP POLICY IF EXISTS orders_update ON public.orders;
CREATE POLICY orders_update ON public.orders
  FOR UPDATE USING (auth.uid() = user_id OR public.user_is_seller_on_order(id));

-- ---------------------------------------------------------------------------
-- ORDER_ITEMS — visible to the buyer (via the parent order) and to the seller
-- of the item. Buyers insert items for their own orders; sellers update the
-- status of their own items.
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS order_items_select ON public.order_items;
CREATE POLICY order_items_select ON public.order_items
  FOR SELECT USING (auth.uid() = seller_id OR public.user_owns_order(order_id));

DROP POLICY IF EXISTS order_items_insert ON public.order_items;
CREATE POLICY order_items_insert ON public.order_items
  FOR INSERT WITH CHECK (public.user_owns_order(order_id));

DROP POLICY IF EXISTS order_items_update ON public.order_items;
CREATE POLICY order_items_update ON public.order_items
  FOR UPDATE USING (auth.uid() = seller_id) WITH CHECK (auth.uid() = seller_id);
