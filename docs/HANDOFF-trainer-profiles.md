# Handoff: Dynamic Trainer Profiles (GymovaFlow)

**Use this writeup when starting a new agent to implement dynamic trainer profiles.**

---

## Project overview

- **App:** GymovaFlow – fitness app to find/book personal trainers.
- **Stack:** Next.js 14 (App Router), Supabase (auth + DB), TypeScript.
- **Repo path:** `c:\Users\neevi\Downloads\Gymovaflow`

---

## What’s already done

- **Auth:** Supabase Auth with AuthProvider, login (`/login`), signup (`/signup`), dashboard (`/dashboard`), profile (`/dashboard/profile`). Confirm email is **off** (no SMTP needed for localhost).
- **Supabase client:** `lib/supabaseClient.ts` – single browser client using `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
- **Trainers list:** `app/trainers/page.tsx` loads trainers from Supabase table `trainers` with:
  - `id, name, specialty, rating, reviews, price, location, distance, specializations`
  - Fallback: if DB returns nothing, a hardcoded list is used. Hydration fix: filter Sheet is only rendered after `mounted` is true.
- **Trainer profile page (current):** `app/trainers/[id]/page.tsx` – **fully hardcoded**. It uses a static object `trainers` with keys `"1"` and `"2"` and fields: `id, name, specialty, rating, reviews, price, location, distance, bio, specializations, certifications, experience, clientsHelped, availability` (per-day time slots), `reviewsList` (array of `{ id, name, rating, date, comment }`). No Supabase call; unknown `id` falls back to `defaultTrainer` (id 1).

---

## Goal for the new agent

**Make the trainer profile dynamic:** load the trainer by `[id]` from Supabase instead of hardcoded data.

1. **Data source**
   - Use the existing `trainers` table in Supabase.
   - If the table doesn’t have columns for the profile page (e.g. `bio`, `certifications`, `experience`, `availability`, reviews), either:
     - Add and use the needed columns (and document the schema), or
     - Use a separate table (e.g. `trainer_profiles`, `trainer_availability`, `trainer_reviews`) and join or fetch in the app. Prefer aligning with the existing `trainers` select in `app/trainers/page.tsx` where possible.

2. **`app/trainers/[id]/page.tsx`**
   - Fetch the trainer by `params.id` from Supabase (e.g. `supabase.from('trainers').select(...).eq('id', params.id).single()` or equivalent for multiple tables).
   - Handle loading state, not-found (invalid or missing id), and errors.
   - Keep the existing UI structure (tabs, bio, specializations, certifications, experience, location, reviews list, availability, price, CTA to book) but feed it from the fetched data. Map DB columns/types to the shape the UI expects (e.g. `specializations` as array, `availability` as object of day → time slots, `reviewsList` from DB or placeholder if no reviews table yet).

3. **IDs**
   - List page uses `trainer.id` from DB (type may be number or UUID). Profile page currently uses string `params.id`. Ensure the profile fetch uses the same id type (e.g. string or number) so links from `/trainers` to `/trainers/[id]` work.

4. **Optional**
   - Add a small note in this doc or in code listing the final `trainers` (and any related) table columns used for the profile page so future work stays consistent.

---

## Key files

| Path | Purpose |
|------|--------|
| `lib/supabaseClient.ts` | Supabase client (use for all DB calls). |
| `app/trainers/page.tsx` | Trainers list; fetches from `trainers` table; links to `/trainers/${trainer.id}`. |
| `app/trainers/[id]/page.tsx` | **Target:** change from hardcoded data to Supabase-backed dynamic profile. |
| `app/dashboard/page.tsx` | Links to `/trainers` and `/trainers/${trainer.id}` (currently mock data). |
| `app/booking/[id]/page.tsx` | Booking flow; uses trainer id; may need to stay in sync with trainer data shape. |

---

## Supabase context

- **Auth:** Working; confirm email disabled. No custom SMTP for localhost.
- **Tables mentioned:** `profiles` (RLS), `trainers` (list page already uses it). Schema for `trainers` beyond the list columns is not in the repo; the new agent should check the Supabase table(s) and extend schema if needed for profile (bio, certifications, availability, reviews, etc.).

---

## Copy-paste prompt for the new agent

You can start the new chat with something like:

```
I'm working on GymovaFlow (Next.js 14 + Supabase). I need to make the trainer profile page dynamic.

Please read docs/HANDOFF-trainer-profiles.md in this project – it describes the current setup and exactly what to do. In short: app/trainers/[id]/page.tsx currently uses hardcoded trainer data; switch it to load the trainer by id from the Supabase `trainers` table (and add any needed columns or related tables for bio, certifications, availability, reviews). Keep the existing UI; add loading and not-found handling.
```

---

*Last updated: handoff for dynamic trainer profiles.*

---

## Done: Dynamic profile (implementation note)

- **Profile page** (`app/trainers/[id]/page.tsx`) is now a server component that fetches the trainer by `params.id` from Supabase. Uses `notFound()` when the trainer is missing or the query errors.
- **Loading:** `app/trainers/[id]/loading.tsx` shows a skeleton while the page loads.
- **Not found:** `app/trainers/[id]/not-found.tsx` is shown for invalid or missing trainer id.
- **Schema:** `docs/SCHEMA-trainers-profile.md` lists the `trainers` table columns used for the list and profile. The profile select currently uses only the same columns as the list page so it works before new columns are added; after adding `bio`, `certifications`, `experience`, `clients_helped`, `availability`, `reviews_list`, add them to the `.select()` in `page.tsx`.
- **UI:** Existing layout (tabs, bio, specializations, certifications, location, reviews, availability, CTA) is unchanged; data comes from the DB. `TrainerProfileView` is a client component for tab interactivity.
