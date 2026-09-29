import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';

import { useAuth } from '@/features/auth/auth-provider';
import {
  configurePurchases,
  hasActiveEntitlement,
  purchasesConfigured,
  signOutPurchases,
} from '@/features/billing/purchases';

type BillingState = {
  /** False until the entitlement check for the current user has finished. */
  ready: boolean;
  entitled: boolean;
  /** Development builds without RevenueCat keys can skip the paywall (see subscribe screen). */
  setDevEntitled: () => void;
  refresh: () => Promise<boolean>;
};

const BillingContext = createContext<BillingState | null>(null);

export function BillingProvider({ children }: { children: ReactNode }) {
  const { session } = useAuth();
  const userId = session?.user.id ?? null;
  // The result of the last entitlement check, and which user it was for. A check for a previous
  // user (or none yet) means we are not ready.
  const [checked, setChecked] = useState<{ userId: string | null; active: boolean } | null>(null);
  const [devUserId, setDevUserId] = useState<string | null>(null);

  const ready = checked !== null && checked.userId === userId;
  const entitled = (ready && checked.active) || (userId !== null && devUserId === userId);

  const refresh = useCallback(async () => {
    if (!userId) return false;
    const active = await hasActiveEntitlement().catch(() => false);
    setChecked({ userId, active });
    return active;
  }, [userId]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      let active = false;
      if (!userId) {
        await signOutPurchases();
      } else {
        await configurePurchases(userId).catch(() => undefined);
        active = await hasActiveEntitlement().catch(() => false);
      }
      if (!cancelled) setChecked({ userId, active });
    })();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const setDevEntitled = useCallback(() => {
    if (__DEV__ && !purchasesConfigured()) setDevUserId(userId);
  }, [userId]);

  return (
    <BillingContext.Provider value={{ ready, entitled, setDevEntitled, refresh }}>
      {children}
    </BillingContext.Provider>
  );
}

export function useBilling(): BillingState {
  const ctx = useContext(BillingContext);
  if (!ctx) throw new Error('useBilling must be used inside BillingProvider');
  return ctx;
}
