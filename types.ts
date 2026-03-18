
export enum UserTag {
  NORMAL = 'NORMAL'
}

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  BLOCKED = 'BLOCKED',
  BANNED = 'BANNED',
  SUSPENDED = 'SUSPENDED'
}

export enum AdminRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  SUB_ADMIN = 'SUB_ADMIN'
}

export interface AdminUser {
  email: string;
  role: AdminRole;
  requires2FA: boolean;
}

export interface Transaction {
  id: string;
  userId: string;
  amount: number;
  type: 'SPIN' | 'CHECKIN' | 'WITHDRAWAL' | 'AD' | 'REFERRAL' | 'ADJUST';
  method: string;
  status: 'PENDING' | 'COMPLETED' | 'REJECTED';
  timestamp: number;
  rejectionReason?: string;
  paymentTxId?: string;
}

export interface AdminLog {
  id: string;
  adminId: string;
  action: string;
  targetId: string;
  details: string;
  timestamp: number;
}

export interface ActivityLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  details: string;
  timestamp: number;
}

export interface SuspiciousActivityLog {
  id: string;
  userId: string;
  userName: string;
  reason: string;
  details: string;
  timestamp: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role?: 'user' | 'admin';
  avatar: string;
  coins: number;
  tag: UserTag;
  referralCode: string;
  referredBy?: string;
  dailyEarned: number;
  lastResetTimestamp: number;
  createdAt?: number;
  adsWatchedToday: number;
  lastAdTimestamp: number;
  dailyRewardClaimed: boolean;
  streakDays: number;
  lastCheckInTimestamp: number;
  spinsToday: number;
  lastSpinTimestamp: number;
  extraSpinWatchedToday: boolean;
  scratchesToday: number;
  lastScratchTimestamp: number;
  extraScratchWatchedToday: boolean;
  status: UserStatus;
  walletFrozen: boolean;
  adsBlocked: boolean;
  statusReason?: string;
  statusExpiresAt?: number;
  upiId?: string;
  phone?: string;
  pushEnabled?: boolean;
  dob?: string;
  gender?: string;
  transactions: Transaction[];
  referralHistory: any[];
  deviceId: string;
  lastIp: string;
  riskScore: number;
  earningVelocity: number;
  lastActiveAt: number;
  lastWithdrawalTimestamp?: number;
  hasCompletedOnboarding?: boolean;
  deviceLimitExempt?: boolean;
  deviceLimitBlocked?: boolean;
  customDeviceLimit?: number;
  rewardLimitExempt?: boolean;
  withdrawalFlagExempt?: boolean;
  fraudDetectionExempt?: boolean;
  device_fingerprint?: string;
  ip_address?: string;
  is_suspicious?: boolean;
  fraud_score?: number;
  last_reward_time?: number;
  is_banned?: boolean;
}

export interface AppSettings {
  maintenanceMode: boolean;
  spinEnabled: boolean;
  scratchEnabled: boolean;
  videosEnabled: boolean;
  referralsEnabled: boolean;
  adsEnabled: boolean;
  withdrawalsEnabled: boolean;
  systemNotification: string;
  appVersion: string;
  minVersionRequired: string;
  dailyCapNormal: number;
  dailyBonusReward: number;
  adRewardCoins: number;
  referralReward: number;
  spinRewards: number[];
  maxDailySpinsNormal: number;
  spinCooldownSeconds: number;
  spinAdRequired: boolean;
  scratchRewards: number[];
  maxDailyScratchesNormal: number;
  scratchCooldownSeconds: number;
  scratchAdRequired: boolean;
  scratchProbabilities: Record<string, number>;
  withdrawalFeeNormal: number;
  minWithdrawalCoins: number;
  maxWithdrawalCoins: number;
  manualWithdrawalApproval: boolean;
  withdrawalCooldownHours: number;
  maxDailyAds: number;
  adCooldownSeconds: number;
  videoAdRequired: boolean;
  dailyWithdrawalLimit: number;
  spinProbabilities: Record<string, number>;
  emergencyRewardReduction: number;
  globalRewardMultiplier: number;
  deviceLimitEnabled: boolean;
  maxAccountsPerDevice: number;
  exemptDevices: string[];
  dailyRewardBudget: number;
  autoRewardBalancing: boolean;
  rewardDelayMs: number;
  autoFlagWithdrawals: boolean;
  dailyBonusRewards: number[];
  dailyBonusResetDays: number;
}

export interface AppState {
  currentUser: User | null;
  allUsers: User[];
  isLoggedIn: boolean;
  logoUrl: string;
  settings: AppSettings;
  logs: AdminLog[];
  activityLogs: ActivityLog[];
  suspiciousActivityLogs: SuspiciousActivityLog[];
  adminUsers: AdminUser[];
  deviceClaims: Record<string, number>;
}

export const COIN_TO_INR_RATE = 0.01;
export const AD_GAP_MS = 30000;
export const MIN_WITHDRAWAL_COINS = 1000;
export const ADMIN_EMAIL = 'admin@stk.com';

declare global {
  interface Window {
    google: any;
  }
}
