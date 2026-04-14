-- Run this in your Supabase SQL Editor

-- Wishlist table
CREATE TABLE IF NOT EXISTS public.wishlists (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, product_id)
);

-- RLS for wishlists
ALTER TABLE public.wishlists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "wishlists_select" ON public.wishlists
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "wishlists_insert" ON public.wishlists
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "wishlists_delete" ON public.wishlists
  FOR DELETE USING (auth.uid() = user_id);
