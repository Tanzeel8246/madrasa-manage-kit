-- Create user roles enum
CREATE TYPE public.app_role AS ENUM ('admin', 'accountant', 'viewer', 'donor');

-- Create user roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create sections table (Mosque/Madrasa)
CREATE TABLE public.sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('mosque', 'madrasa')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.sections ENABLE ROW LEVEL SECURITY;

-- Create donors table
CREATE TABLE public.donors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  address TEXT,
  cnic TEXT,
  is_regular BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.donors ENABLE ROW LEVEL SECURITY;

-- Create income categories enum
CREATE TYPE public.income_category AS ENUM ('zakat', 'sadaqah', 'fitrana', 'qurbani', 'donation', 'other');

-- Create payment method enum
CREATE TYPE public.payment_method AS ENUM ('cash', 'bank', 'online');

-- Create income transactions table
CREATE TABLE public.income_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  amount DECIMAL(15, 2) NOT NULL CHECK (amount > 0),
  category income_category NOT NULL,
  payment_method payment_method NOT NULL,
  donor_id UUID REFERENCES public.donors(id),
  donor_name TEXT,
  section_id UUID REFERENCES public.sections(id),
  receipt_number TEXT,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  description TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.income_transactions ENABLE ROW LEVEL SECURITY;

-- Create expense categories enum
CREATE TYPE public.expense_category AS ENUM (
  'salaries', 'food', 'utilities', 'books', 'furniture', 
  'stationery', 'construction', 'repairs', 'events', 'other'
);

-- Create expense transactions table
CREATE TABLE public.expense_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  amount DECIMAL(15, 2) NOT NULL CHECK (amount > 0),
  category expense_category NOT NULL,
  payment_method payment_method NOT NULL,
  section_id UUID REFERENCES public.sections(id),
  description TEXT NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  bill_url TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.expense_transactions ENABLE ROW LEVEL SECURITY;

-- Create bank accounts table
CREATE TABLE public.bank_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  account_number TEXT NOT NULL,
  bank_name TEXT NOT NULL,
  branch TEXT,
  balance DECIMAL(15, 2) DEFAULT 0,
  section_id UUID REFERENCES public.sections(id),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.bank_accounts ENABLE ROW LEVEL SECURITY;

-- Create cash accounts table
CREATE TABLE public.cash_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  balance DECIMAL(15, 2) DEFAULT 0,
  section_id UUID REFERENCES public.sections(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.cash_accounts ENABLE ROW LEVEL SECURITY;

-- Create loans table
CREATE TABLE public.loans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL CHECK (type IN ('given', 'taken')),
  person_name TEXT NOT NULL,
  person_contact TEXT,
  amount DECIMAL(15, 2) NOT NULL CHECK (amount > 0),
  issue_date DATE NOT NULL,
  return_date DATE,
  expected_return_date DATE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'partial', 'completed')),
  notes TEXT,
  section_id UUID REFERENCES public.sections(id),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.loans ENABLE ROW LEVEL SECURITY;

-- Create stock items table
CREATE TABLE public.stock_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('kitchen', 'books', 'stationery', 'clothes', 'bedding', 'other')),
  quantity INTEGER NOT NULL DEFAULT 0,
  unit TEXT NOT NULL,
  price_per_unit DECIMAL(10, 2),
  min_quantity INTEGER DEFAULT 0,
  expiry_date DATE,
  section_id UUID REFERENCES public.sections(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.stock_items ENABLE ROW LEVEL SECURITY;

-- Create stock usage table
CREATE TABLE public.stock_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stock_item_id UUID REFERENCES public.stock_items(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL,
  usage_date DATE NOT NULL DEFAULT CURRENT_DATE,
  purpose TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.stock_usage ENABLE ROW LEVEL SECURITY;

-- Create financial year settings table
CREATE TABLE public.financial_year_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  start_month INTEGER NOT NULL CHECK (start_month BETWEEN 1 AND 12),
  start_day INTEGER NOT NULL CHECK (start_day BETWEEN 1 AND 31),
  current_year INTEGER NOT NULL,
  section_id UUID REFERENCES public.sections(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE (section_id)
);

ALTER TABLE public.financial_year_settings ENABLE ROW LEVEL SECURITY;

-- Create trigger function for updating timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at columns
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_donors_updated_at BEFORE UPDATE ON public.donors
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_income_updated_at BEFORE UPDATE ON public.income_transactions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_expense_updated_at BEFORE UPDATE ON public.expense_transactions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_bank_accounts_updated_at BEFORE UPDATE ON public.bank_accounts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_cash_accounts_updated_at BEFORE UPDATE ON public.cash_accounts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_loans_updated_at BEFORE UPDATE ON public.loans
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_stock_items_updated_at BEFORE UPDATE ON public.stock_items
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_financial_year_updated_at BEFORE UPDATE ON public.financial_year_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create profile trigger function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, phone)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'phone', '')
  );
  RETURN NEW;
END;
$$;

-- Trigger to create profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- RLS Policies for user_roles
CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles"
  ON public.user_roles FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for profiles
CREATE POLICY "Users can view all profiles"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- RLS Policies for sections
CREATE POLICY "Everyone can view sections"
  ON public.sections FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage sections"
  ON public.sections FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for donors
CREATE POLICY "Authenticated users can view donors"
  ON public.donors FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admin and accountant can manage donors"
  ON public.donors FOR ALL
  USING (
    public.has_role(auth.uid(), 'admin') OR
    public.has_role(auth.uid(), 'accountant')
  );

-- RLS Policies for income_transactions
CREATE POLICY "Authenticated users can view income"
  ON public.income_transactions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admin and accountant can manage income"
  ON public.income_transactions FOR INSERT
  WITH CHECK (
    public.has_role(auth.uid(), 'admin') OR
    public.has_role(auth.uid(), 'accountant')
  );

CREATE POLICY "Admin and accountant can update income"
  ON public.income_transactions FOR UPDATE
  USING (
    public.has_role(auth.uid(), 'admin') OR
    public.has_role(auth.uid(), 'accountant')
  );

CREATE POLICY "Admin can delete income"
  ON public.income_transactions FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for expense_transactions
CREATE POLICY "Authenticated users can view expenses"
  ON public.expense_transactions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admin and accountant can manage expenses"
  ON public.expense_transactions FOR INSERT
  WITH CHECK (
    public.has_role(auth.uid(), 'admin') OR
    public.has_role(auth.uid(), 'accountant')
  );

CREATE POLICY "Admin and accountant can update expenses"
  ON public.expense_transactions FOR UPDATE
  USING (
    public.has_role(auth.uid(), 'admin') OR
    public.has_role(auth.uid(), 'accountant')
  );

CREATE POLICY "Admin can delete expenses"
  ON public.expense_transactions FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for bank_accounts
CREATE POLICY "Authenticated users can view bank accounts"
  ON public.bank_accounts FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admin can manage bank accounts"
  ON public.bank_accounts FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for cash_accounts
CREATE POLICY "Authenticated users can view cash accounts"
  ON public.cash_accounts FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admin can manage cash accounts"
  ON public.cash_accounts FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for loans
CREATE POLICY "Authenticated users can view loans"
  ON public.loans FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admin and accountant can manage loans"
  ON public.loans FOR ALL
  USING (
    public.has_role(auth.uid(), 'admin') OR
    public.has_role(auth.uid(), 'accountant')
  );

-- RLS Policies for stock_items
CREATE POLICY "Authenticated users can view stock"
  ON public.stock_items FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admin and accountant can manage stock"
  ON public.stock_items FOR ALL
  USING (
    public.has_role(auth.uid(), 'admin') OR
    public.has_role(auth.uid(), 'accountant')
  );

-- RLS Policies for stock_usage
CREATE POLICY "Authenticated users can view stock usage"
  ON public.stock_usage FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admin and accountant can record stock usage"
  ON public.stock_usage FOR INSERT
  WITH CHECK (
    public.has_role(auth.uid(), 'admin') OR
    public.has_role(auth.uid(), 'accountant')
  );

-- RLS Policies for financial_year_settings
CREATE POLICY "Authenticated users can view financial year"
  ON public.financial_year_settings FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admin can manage financial year"
  ON public.financial_year_settings FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Insert default sections
INSERT INTO public.sections (name, type) VALUES
  ('Masjid', 'mosque'),
  ('Madrasa', 'madrasa');

-- Insert default financial year (July to June)
INSERT INTO public.financial_year_settings (start_month, start_day, current_year)
VALUES (7, 1, 2024);