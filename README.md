# Bloom — Calorie & Macro Tracker

A mobile-first calorie, macro, and water tracking app with a warm boho design,
AI-powered food lookup, and a personalized plan calculator.

## Stack

- **Expo / React Native / TypeScript** — cross-platform mobile (iOS + Android), with web support via Metro.
- **React Navigation** (bottom tabs) for the primary app shell.
- **AsyncStorage** for local persistence (profile + daily logs).
- **react-native-svg** for the custom macro rings, water drops, and arch/sunrise motif.

## Features

- **Onboarding & personalization** — height, weight, age, gender, and activity level feed a
  Mifflin-St Jeor BMR + TDEE calculation (`src/utils/calculations.ts`). Combined with a goal
  weight and timeframe, the app derives a daily calorie target, a macro split (protein
  prioritized to protect lean mass), and suggested weekly exercise volume. Unsafe timeframes
  (faster than ~1% bodyweight/week) are flagged both at onboarding and on the dashboard.
- **AI-powered food search** — `src/services/aiFoodService.ts` sends a free-text food
  description ("2 boiled eggs", "grande oat milk latte") to a configurable AI backend
  (`EXPO_PUBLIC_AI_PROXY_URL`) that proxies to an LLM (e.g. Claude) and returns structured
  nutrition JSON. A small local dataset acts as an offline/demo fallback when no backend is
  configured or the request fails.
- **Dashboard (Home)** — remaining calories, macro progress rings, water progress, and a log
  of today's food.
- **Water tracking** — tap-to-fill water drops, quick-add buttons, and a running log.
- **Profile / Plan** — full breakdown of BMR, TDEE, calorie/macro targets, goal pace, and
  exercise suggestions.

## Boho design system

`src/theme/theme.ts` defines the palette (terracotta, sage, sand, clay, warm cream), soft
rounded corners, and a decorative sunrise-over-arch header (`ArchHeader`) used across screens.

## AI backend integration

The mobile app never holds an AI API key directly — `aiFoodService` calls a backend proxy at
`${EXPO_PUBLIC_AI_PROXY_URL}/food-lookup` with a `{ query, system }` payload and expects
`{ text: string }` containing the model's JSON response. A minimal proxy just needs to forward
that prompt to the Claude Messages API and return the completion text. Set
`EXPO_PUBLIC_AI_PROXY_URL` in `.env` (or via `configureAiFoodService`) to enable it; without it,
search falls back to the local dataset in `aiFoodService.ts`.

## Getting started

```bash
npm install
npm run start   # then press i / a / w for iOS / Android / web
```

## Project layout

```
src/
  theme/            boho color palette, spacing, typography
  types/            shared domain types (UserProfile, FoodEntry, WaterEntry, ...)
  utils/            BMR/TDEE/macro/plan calculations
  services/         AsyncStorage persistence + AI food lookup
  context/          UserContext (profile/plan), LogContext (daily food/water logs)
  components/       MacroRing, ProgressBar, BohoCard, WaterDrop, ArchHeader
  screens/          Onboarding, Home, FoodSearch, Water, Profile
  navigation/        bottom-tab root navigator
```
