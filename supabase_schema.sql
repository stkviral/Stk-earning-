-- Create users table
CREATE TABLE IF NOT EXISTS public.users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT NOT NULL,
  name TEXT,
  role TEXT DEFAULT 'user',
  avatar TEXT,
  coins INTEGER DEFAULT 0,
  tag TEXT DEFAULT 'NORMAL',
  "referralCode" TEXT,
  "referredBy" TEXT,
  "dailyEarned" INTEGER DEFAULT 0,
  "lastResetTimestamp" BIGINT,
  "adsWatchedToday" INTEGER DEFAULT 0,
  "lastAdTimestamp" BIGINT,
  "dailyRewardClaimed" BOOLEAN DEFAULT false,
  "streakDays" INTEGER DEFAULT 0,
  "lastCheckInTimestamp" BIGINT,
  "spinsToday" INTEGER DEFAULT 0,
  "lastSpinTimestamp" BIGINT,
  "extraSpinWatchedToday" BOOLEAN DEFAULT false,
  "scratchesToday" INTEGER DEFAULT 0,
  "lastScratchTimestamp" BIGINT,
  "extraScratchWatchedToday" BOOLEAN DEFAULT false,
  "adsBlocked" BOOLEAN DEFAULT false,
  "riskScore" INTEGER DEFAULT 0,
  "earningVelocity" INTEGER DEFAULT 0,
  "lastWithdrawalTimestamp" BIGINT,
  transactions JSONB DEFAULT '[]'::jsonb,
  "referralHistory" JSONB DEFAULT '[]'::jsonb,
  "deviceId" TEXT,
  "deviceLimitBlocked" BOOLEAN DEFAULT false,
  "deviceLimitExempt" BOOLEAN DEFAULT false,
  "customDeviceLimit" INTEGER,
  status TEXT DEFAULT 'ACTIVE',
  "statusReason" TEXT,
  "walletFrozen" BOOLEAN DEFAULT false,
  "withdrawalFlagExempt" BOOLEAN DEFAULT false,
  "rewardLimitExempt" BOOLEAN DEFAULT false,
  "fraudDetectionExempt" BOOLEAN DEFAULT false,
  "lastActiveAt" BIGINT,
  "lastIp" TEXT,
  "upiId" TEXT,
  "device_fingerprint" TEXT,
  "ip_address" TEXT,
  "is_suspicious" BOOLEAN DEFAULT false,
  "fraud_score" INTEGER DEFAULT 0,
  "last_reward_time" BIGINT DEFAULT 0,
  "is_banned" BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create ip_logs table
CREATE TABLE IF NOT EXISTS public.ip_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) NOT NULL,
  ip_address TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create reward_logs table
CREATE TABLE IF NOT EXISTS public.reward_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) NOT NULL,
  action_type TEXT NOT NULL,
  reward_amount INTEGER NOT NULL,
  device_fingerprint TEXT,
  ip_address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create withdrawals table
CREATE TABLE IF NOT EXISTS public.withdrawals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) NOT NULL,
  amount INTEGER NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create devices table
CREATE TABLE IF NOT EXISTS public.devices (
  device_id TEXT PRIMARY KEY,
  account_count INTEGER DEFAULT 0,
  is_whitelisted BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Set up Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.withdrawals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ip_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reward_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for users table
CREATE POLICY "Users can view their own profile" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins can view all profiles" ON public.users FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admins can update all profiles" ON public.users FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admins can insert profiles" ON public.users FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);
-- Allow inserting own profile during signup
CREATE POLICY "Users can insert their own profile" ON public.users FOR INSERT WITH CHECK (auth.uid() = id);

-- Create policies for withdrawals table
CREATE POLICY "Users can view their own withdrawals" ON public.withdrawals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own withdrawals" ON public.withdrawals FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can view all withdrawals" ON public.withdrawals FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admins can update all withdrawals" ON public.withdrawals FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);

-- Create policies for devices table
CREATE POLICY "Anyone can view devices" ON public.devices FOR SELECT USING (true);
CREATE POLICY "Anyone can insert devices" ON public.devices FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update devices" ON public.devices FOR UPDATE USING (true);

-- Create policies for ip_logs table
CREATE POLICY "Users can view their own ip_logs" ON public.ip_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own ip_logs" ON public.ip_logs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can view all ip_logs" ON public.ip_logs FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);

-- Create policies for reward_logs table
CREATE POLICY "Users can view their own reward_logs" ON public.reward_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own reward_logs" ON public.reward_logs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can view all reward_logs" ON public.reward_logs FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);
