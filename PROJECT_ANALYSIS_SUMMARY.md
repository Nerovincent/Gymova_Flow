# GymovaFlow — Project Analysis Summary

## 1. All Pages & Routes

- `/` — Public landing page
- `/login` — User sign-in
- `/signup` — User registration + trainer application
- `/trainers` — Browse trainers list
- `/trainers/[id]` — Individual trainer profile
- `/booking/[id]` — 3-step booking flow
- `/map` — Trainer location map
- `/ai-coach` — AI chat assistant
- `/messages` — Client–trainer messaging
- `/dashboard` — Client dashboard home
- `/dashboard/bookings` — Client booking history
- `/dashboard/profile` — Client profile settings
- `/dashboard/trainer` — Redirect helper for trainer role
- `/trainer` — Trainer dashboard home
- `/trainer/availability` — Trainer weekly schedule editor
- `/trainer/sessions` — Trainer session list
- `/admin/login` — Admin sign-in (cookie-based)
- `/admin` — Admin dashboard
- `/admin/applications` — Trainer application review
- `/admin/users` — User management
- `/admin/trainers` — Trainer management
- `/supabase-test` — Dev connectivity diagnostic

---

## 2. All Components Implemented

**Global:** AuthProvider, Providers, ThemeProvider

**Inline (inside pages):** Navbar, HeroSection, FeaturesSection, TestimonialsSection, CTASection, Footer, FilterSidebar, TrainerCard, TrainerProfileView, BookingPage, ConversationItem, MessageBubble, MapMarker, TrainerListCard, BookingCard, Sidebar/TopNav for dashboard and trainer and admin layouts.

**UI library:** 55+ shadcn/ui components in components/ui/

---

## 3. Trainer-Related UI

- TrainerCard, FilterSidebar (trainers list) — trainers table connected, filters UI-only
- TrainerProfileView — connected to trainers table
- Trainer dashboard/sessions — UI only, hardcoded data
- Trainer availability — connected to trainer_availability table
- Admin trainers page — UI only, mock data

---

## 4. Booking-Related UI

- BookingPage (3-step flow) — UI only, no DB write
- Booking sidebar in trainer profile — links only, no DB
- Dashboard bookings page and BookingCard — UI only, mock data

---

## 5. Dashboard Pages

- Client dashboard home — mock data
- Client bookings — mock data
- Client profile — connected (profiles table)
- Trainer dashboard/sessions — mock data
- Trainer availability — connected (trainer_availability)
- Admin home — mock data
- Admin applications — connected (trainer_applications, profiles)
- Admin users/trainers — mock data

---

## 6. Authentication

- User auth: Supabase (AuthProvider, login, signup, signOut). Protection is client-side in layouts.
- Trainer status: lib/trainerAuth.ts (getIsApprovedTrainer, getTrainerStatus) using profiles table.
- Admin auth: cookie-based in app/admin/actions.ts; middleware protects /admin/* only.

---

## 7. Supabase Integrations

- Working: Auth, profiles, trainer_applications (submit + admin review), trainers list/profile, trainer_availability.
- Not used yet: bookings, messages, reviews, gym_locations, trainer_locations, client_goals.

---

## 8. API Routes & Server Actions

- No route.ts API routes.
- Only server code: app/admin/actions.ts (adminLogin, adminLogout) and middleware.ts (admin cookie check).

---

## 9. UI-Only (Not Connected to DB)

- Booking flow — no INSERT into bookings
- Dashboard home (client and trainer) — all hardcoded
- Dashboard bookings — no bookings table query
- Messages — no messages table
- Map — no gym_locations/trainer_locations
- AI Coach — setTimeout mock, no real API
- Admin users/trainers — no DB queries
- Trainer profile reviews tab — no reviews table

---

## Summary

**Already implemented:** Auth, trainer application + admin review, client profile, trainer availability, trainers list and profile (from DB).

**UI only:** Booking flow, dashboard stats/sessions, messages, map, reviews, AI responses, admin users/trainers panels.

**Missing backend:** Create/read bookings, messages CRUD, reviews CRUD, location data, client_goals, real AI integration.

**Tables UI expects but doesn’t use yet:** bookings, messages, reviews, gym_locations, trainer_locations, client_goals.

**Note:** trainer_availability in code uses JSONB by user_id; migration has relational rows — needs alignment.
