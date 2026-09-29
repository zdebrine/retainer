export type FlowState = {
  signedIn: boolean;
  entitled: boolean;
  onboarded: boolean;
};

export type Step = '/' | '/subscribe' | '/connect' | '/home';

/**
 * Where a user belongs, given what we know about them. Onboarding order (spec §1):
 * welcome → why → price → sign in → subscribe → connect → AI → agent → time → home.
 */
export function nextStep({ signedIn, entitled, onboarded }: FlowState): Step {
  if (!signedIn) return '/';
  if (!entitled) return '/subscribe';
  if (!onboarded) return '/connect';
  return '/home';
}
