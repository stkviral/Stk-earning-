
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
  amount: number;
  type: 'EARN' | 'WITHDRAW' | 'ADJUST';
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

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  coins: number;
  tag: UserTag;
  referralCode: string;
  referredBy?: string;
  dailyEarned: number;
  lastResetTimestamp: number;
  adsWatchedToday: number;
  lastAdTimestamp: number;
  miningClaimed: boolean;
  miningStartedAt?: number;
  miningLastClaimedAt?: number;
  miningCyclesToday: number;
  dailyRewardClaimed: boolean;
  streakDays: number;
  spinsToday: number;
  lastSpinTimestamp: number;
  extraSpinWatchedToday: boolean;
  status: UserStatus;
  walletFrozen: boolean;
  adsBlocked: boolean;
  statusReason?: string;
  statusExpiresAt?: number;
  upiId?: string;
  transactions: Transaction[];
  referralHistory: any[];
  is2xMiningUnlocked: boolean;
  adsFor2xMining: number;
  deviceId: string;
  lastIp: string;
  riskScore: number;
  earningVelocity: number;
  lastActiveAt: number;
  lastWithdrawalTimestamp?: number;
}

export interface AppSettings {
  maintenanceMode: boolean;
  miningEnabled: boolean;
  spinEnabled: boolean;
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
  miningDurationNormal: number;
  miningRewardNormal: number;
  miningCyclesPerDayNormal: number;
  miningBoostAdsRequired: number;
  spinRewards: number[];
  maxDailySpinsNormal: number;
  spinCooldownMinutes: number;
  withdrawalFeeNormal: number;
  minWithdrawalCoins: number;
  withdrawalCooldownHours: number;
  paymentQrUrl: string;
  adminUpiId: string;
  maxDailyAds: number;
  dailyWithdrawalLimit: number;
  spinProbabilities: Record<string, number>;
  emergencyRewardReduction: number;
  globalRewardMultiplier: number;
}

export interface AppState {
  currentUser: User | null;
  allUsers: User[];
  isLoggedIn: boolean;
  logoUrl: string;
  settings: AppSettings;
  logs: AdminLog[];
  activityLogs: ActivityLog[];
  adminUsers: AdminUser[];
}

export const COIN_TO_INR_RATE = 0.01;
export const AD_GAP_MS = 30000;
export const MIN_WITHDRAWAL_COINS = 15000;
export const ADMIN_EMAIL = 'admin@stk.com';

declare global {
  interface Window {
    google: any;
  }
}
