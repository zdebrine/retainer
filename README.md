# Retainer

Retainer People: a paid iOS and Android app that shows you posts from the people you choose, twice a day, then closes.

- `docs/TECH_SPEC.md`: technical spec (decisions, architecture, milestones)
- `design/`: wireframe and design system imported from Claude Design ("Retainer People")
- `apps/mobile`: Expo SDK 57 app (React Native 0.86, Expo Router, TypeScript)
- `packages/shared`: code shared by the app and the backend, including design tokens generated from `design/`
- `supabase/`: database migrations, config and Edge Functions

## Getting started

Requires Node 22 and pnpm 10.

```sh
pnpm install
cd apps/mobile
npx expo start           # then press i / a, or scan with a development build
```

Fonts are embedded natively by the `expo-font` config plugin, so iOS and Android need a
development build (`npx expo run:ios`, `npx expo run:android`, or
`npx eas-cli@latest build --profile development`). Expo Go will fall back to system fonts.

## Checks

```sh
pnpm tokens:check   # design tokens match design/
pnpm format:check
pnpm typecheck
pnpm lint
pnpm test
pnpm test:functions   # Edge Function logic (node --test)
```

CI runs all of these, plus an iOS and Android JS bundle, on every pull request.

## Design tokens

`packages/shared/src/tokens.ts` is generated from `design/_ds/*/tokens/*.css` and the light
theme in the People wireframe. After re-importing the design system from Claude Design, run
`pnpm tokens`. Never edit `tokens.ts` by hand. The in-app design check lives at `/dev/tokens`.

## Supabase

`supabase/config.toml` and `supabase/migrations/` are the source of truth. Local stack:
`npx supabase start` (needs Docker).

| Environment | Project                              | Ref                    | Region    |
| ----------- | ------------------------------------ | ---------------------- | --------- |
| dev         | retainer-dev                         | `ilxxsqpevooclmpazydx` | us-east-1 |
| staging     | not created yet (needs the Pro plan) |                        |           |
| prod        | not created yet (needs the Pro plan) |                        |           |

Link with `npx supabase link --project-ref <ref>`, then `npx supabase db push` to apply new
migrations. The app reads `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
from `apps/mobile/.env.development` in development builds, and from the `env` block of each
profile in `apps/mobile/eas.json` otherwise (preview builds use the dev project until staging
exists).

## Sign-in and subscription setup

Each of these is optional for development: the app hides a sign-in method whose keys are
missing, and development builds without RevenueCat keys can skip the paywall.

| What                | Where                                                                                                                                                                                            | Values                                                                                                                                                                                |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Email code sign-in  | Supabase → Authentication → Email templates → Magic link                                                                                                                                         | Paste `supabase/templates/magic_link.html` (it sends `{{ .Token }}`). Supabase's built-in mailer only delivers to project team members; add custom SMTP before beta.                  |
| Sign in with Apple  | Supabase → Authentication → Providers → Apple                                                                                                                                                    | Enable; Client IDs: `app.retainer.people`. Needs an active Apple Developer membership to test on a device.                                                                            |
| Sign in with Google | Google Cloud console: an OAuth client of type Web, one of type iOS (bundle `app.retainer.people`) and one of type Android (package `app.retainer.people` + signing SHA-1 from `eas credentials`) | App: `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`, `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID`. Supabase → Providers → Google: Client IDs = web and iOS IDs, comma-separated; enable "Skip nonce check". |
| Subscription        | RevenueCat project with the App Store and Play apps, product `retainer_monthly_499` ($4.99/month, no trial), entitlement `retainer`, in the current offering                                     | App: `EXPO_PUBLIC_REVENUECAT_IOS_KEY`, `EXPO_PUBLIC_REVENUECAT_ANDROID_KEY` (public SDK keys).                                                                                        |
| YouTube channels    | Google Cloud: an API key restricted to the YouTube Data API v3                                                                                                                                   | Supabase → Edge Functions → Secrets: `YOUTUBE_API_KEY`. App: `EXPO_PUBLIC_YOUTUBE_ENABLED=true` to show YouTube on the connect screen.                                                |
| Entitlement webhook | RevenueCat → Integrations → Webhooks: URL `https://<ref>.supabase.co/functions/v1/revenuecat-webhook`, Authorization header = a random secret                                                    | Supabase → Edge Functions → Secrets: `REVENUECAT_WEBHOOK_AUTH` = the same secret. Until it is set, the webhook rejects every request.                                                 |

Put app values in `apps/mobile/.env.development` for development builds, and in the profile's
`env` in `eas.json` (or EAS environment variables) for preview and production builds.
