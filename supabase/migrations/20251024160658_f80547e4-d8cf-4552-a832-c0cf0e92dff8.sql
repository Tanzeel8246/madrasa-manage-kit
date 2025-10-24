-- Add manager role to app_role enum
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'manager';

-- Update handle_new_user function to assign default viewer role
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  -- Insert profile
  INSERT INTO public.profiles (id, full_name, madrasa_name)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', ''),
    COALESCE(new.raw_user_meta_data->>'madrasa_name', '')
  );
  
  -- Assign default viewer role to new users
  INSERT INTO public.user_roles (user_id, role)
  VALUES (new.id, 'viewer');
  
  RETURN new;
END;
$$;