# Retainer People: technical specification (v1)

Status: draft for review · 2026-09-29
Source design: Claude Design project "Retainer People" (`design/Retainer People.dc.html`), Retainer design system (`design/_ds/…`), and the earlier anti-feed spec it builds on.

---

## 0. Summary

Retainer People is a paid ($4.99/mo) iOS and Android app. It reads the social accounts of a short list of people the user picks, and twice a day it hands them a finite briefing: posts come one at a time, with no likes, counts, ads, suggestions or strangers. After the last post, or when the daily time limit runs out, the app closes until the next briefing.

Decisions already made:

| Area | Decision |
| --- | --- |
| Client | React Native with **Expo SDK 57** (New Architecture, Hermes), TypeScript, Expo Router |
| Backend | **Supabase**: Postgres, Auth, row-level security (RLS), Edge Functions, Cron, Queues, Vault |
| Platform access | **Hybrid, phased.** Phase 1 uses only official or open APIs. Phase 2 adds an on-device, logged-in reader for platforms that have no read API. |
| Scope | People is a standalone v1. Retainer Space (the money and attention clusters) is out of scope, but the schema leaves room for it. |
| Billing | App Store and Play subscriptions through RevenueCat |
| AI | Choice of Claude, ChatGPT, Gemini or on-phone, as in wireframe screen 06b. The server calls the cloud providers through a provider abstraction; there are no provider keys on the device. |

---

## 1. v1 scope, mapped to the wireframe

| # | Screen | What it needs technically |
| --- | --- | --- |
| 01 | Welcome | Static. Creates an anonymous Supabase session on first launch. |
| 01b | What it is for | Static. |
| 02 | Why we charge | Static. The copy states the AI providers, which must match the ones we ship. |
| 03 | Subscribe | RevenueCat offering, purchase, restore. Server entitlement arrives by webhook. |
| 04 | Connect platforms | A connector list driven by server config (so platforms can be switched on and off remotely). OAuth or app-password flows per connector. Read-only scopes. |
| 05 | Accounts per platform | Pulls the user's following list per connector, then a searchable list with toggles plus "type a @handle". Accounts are grouped into **people** (see §9). |
| 06 | How AI is used | Static, but the times shown come from the user's schedule. |
| 06b | Choose AI agent | Stores the provider choice. The "What the agent sees" text is generated from the choice. On-phone is shown only on capable devices (§8.3). |
| 07 | Daily limit | Limit of 10, 20, 30 or 45 min. Window: once a day, twice a day, or whenever I open it. Produces a readable rule summary. |
| 2a | Briefing ready | Counts per briefing (read, kept, not on list, ads/promoted) and avatars of the people included. |
| 2b | Reading | A paged, one-post-at-a-time reader with a segmented progress bar, a "Why this" drawer, Keep, Open in {app}, Back/Next, tap-to-play video and no autoplay. |
| 2c | Adjust | Per-person rules: only posts they wrote, mute a word (from this person or everyone), skip a platform for this person, remove them. Rules take effect from the next briefing. |
| 2d | Closed | The hard end. Pull down to see the schedule, with a countdown to the next briefing. |
| — | Settings | Not drawn yet. Needs: the decision log per briefing, the Kept archive, AI choice, schedule, connected platforms, subscription, and data export and delete. |

Out of scope for v1: Retainer Space graph and three.js scene, desktop, web, any posting or replying, and push notifications (see §19 Q4).

---

## 2. Product rules that become system requirements

1. **No live refresh.** Posts are collected in scheduled *passes*, and the client never polls a platform in real time.
2. **Finite and ordered.** A briefing is an immutable, ordered list, built once per window and never extended while the user reads it.
3. **Hard end.** When the briefing ends or the daily limit runs out, reading is locked until the next window opens. The server enforces this; the client can't be the only enforcement.
4. **Metrics stripped at ingest.** Like, share, view and reply counts, and "suggested" or "promoted" fields, are dropped before a post is stored. They never exist in our database.
5. **Read-only.** Every connector asks for the narrowest read scope. No code path posts, likes, follows or messages.
6. **Explainability.** Every kept or dropped post has a stored reason, shown in "Why this" and in the Settings decision log.
7. **Nothing pulls the user back.** No streaks, badges or re-engagement pushes. Analytics must not optimise for time in app (§14).

---

## 3. Architecture

```
┌───────────────────────── Phone (Expo app) ─────────────────────────┐
│ Expo Router screens ─ TanStack Query ─ Zustand (UI state)          │
│ expo-sqlite + Drizzle: cached briefings, kept posts, rules         │
│ RevenueCat SDK        Session timer + lock                         │
│ [Phase 2] On-device reader (WebView per platform, user's session)  │
│ [Opt] On-device model (Apple Foundation Models / Gemini Nano)      │
└──────────────┬──────────────────────────────────────▲──────────────┘
               │ HTTPS (Supabase JS, RLS)             │ briefing JSON
┌──────────────▼──────────────────────────────────────┴──────────────┐
│ Supabase                                                           │
│  Auth (anon → Apple/Google link)   Postgres + RLS   Vault (tokens) │
│  Cron ──► enqueue passes ──► Queues (pgmq)                         │
│  Edge Functions:                                                   │
│    connectors/*  (fetch since cursor, normalise, strip)            │
│    classify      (rules → LLM batch → decisions)                   │
│    assemble      (order, cap to time budget, publish at window)    │
│    ingest-device (Phase 2: posts uploaded from on-device reader)   │
│    revenuecat-webhook, account-delete, export                      │
└──────┬───────────────────────┬─────────────────────────────────────┘
       │                       │
 Platform APIs            LLM providers (server-side keys)
 Bluesky, YouTube,        Anthropic · OpenAI · Google
 Mastodon, RSS, Threads,
 X (cost-gated)
```

---

## 4. Client stack

Versions are the current stable releases as of 2026-09-29. Native modules must be installed with `npx expo install`, so they resolve to the versions Expo SDK 57 was tested against; those are shown where they differ from the npm "latest" tag.

| Concern | Library | Version |
| --- | --- | --- |
| Runtime / SDK | `expo` | 57.x |
| RN / React | `react-native` / `react` | 0.86.x / 19.2.x (as bundled by SDK 57) |
| Language | TypeScript, strict, `noUncheckedIndexedAccess` | as pinned by the SDK 57 template |
| Navigation | `expo-router` (typed routes) | 57.x |
| Animation | `react-native-reanimated` + `react-native-worklets` | 4.x (SDK-resolved) |
| Gestures | `react-native-gesture-handler` | SDK-resolved |
| Server state | `@tanstack/react-query` | 5.x |
| UI state | `zustand` | 5.x |
| Validation | `zod` (shared schemas with Edge Functions) | 4.x |
| Local DB | `expo-sqlite` + `drizzle-orm` | 57.x / 0.45.x |
| Small prefs | `react-native-mmkv` | 4.x |
| Images / video | `expo-image`, `expo-video` (no autoplay) | 57.x |
| Lists (Settings, Kept) | `@shopify/flash-list` | 2.x |
| Secure storage | `expo-secure-store` | 57.x |
| Auth UI | `expo-apple-authentication`, Google Sign-In via `expo-auth-session` | 57.x |
| Subscriptions | `react-native-purchases` (RevenueCat) | 10.x |
| Supabase | `@supabase/supabase-js` | 2.x |
| Web auth flows | `expo-web-browser`, `expo-auth-session` | 57.x |
| On-device reader (Phase 2) | `react-native-webview` | SDK-resolved (13.x) |
| On-device AI (optional) | Custom Expo Module wrapping Apple Foundation Models (iOS) and ML Kit GenAI / Gemini Nano (Android); `react-native-executorch` as a fallback | 0.10.x |
| Fonts | `expo-font` with Manrope (400–700) and JetBrains Mono (400–500), bundled rather than loaded from Google Fonts | — |
| Errors | `@sentry/react-native` | 8.x |
| Product analytics | `posthog-react-native`, with autocapture and session replay **off** | 4.x |
| i18n (later) | `expo-localization` + `i18next` | — |

**Styling.** Port `design/_ds/.../tokens/*.css` to `src/theme/tokens.ts` (colours, the eight type styles, spacing, radius, glow, motion) and use `StyleSheet` with small primitives (`Text variant="title|body|micro|data"`, `Button fill|outline|quiet`, `Panel`, `Toggle`, `Avatar`). Support dark (default) and light, which the wireframe already defines. A script regenerates `tokens.ts` from the CSS so design changes are one command. No UI kit dependency, because the design system is small and opinionated.

**Architecture on the client.**
```
app/                  expo-router routes
  (onboarding)/ welcome, why, price, subscribe, connect, accounts, ai, agent, time
  (main)/ ready, read/[index], adjust/[personId], closed, settings/…
src/features/<feature>/  hooks, components, api
src/theme/  src/db/  src/lib/(supabase, purchases, sentry)
```
Offline: the current briefing and its media URLs are cached in SQLite, so reading works without a network. Actions (Keep, Adjust) are queued and synced.

---

## 5. Backend (Supabase)

* **Postgres 17** with RLS on every user table (`user_id = auth.uid()`).
* **Auth.** Anonymous sign-in at first launch, so onboarding needs no signup screen. At Subscribe we offer "Sign in with Apple" or Google to link the account, which enables restore on a new device. The RevenueCat `appUserID` is the Supabase user id.
* **Edge Functions** (Deno, TypeScript). Connectors, classify, assemble, webhooks, export and delete. Shared `zod` schemas live in `packages/shared`.
* **Cron + Queues.** `pg_cron` runs every 5 minutes and enqueues pass jobs into `pgmq` for users whose next window opens within the lead time (§7). Workers are Edge Functions that pull from the queue. Retries use exponential backoff and a dead-letter queue.
* **Vault.** Platform OAuth tokens and app passwords are encrypted at rest. Only service-role functions can decrypt them.
* **Storage.** Not used for post media in v1: media is loaded from the platform CDN by URL. It is used only for data exports.
* **Environments.** `dev`, `staging`, `prod` as separate projects, with Supabase branching for PR previews. Migrations go through the Supabase CLI in Git.

---

## 6. Platform connectors (phased)

Each connector implements one interface:

```ts
interface Connector {
  id: 'bluesky' | 'youtube' | 'mastodon' | 'rss' | 'threads' | 'x' | 'instagram' | 'tiktok' | 'facebook';
  auth: 'oauth' | 'app_password' | 'none' | 'device_session';
  listFollowing(conn): AsyncIterable<SourceAccount>;         // screen 05
  fetchSince(conn, account, cursor): Promise<{ posts: RawPost[]; cursor }>;
  normalise(raw): NormalisedPost;                            // strips metrics here
}
```

| Platform | Phase | Mechanism | Notes and risks |
| --- | --- | --- | --- |
| **Bluesky** | 1 | AT Protocol (`@atproto/api`), OAuth | Open. `getAuthorFeed` per followed account. Low risk. |
| **YouTube** | 1 | YouTube Data API v3, OAuth `youtube.readonly` | Subscriptions, then the uploads playlist per channel. There is a daily quota: we request a raise before launch. |
| **Mastodon / fediverse** | 1 | Per-instance OAuth, `read` scope | Open. |
| **RSS / Atom** (blogs, Substack, newsletters) | 1 | Plain fetch, no auth | Open. The user enters feed URLs. |
| **Threads** | 1 (if approved) | Threads API, which reads public profiles through its profile-discovery endpoints | Needs Meta app review. Only public profiles, and it may not list who you follow. **Confirm the current API surface before committing.** |
| **X** | 1 (cost-gated) | X API, OAuth 2.0 | Reading timelines is paid per use. **Model the per-user cost first**, and ship only if it fits §16. |
| **Instagram** | 2 | On-device reader | There is no official API for reading other people's posts. The reader visits each chosen person's profile inside a WebView that uses the user's own session. |
| **TikTok** | 2 | On-device reader | Same approach. Its official APIs don't allow this use. |
| **Facebook** | 2 | On-device reader | Same approach. The highest breakage risk. |
| **Snapchat** | Not planned | — | Stories are private and ephemeral, with no reliable way to read them. Remove it from screen 04. |

### 6.1 On-device reader (Phase 2)

* The user logs in to each platform **inside a WebView the app hosts**. Cookies stay in the device's WebView cookie store. Credentials never reach our servers.
* At pass time the reader loads **each chosen person's profile page**, not the home feed. This avoids ads and suggestions by design and keeps the "only your people" promise without guesswork. An injected script turns the DOM or embedded JSON into `NormalisedPost` and uploads it to `ingest-device`.
* Per-platform extractors are **remote config** (versioned JS served from our backend and validated with a signature), so a platform markup change doesn't need an app release. EAS Update is the fallback.
* **Scheduling limits.** iOS doesn't guarantee background execution at a set time: `BGAppRefreshTask` is best-effort, and WebViews in the background are unreliable. So Phase 2 platforms are collected **when the app opens** ("Preparing your briefing… 8 s"), plus opportunistic background refresh. On Android, `WorkManager` with an expedited job is more reliable. The UX has to allow for this, and it needs a designed loading state.
* **Risk.** This is against Instagram, TikTok and Facebook's terms. The realistic consequences are account challenges for users, breakage, and app-review rejection if the app is described as a scraper. Mitigations: profile visits only, human-like pacing, a hard cap on pages per pass, a clear in-app disclosure, a per-platform kill switch, and **legal review before Phase 2**.

---

## 7. The pass pipeline (server)

A **pass** collects and classifies posts for one user ahead of one window.

1. **Schedule.** The window times come from the user's settings in their IANA time zone. Cron enqueues a pass `lead = 60 min` before each window. For "Whenever I open it", passes run every 4 hours and on app open (rate-limited).
2. **Fetch.** One queue job per (user, connection). The job calls `fetchSince(cursor)` for each chosen account, with a per-connector concurrency limit and platform rate-limit handling.
3. **Normalise and strip.** The connector drops every metric and promo field and stores a `NormalisedPost`: author, platform, text, media (URLs, type, alt, duration), permalink, `posted_at`, `is_repost`, `is_reply`, and `is_sponsored` where the platform exposes it.
4. **Deterministic rules first**, which are cheap and explainable:
   * the author isn't on the list → drop (`not_on_list`)
   * a repost or reshare when "only posts they wrote" is set → drop
   * the platform is skipped for this person → drop
   * an exact muted word → drop
   * a reply to a stranger → drop (default on)
5. **LLM classification** runs only on the survivors (§8). It catches sponsored or ad content the platform didn't flag, fuzzy mute-word matches ("no politics"), and near-duplicates across platforms (the same photo on Instagram and Threads), and it writes a short factual `why` line.
6. **Assemble.** Keep posts in time order (the wireframe shows newest first, but see §20). Deduplicate. Cap the count to fit the time budget, estimating seconds per post from text length and media. Anything that didn't fit carries over to the next briefing or is noted as "N more held". Write an immutable `briefing` with `opens_at` and `status='ready'`.
7. **Publish.** At `opens_at` the client can fetch it. Every drop and keep is written to `decision_log`.

Idempotency: a pass is keyed on `(user_id, window_start)`, and posts are upserted on `(platform, platform_post_id)`.

---

## 8. AI layer

### 8.1 What the model does (and doesn't)

It classifies and annotates posts from people the user already chose. It never ranks for engagement, never sees the user's messages or credentials, and never acts on a platform.

### 8.2 Cloud providers

* A provider abstraction (`classifyBatch(posts, rules) → Decision[]`) with adapters for Anthropic (`@anthropic-ai/sdk`), OpenAI (`openai`) and Google (`@google/genai`). The keys live only in Supabase secrets.
* **Anthropic adapter:** the default model is `claude-opus-5-5` at `effort: "low"`, using structured outputs (`output_config.format` with the Decision JSON schema), prompt caching on the fixed system prompt and rules block, and the **Message Batches API** (50% cost) for scheduled passes. That works because passes start 60 min ahead. A synchronous fallback handles batch items that aren't finished 10 min before the window. Refusal handling uses server-side `fallbacks`.
* A cheaper model, for example `claude-haiku-4-5` for classification, is a **cost lever for you to decide on** after we measure its quality on the eval set in §8.5. See §16 and §19 Q6.
* **Output contract:**
```json
{ "post_id": "…", "keep": true,
  "reason_code": "on_list|sponsored|muted_topic|duplicate|repost|other",
  "why": "Dana is on your list. Posted on Instagram at 8:02 am.",
  "confidence": 0.0 }
```
* The OpenAI and Gemini model IDs are set in server config, not in the app, so switching a provider needs no release.

### 8.3 On-phone option

* **iOS:** Apple Foundation Models framework, on supported devices and OS versions, through a small Expo Module.
* **Android:** ML Kit GenAI (Gemini Nano through AICore), on supported devices.
* **Fallback:** hide the "On this phone" option on unsupported devices. We don't ship a bundled GGUF model in v1: it adds hundreds of MB and a large battery cost, and `llama.rn` currently has only release candidates.
* In on-phone mode the server skips step 5. The client downloads the rule-filtered candidates, classifies them locally, and uploads only the decisions (not post content) for the decision log.
* **Privacy caveat.** For Phase 1 connectors the *server* still fetches posts. So "No post, name or account is sent anywhere" (screen 06b) is only true for Phase 2 on-device platforms. **This copy has to change**; see §20.

### 8.4 Prompt injection

Post text is untrusted. It goes inside a delimited data block, the system prompt says to treat it as data, the output is schema-constrained, and the model output can only keep or drop a post. It has no tools and can't change rules.

### 8.5 Evals

A labelled set of about 1,000 posts (sponsored, reposts, duplicates, mute-topic edge cases, non-English). CI runs it on prompt or model changes and gates on precision and recall for `sponsored` and `muted_topic`. The same set is used to compare Opus, Haiku, GPT and Gemini, both for cost decisions and to keep behaviour consistent across providers.

---

## 9. Data model (core tables)

```sql
profiles(user_id pk, tz, ai_provider, daily_limit_min, window_mode, windows jsonb,
         created_at, deleted_at)
connections(id, user_id, platform, handle, auth_kind, vault_secret_id, status,
            last_ok_at, cursor jsonb)
people(id, user_id, display_name, initials, avatar_url, created_at)        -- "Dana"
source_accounts(id, user_id, person_id null, connection_id, platform,
                platform_account_id, handle, display_name, enabled bool)  -- @danaokafor on IG
person_rules(id, user_id, person_id null /* null = everyone */,
             kind /* own_posts_only | mute_word | skip_platform | removed */,
             value, effective_from, created_at)
posts(id, platform, platform_post_id unique, source_account_id, posted_at,
      text, media jsonb, permalink, is_repost, is_reply, is_sponsored_flag,
      fetched_at, expires_at)                                              -- no metrics columns
briefings(id, user_id, window_start, opens_at, closes_at, status, stats jsonb)
briefing_items(briefing_id, position, post_id, why)
decision_log(id, user_id, briefing_id, post_id, keep, reason_code, source /* rule|llm|device */,
             rule_id null, model null, created_at)
kept_posts(user_id, post_id, kept_at)
reading_sessions(id, user_id, briefing_id, started_at, ended_at, seconds)
entitlements(user_id, product_id, status, expires_at, rc_event_id)
```

* **People vs accounts.** Screen 05 is per platform, but the briefing and Adjust screens are per *person*. When onboarding finishes we suggest groupings (same display name, cross-links in bios) and let the user confirm them ("Dana on Instagram, Threads and X"). Accounts that aren't grouped become a person on their own.
* **Retention.** `posts` that aren't kept expire 7 days after their briefing closes. Kept posts are stored until the user unkeeps them. The decision log is kept for 30 days.
* **Future Space clusters** would add `money_*` and `attention_*` tables. `people` is already a first-class entity.

---

## 10. Client ↔ server API

Supabase tables are used directly under RLS for simple CRUD (rules, people, settings). Anything with side effects goes through an Edge Function:

| Endpoint | Purpose |
| --- | --- |
| `POST /connect/:platform/start`, `/callback` | OAuth start and callback, which stores tokens in Vault |
| `GET /connections/:id/following` | Paged following list for screen 05 |
| `GET /briefing/current` | The current briefing plus lock state (`open`, `closed_until`, `limit_remaining_s`) |
| `POST /session/heartbeat` | Adds read seconds. The server returns the remaining limit and locks the briefing when it hits 0. |
| `POST /ingest-device` | Phase 2: posts from the on-device reader |
| `POST /decisions-device` | On-phone AI decisions |
| `POST /export`, `POST /account/delete` | GDPR/CCPA export and deletion, which also revokes platform tokens |
| `POST /webhooks/revenuecat` | Entitlement sync |

---

## 11. Subscriptions

* RevenueCat, with one product: `retainer_monthly_499` (auto-renewing monthly).
* The paywall is shown before connecting (screen 03) and matches the "price explained before it is asked for" principle.
* Entitlement is checked **server-side** before a pass runs. A lapsed user keeps their Kept archive and data, but passes stop.
* Trial or no trial: see §19 Q3.
* App Store review: the paywall must show the price, the period, a restore link, and terms and privacy links. Screen 03 needs terms and privacy links added.

---

## 12. Time limit and the hard end

* The client runs a visible-time timer (foreground only) and sends a heartbeat every 15 s. The server holds the authoritative `seconds_used_today`.
* When the limit or the last post is reached, the client routes to **Closed** and clears the briefing from memory. `GET /briefing/current` returns `closed_until` until the next window, so reinstalling or changing the device clock doesn't reopen it.
* Pull-down on Closed shows the schedule, computed from `profiles.windows` and `tz`.
* "Whenever I open it" mode: the briefing is a rolling queue, and the limit is the only lock.

---

## 13. Privacy and security

* Read-only scopes only. The app's privacy labels declare "Other user content" and "Purchases", and no tracking.
* Tokens are held in Vault. Service-role keys exist only in Edge Functions. RLS has tests (pgTAP).
* LLM calls send post text, media URLs and the author's display name, and never the user's name, email or tokens. This matches the screen 06b copy.
* No ads SDKs and no IDFA. The analytics rules are in §14.
* Account deletion is in-app (an App Store requirement). It hard-deletes rows and revokes platform tokens within 30 days.
* The Phase 2 WebView uses its own cookie store per platform, and the user can wipe it from Settings.

---

## 14. Observability and "humane" analytics

* Sentry for crashes and performance (client and Edge Functions). Structured logs are kept per pass: fetched, dropped by rule, dropped by LLM, kept, latency, and cost.
* PostHog tracks only funnel and health events: onboarding steps, subscribe, connect success or failure, briefing opened, briefing finished, and adjust used.
* **We deliberately don't track** time-in-app maximisation, scroll depth or re-open frequency as success metrics. The success metrics are "finished briefing within limit", "adjust rate trending down" (the filter is learning) and retention of the subscription.

---

## 15. Engineering workflow

* **Monorepo:** `apps/mobile` (Expo), `supabase/` (migrations and functions), `packages/shared` (zod schemas, types, token file). Uses pnpm workspaces.
* **Lint and format:** ESLint 10 flat config (`eslint-config-expo`) and Prettier, or Biome 2 for both. Pick one at kickoff.
* **Tests:**
  * Jest 30 and React Native Testing Library 14 for components and hooks
  * Maestro 2 for E2E flows (onboarding → subscribe with a sandbox account → read → closed)
  * `deno test` for Edge Functions, with connector contract tests against recorded fixtures
  * pgTAP for RLS
  * the LLM eval suite (§8.5)
* **CI:** GitHub Actions runs typecheck, lint, unit and edge tests on every PR. EAS Build runs on main. Maestro runs on EAS Workflows. Supabase preview branches are created per PR.
* **Release:** EAS Submit to TestFlight and the Play internal track. EAS Update channels (`preview`, `production`) carry JS-only fixes. Runtime version is set by fingerprint policy.

---

## 16. Cost model (estimates to validate)

Assumptions: 15 people followed, about 25 posts per pass reach the LLM after the deterministic rules, and 2 passes a day, so about 1,500 posts a month. Each post is about 300 input tokens of text (images not sent in v1) and about 40 output tokens. The fixed system prompt and rules block is cached.

| Line | Per user / month |
| --- | --- |
| Store fee (15% small-business / after year 1; 30% otherwise) | $0.75 – $1.50 |
| LLM, `claude-opus-5-5` low effort, batch: ~0.45M in, ~0.06M out, plus thinking overhead | ≈ $1.00 – $1.80 |
| LLM, `claude-haiku-4-5`, batch (if chosen after eval) | ≈ $0.30 – $0.50 |
| Supabase (Pro plan amortised plus compute) | ≈ $0.05 – $0.15 at 10k users |
| RevenueCat (above its free tier) | ≈ 1% of revenue |
| X API, if enabled | **unknown, possibly the largest line; measure first** |

Takeaways:
* On-phone users cost almost nothing in LLM spend.
* Sending images to the model would multiply input tokens, so v1 classifies on text and alt text only.
* OpenAI and Gemini adapters need the same per-user estimate before launch.

---

## 17. Milestones

| Milestone | Contents | Exit criteria |
| --- | --- | --- |
| M0 · Foundations (1–2 wk) | Monorepo, Expo app shell, tokens, fonts, Supabase projects, auth (anonymous), CI | App boots on both platforms, and tokens match the design screenshots |
| M1 · Onboarding + billing (2–3 wk) | Screens 01–07, RevenueCat sandbox, entitlement webhook | Can subscribe and restore on TestFlight and the Play internal track |
| M2 · Phase 1 connectors (3–4 wk) | Bluesky, YouTube, Mastodon, RSS; following list; people grouping; Threads/X if approved and costed | Real accounts selectable on screen 05 |
| M3 · Pass pipeline + AI (3 wk) | Cron and queues, rules, provider adapters, batch, eval harness, decision log | Briefing ready at window time for 50 dogfood users; eval gate green |
| M4 · Reading experience (2–3 wk) | 2a–2d, Adjust, Keep, time limit and lock, offline cache, Settings | Full loop on device, and the lock survives reinstall |
| M5 · Beta (2 wk) | Sentry, PostHog, privacy labels, export and delete, store listing | TestFlight external and Play closed testing |
| Phase 2 (after legal review) | On-device reader for Instagram, then TikTok and Facebook; remote extractors; on-phone AI module | Per-platform success rate ≥ 95% over 2 weeks |

---

## 18. Risks

| Risk | Likelihood | Impact | Mitigation |
| --- | --- | --- | --- |
| The platforms users care most about (Instagram, TikTok, Facebook) aren't in Phase 1 | High | High | Be honest in onboarding copy, prioritise Phase 2, and test demand with a waitlist |
| Phase 2 terms-of-service enforcement or app-review rejection | Medium | High | Legal review, profile-only reading, a kill switch, and disclosure |
| X API pricing makes X uneconomic | High | Medium | Cost it first, or make X an add-on |
| Threads API doesn't expose the following list | Medium | Medium | Let the user type handles |
| iOS background limits delay Phase 2 briefings | High | Medium | Collect on open, with a designed loading state |
| LLM cost exceeds margin | Low–Med | Medium | Batch, caching, text-only input, a cheaper model after the eval |
| LLM false drops (a missed post from Mom) | Medium | High (trust) | Deterministic rules first, the LLM only drops on high confidence, and a visible decision log |

---

## 19. Open questions for you

1. **Launch platforms.** Given §6, is a Phase 1 launch without Instagram, TikTok and Facebook acceptable, or should Phase 2 (with its risk) be part of v1?
2. **Accounts.** Is an anonymous start with an optional Apple or Google link at Subscribe acceptable, or do you want an explicit sign-in screen?
3. **Trial.** Should there be a free trial (for example 7 days) or none? The "price before asked" principle suggests an honest paywall, and a trial changes the screen 03 copy.
4. **Notifications.** Should there be no push at all, or one opt-in "Your 6:00 pm briefing is ready"? The design principles lean towards none.
5. **Window times.** Screen 06 says 6:00 am and 6:00 pm, but screen 07 says 8:00 am and 6:00 pm for "Twice a day". Which is right, and can users pick custom times?
6. **Default cloud model and cost ceiling.** The spec defaults to `claude-opus-5-5` at low effort. Do you want us to evaluate `claude-haiku-4-5` for cost, and what monthly LLM cost per user is acceptable?
7. **Regions.** US-only at launch, or EU too (GDPR, data residency and EU LLM endpoints)?
8. **Kept posts.** Should Keep store the full post in our database, or only a link?

---

## 20. Design issues found while specifying

* Screen 04 lists **Snapchat**, which we can't support. Instagram, TikTok and Facebook should read "Coming soon" in Phase 1.
* Screen 06b, on-phone option: "No post, name or account is sent anywhere" isn't true for server-fetched platforms. Suggested copy: "Posts are sorted on this phone. Retainer's servers still collect them from Bluesky, YouTube and others."
* The screen 06 times conflict with screen 07 (Q5).
* Screen 2b's post order is newest first, but the Retainer Space spec says "time order". Pick one.
* Screen 03 has no terms or privacy links (App Store requirement), and it doesn't mention auto-renewal.
* There's no design yet for: Settings, the decision log, the Kept archive, a connection that has failed or expired, the "preparing your briefing" state (Phase 2), an empty briefing ("None of your people posted"), and the lapsed-subscription state.
