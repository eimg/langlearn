# LangLearn

Langlearn is a lightweight language learning app for practicing phrases and object vocabulary with timed quiz cards. It supports multilingual prompts, image-based object learning, and a simple admin flow to add or update content.

Live: https://eimaung.com/langlearn/

## Tech stack

- React + TypeScript
- Vite
- Tailwind CSS
- Supabase (Database + Auth + Storage)
- TanStack Query

## Usage

### 1) Install dependencies

```bash
npm install
```

### 2) Configure Supabase

Create a Supabase project and set up:

- Tables: `phrases`, `objects`
- Storage bucket: `langlearn_public` (public)
- RLS: public read, authenticated write (see policies below)

### 3) Environment variables

Create a `.env` file in the project root:

```
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 4) Run the app

```bash
npm run dev
```

### 5) Optional: seed content

```bash
node scripts/seed.mjs
```

## Supabase policies (recommended)

Enable RLS and add policies for public read and authenticated write:

```sql
-- Phrases table
create policy "Public read phrases"
on public.phrases
for select
to public
using (true);

create policy "Auth insert phrases"
on public.phrases
for insert
to authenticated
with check (true);

create policy "Auth update phrases"
on public.phrases
for update
to authenticated
using (true)
with check (true);

create policy "Auth delete phrases"
on public.phrases
for delete
to authenticated
using (true);

-- Objects table
create policy "Public read objects"
on public.objects
for select
to public
using (true);

create policy "Auth insert objects"
on public.objects
for insert
to authenticated
with check (true);

create policy "Auth update objects"
on public.objects
for update
to authenticated
using (true)
with check (true);

create policy "Auth delete objects"
on public.objects
for delete
to authenticated
using (true);

-- Storage bucket policies
create policy "Public read object images"
on storage.objects
for select
to public
using (bucket_id = 'langlearn_public');

create policy "Auth upload object images"
on storage.objects
for insert
to authenticated
with check (bucket_id = 'langlearn_public');

create policy "Auth update object images"
on storage.objects
for update
to authenticated
using (bucket_id = 'langlearn_public')
with check (bucket_id = 'langlearn_public');

create policy "Auth delete object images"
on storage.objects
for delete
to authenticated
using (bucket_id = 'langlearn_public');
```
