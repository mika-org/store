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

-- 4. Create customers table (profiles table mapping to auth.users)
create table public.customers_shop (
    id uuid references auth.users(id) on delete cascade primary key,
    full_name text,
    email text not null,
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
    customer_id uuid references public.customers_shop(id) on delete cascade unique not null
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
    customer_id uuid references public.customers_shop(id) on delete set null,
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
alter table public.customers_shop enable row level security;
alter table public.carts_shop enable row level security;
alter table public.cart_items_shop enable row level security;
alter table public.orders_shop enable row level security;
alter table public.order_items_shop enable row level security;
alter table public.payments_shop enable row level security;

-- Create Security Policies

-- Categories: Read for anyone, write for admins
create policy "Allow public read categories" on public.categories_shop for select using (true);
create policy "Allow admin write categories" on public.categories_shop for all using (
    exists (select 1 from public.customers_shop where id = auth.uid() and role = 'admin')
);

-- Products: Read for anyone (active only for public, all for admins), write for admins
create policy "Allow public read products" on public.products_shop for select using (is_active = true or exists (select 1 from public.customers_shop where id = auth.uid() and role = 'admin'));
create policy "Allow admin write products" on public.products_shop for all using (
    exists (select 1 from public.customers_shop where id = auth.uid() and role = 'admin')
);

-- Product Images: Read for anyone, write for admins
create policy "Allow public read product_images" on public.product_images_shop for select using (true);
create policy "Allow admin write product_images" on public.product_images_shop for all using (
    exists (select 1 from public.customers_shop where id = auth.uid() and role = 'admin')
);

-- Customers: Read self/admin, update self/admin, create trigger/auth
create policy "Allow users to read their own profile" on public.customers_shop for select using (
    auth.uid() = id or exists (select 1 from public.customers_shop where id = auth.uid() and role = 'admin')
);
create policy "Allow users to update their own profile" on public.customers_shop for update using (
    auth.uid() = id or exists (select 1 from public.customers_shop where id = auth.uid() and role = 'admin')
);
create policy "Allow admin write customers" on public.customers_shop for all using (
    exists (select 1 from public.customers_shop where id = auth.uid() and role = 'admin')
);

-- Carts: Read/write self, read/write admin
create policy "Allow users to manage their own cart" on public.carts_shop for all using (
    auth.uid() = customer_id or exists (select 1 from public.customers_shop where id = auth.uid() and role = 'admin')
);

-- Cart Items: Read/write self cart items, read/write admin
create policy "Allow users to manage their own cart items" on public.cart_items_shop for all using (
    exists (
        select 1 from public.carts_shop 
        where id = cart_id and (customer_id = auth.uid() or exists (select 1 from public.customers_shop where id = auth.uid() and role = 'admin'))
    )
);

-- Orders: Read self/admin, write self/admin
create policy "Allow users to view their own orders" on public.orders_shop for select using (
    auth.uid() = customer_id or exists (select 1 from public.customers_shop where id = auth.uid() and role = 'admin')
);
create policy "Allow users to create their own orders" on public.orders_shop for insert with check (
    auth.uid() = customer_id
);
create policy "Allow admin write orders" on public.orders_shop for all using (
    exists (select 1 from public.customers_shop where id = auth.uid() and role = 'admin')
);

-- Order Items: Read self/admin, write self/admin
create policy "Allow users to view their own order items" on public.order_items_shop for select using (
    exists (
        select 1 from public.orders_shop 
        where id = order_id and (customer_id = auth.uid() or exists (select 1 from public.customers_shop where id = auth.uid() and role = 'admin'))
    )
);
create policy "Allow users to insert their own order items" on public.order_items_shop for insert with check (
    exists (
        select 1 from public.orders_shop 
        where id = order_id and customer_id = auth.uid()
    )
);
create policy "Allow admin write order_items" on public.order_items_shop for all using (
    exists (select 1 from public.customers_shop where id = auth.uid() and role = 'admin')
);

-- Payments: Read self/admin, write self/admin
create policy "Allow users to view their own payments" on public.payments_shop for select using (
    exists (
        select 1 from public.orders_shop 
        where id = order_id and (customer_id = auth.uid() or exists (select 1 from public.customers_shop where id = auth.uid() and role = 'admin'))
    )
);
create policy "Allow users to create/update their own payments" on public.payments_shop for insert with check (
    exists (
        select 1 from public.orders_shop 
        where id = order_id and customer_id = auth.uid()
    )
);
create policy "Allow admin write payments" on public.payments_shop for all using (
    exists (select 1 from public.customers_shop where id = auth.uid() and role = 'admin')
);

-- Create trigger to automatically insert a new profile into public.customers_shop on auth.users registration
create or replace function public.handle_new_user()
returns trigger as $$
begin
    insert into public.customers_shop (id, email, full_name, role)
    values (
        new.id,
        new.email,
        coalesce(new.raw_user_meta_data->>'full_name', ''),
        coalesce(new.raw_user_meta_data->>'role', 'customer')
    );
    
    -- Also initialize an empty cart for the new customer
    insert into public.carts_shop (customer_id)
    values (new.id);
    
    return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
    after insert on auth.users
    for each row execute procedure public.handle_new_user();
