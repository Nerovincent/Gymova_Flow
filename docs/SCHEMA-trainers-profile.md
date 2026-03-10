# Trainers table schema (list + profile)

Used by `app/trainers/page.tsx` (list) and `app/trainers/[id]/page.tsx` (profile).

## Columns

| Column             | Type        | Used by  | Notes |
|--------------------|-------------|----------|--------|
| `id`               | int or uuid | list, profile | Primary key; links use `/trainers/[id]`. |
| `name`             | text        | list, profile | |
| `specialty`        | text        | list, profile | |
| `rating`           | numeric     | list, profile | e.g. 4.9 |
| `reviews`          | int         | list, profile | Count of reviews |
| `price`            | numeric     | list, profile | Per session |
| `location`         | text        | list, profile | |
| `distance`         | text        | list, profile | e.g. "0.8 miles" |
| `specializations`  | text[] or jsonb | list, profile | Array of strings |
| `bio`              | text        | profile | Nullable; fallback to empty string |
| `certifications`   | text[] or jsonb | profile | Array of strings; nullable |
| `experience`       | text        | profile | e.g. "8+ years"; nullable |
| `clients_helped`   | int         | profile | Nullable; fallback to 0 |
| `availability`     | jsonb       | profile | Object: `{ "monday": ["9:00 AM", ...], "tuesday": [...], ... }`. Keys: monday–sunday; values: array of time strings. Nullable. |
| `reviews_list`     | jsonb       | profile | Array of `{ "id": number, "name": string, "rating": number, "date": string, "comment": string }`. Nullable. |

If `bio`, `certifications`, `experience`, `clients_helped`, `availability`, or `reviews_list` are missing in the DB, add them via Supabase Table Editor or run:

```sql
-- Optional: add profile columns to existing trainers table
ALTER TABLE trainers
  ADD COLUMN IF NOT EXISTS bio text,
  ADD COLUMN IF NOT EXISTS certifications jsonb DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS experience text,
  ADD COLUMN IF NOT EXISTS clients_helped int DEFAULT 0,
  ADD COLUMN IF NOT EXISTS availability jsonb DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS reviews_list jsonb DEFAULT '[]';
```

(Use `text[]` for `certifications` if you prefer; the app accepts array or jsonb.)
