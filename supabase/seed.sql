-- Seed Categories
insert into public.categories_shop (id, name, slug, image) values
('11111111-1111-1111-1111-111111111111', 'T-Shirts', 't-shirts', 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500&auto=format&fit=crop&q=60'),
('22222222-2222-2222-2222-222222222222', 'Hoodies', 'hoodies', 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=500&auto=format&fit=crop&q=60'),
('33333333-3333-3333-3333-333333333333', 'Pants', 'pants', 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=500&auto=format&fit=crop&q=60'),
('44444444-4444-4444-4444-444444444444', 'Jackets', 'jackets', 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500&auto=format&fit=crop&q=60')
on conflict (id) do nothing;

-- Seed Products
insert into public.products_shop (id, category_id, name, slug, description, price, stock, gender, size, color, image) values
-- T-Shirts
('a1111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'Classic White Tee', 'classic-white-tee', 'A timeless, comfortable, and durable white crewneck t-shirt made of 100% organic cotton.', 150000.00, 50, 'Unisex', array['S', 'M', 'L', 'XL'], array['White'], 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80'),
('a1111112-1111-1111-1111-111111111112', '11111111-1111-1111-1111-111111111111', 'Vintage Black Tee', 'vintage-black-tee', 'Slightly faded black graphic t-shirt crafted with a premium heavyweight cotton blend.', 180000.00, 30, 'Unisex', array['M', 'L', 'XL'], array['Black'], 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=800&auto=format&fit=crop&q=80'),
('a1111113-1111-1111-1111-111111111113', '11111111-1111-1111-1111-111111111111', 'Stripped Cotton Shirt', 'stripped-cotton-shirt', 'Slim-fit striped casual t-shirt for daily comfort.', 175000.00, 25, 'Men', array['S', 'M', 'L'], array['Blue', 'White'], 'https://images.unsplash.com/photo-1562157873-818bc0726f68?w=800&auto=format&fit=crop&q=80'),

-- Hoodies
('a2222221-2222-2222-2222-222222222221', '22222222-2222-2222-2222-222222222222', 'Oversized Grey Hoodie', 'oversized-grey-hoodie', 'Cozy oversized fleece hoodie featuring a double-lined hood and spacious kangaroo pocket.', 350000.00, 40, 'Unisex', array['S', 'M', 'L', 'XL'], array['Grey'], 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&auto=format&fit=crop&q=80'),
('a2222222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', 'Pastel Pink Hoodie', 'pastel-pink-hoodie', 'Soft pastel pink cotton hoodie, perfect for relaxed layering.', 320000.00, 15, 'Women', array['XS', 'S', 'M'], array['Pink'], 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&auto=format&fit=crop&q=80'),

-- Pants
('a3333331-3333-3333-3333-333333333331', '33333333-3333-3333-3333-333333333333', 'Relaxed Denim Jeans', 'relaxed-denim-jeans', 'Vintage-wash relaxed fit denim jeans with a straight leg cut.', 450000.00, 35, 'Men', array['28', '30', '32', '34'], array['Blue'], 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=800&auto=format&fit=crop&q=80'),
('a3333332-3333-3333-3333-333333333332', '33333333-3333-3333-3333-333333333333', 'Cargo Jogger Pants', 'cargo-jogger-pants', 'Utility cargo joggers featuring multiple pockets and elastic ankle cuffs.', 380000.00, 20, 'Unisex', array['S', 'M', 'L'], array['Black', 'Green'], 'https://images.unsplash.com/photo-1517445312882-bc9910d016b7?w=800&auto=format&fit=crop&q=80'),

-- Jackets
('a4444441-4444-4444-4444-444444444441', '44444444-4444-4444-4444-444444444444', 'Classic Leather Bomber', 'classic-leather-bomber', 'Premium genuine leather bomber jacket with ribbed collar and zipped cuffs.', 1200000.00, 10, 'Men', array['M', 'L', 'XL'], array['Black', 'Brown'], 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&auto=format&fit=crop&q=80'),
('a4444442-4444-4444-4444-444444444442', '44444444-4444-4444-4444-444444444444', 'Windbreaker Shell Jacket', 'windbreaker-shell-jacket', 'Water-resistant lightweight windbreaker featuring adjustable toggle hood.', 290000.00, 30, 'Unisex', array['S', 'M', 'L'], array['Yellow', 'Black'], 'https://images.unsplash.com/photo-1548883354-7622d03aca27?w=800&auto=format&fit=crop&q=80')
on conflict (id) do nothing;

-- Seed Product Additional Images
insert into public.product_images_shop (id, product_id, image_url) values
(gen_random_uuid(), 'a1111111-1111-1111-1111-111111111111', 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80'),
(gen_random_uuid(), 'a1111111-1111-1111-1111-111111111111', 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&auto=format&fit=crop&q=80'),
(gen_random_uuid(), 'a2222221-2222-2222-2222-222222222221', 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&auto=format&fit=crop&q=80'),
(gen_random_uuid(), 'a4444441-4444-4444-4444-444444444441', 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&auto=format&fit=crop&q=80')
on conflict (id) do nothing;

-- Seed Admin User
insert into public.users_shop (id, full_name, email, password, role) values
('99999999-9999-9999-9999-999999999999', 'Admin Store', 'admin@store.com', '$2b$10$AYsjtUv3iIUzIS70wO/EXe4xFpWE3A6LP6rTWIu/CdPOMtxeBbTOi', 'admin')
on conflict (email) do nothing;

-- Seed Additional Product
insert into public.products_shop (id, category_id, name, slug, description, price, stock, gender, size, color, image) values
('b1111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'Minimalist Linen Shirt', 'minimalist-linen-shirt', 'A premium minimalist shirt crafted from 100% organic French linen, designed for comfort and breathability.', 249000.00, 45, 'Unisex', array['S', 'M', 'L', 'XL'], array['Beige', 'White'], 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&auto=format&fit=crop&q=80')
on conflict (slug) do nothing;

-- More Seed Products
insert into public.products_shop (id, category_id, name, slug, description, price, stock, gender, size, color, image) values
('b2222222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', 'Linen Oversized Hoodie', 'linen-oversized-hoodie', 'Lightweight and breathable hoodie knitted from premium organic linen and cotton blend. Ideal for summer layering.', 399000.00, 25, 'Unisex', array['S', 'M', 'L'], array['Beige', 'Grey'], 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=800&auto=format&fit=crop&q=80'),
('b3333333-3333-3333-3333-333333333333', '33333333-3333-3333-3333-333333333333', 'Tailored Chino Pants', 'tailored-chino-pants', 'Slim fit tailored chino pants crafted with high-stretch organic cotton twill for daily flexibility and style.', 499000.00, 30, 'Men', array['30', '32', '34'], array['Khaki', 'Black', 'Navy'], 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=800&auto=format&fit=crop&q=80'),
('b4444444-4444-4444-4444-444444444444', '44444444-4444-4444-4444-444444444444', 'Premium Denim Jacket', 'premium-denim-jacket', 'Classic fit trucker denim jacket constructed from raw rigid organic cotton denim with copper button details.', 699000.00, 15, 'Unisex', array['S', 'M', 'L', 'XL'], array['Blue'], 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=800&auto=format&fit=crop&q=80'),
('b1111112-1111-1111-1111-111111111112', '11111111-1111-1111-1111-111111111111', 'Structured Knit Tee', 'structured-knit-tee', 'Heavyweight interlock knit t-shirt featuring a structured shape and mock neck collar for a refined streetwear look.', 199000.00, 60, 'Unisex', array['S', 'M', 'L', 'XL'], array['Off-White', 'Black'], 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=800&auto=format&fit=crop&q=80')
on conflict (slug) do nothing;



