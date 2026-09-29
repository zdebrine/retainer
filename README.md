# Retainer

Retainer People: a paid iOS and Android app that shows you posts from the people you choose, twice a day, then closes.

- `docs/TECH_SPEC.md`: technical spec (decisions, architecture, milestones)
- `design/`: wireframe and design system imported from Claude Design ("Retainer People")
- `apps/mobile`: Expo SDK 57 app (React Native 0.86, Expo Router, TypeScript)
- `packages/shared`: code shared by the app and the backend, including design tokens generated from `design/`
- `supabase/`: database migrations, config and (from M2) Edge Functions

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
```

CI runs all of these, plus an iOS and Android JS bundle, on every pull request.

## Design tokens

`packages/shared/src/tokens.ts` is generated from `design/_ds/*/tokens/*.css` and the light
theme in the People wireframe. After re-importing the design system from Claude Design, run
`pnpm tokens`. Never edit `tokens.ts` by hand. The in-app design check lives at `/dev/tokens`.

## Supabase

`supabase/config.toml` and `supabase/migrations/` are the source of truth. Local stack:
`npx supabase start` (needs Docker). Hosted projects (dev, staging, prod, US East) are
linked with `npx supabase link --project-ref <ref>`.
