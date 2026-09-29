import { Platform } from 'react-native';
import Purchases, {
  PURCHASES_ERROR_CODE,
  type CustomerInfo,
  type PurchasesPackage,
} from 'react-native-purchases';

import { env } from '@/lib/env';

/** The RevenueCat entitlement that unlocks Retainer (spec §11). */
export const ENTITLEMENT = 'retainer';

export type PurchaseResult =
  | { ok: true; active: boolean }
  | { ok: false; cancelled: true }
  | { ok: false; cancelled: false; message: string };

function apiKey(): string {
  if (Platform.OS === 'ios') return env.revenueCatIosKey;
  if (Platform.OS === 'android') return env.revenueCatAndroidKey;
  return '';
}

/** False in builds without a RevenueCat key for this platform (and always on web). */
export function purchasesConfigured(): boolean {
  return !!apiKey();
}

let configuredFor: string | null = null;

/** Configures RevenueCat for this user. RevenueCat's app user ID is the Supabase user ID. */
export async function configurePurchases(userId: string): Promise<void> {
  if (!purchasesConfigured()) return;
  if (configuredFor === null) {
    Purchases.configure({ apiKey: apiKey(), appUserID: userId });
  } else if (configuredFor !== userId) {
    await Purchases.logIn(userId);
  }
  configuredFor = userId;
}

export function isEntitled(info: CustomerInfo): boolean {
  return ENTITLEMENT in info.entitlements.active;
}

export async function hasActiveEntitlement(): Promise<boolean> {
  if (!purchasesConfigured() || configuredFor === null) return false;
  return isEntitled(await Purchases.getCustomerInfo());
}

/** The monthly package from the current offering, or null if the store returned none. */
export async function getMonthlyPackage(): Promise<PurchasesPackage | null> {
  if (!purchasesConfigured()) return null;
  const offerings = await Purchases.getOfferings();
  return offerings.current?.monthly ?? offerings.current?.availablePackages[0] ?? null;
}

export async function purchase(pkg: PurchasesPackage): Promise<PurchaseResult> {
  try {
    const { customerInfo } = await Purchases.purchasePackage(pkg);
    return { ok: true, active: isEntitled(customerInfo) };
  } catch (e) {
    const code = (e as { code?: string }).code;
    if (code === PURCHASES_ERROR_CODE.PURCHASE_CANCELLED_ERROR)
      return { ok: false, cancelled: true };
    return { ok: false, cancelled: false, message: 'The purchase did not complete.' };
  }
}

export async function restore(): Promise<PurchaseResult> {
  try {
    const info = await Purchases.restorePurchases();
    return { ok: true, active: isEntitled(info) };
  } catch {
    return { ok: false, cancelled: false, message: 'Nothing could be restored.' };
  }
}

export async function signOutPurchases(): Promise<void> {
  if (configuredFor === null) return;
  await Purchases.logOut().catch(() => undefined);
  configuredFor = null;
}
