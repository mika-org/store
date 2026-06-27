-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Create categories table
create table public.categories_shop (
    id uuid default gen_random_uuid() primary key,
    name text not null,
    slug text not null unique,
    image text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Create products table
create table public.products_shop (
    id uuid default gen_random_uuid() primary key,
    category_id uuid references public.categories_shop(id) on delete set null,
    name text not null,
    slug text not null unique,
    description text,
    price decimal(12, 2) not null check (price >= 0),
    stock integer not null default 0 check (stock >= 0),
    gender text check (gender in ('Men', 'Women', 'Unisex')),
    size text[] default '{}'::text[], -- e.g. {'S', 'M', 'L', 'XL'}
    color text[] default '{}'::text[], -- e.g. {'Black', 'White', 'Gray'}
    image text, -- Main product image
    is_active boolean default true not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Create product_images table
create table public.product_images_shop (
    id uuid default gen_random_uuid() primary key,
    product_id uuid references public.products_shop(id) on delete cascade not null,
    image_url text not null
);

-- 4. Create users table (with password column for custom bcrypt auth)
create table public.users_shop (
    id uuid default gen_random_uuid() primary key,
    full_name text,
    email text not null unique,
    password text not null,
    phone text,
    address text,
    city text,
    province text,
    postal_code text,
    role text default 'customer'::text check (role in ('customer', 'admin')) not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. Create carts table
create table public.carts_shop (
    id uuid default gen_random_uuid() primary key,
    customer_id uuid references public.users_shop(id) on delete cascade unique not null
);

-- 6. Create cart_items table
create table public.cart_items_shop (
    id uuid default gen_random_uuid() primary key,
    cart_id uuid references public.carts_shop(id) on delete cascade not null,
    product_id uuid references public.products_shop(id) on delete cascade not null,
    qty integer not null default 1 check (qty > 0),
    unique(cart_id, product_id)
);

-- 7. Create orders table
create table public.orders_shop (
    id uuid default gen_random_uuid() primary key,
    customer_id uuid references public.users_shop(id) on delete set null,
    invoice_number text not null unique,
    total_price decimal(12, 2) not null check (total_price >= 0),
    shipping_cost decimal(12, 2) not null default 0 check (shipping_cost >= 0),
    grand_total decimal(12, 2) not null check (grand_total >= 0),
    status text default 'Pending'::text check (status in ('Pending', 'Paid', 'Packed', 'Shipped', 'Completed', 'Cancelled')) not null,
    payment_status text default 'Unpaid'::text check (payment_status in ('Unpaid', 'Paid', 'Refunded', 'Pending Verification')) not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 8. Create order_items table
create table public.order_items_shop (
    id uuid default gen_random_uuid() primary key,
    order_id uuid references public.orders_shop(id) on delete cascade not null,
    product_id uuid references public.products_shop(id) on delete set null,
    qty integer not null check (qty > 0),
    price decimal(12, 2) not null check (price >= 0)
);

-- 9. Create payments table
create table public.payments_shop (
    id uuid default gen_random_uuid() primary key,
    order_id uuid references public.orders_shop(id) on delete cascade unique not null,
    payment_method text not null,
    payment_proof text,
    status text default 'Pending'::text check (status in ('Pending', 'Approved', 'Rejected')) not null
);

-- Enable Row Level Security (RLS) on all tables
alter table public.categories_shop enable row level security;
alter table public.products_shop enable row level security;
alter table public.product_images_shop enable row level security;
alter table public.users_shop enable row level security;
alter table public.carts_shop enable row level security;
alter table public.cart_items_shop enable row level security;
alter table public.orders_shop enable row level security;
alter table public.order_items_shop enable row level security;
alter table public.payments_shop enable row level security;

-- Create Security Policies (Security is validated at Next.js server-side layer)

create policy "Allow all access categories" on public.categories_shop for all using (true) with check (true);
create policy "Allow all access products" on public.products_shop for all using (true) with check (true);
create policy "Allow all access product_images" on public.product_images_shop for all using (true) with check (true);
create policy "Allow all access users" on public.users_shop for all using (true) with check (true);
create policy "Allow all access carts" on public.carts_shop for all using (true) with check (true);
create policy "Allow all access cart_items" on public.cart_items_shop for all using (true) with check (true);
create policy "Allow all access orders" on public.orders_shop for all using (true) with check (true);
create policy "Allow all access order_items" on public.order_items_shop for all using (true) with check (true);
create policy "Allow all access payments" on public.payments_shop for all using (true) with check (true);

-- Create trigger to automatically initialize an empty cart for a new user in users_shop
create or replace function public.handle_new_shop_user()
returns trigger as $$
begin
    insert into public.carts_shop (customer_id)
    values (new.id);
    return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_users_shop_user_created
    after insert on public.users_shop
    for each row execute procedure public.handle_new_shop_user();
