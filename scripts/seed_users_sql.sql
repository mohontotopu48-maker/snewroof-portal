DO $$
DECLARE
    user1_id UUID := gen_random_uuid();
    user2_id UUID := gen_random_uuid();
    user3_id UUID := gen_random_uuid();
    user4_id UUID := gen_random_uuid();
    user5_id UUID := gen_random_uuid();
    user6_id UUID := gen_random_uuid();
    user7_id UUID := gen_random_uuid();
    user8_id UUID := gen_random_uuid();
BEGIN
    -- 1. GEO (Admin)
    INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, role, raw_app_meta_data, raw_user_meta_data, instance_id, aud)
    VALUES (user1_id, 'geovsualdm@gmail.com', crypt('SNR#26$Customer', gen_salt('bf')), now(), 'authenticated', '{"provider": "email", "providers": ["email"]}', '{}', '00000000-0000-0000-0000-000000000000', 'authenticated');

    -- 2. SAL (Admin)
    INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, role, raw_app_meta_data, raw_user_meta_data, instance_id, aud)
    VALUES (user2_id, 'info.vsualdm@gmail.com', crypt('SNR#26$Customer', gen_salt('bf')), now(), 'authenticated', '{"provider": "email", "providers": ["email"]}', '{}', '00000000-0000-0000-0000-000000000000', 'authenticated');

    -- 3. SAM (Admin)
    INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, role, raw_app_meta_data, raw_user_meta_data, instance_id, aud)
    VALUES (user3_id, 'info@snewroof.com', crypt('SNR#26$Customer', gen_salt('bf')), now(), 'authenticated', '{"provider": "email", "providers": ["email"]}', '{}', '00000000-0000-0000-0000-000000000000', 'authenticated');

    -- 4. Mohon (Admin)
    INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, role, raw_app_meta_data, raw_user_meta_data, instance_id, aud)
    VALUES (user4_id, 'mohontotopu48@gmail.com', crypt('SNR#26$Customer', gen_salt('bf')), now(), 'authenticated', '{"provider": "email", "providers": ["email"]}', '{}', '00000000-0000-0000-0000-000000000000', 'authenticated');

    -- 5. Maria (Admin)
    INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, role, raw_app_meta_data, raw_user_meta_data, instance_id, aud)
    VALUES (user5_id, 'marisnewroof2023@gmail.com', crypt('Maria@#SNR&26', gen_salt('bf')), now(), 'authenticated', '{"provider": "email", "providers": ["email"]}', '{}', '00000000-0000-0000-0000-000000000000', 'authenticated');

    -- 6. Tom Vuong (Customer)
    INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, role, raw_app_meta_data, raw_user_meta_data, instance_id, aud)
    VALUES (user6_id, 'tom@snewroof.com', crypt('SNR2026#Roof', gen_salt('bf')), now(), 'authenticated', '{"provider": "email", "providers": ["email"]}', '{}', '00000000-0000-0000-0000-000000000000', 'authenticated');

    -- 7. Brett (Customer)
    INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, role, raw_app_meta_data, raw_user_meta_data, instance_id, aud)
    VALUES (user7_id, 'brett@snewroof.com', crypt('SNR2026#Roof', gen_salt('bf')), now(), 'authenticated', '{"provider": "email", "providers": ["email"]}', '{}', '00000000-0000-0000-0000-000000000000', 'authenticated');

    -- 8. Lorraine (Customer)
    INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, role, raw_app_meta_data, raw_user_meta_data, instance_id, aud)
    VALUES (user8_id, 'lorraine@snewroof.com', crypt('SNR2026#Roof', gen_salt('bf')), now(), 'authenticated', '{"provider": "email", "providers": ["email"]}', '{}', '00000000-0000-0000-0000-000000000000', 'authenticated');

    -- Insert into public profiles to complete the creation
    INSERT INTO public.profiles (id, full_name, role) VALUES (user1_id, 'GEO', 'admin');
    INSERT INTO public.profiles (id, full_name, role) VALUES (user2_id, 'SAL', 'admin');
    INSERT INTO public.profiles (id, full_name, role) VALUES (user3_id, 'SAM', 'admin');
    INSERT INTO public.profiles (id, full_name, role) VALUES (user4_id, 'Mohon', 'admin');
    INSERT INTO public.profiles (id, full_name, role) VALUES (user5_id, 'Maria', 'admin');
    INSERT INTO public.profiles (id, full_name, role) VALUES (user6_id, 'Tom Vuong', 'customer');
    INSERT INTO public.profiles (id, full_name, role) VALUES (user7_id, 'Brett', 'customer');
    INSERT INTO public.profiles (id, full_name, role) VALUES (user8_id, 'Lorraine', 'customer');

END $$;
