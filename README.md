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
  prioritized to protect lean mass, plus a sugar limit), and suggested weekly exercise volume.
  Unsafe timeframes (faster than ~1% bodyweight/week) are flagged both at onboarding and on
  the dashboard. A metric/imperial unit toggle is available at onboarding and in Profile.
- **Food search** — `src/services/foodLookupService.ts` resolves a free-text description
  ("Quest protein bar", "2 scrambled eggs") in three tiers: **Open Food Facts** (a free, open
  database of branded/packaged foods — best source for name-brand items) first, then an AI
  backend with web search enabled (for restaurant items or anything OFF doesn't carry — see
  `src/services/aiFoodService.ts`), then a small local dataset as an offline/demo fallback.
  Once a food is found, its logged amount is editable and rescales calories/macros/sugar
  proportionally (`scaleFoodResult`).
- **Dashboard (Home)** — remaining calories (net of exercise burned), macro rings (protein,
  carbs, fat, sugar), water progress, an exercise summary, and today's food grouped into
  breakfast/lunch/dinner/snack sections with per-meal subtotals.
- **Exercise tracker** — `src/data/exerciseMets.ts` is a curated MET-value dataset sourced
  from the published Compendium of Physical Activities (the standard public research
  reference for energy-expenditure estimates). Search an activity, enter a duration, and
  calories burned are estimated from MET × bodyweight × time.
- **Water tracking** — tap-to-fill water drops, quick-add buttons (shown in ml or fl oz
  depending on unit system), and a running log.
- **Profile / Plan** — full breakdown of BMR, TDEE, calorie/macro/sugar targets, goal pace,
  and exercise suggestions, with a unit-system toggle.

## Boho design system

`src/theme/theme.ts` defines the palette (terracotta, sage, sand, clay, warm cream), soft
rounded corners, and a decorative sunrise-over-arch header (`ArchHeader`) used across screens.

## AI backend integration

The mobile app never holds an AI API key directly — `aiFoodService` calls a backend proxy at
`${EXPO_PUBLIC_AI_PROXY_URL}/food-lookup` with a `{ query, system }` payload and expects
`{ text: string }` containing the model's JSON response. A minimal proxy needs to forward that
prompt to an LLM **with web search/browsing enabled** (e.g. the Claude Messages API with the
web search tool) and return the completion text — the system prompt explicitly asks the model
to search manufacturer/retailer sites for branded items rather than guess from memory, since
exact label numbers matter here. Set `EXPO_PUBLIC_AI_PROXY_URL` in `.env` (or via
`configureAiFoodService`) to enable it. Without it, or when Open Food Facts already has the
item, this tier is skipped or used only as a fallback.

## Getting started

```bash
npm install
npm run start   # then press i / a / w for iOS / Android / web
```

## Project layout

```
src/
  theme/            boho color palette, spacing, typography
  types/            shared domain types (UserProfile, FoodEntry, ExerciseEntry, ...)
  utils/            BMR/TDEE/macro/plan calculations, unit conversions
  data/              exercise MET-value dataset (Compendium of Physical Activities)
  services/         AsyncStorage persistence, Open Food Facts, AI food lookup, orchestrator
  context/          UserContext (profile/plan), LogContext (daily food/water/exercise logs)
  components/       MacroRing, ProgressBar, BohoCard, WaterDrop, ArchHeader, UnitToggle
  screens/          Onboarding, Home, FoodSearch, Exercise, Water, Profile
  navigation/        bottom-tab root navigator
```
