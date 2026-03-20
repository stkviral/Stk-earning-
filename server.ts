import express from "express";
import cors from "cors";
import { createServer as createViteServer } from "vite";
import path from "path";
import { createClient } from "@supabase/supabase-js";
import fs from "fs";

// Initialize Supabase client
// We need to read the config from supabase.ts or environment variables
// But since we are in the same project, we can just use the env vars
import dotenv from "dotenv";
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase environment variables");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkAndResetDailyStats(user: any) {
  const now = Date.now();
  const lastReset = user.lastResetTimestamp || 0;
  
  // If more than 24 hours have passed since last reset
  if (now - lastReset > 24 * 60 * 60 * 1000) {
    const newStreak = user.dailyRewardClaimed ? user.streakDays : 0;
    
    const updates = {
      dailyEarned: 0,
      adsWatchedToday: 0,
      spinsToday: 0,
      extraSpinWatchedToday: false,
      scratchesToday: 0,
      extraScratchWatchedToday: false,
      dailyRewardClaimed: false,
      lastResetTimestamp: now,
      streakDays: newStreak
    };
    
    await supabase.from('users').update(updates).eq('id', user.id);
    return { ...user, ...updates };
  }
  return user;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // API routes FIRST
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Admin API
  app.get("/api/leaderboard", async (req, res) => {
  try {
    const { data: users, error } = await supabase
      .from("users")
      .select('id, name, avatar, coins, "dailyEarned"')
      .order("coins", { ascending: false })
      .limit(50);
      
    if (error) throw error;
    return res.json({ users });
  } catch (error) {
    console.error("Leaderboard error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/api/admin/view-users", async (req, res) => {
  try {
    const adminId = req.query.adminId as string;
    if (!adminId) return res.status(401).json({ error: "Unauthorized" });

    const { data: adminUser } = await supabase.from("users").select("role").eq("id", adminId).single();
    if (!adminUser || adminUser.role !== "admin") {
      return res.status(403).json({ error: "Unauthorized: Admin access required" });
    }

    const { data: users, error } = await supabase.from("users").select("*");
    if (error) throw error;

    return res.json({ users });
  } catch (error) {
    console.error("Admin view-users error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/api/admin/view-withdrawal-requests", async (req, res) => {
  try {
    const adminId = req.query.adminId as string;
    if (!adminId) return res.status(401).json({ error: "Unauthorized" });

    const { data: adminUser } = await supabase.from("users").select("role").eq("id", adminId).single();
    if (!adminUser || adminUser.role !== "admin") {
      return res.status(403).json({ error: "Unauthorized: Admin access required" });
    }

    const { data: withdrawals, error } = await supabase.from("withdrawals").select("*").order("created_at", { ascending: false });
    if (error) throw error;

    return res.json({ withdrawals });
  } catch (error) {
    console.error("Admin view-withdrawals error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/api/admin/action", async (req, res) => {
    try {
      const { adminId, action, targetUserId, payload } = req.body;
      if (!adminId) return res.status(400).json({ error: "Admin ID required" });

      const { data: adminUser } = await supabase.from("users").select("role").eq("id", adminId).single();
      if (!adminUser || adminUser.role !== "admin") {
        return res.status(403).json({ error: "Unauthorized: Admin access required" });
      }

      // Log the admin action
      try {
        await supabase.from("admin_logs").insert([{
          admin_id: adminId,
          action: action,
          target_user_id: targetUserId || null,
          payload: payload,
          created_at: new Date().toISOString()
        }]);
      } catch (logError) {
        console.error("Failed to log admin action:", logError);
      }

      if (action === "modifyCoins") {
        const { amount, reason } = payload;
        const { data: user } = await supabase.from("users").select("coins, transactions").eq("id", targetUserId).single();
        if (!user) return res.status(404).json({ error: "User not found" });
        const newCoins = (user.coins || 0) + amount;
        
        const tx = {
          id: 'ADJ-' + Math.random().toString(36).substring(2, 9),
          userId: targetUserId,
          amount,
          type: 'ADJUST',
          method: reason,
          status: 'COMPLETED',
          timestamp: Date.now()
        };
        const newTransactions = [tx, ...(user.transactions || [])];
        
        await supabase.from("users").update({ coins: newCoins, transactions: newTransactions }).eq("id", targetUserId);
        return res.json({ success: true, newCoins, newTransactions });
      }

      if (action === "setUserStatus") {
        const { status, reason } = payload;
        await supabase.from("users").update({ status, is_banned: status === 'BANNED' }).eq("id", targetUserId);
        return res.json({ success: true });
      }

      if (action === "updateUserSettings") {
        const { updates } = payload;
        await supabase.from("users").update(updates).eq("id", targetUserId);
        return res.json({ success: true });
      }

      if (action === "resetDeviceLimits") {
         await supabase.from("users").update({ deviceLimitExempt: true }).eq("id", targetUserId);
         return res.json({ success: true });
      }

      if (action === "resetCooldowns") {
         const { type } = payload;
         const updates: any = {};
         if (type === 'SPIN' || type === 'ALL') updates.spinCooldownEnd = 0;
         if (type === 'SCRATCH' || type === 'ALL') updates.scratchCooldownEnd = 0;
         await supabase.from("users").update(updates).eq("id", targetUserId);
         return res.json({ success: true });
      }

      if (action === "resetStreak") {
         await supabase.from("users").update({ streakDays: 0, dailyRewardClaimed: false }).eq("id", targetUserId);
         return res.json({ success: true });
      }

      if (action === "approveWithdrawal") {
         const { txId, paymentTxId } = payload;
         const { data: user } = await supabase.from("users").select("coins, transactions").eq("id", targetUserId).single();
         if (!user) return res.status(404).json({ error: "User not found" });

         const tx = (user.transactions || []).find((t: any) => t.id === txId);
         if (!tx) return res.status(404).json({ error: "Transaction not found" });

         const feeMatch = tx.method.match(/Fee: (\d+)/);
         const feeAmount = feeMatch ? parseInt(feeMatch[1]) : 0;
         const deductAmount = tx.amount + feeAmount;

         if (user.coins < deductAmount) {
           return res.status(400).json({ error: "User does not have enough coins" });
         }

         const newCoins = user.coins - deductAmount;
         const newTransactions = (user.transactions || []).map((t: any) => t.id === txId ? { ...t, status: 'COMPLETED', paymentTxId } : t);

         await supabase.from("users").update({ coins: newCoins, transactions: newTransactions }).eq("id", targetUserId);
         await supabase.from("withdrawals").update({ status: 'completed' }).eq("id", txId).eq("user_id", targetUserId);
         return res.json({ success: true, newCoins, newTransactions });
      }

      if (action === "rejectWithdrawal") {
         const { txId, rejectionReason } = payload;
         const { data: user } = await supabase.from("users").select("transactions").eq("id", targetUserId).single();
         if (!user) return res.status(404).json({ error: "User not found" });

         const newTransactions = (user.transactions || []).map((t: any) => t.id === txId ? { ...t, status: 'REJECTED', rejectionReason } : t);

         await supabase.from("users").update({ transactions: newTransactions }).eq("id", targetUserId);
         await supabase.from("withdrawals").update({ status: 'rejected' }).eq("id", txId).eq("user_id", targetUserId);
         return res.json({ success: true, newTransactions });
      }

      if (action === "clearDeviceLimitForDevice") {
         const { deviceId } = payload;
         await supabase.from("devices").update({ is_whitelisted: true }).eq("device_id", deviceId);
         return res.json({ success: true });
      }

      if (action === "removeDeviceExemption") {
         const { deviceId } = payload;
         await supabase.from("devices").update({ is_whitelisted: false }).eq("device_id", deviceId);
         return res.json({ success: true });
      }

      if (action === "resetDeviceRestrictions") {
         await supabase.from("devices").update({ is_whitelisted: false }).neq("device_id", "");
         await supabase.from("users").update({ deviceLimitExempt: false, deviceLimitBlocked: false, customDeviceLimit: null }).neq("id", "");
         return res.json({ success: true });
      }

      if (action === "unbindAllDevices") {
         await supabase.from("devices").update({ account_count: 0 }).neq("device_id", "");
         await supabase.from("users").update({ deviceId: null, deviceLimitBlocked: false, deviceLimitExempt: false, customDeviceLimit: null }).neq("id", "");
         return res.json({ success: true });
      }

      return res.status(400).json({ error: "Unknown action" });
    } catch (error) {
      console.error("Admin API error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Reward Engine API
  app.post("/api/rewards/spin", async (req, res) => {
    try {
      const { userId } = req.body;
      if (!userId) {
        return res.status(400).json({ error: "User ID is required" });
      }

      // 1. Fetch user and settings
      let { data: user, error: userError } = await supabase
        .from("users")
        .select("*")
        .eq("id", userId)
        .single();

      if (userError || !user) {
        return res.status(404).json({ error: "User not found" });
      }

      user = await checkAndResetDailyStats(user);

      // Check if banned or suspicious
      if (user.is_banned || user.status === 'BANNED' || user.status === 'SUSPENDED') {
        return res.status(403).json({ error: "Account suspended or banned" });
      }
      if (user.is_suspicious) {
        return res.status(403).json({ error: "Suspicious activity detected. Rewards blocked." });
      }

      // Fraud Prevention: Auto-clicker detection
      const now = Date.now();
      const lastRewardTime = user.last_reward_time || 0;
      if (now - lastRewardTime < 500) {
        await supabase.from("users").update({ is_suspicious: true, status: 'SUSPENDED' }).eq("id", userId);
        return res.status(403).json({ error: "Suspicious activity detected. Account suspended." });
      }

      // Check daily cap
      const dailyCap = 200; // Example cap
      if ((user.dailyEarned || 0) >= dailyCap) {
        return res.status(403).json({ error: "Daily earning limit reached. Come back tomorrow." });
      }

      // Check cooldown (5 seconds)
      const lastSpin = user.lastSpinTimestamp || 0;
      if (now - lastSpin < 5000) {
        return res.status(429).json({ error: "Spin Cooldown: Please wait 5 seconds." });
      }

      // Generate reward based on probability
      // 1 coin → 45%
      // 2 coins → 25%
      // 3 coins → 10%
      // 4 coins → 5%
      // 0 coins → 15%
      const rand = Math.random() * 100;
      let reward = 0;
      if (rand < 45) reward = 1;
      else if (rand < 70) reward = 2;
      else if (rand < 80) reward = 3;
      else if (rand < 85) reward = 4;
      else reward = 0;

      // Update user
      const newCoins = (user.coins || 0) + reward;
      const newDailyEarned = (user.dailyEarned || 0) + reward;
      const newSpinsToday = (user.spinsToday || 0) + 1;

      const { error: updateError } = await supabase
        .from("users")
        .update({
          coins: newCoins,
          dailyEarned: newDailyEarned,
          lastSpinTimestamp: now,
          last_reward_time: now,
          spinsToday: newSpinsToday
        })
        .eq("id", userId);

      if (updateError) {
        console.error("Failed to update user:", updateError);
        return res.status(500).json({ error: "Failed to process reward" });
      }

      // Log reward
      await supabase.from("reward_logs").insert([{
        user_id: userId,
        action_type: "SPIN",
        reward_amount: reward,
        device_fingerprint: user.device_fingerprint,
        ip_address: user.ip_address,
        created_at: new Date().toISOString()
      }]);

      res.json({ reward, newCoins, newDailyEarned });
    } catch (error) {
      console.error("Spin API error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/rewards/scratch", async (req, res) => {
    try {
      const { userId } = req.body;
      if (!userId) {
        return res.status(400).json({ error: "User ID is required" });
      }

      let { data: user, error: userError } = await supabase
        .from("users")
        .select("*")
        .eq("id", userId)
        .single();

      if (userError || !user) {
        return res.status(404).json({ error: "User not found" });
      }

      user = await checkAndResetDailyStats(user);

      if (user.is_banned || user.status === 'BANNED' || user.status === 'SUSPENDED') {
        return res.status(403).json({ error: "Account suspended or banned" });
      }
      if (user.is_suspicious) {
        return res.status(403).json({ error: "Suspicious activity detected. Rewards blocked." });
      }

      // Fraud Prevention: Auto-clicker detection
      const now = Date.now();
      const lastRewardTime = user.last_reward_time || 0;
      if (now - lastRewardTime < 500) {
        await supabase.from("users").update({ is_suspicious: true, status: 'SUSPENDED' }).eq("id", userId);
        return res.status(403).json({ error: "Suspicious activity detected. Account suspended." });
      }

      const dailyCap = 200;
      if ((user.dailyEarned || 0) >= dailyCap) {
        return res.status(403).json({ error: "Daily earning limit reached. Come back tomorrow." });
      }

      const lastScratch = user.lastScratchTimestamp || 0;
      if (now - lastScratch < 5000) {
        return res.status(429).json({ error: "Scratch Cooldown: Please wait 5 seconds." });
      }

      const rand = Math.random() * 100;
      let reward = 0;
      if (rand < 45) reward = 1;
      else if (rand < 70) reward = 2;
      else if (rand < 80) reward = 3;
      else if (rand < 85) reward = 4;
      else reward = 0;

      const newCoins = (user.coins || 0) + reward;
      const newDailyEarned = (user.dailyEarned || 0) + reward;
      const newScratchesToday = (user.scratchesToday || 0) + 1;

      const { error: updateError } = await supabase
        .from("users")
        .update({
          coins: newCoins,
          dailyEarned: newDailyEarned,
          lastScratchTimestamp: now,
          last_reward_time: now,
          scratchesToday: newScratchesToday
        })
        .eq("id", userId);

      if (updateError) {
        return res.status(500).json({ error: "Failed to process reward" });
      }

      await supabase.from("reward_logs").insert([{
        user_id: userId,
        action_type: "SCRATCH",
        reward_amount: reward,
        device_fingerprint: user.device_fingerprint,
        ip_address: user.ip_address,
        created_at: new Date().toISOString()
      }]);

      res.json({ reward, newCoins, newDailyEarned });
    } catch (error) {
      console.error("Scratch API error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/rewards/ad", async (req, res) => {
    try {
      const { userId } = req.body;
      if (!userId) {
        return res.status(400).json({ error: "User ID is required" });
      }

      let { data: user, error: userError } = await supabase
        .from("users")
        .select("*")
        .eq("id", userId)
        .single();

      if (userError || !user) {
        return res.status(404).json({ error: "User not found" });
      }

      user = await checkAndResetDailyStats(user);

      if (user.is_banned || user.status === 'BANNED' || user.status === 'SUSPENDED') {
        return res.status(403).json({ error: "Account suspended or banned" });
      }
      if (user.is_suspicious) {
        return res.status(403).json({ error: "Suspicious activity detected. Rewards blocked." });
      }

      // Fraud Prevention: Auto-clicker detection
      const now = Date.now();
      const lastRewardTime = user.last_reward_time || 0;
      if (now - lastRewardTime < 500) {
        await supabase.from("users").update({ is_suspicious: true, status: 'SUSPENDED' }).eq("id", userId);
        return res.status(403).json({ error: "Suspicious activity detected. Account suspended." });
      }

      const dailyCap = 200;
      if ((user.dailyEarned || 0) >= dailyCap) {
        return res.status(403).json({ error: "Daily earning limit reached. Come back tomorrow." });
      }

      const maxDailyAds = 20;
      if ((user.adsWatchedToday || 0) >= maxDailyAds) {
        return res.status(403).json({ error: "Daily ad limit reached." });
      }

      const lastAd = user.lastAdTimestamp || 0;
      if (now - lastAd < 10000) {
        return res.status(429).json({ error: "Ad Cooldown: Please wait 10 seconds." });
      }

      // Calculate reward
      const baseReward = 1; // Default adRewardCoins
      const streakDays = user.streakDays || 0;
      const multiplier = streakDays >= 7 ? 2.0 : 1.0 + streakDays * 0.1;
      const reward = Math.round(baseReward * multiplier);

      const newCoins = (user.coins || 0) + reward;
      const newDailyEarned = (user.dailyEarned || 0) + reward;
      const newAdsWatchedToday = (user.adsWatchedToday || 0) + 1;

      const { error: updateError } = await supabase
        .from("users")
        .update({
          coins: newCoins,
          dailyEarned: newDailyEarned,
          lastAdTimestamp: now,
          last_reward_time: now,
          adsWatchedToday: newAdsWatchedToday
        })
        .eq("id", userId);

      if (updateError) {
        return res.status(500).json({ error: "Failed to process reward" });
      }

      await supabase.from("reward_logs").insert([{
        user_id: userId,
        action_type: "AD_REWARD",
        reward_amount: reward,
        device_fingerprint: user.device_fingerprint,
        ip_address: user.ip_address,
        created_at: new Date().toISOString()
      }]);

      res.json({ reward, newCoins, newDailyEarned, newAdsWatchedToday });
    } catch (error) {
      console.error("Ad Reward API error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/rewards/checkin", async (req, res) => {
    try {
      const { userId } = req.body;
      if (!userId) {
        return res.status(400).json({ error: "User ID is required" });
      }

      let { data: user, error: userError } = await supabase
        .from("users")
        .select("*")
        .eq("id", userId)
        .single();

      if (userError || !user) {
        return res.status(404).json({ error: "User not found" });
      }

      user = await checkAndResetDailyStats(user);

      if (user.is_banned || user.status === 'BANNED' || user.status === 'SUSPENDED') {
        return res.status(403).json({ error: "Account suspended or banned" });
      }
      if (user.is_suspicious) {
        return res.status(403).json({ error: "Suspicious activity detected. Rewards blocked." });
      }

      // Fraud Prevention: Auto-clicker detection
      const now = Date.now();
      const lastRewardTime = user.last_reward_time || 0;
      if (now - lastRewardTime < 500) {
        await supabase.from("users").update({ is_suspicious: true, status: 'SUSPENDED' }).eq("id", userId);
        return res.status(403).json({ error: "Suspicious activity detected. Account suspended." });
      }

      if (user.dailyRewardClaimed) {
        return res.status(403).json({ error: "Daily reward already claimed today." });
      }

      const currentStreak = user.streakDays || 0;
      const currentDay = currentStreak + 1;
      
      const baseReward = 5;
      let reward = baseReward;
      if (currentDay === 7) {
        reward += 25; // Extra weekly bonus
      }

      const newCoins = (user.coins || 0) + reward;
      const newDailyEarned = (user.dailyEarned || 0) + reward;

      const { error: updateError } = await supabase
        .from("users")
        .update({
          coins: newCoins,
          dailyEarned: newDailyEarned,
          dailyRewardClaimed: true,
          streakDays: currentDay,
          last_reward_time: Date.now()
        })
        .eq("id", userId);

      if (updateError) {
        return res.status(500).json({ error: "Failed to process reward" });
      }

      await supabase.from("reward_logs").insert([{
        user_id: userId,
        action_type: "DAILY_BONUS",
        reward_amount: reward,
        device_fingerprint: user.device_fingerprint,
        ip_address: user.ip_address,
        created_at: new Date().toISOString()
      }]);

      res.json({ reward, newCoins, newDailyEarned, currentDay });
    } catch (error) {
      console.error("Daily Check-in API error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
