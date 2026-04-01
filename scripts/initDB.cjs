const { Client } = require('pg');

const uri = 'postgresql://postgres:Koushik2003*@db.xoterbjnkinehavteitl.supabase.co:5432/postgres';

const client = new Client({
  connectionString: uri,
  ssl: { rejectUnauthorized: false }
});

const schema = `
  -- Users handled by supabase auth.users, but we can store public profiles
  CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    role TEXT DEFAULT 'buyer',
    avatar TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
  );

  -- Products
  CREATE TABLE IF NOT EXISTS public.products (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    price NUMERIC NOT NULL,
    original_price NUMERIC,
    category TEXT NOT NULL,
    images JSONB DEFAULT '[]'::jsonb,
    stock INTEGER DEFAULT 0,
    status TEXT DEFAULT 'active',
    seller_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    seller_name TEXT,
    rating NUMERIC DEFAULT 0,
    review_count INTEGER DEFAULT 0,
    tags JSONB DEFAULT '[]'::jsonb,
    specifications JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
  );

  -- Orders
  CREATE TABLE IF NOT EXISTS public.orders (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    subtotal NUMERIC NOT NULL,
    shipping NUMERIC DEFAULT 0,
    tax NUMERIC DEFAULT 0,
    total NUMERIC NOT NULL,
    status TEXT DEFAULT 'pending',
    payment_status TEXT DEFAULT 'pending',
    shipping_address JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
  );

  -- Order Items
  CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    product_name TEXT NOT NULL,
    product_image TEXT NOT NULL,
    price NUMERIC NOT NULL,
    quantity INTEGER NOT NULL,
    total NUMERIC NOT NULL,
    seller_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'pending'
  );

  -- Seed initial users for testing (bypassing auth just for dummy data structure? No, best to rely on auth.)
  -- Enable Row Level Security (RLS) policies for products so sellers can insert but anyone can view.
  -- Enable pg_uuid_ossp if not enabled
  CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
`;

async function init() {
  try {
    await client.connect();
    console.log("Connected to database.");
    await client.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";');
    await client.query(schema);
    console.log("Successfully ran schema queries.");
  } catch (err) {
    console.error("Error executing queries:", err);
  } finally {
    await client.end();
  }
}

init();
