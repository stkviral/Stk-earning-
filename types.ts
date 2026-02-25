
export enum UserTag {
  NORMAL = 'NORMAL',
  PASS = 'MONTHLY_PASS'
}

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  BLOCKED = 'BLOCKED',
  BANNED = 'BANNED',
  SUSPENDED = 'SUSPENDED'
}

export interface Transaction {
  id: string;
  amount: number;
  type: 'EARN' | 'WITHDRAW' | 'ADJUST';
  method: string;
  status: 'PENDING' | 'COMPLETED' | 'REJECTED';
  timestamp: number;
}

export interface PassRequest {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  proofUrl: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  timestamp: number;
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
  dailyRewardClaimed: boolean;
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
  passHistory: any[];
  is2xMiningUnlocked: boolean;
  adsFor2xMining: number;
  passPurchaseTimestamp?: number;
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
  systemNotification: string;
  appVersion: string;
  minVersionRequired: string;
  dailyCapNormal: number;
  dailyBonusReward: number;
  adRewardCoins: number;
  referralReward: number;
  miningDurationNormal: number;
  miningDurationVIP: number;
  miningRewardNormal: number;
  miningRewardVIP: number;
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
}

export interface AppState {
  currentUser: User | null;
  allUsers: User[];
  isLoggedIn: boolean;
  logoUrl: string;
  settings: AppSettings;
  logs: AdminLog[];
  activityLogs: ActivityLog[];
  passRequests: PassRequest[];
}

export const COIN_TO_INR_RATE = 10 / 100;
export const PASS_PRICE_INR = 49;
export const AD_GAP_MS = 30000;
export const MIN_WITHDRAWAL_COINS = 500;
export const ADMIN_EMAIL = 'admin@stk.com';

declare global {
  interface Window {
    google: any;
  }
}
