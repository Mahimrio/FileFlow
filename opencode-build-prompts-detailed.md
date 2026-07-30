# OpenCode Build Prompts — Detailed Edition (for DeepSeek / smaller models)

This is the elaborated version of `opencode-build-prompts.md`, with every ambiguity removed: exact file paths, exact package names, exact commands, exact data shapes. Smaller/flash models do better with explicit, numbered instructions than with high-level descriptions — this trades brevity for precision.

## How to use this with a smaller model

1. Smaller models often don't carry context between sessions the way a larger model would in one long chat. Before **every single prompt**, paste the **Project Context Block** below first, then the numbered prompt.
2. Update the `CURRENT STATE` line in the context block each time you move to a new prompt — tell it what's already built so it doesn't try to redo or guess at earlier work.
3. If OpenCode's output drifts from the spec (wrong file path, wrong package, extra unrequested features), stop it and re-paste the relevant "Task" steps rather than letting it improvise — improvisation is where smaller models go wrong.
4. Do prompts in order. Each one names the exact files the previous ones created.

---

## Project Context Block (paste before every prompt)

```
PROJECT: Universal File Converter — a web app that converts between document,
spreadsheet, slide, and image formats (Phase 1 scope only). Similar to
CloudConvert, with a premium, non-templated UI.

MONOREPO STRUCTURE:
- apps/web        Next.js 14+ (App Router, TypeScript, Tailwind, shadcn/ui).
                   Deployed to Vercel.
- apps/worker     Node.js + TypeScript background service that runs the
                   actual file conversions. Deployed as a Docker container
                   to Railway or Fly.io.
- packages/shared TypeScript types and constants shared between web and
                   worker (job payloads, format definitions, queue name).

INFRASTRUCTURE:
- Database: PostgreSQL via Prisma. Connection string in DATABASE_URL.
- File storage: Cloudflare R2 (S3-compatible API, via @aws-sdk/client-s3).
- Queue: Redis + BullMQ. Connection string in REDIS_URL.
- Conversion engines: LibreOffice headless (documents/spreadsheets/slides),
  sharp (images).

CONVENTIONS:
- TypeScript strict mode everywhere. Never use `any` without a comment
  explaining why.
- Package manager: npm with npm workspaces. Do not use yarn or pnpm.
- Branch naming: type/kebab-case-description (feat/, fix/, chore/, ci/, test/)
- Commit style: Conventional Commits (feat:, fix:, chore:, ci:, test:)
- Only build what the current prompt asks for. Do not scaffold Phase 2+
  formats (vectors, audio, video, RAW images) yet — those come later.
- Every new environment variable must be added to the relevant app's
  .env.example file with a one-line comment explaining what it's for.
- Do not invent new folders/files outside the paths given in the prompt.
  If unsure where something goes, ask rather than guessing.

CURRENT STATE: [REPLACE THIS EACH TIME — e.g. "Prompts 1-4 complete. apps/web
has Next.js + Tailwind + shadcn/ui + a Prisma schema with the ConversionJob
model. apps/worker is an empty TypeScript scaffold with no logic yet.
packages/shared only exports an empty index.ts so far."]
```

---

## Quick Reference

| # | Branch | Focus |
|---|---|---|
| 1 | `chore/project-scaffold` | Monorepo setup |
| 2 | `feat/design-system` | Tailwind + shadcn/ui + fonts |
| 3 | `feat/landing-page` | Marketing landing page |
| 4 | `feat/database-schema` | Prisma + Postgres |
| 5 | `feat/object-storage` | Cloudflare R2 integration |
| 6 | `feat/upload-dropzone` | Drag-and-drop upload UI |
| 7 | `feat/format-picker` | Searchable format picker |
| 8 | `feat/jobs-api` | Job creation API + validation |
| 9 | `feat/queue-setup` | BullMQ + Redis |
| 10 | `feat/worker-document-conversion` | LibreOffice pipeline |
| 11 | `feat/worker-image-conversion` | sharp pipeline |
| 12 | `feat/realtime-status` | SSE live status |
| 13 | `feat/download-flow` | Download UI |
| 14 | `feat/cleanup-cron` | Scheduled file deletion |
| 15 | `feat/error-handling-retries` | Retry policy + friendly errors |
| 16 | `chore/testing-setup` | Vitest + Playwright |
| 17 | `chore/ci-pipeline` | GitHub Actions CI |
| 18 | `chore/vercel-deployment` | Vercel deploy (web) |
| 19 | `chore/worker-deployment` | Railway/Fly deploy (worker) |
| 20 | `chore/launch-readiness` | Monitoring + QA pass |

---

## Prompt 1 — Monorepo Scaffold

**Branch:** `chore/project-scaffold`

**Task (numbered steps for OpenCode):**
1. At the repo root, create `package.json` with `"private": true` and `"workspaces": ["apps/*", "packages/*"]`.
2. Install Turborepo at the root: `npm install turbo --save-dev`.
3. Create `turbo.json` at the root defining tasks: `dev` (persistent, no cache), `build` (depends on `^build`, caches `.next/**` and `dist/**`), `lint`, `typecheck`.
4. Scaffold `apps/web` by running: `npx create-next-app@latest apps/web --typescript --tailwind --eslint --app --no-src-dir --import-alias "@/*"` non-interactively, accepting all defaults.
5. Scaffold `apps/worker` manually (no CLI exists for this):
   - `apps/worker/package.json` with `"name": "worker"`, `"type": "module"`, scripts: `"dev": "tsx watch src/index.ts"`, `"build": "tsc"`.
   - `apps/worker/tsconfig.json` with `"target": "ES2022"`, `"module": "NodeNext"`, `"moduleResolution": "NodeNext"`, `"strict": true`, `"outDir": "dist"`.
   - `apps/worker/src/index.ts` containing just `console.log("worker started");` as a placeholder.
   - Install dev dependencies in `apps/worker`: `typescript`, `tsx`, `@types/node`.
6. Scaffold `packages/shared`:
   - `packages/shared/package.json` with `"name": "@repo/shared"`, `"main": "src/index.ts"`, `"types": "src/index.ts"`.
   - `packages/shared/tsconfig.json` matching the worker's settings.
   - `packages/shared/src/index.ts` with a single placeholder export: `export const SHARED_PACKAGE_VERSION = "0.0.1";`.
7. Create a root `.gitignore` including: `node_modules`, `.next`, `.turbo`, `dist`, `.env`, `.env.local`, `.DS_Store`.
8. Create `apps/web/.env.example` and `apps/worker/.env.example`. Each line is `VAR_NAME=` followed by a `#` comment on the line above explaining what it's for. Include: `DATABASE_URL`, `REDIS_URL`, `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME`. Add `NEXT_PUBLIC_APP_URL`, `CRON_SECRET`, `SENTRY_DSN` to `apps/web/.env.example` only.
9. Write a root `README.md`: project name as H1, one-paragraph description, a "Getting Started" section with `npm install` then `npm run dev`.
10. Root `package.json` scripts: `"dev": "turbo run dev"`, `"build": "turbo run build"`, `"lint": "turbo run lint"`, `"typecheck": "turbo run typecheck"`.

**Constraints:** No UI components, no database, no business logic in this prompt — scaffolding only. Do not run `npx create-turbo` (it pulls an unwanted template).

**You provide manually:**
- Create the GitHub repository and push the initial scaffold.
- Decide the project name and, optionally, a domain name.

**Commit message:** `chore: scaffold turborepo monorepo with web and worker apps`

**Checklist:**
- [ ] `npm run dev` starts the Next.js app locally without errors
- [ ] `cd apps/worker && npm run build` compiles cleanly
- [ ] `.env.example` exists in both apps with all listed variables and comments
- [ ] `npm run lint` and `npm run typecheck` run clean at the root

---

## Prompt 2 — Design System Foundation

**Branch:** `feat/design-system`

**Task:**
1. In `apps/web`, run `npx shadcn@latest init` non-interactively (choose: TypeScript yes, style "New York" or default, base color "neutral", CSS variables yes).
2. Add these initial components: `npx shadcn@latest add button input command dialog sonner badge`.
3. Open `apps/web/app/globals.css`. Replace the default shadcn CSS variable values (the `:root` and `.dark` blocks) with a custom palette: pick 2–3 brand HSL colors plus a neutral scale — do **not** leave the default shadcn purple/gray values in place. If no brand colors were given to you, propose a palette and list the exact HSL values you chose in your response so they can be reviewed.
4. Set up two Google Fonts (or similar) via `next/font/google` in `apps/web/app/layout.tsx`: one display/heading font, one body sans font. Expose them as CSS variables (e.g. `--font-heading`, `--font-body`) and wire them into `tailwind.config.ts` under `theme.extend.fontFamily`.
5. Install `next-themes`: `npm install next-themes` in `apps/web`. Create `apps/web/components/theme-provider.tsx` wrapping `next-themes`'s `ThemeProvider`, and wrap the app in `apps/web/app/layout.tsx` with it (`attribute="class"`, `defaultTheme="system"`).
6. Add a theme toggle component at `apps/web/components/theme-toggle.tsx` using the shadcn `button` (sun/moon icon swap, `lucide-react` icons — install it if not present).
7. Build a base layout shell: `apps/web/components/layout/header.tsx` (logo placeholder + theme toggle) and `apps/web/components/layout/footer.tsx` (basic links), both used in `apps/web/app/layout.tsx`.
8. Create `apps/web/app/style-guide/page.tsx` rendering: all color swatches (labeled), the full type scale (h1–h6, body, small), and every variant of `Button`, `Input`, and `Badge`.

**Constraints:** Don't build the landing page yet — that's the next prompt. This prompt is design tokens and the `/style-guide` reference page only.

**You provide manually:**
- Final brand colors (hex or HSL) and font names, if you want specific values rather than reviewing OpenCode's proposal.

**Commit message:** `feat(ui): add design system foundation with tailwind and shadcn/ui`

**Checklist:**
- [ ] `/style-guide` renders correctly with the real (not default shadcn) palette
- [ ] Dark mode toggle switches the whole shell instantly, no flash of wrong theme
- [ ] Both fonts load correctly (check the Network tab for font file requests)
- [ ] No default shadcn indigo/violet/gray theme values remain anywhere in `globals.css`

---

## Prompt 3 — Landing Page

**Branch:** `feat/landing-page`

**Task:**
1. Create `apps/web/components/marketing/hero.tsx`: full-width hero with an H1 headline, a one-sentence subheadline, and a visually prominent (but non-functional for now) drop-zone-styled CTA box with placeholder text "Drag & drop a file, or click to browse."
2. Create `apps/web/components/marketing/formats-grid.tsx`: a section titled "Supported formats" showing the 7 categories (Documents, Images, Video, Audio, Spreadsheets, Slides, Vectors) as cards, each listing 4–6 example extensions as small badges (e.g. Documents: PDF, DOCX, ODT, RTF, TXT, HTML).
3. Create `apps/web/components/marketing/how-it-works.tsx`: a 3-step horizontal (stacking on mobile) section: "1. Upload your file" / "2. Choose a format" / "3. Download the result," each with a small icon from `lucide-react`.
4. Update `apps/web/components/layout/footer.tsx` (created in Prompt 2) to add a privacy note: "Files are automatically deleted 24 hours after conversion. We don't read, share, or store your content beyond that."
5. Assemble all of the above into `apps/web/app/page.tsx` in order: Hero → FormatsGrid → HowItWorks.
6. Confirm every section is responsive at 375px (mobile), 768px (tablet), and 1440px (desktop) widths using Tailwind's responsive prefixes.

**Constraints:** No backend logic, no working upload, no API calls in this prompt. Everything is static UI.

**You provide manually:**
- Final headline/subheadline copy, if you want specific wording instead of agent-drafted placeholder text.

**Commit message:** `feat(web): build landing page with hero, formats section, and how-it-works`

**Checklist:**
- [ ] Responsive at 375px, 768px, and 1440px with no horizontal scroll or overlap
- [ ] All 7 format categories present with correct example badges
- [ ] Copy reviewed and approved
- [ ] Lighthouse accessibility score checked (target 90+)

---

## Prompt 4 — Database Schema

**Branch:** `feat/database-schema`

**Task:**
1. In `apps/web`, install: `npm install prisma --save-dev` and `npm install @prisma/client`.
2. Run `npx prisma init --datasource-provider postgresql` to create `apps/web/prisma/schema.prisma` and add `DATABASE_URL` to `.env` (it should already be listed in `.env.example` from Prompt 1).
3. Replace the contents of `schema.prisma`'s model section with exactly this model:
   ```prisma
   enum JobStatus {
     PENDING
     PROCESSING
     COMPLETED
     FAILED
   }

   model ConversionJob {
     id                String    @id @default(cuid())
     sourceFileName    String
     sourceFormat      String
     targetFormat      String
     storageKeySource  String
     storageKeyResult  String?
     status            JobStatus @default(PENDING)
     errorMessage      String?
     createdAt         DateTime  @default(now())
     updatedAt         DateTime  @updatedAt
     expiresAt         DateTime
   }
   ```
4. Run `npx prisma migrate dev --name init` to create the initial migration and apply it.
5. Create `apps/web/prisma/seed.ts` inserting 2–3 sample `ConversionJob` rows with varied statuses, for local UI testing. Wire it up via the `"prisma": { "seed": "tsx prisma/seed.ts" }` field in `package.json` (install `tsx` as a dev dependency if not already present).
6. Create `apps/web/lib/db.ts` exporting a Prisma client singleton using the standard Next.js hot-reload-safe pattern (attach to `globalThis` in development to avoid exhausting connections).

**Constraints:** Do not add a `User` model or any auth-related fields — out of scope for now. Do not add fields beyond the ones listed above.

**You provide manually:**
- Provision a Postgres database (Neon, Supabase, or Railway all have usable free tiers) and put the connection string in `apps/web/.env` as `DATABASE_URL`.

**Commit message:** `feat(db): add prisma schema for conversion jobs`

**Checklist:**
- [ ] `npx prisma migrate dev` runs cleanly against your database
- [ ] `ConversionJob` table is visible via `npx prisma studio`
- [ ] `npx prisma db seed` inserts the sample rows without error
- [ ] `DATABASE_URL` is set locally and is **not** committed to git (confirm `.env` is in `.gitignore`)

---

## Prompt 5 — Object Storage Integration

**Branch:** `feat/object-storage`

**Task:**
1. In `apps/web`, install: `npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner`.
2. Create `apps/web/lib/storage.ts` exporting an S3 client configured for R2 (endpoint `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`, region `"auto"`, credentials from `R2_ACCESS_KEY_ID`/`R2_SECRET_ACCESS_KEY`), plus three functions:
   - `generateUploadPresignedUrl(fileName: string, contentType: string): Promise<{ url: string; key: string }>` — generates a unique storage key (e.g. `uploads/${cuid()}-${fileName}`) and returns a presigned `PUT` URL valid for 10 minutes.
   - `generateDownloadPresignedUrl(storageKey: string, expiresInSeconds = 3600): Promise<string>` — presigned `GET` URL.
   - `deleteObject(storageKey: string): Promise<void>`.
3. Create `apps/web/app/api/upload-url/route.ts` — `POST` handler. Request body: `{ fileName: string, contentType: string }`. Response: `{ uploadUrl: string, storageKey: string }`. Return `400` if `fileName` or `contentType` is missing.
4. Create `apps/web/app/api/download-url/[jobId]/route.ts` — `GET` handler. Looks up the `ConversionJob` by `id`, returns `404` if not found or if `status !== "COMPLETED"`. Otherwise returns `{ downloadUrl: string, fileName: string }`.

**Constraints:** Do not build any frontend UI in this prompt — API routes and the storage lib only. Do not hardcode credentials anywhere; only read them from `process.env`.

**You provide manually:**
- Create a Cloudflare R2 bucket and an API token (Access Key ID + Secret Access Key).
- Add `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME` to `apps/web/.env`.
- In the Cloudflare dashboard, set the bucket's CORS policy to allow `PUT` from `http://localhost:3000` (and later your production domain). Ask OpenCode to output the exact CORS JSON to paste in — this can't be done from the repo.

**Commit message:** `feat(storage): add R2 presigned upload/download url generation`

**Checklist:**
- [ ] `curl -X PUT <presigned-url> --data-binary @testfile.txt` successfully uploads a file
- [ ] A presigned download URL correctly serves that file back in a browser
- [ ] R2 bucket CORS is configured for `localhost:3000`
- [ ] No storage credentials appear anywhere in git history (`git log -p | grep R2_` should return nothing)

---

## Prompt 6 — Upload UI

**Branch:** `feat/upload-dropzone`

**Task:**
1. In `apps/web`, install: `npm install react-dropzone framer-motion`.
2. Create `apps/web/components/upload/dropzone.tsx`. Define a local type `type UploadState = "idle" | "hover" | "dragging" | "uploading" | "success" | "error"`.
3. Use `react-dropzone`'s `useDropzone` hook. On `onDrop`:
   - Call `POST /api/upload-url` with `{ fileName, contentType }` from the selected file.
   - Upload the file directly to the returned `uploadUrl` using `XMLHttpRequest` (not `fetch`) so you can track `upload.onprogress` and update a progress percentage in state — this is required, a fake/simulated progress bar is not acceptable.
   - On successful upload, call `POST /api/jobs` with `{ sourceFileName, sourceFormat, storageKeySource }` (stub this fetch call for now with a `// TODO: /api/jobs not built until Prompt 8` comment and a temporary mocked response if that route doesn't exist yet).
4. Render distinct visual states for each value of `UploadState` using Framer Motion `AnimatePresence` for smooth transitions between them: idle (dashed border, upload icon), hover/dragging (border color change, slight scale), uploading (progress bar + percentage text), success (checkmark + file name), error (red border + retry button).
5. Replace the placeholder CTA box in `apps/web/components/marketing/hero.tsx` (from Prompt 3) with this real `Dropzone` component.

**Constraints:** Single-file upload only — no multi-file/batch support yet. Do not build the format picker in this prompt (next prompt).

**You provide manually:**
- Visually review the interaction states and timing; adjust animation durations to taste.

**Commit message:** `feat(web): add drag-and-drop upload component with real progress`

**Checklist:**
- [ ] Drag-over state changes immediately and visibly on hover
- [ ] Progress bar shows a real, increasing percentage on a 20MB+ test file (not jumping straight to 100%)
- [ ] Disabling your network mid-upload shows the error state with a working retry button
- [ ] The uploaded file appears in the R2 bucket (check the Cloudflare dashboard) after a successful upload

---

## Prompt 7 — Format Picker

**Branch:** `feat/format-picker`

**Task:**
1. Create `packages/shared/src/formats.ts` exporting:
   ```typescript
   export type FormatCategory =
     | "documents" | "images" | "spreadsheets" | "slides"
     | "vectors" | "video" | "audio";

   export interface FormatDefinition {
     id: string;          // e.g. "pdf"
     label: string;       // e.g. "PDF"
     category: FormatCategory;
     phase1: boolean;      // true if live in Phase 1
   }

   export const FORMATS: FormatDefinition[] = [ /* populate with every
     format from the project plan, grouped by category. Set phase1: true
     for documents, spreadsheets, slides, and common images (png, jpg,
     jpeg, webp, gif, bmp, tiff). Set phase1: false for everything else. */ ];
   ```
2. Export `FORMATS` from `packages/shared/src/index.ts`.
3. In `apps/web`, install `cmdk` if not already pulled in by shadcn's `command` component, then run `npx shadcn@latest add command` if not already added.
4. Create `apps/web/components/upload/format-picker.tsx`: a `Command` palette listing all `FORMATS` grouped by `category` (use `CommandGroup` per category) with a search input at top. Formats where `phase1: false` render disabled with a "Coming soon" badge next to them.
5. Accept a `sourceCategory: FormatCategory` prop — when provided, only show target formats from the **same** category as valid options (documents convert to other documents, etc.); other categories are hidden entirely, not just disabled.
6. Wire the `FormatPicker` into the upload flow: once `Dropzone` reaches the `"success"` state, show `FormatPicker` below it.

**Constraints:** Only documents, spreadsheets, slides, and common images should be selectable (`phase1: true`). Do not enable cross-category conversion (e.g. docx → jpg) — out of scope.

**You provide manually:**
- Confirm the exact Phase 1 format list is correct before merging — review the generated `formats.ts` file line by line.

**Commit message:** `feat(web): add searchable grouped format picker`

**Checklist:**
- [ ] Typing in the search box filters results in real time
- [ ] Only `phase1: true` formats in the matching category are clickable
- [ ] Non-Phase-1 formats show a visible "Coming soon" badge and are not selectable
- [ ] Fully keyboard-navigable (arrow keys to move, Enter to select, Escape to close)

---

## Prompt 8 — Job Creation API + Validation

**Branch:** `feat/jobs-api`

**Task:**
1. Create `apps/web/app/api/jobs/route.ts` — `POST` handler:
   - Request body: `{ sourceFileName: string, sourceFormat: string, targetFormat: string, storageKeySource: string }`.
   - Validate `sourceFormat` and `targetFormat` are both in `FORMATS` (from `@repo/shared`), are the same `category`, and both have `phase1: true`. Return `400` with `{ error: "..." }` if not.
   - Create a `ConversionJob` row with `status: "PENDING"` and `expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)`.
   - Return `201` with `{ jobId: string }`.
2. Create `apps/web/app/api/jobs/[id]/route.ts` — `GET` handler returning `{ id, status, errorMessage, sourceFileName, createdAt }` for the given job, `404` if not found.
3. Install `file-type`: `npm install file-type`. Before creating the job record, download the first few KB of the uploaded object from R2 (or accept the file buffer if still available) and run `fileTypeFromBuffer` to confirm the actual file signature matches `sourceFormat`'s expected MIME type. Reject with `400` if it doesn't match (this catches renamed/spoofed extensions).
4. Install `@upstash/ratelimit` and `@upstash/redis`. Create `apps/web/lib/rate-limit.ts` exporting a `Ratelimit` instance (sliding window, 10 requests per hour per IP) used inside the `POST /api/jobs` handler, keyed by the request's IP (from `headers().get("x-forwarded-for")`). If Upstash env vars are absent (local dev), fall back to a simple in-memory `Map`-based limiter with the same interface.

**Constraints:** Do not implement the queue/worker trigger yet — that's Prompt 9. This prompt only creates and reads job records.

**You provide manually:**
- Decide the exact rate limit number if 10/hour isn't right for you.
- Provision Upstash Redis (separate from your BullMQ Redis, or the same instance — your call) and add `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` to `.env` and `.env.example`.

**Commit message:** `feat(api): add job creation and status endpoints with validation and rate limiting`

**Checklist:**
- [ ] `POST /api/jobs` with mismatched-category formats (e.g. docx → png) returns `400`
- [ ] Uploading a `.txt` file renamed to `.pdf` is rejected by the magic-byte check
- [ ] Making 11 requests within an hour from the same IP triggers a `429` on the 11th
- [ ] `GET /api/jobs/[id]` returns the correct fields and status

---

## Prompt 9 — Redis Queue Setup

**Branch:** `feat/queue-setup`

**Task:**
1. Install `bullmq` and `ioredis` in **both** `apps/web` and `apps/worker`.
2. Create `packages/shared/src/queue.ts`:
   ```typescript
   export const CONVERSION_QUEUE_NAME = "conversions";

   export interface ConversionJobPayload {
     jobId: string;
     storageKeySource: string;
     sourceFormat: string;
     targetFormat: string;
   }
   ```
   Export it from `packages/shared/src/index.ts`.
3. Create `apps/web/lib/queue-producer.ts` exporting a `Queue` instance (from `bullmq`) named `CONVERSION_QUEUE_NAME`, connected via `REDIS_URL`.
4. In `apps/web/app/api/jobs/route.ts` (from Prompt 8), after successfully creating the `ConversionJob` row, call `queue.add("convert", payload)` with the `ConversionJobPayload` shape.
5. In `apps/worker/src/index.ts`, replace the placeholder `console.log` with a `Worker` instance (from `bullmq`) listening on `CONVERSION_QUEUE_NAME`, connected via `REDIS_URL`. For now, its processor function just does `console.log("received job", job.data)` — actual conversion logic comes in Prompts 10–11.

**Constraints:** No conversion logic yet in this prompt — just prove the message gets from web to worker.

**You provide manually:**
- Provision a Redis instance (Upstash Redis, or a self-hosted Redis on Railway) and add `REDIS_URL` to both apps' `.env` files.

**Commit message:** `feat(queue): wire up bullmq producer in web and shared job types`

**Checklist:**
- [ ] Creating a job via `POST /api/jobs` results in the worker's console logging the job data within ~1 second
- [ ] The job is visible in Redis while pending (check with `redis-cli LRANGE` or a Bull Board UI)
- [ ] Shared `ConversionJobPayload` type is imported (not duplicated) in both apps
- [ ] Restarting the worker mid-queue doesn't lose pending jobs (BullMQ persists them in Redis)

---

## Prompt 10 — Worker: Document Conversion

**Branch:** `feat/worker-document-conversion`

**Task:**
1. In `apps/worker`, create `src/converters/document.ts` exporting `async function convertDocument(inputPath: string, targetFormat: string, outputDir: string): Promise<string>` (returns the output file path). Implementation:
   - Spawn `soffice --headless --convert-to <targetFormat> --outdir <outputDir> <inputPath>` using Node's `child_process.execFile` (not `exec`, to avoid shell injection).
   - Kill the process and throw a timeout error if it runs longer than 120 seconds.
   - Parse `soffice`'s stdout/stderr to detect failure even on exit code 0 (LibreOffice sometimes exits 0 but fails silently) — throw if the expected output file doesn't exist afterward.
2. Create `src/converters/index.ts` exporting `convertFile(job: ConversionJobPayload): Promise<{ outputPath: string }>` that routes to `convertDocument` when the format category is `documents`, `spreadsheets`, or `slides` (look this up via `FORMATS` from `@repo/shared`). Throw a clear "unsupported category" error otherwise (image support lands in Prompt 11).
3. Update the `Worker` processor in `src/index.ts` to, for each job:
   1. Download the source file from R2 to a temp dir (`os.tmpdir()`).
   2. Call `convertFile(job.data)`.
   3. Upload the result back to R2 under a new key (`results/${job.data.jobId}-<targetFormat filename>`).
   4. Update the `ConversionJob` row (`status: "COMPLETED"`, `storageKeyResult`) via a Prisma client in the worker (install `@prisma/client` and `prisma` in `apps/worker` too, pointing at the same `DATABASE_URL`).
   5. On any error, set `status: "FAILED"`, `errorMessage: <error message, no stack trace>`.
   6. Delete all temp files in a `finally` block regardless of success/failure.
4. Create `apps/worker/Dockerfile`:
   ```dockerfile
   FROM node:20-bookworm-slim
   RUN apt-get update && apt-get install -y libreoffice --no-install-recommends && rm -rf /var/lib/apt/lists/*
   WORKDIR /app
   COPY package*.json ./
   RUN npm install
   COPY . .
   RUN npm run build
   CMD ["node", "dist/index.js"]
   ```

**Constraints:** Do not implement image conversion in this prompt (next prompt). Do not skip the timeout — LibreOffice can hang indefinitely on malformed input.

**You provide manually:**
- Have Docker installed locally to build and test the container: `docker build -t worker-test apps/worker`.

**Commit message:** `feat(worker): implement libreoffice-based document conversion pipeline`

**Checklist:**
- [ ] `docker build -t worker-test apps/worker` succeeds
- [ ] A test `.docx → .pdf` job goes from `PENDING` to `COMPLETED` end-to-end locally
- [ ] A deliberately corrupt input file results in `status: "FAILED"` with a readable `errorMessage`, no crash
- [ ] Running 5 conversions in a row leaves no leftover files in the temp directory afterward

---

## Prompt 11 — Worker: Image Conversion

**Branch:** `feat/worker-image-conversion`

**Task:**
1. Install `sharp` in `apps/worker`.
2. Create `apps/worker/src/converters/image.ts` exporting `async function convertImage(inputPath: string, targetFormat: string, outputPath: string): Promise<string>`. Use `sharp(inputPath).toFormat(targetFormat, { quality: 85 })` (quality option only applies to lossy formats — ignore it for png/bmp/tiff) `.toFile(outputPath)`.
3. Update `apps/worker/src/converters/index.ts`'s `convertFile` router to call `convertImage` when the format category is `images`, alongside the existing `convertDocument` branch from Prompt 10.
4. Handle HEIC specifically: `sharp` needs `libheif` support — verify it works in the Docker image (Debian's `libvips` build usually includes it; if not, note it in your response and we'll add the system package).

**Constraints:** Only the Phase 1 image formats (png, jpg, jpeg, webp, gif, bmp, tiff) — do not add RAW format support (cr2, nef, etc.) yet.

**You provide manually:**
- Nothing beyond spot-checking output quality on a couple of test images.

**Commit message:** `feat(worker): add sharp-based image conversion pipeline`

**Checklist:**
- [ ] PNG → WebP produces a visually correct, appropriately sized file
- [ ] HEIC → JPG works using a real photo exported from an iPhone
- [ ] The router in `converters/index.ts` correctly sends image jobs to `convertImage` and document jobs to `convertDocument`
- [ ] A 20MB+ image doesn't crash or hang the worker process

---

## Prompt 12 — Real-Time Job Status

**Branch:** `feat/realtime-status`

**Task:**
1. Create `apps/web/app/api/jobs/[id]/stream/route.ts` — a `GET` handler returning a `ReadableStream` with `Content-Type: text/event-stream`. Poll the `ConversionJob` row every 1 second server-side and write an SSE event (`data: ${JSON.stringify({ status, errorMessage })}\n\n`) whenever the status changes. Close the stream once status is `COMPLETED` or `FAILED`.
2. Create `apps/web/hooks/use-job-status.ts`: a React hook `useJobStatus(jobId: string | null)` that opens an `EventSource` to the stream route, updates local state on each message, and closes the connection on unmount or terminal status. If the `EventSource` errors (e.g. blocked by a proxy), fall back to `setInterval`-based polling of `GET /api/jobs/[id]` every 3 seconds instead.
3. Wire `useJobStatus` into the upload flow component so the UI reflects `PENDING → PROCESSING → COMPLETED/FAILED` live, without a page refresh.

**Constraints:** Don't build the final download card UI yet (Prompt 13) — just get status updates flowing correctly, shown as simple text/spinner for now.

**You provide manually:**
- Nothing.

**Commit message:** `feat(web): add sse-based live job status updates with polling fallback`

**Checklist:**
- [ ] Status text updates in the UI within ~1 second of the worker changing the job's status in the DB
- [ ] Opening browser dev tools shows the `EventSource` connection closing cleanly after a terminal status (not left hanging)
- [ ] Manually breaking the SSE connection (e.g. via dev tools network throttling/blocking) triggers the polling fallback correctly

---

## Prompt 13 — Download Flow

**Branch:** `feat/download-flow`

**Task:**
1. Create `apps/web/components/upload/download-card.tsx`. Props: `jobId: string`, `fileName: string`. On mount, once the parent confirms `status === "COMPLETED"` (via the hook from Prompt 12), fetch `GET /api/download-url/[jobId]` and render: file name, a formatted file size (fetch via a `HEAD` request to the download URL or store size at upload time — your choice, document which), and a "Download" button that opens the presigned URL (`window.location.href = downloadUrl` or an `<a download>` tag).
2. Add a visible expiry notice: "This file will be deleted in 24 hours."
3. Add a "Convert another file" button that resets all local state (uploaded file, job id, format selection) back to the initial `Dropzone` view.
4. Replace the placeholder status text from Prompt 12 with: `Dropzone` (idle/uploading) → `FormatPicker` (once uploaded) → processing spinner (`PENDING`/`PROCESSING`) → `DownloadCard` (`COMPLETED`) → error message with retry (`FAILED`).

**Constraints:** Nothing beyond wiring the existing pieces together into one coherent flow — no new backend endpoints in this prompt.

**You provide manually:**
- Nothing.

**Commit message:** `feat(web): add download flow with presigned urls and expiry messaging`

**Checklist:**
- [ ] Clicking "Download" correctly downloads the converted file with the right file name
- [ ] Displayed file size roughly matches the actual downloaded file's size
- [ ] Expiry messaging is visible and states "24 hours" accurately
- [ ] "Convert another file" fully resets state — no leftover job ID or stale format selection

---

## Prompt 14 — Scheduled Cleanup

**Branch:** `feat/cleanup-cron`

**Task:**
1. Create `apps/web/app/api/cron/cleanup/route.ts` — `GET` handler:
   - Reject with `401` unless the request header `Authorization: Bearer <CRON_SECRET>` matches `process.env.CRON_SECRET`.
   - Query all `ConversionJob` rows where `expiresAt < now()`.
   - For each: call `deleteObject` (from `lib/storage.ts`) on both `storageKeySource` and `storageKeyResult` (skip if the key is null), then delete the DB row.
   - Return `{ deletedCount: number }`.
2. Create `apps/web/vercel.json`:
   ```json
   {
     "crons": [
       { "path": "/api/cron/cleanup", "schedule": "0 * * * *" }
     ]
   }
   ```
3. Update `apps/web/.env.example` to confirm `CRON_SECRET` is listed (it should already be there from Prompt 1).

**Constraints:** Vercel Cron requests already include an internal auth mechanism, but implement the `CRON_SECRET` header check anyway so the route is safe to call from an external cron service too if needed.

**You provide manually:**
- Enable Vercel Cron on your project (requires Vercel Pro) — or, on the Hobby plan, use an external service like cron-job.org to call the route hourly with the `Authorization: Bearer <CRON_SECRET>` header.
- Set `CRON_SECRET` in both Vercel's environment variables and (if using an external service) that service's request headers.

**Commit message:** `feat(cleanup): add scheduled job to purge expired files and records`

**Checklist:**
- [ ] Manually setting a test job's `expiresAt` to the past, then calling the route with the correct secret, deletes it from R2
- [ ] The corresponding DB row is removed after cleanup runs
- [ ] Calling the route without the correct `Authorization` header returns `401`
- [ ] The cron is confirmed firing on schedule (Vercel dashboard "Cron Jobs" tab, or your external service's logs)

---

## Prompt 15 — Error Handling & Retries

**Branch:** `feat/error-handling-retries`

**Task:**
1. In `apps/web/lib/queue-producer.ts`, update the `queue.add()` call to include job options: `{ attempts: 3, backoff: { type: "exponential", delay: 5000 } }`.
2. In `apps/worker/src/index.ts`'s processor, distinguish error types:
   - Define a custom `class PermanentConversionError extends Error {}` for unsupported formats or corrupt input (detected via LibreOffice/sharp throwing a clear parse error).
   - If a `PermanentConversionError` is caught, immediately set `status: "FAILED"` and do **not** let BullMQ retry (throw a special marker, or catch it and resolve the job successfully with a "failed" outcome recorded in the DB instead of re-throwing, so BullMQ doesn't retry it).
   - For any other error (network timeout talking to R2, etc.), re-throw so BullMQ's retry policy from step 1 kicks in. Only mark `status: "FAILED"` in the DB after all 3 attempts are exhausted (use BullMQ's `"failed"` event listener on the `Worker` for this, checking `job.attemptsMade >= job.opts.attempts`).
3. In `apps/web`, create `apps/web/components/error-boundary.tsx` (a client component using React's error boundary pattern) wrapping the main upload flow in `app/page.tsx`. On catch, show a friendly message: "Something went wrong. Please refresh and try again." — never render `error.message` or `error.stack` directly to the user.
4. Create `apps/web/lib/error-messages.ts` mapping known API error codes/strings to friendly copy (e.g. `"FORMAT_MISMATCH"` → "That file doesn't match the format you selected.").

**Constraints:** Never expose a raw stack trace or internal error message to the end user in the UI, only in server logs.

**You provide manually:**
- Nothing.

**Commit message:** `fix(worker): add retry policy and distinguish transient vs permanent failures`

**Checklist:**
- [ ] Simulating a network failure (e.g. temporarily wrong R2 credentials) triggers 3 retries with increasing delay before `FAILED`
- [ ] A corrupt file fails immediately with no retries (check the worker logs for attempt count = 1)
- [ ] The frontend never shows a raw error message or stack trace, only friendly copy
- [ ] Throwing a test error inside the upload flow component is caught by the error boundary instead of crashing the whole page

---

## Prompt 16 — Testing Suite

**Branch:** `chore/testing-setup`

**Task:**
1. Install `vitest` as a dev dependency in `apps/web`, `apps/worker`, and `packages/shared`. Add a `test` script to each: `"test": "vitest run"`.
2. Write unit tests:
   - `packages/shared/src/formats.test.ts`: assert every `FormatDefinition` has a non-empty `id`/`label`, and that category groupings are internally consistent.
   - `apps/web/app/api/jobs/route.test.ts` (or wherever makes sense given the route's structure): test the format-matching validation logic in isolation (extract it into a pure function first if it isn't already, e.g. `lib/validate-conversion.ts`, so it's testable without spinning up the full Next.js request handler).
   - `apps/worker/src/converters/index.test.ts`: test that the router picks the correct converter function for a given format category (mock `convertDocument`/`convertImage`).
3. Install Playwright in `apps/web`: `npm init playwright@latest` (choose TypeScript, tests in `apps/web/e2e/`).
4. Create `apps/web/test-fixtures/` with a small sample `.docx` and `.png` file (a few KB each).
5. Write `apps/web/e2e/critical-path.spec.ts`: navigate to the homepage, upload `test-fixtures/sample.docx`, select PDF as the target format, wait for the download card to appear (with a generous timeout, e.g. 30s, since real conversion takes time), click download, and assert the downloaded file exists and has a non-zero size.

**Constraints:** Don't try to mock the entire conversion pipeline for the E2E test — it should exercise the real upload → queue → worker → download path against a local dev environment.

**You provide manually:**
- Confirm the sample test files in `test-fixtures/` are appropriate (small, real, not corrupted).

**Commit message:** `test: add unit tests and e2e critical-path test`

**Checklist:**
- [ ] `npm run test` passes across all three packages
- [ ] `npx playwright test` passes the critical-path test locally with the full stack running
- [ ] Test fixtures are committed to git and correctly referenced by path
- [ ] Playwright config runs headless by default (`headless: true`)

---

## Prompt 17 — CI Pipeline (GitHub Actions)

**Branch:** `chore/ci-pipeline`

**Task:**
1. Create `.github/workflows/ci.yml` triggered on `pull_request` and `push` to `main`.
2. Job `lint-typecheck-test`: checkout, setup Node 20, `npm ci` at root, run `npm run lint`, `npm run typecheck`, `npm run test` (turbo will fan these out to each app/package), then `npm run build` for `apps/web` and `apps/worker` to confirm both compile.
3. Job `docker-build-worker` (runs in parallel, doesn't depend on job 1): checkout, build the `apps/worker` Docker image with `docker build -t worker-ci-check apps/worker` — build only, no push, just confirming the Dockerfile still works.
4. Add `DATABASE_URL` as a required secret referenced in the workflow (point it at a throwaway test database — document this in a comment in the YAML).
5. Ensure the workflow fails (non-zero exit) if any step fails, and that GitHub shows clear per-step status in the PR checks UI.

**Constraints:** Don't add deployment steps yet (Prompts 18–19 handle that separately).

**You provide manually:**
- In GitHub repo Settings → Branches, add a branch protection rule on `main` requiring the CI workflow's checks to pass before merging.
- Add `DATABASE_URL` (and any other secrets the tests need) under Settings → Secrets and variables → Actions.

**Commit message:** `ci: add github actions pipeline for lint, typecheck, test, and build`

**Checklist:**
- [ ] CI runs automatically on a test PR and shows both jobs
- [ ] All steps (lint/typecheck/test/build/docker-build) pass
- [ ] Branch protection blocks merging when CI fails (test this by intentionally breaking a lint rule in a throwaway PR)
- [ ] No secrets show as blank/`undefined` in the Actions log

---

## Prompt 18 — CD: Vercel Deployment (Web)

**Branch:** `chore/vercel-deployment`

**Task:**
1. Confirm `apps/web/vercel.json` (from Prompt 14) is correctly picked up when the Vercel project root directory is set to `apps/web`.
2. Write `DEPLOYMENT.md` at the repo root documenting: every environment variable needed in production (pulled from both `.env.example` files), the exact Vercel project settings (root directory `apps/web`, framework preset "Next.js", build command left as default since Turborepo handles it, or explicitly `cd ../.. && turbo run build --filter=web` if the monorepo needs it spelled out), and a note that preview deployments happen automatically per-PR.
3. Confirm `next.config.js`/`next.config.mjs` in `apps/web` has no settings that assume a non-Vercel host (e.g. no hardcoded `output: "standalone"` unless intentional).

**Constraints:** This prompt is configuration and documentation — the actual account/project connection is a manual dashboard step (see below).

**You provide manually:**
- Connect the GitHub repo to a new Vercel project; set root directory to `apps/web` in Project Settings → General.
- Add all production environment variables in the Vercel dashboard: `DATABASE_URL`, `REDIS_URL`, `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME`, `CRON_SECRET`, `NEXT_PUBLIC_APP_URL`, `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`.
- Connect a custom domain if you have one, and update your DNS records as Vercel instructs.

**Commit message:** `chore: configure vercel deployment for monorepo web app`

**Checklist:**
- [ ] A test PR produces a working preview deployment URL
- [ ] Merging to `main` produces a working production deployment
- [ ] All environment variables are present and correctly named in the Vercel dashboard (no typos — a mismatched var name fails silently)
- [ ] Custom domain (if used) resolves correctly over HTTPS with a valid certificate

---

## Prompt 19 — CD: Worker Deployment (Railway/Fly.io)

**Branch:** `chore/worker-deployment`

**Task:**
1. Add `apps/worker/src/health.ts` exporting a tiny HTTP server (using Node's built-in `http` module, no framework needed) listening on `process.env.PORT || 8080`, responding `200 OK` with `{ status: "ok", redisConnected: boolean }` at `GET /health`. Start this alongside the BullMQ `Worker` in `src/index.ts` (they can run in the same process).
2. Optimize `apps/worker/Dockerfile` into a multi-stage build: a `builder` stage that installs all dependencies and runs `npm run build`, then a final stage that copies only `dist/`, `node_modules` (production-only, via `npm ci --omit=dev`), and `package.json` — plus the `apt-get install libreoffice` step — to keep the final image smaller.
3. If using Railway: add `apps/worker/railway.json` with `{ "build": { "builder": "DOCKERFILE" }, "deploy": { "restartPolicyType": "ON_FAILURE", "restartPolicyMaxRetries": 5 } }`. If using Fly.io instead: create `apps/worker/fly.toml` with an equivalent restart policy and the health check pointed at `/health`.
4. Add a `deploy-worker` job to `.github/workflows/ci.yml` (or a new `deploy.yml`), triggered on push to `main` only, running after CI passes, that triggers a Railway/Fly deployment via their CLI (`railway up` or `flyctl deploy`), authenticated with a token from a GitHub Actions secret.

**Constraints:** Pick one platform (Railway or Fly.io) and be consistent — don't half-configure both.

**You provide manually:**
- Create a Railway (or Fly.io) account and project for the worker.
- Generate a deploy token/API key and add it as a GitHub Actions secret (`RAILWAY_TOKEN` or `FLY_API_TOKEN`).
- Set the same environment variables (`DATABASE_URL`, `REDIS_URL`, `R2_*`) in the Railway/Fly project's environment settings.

**Commit message:** `chore: add worker deployment pipeline for railway/fly.io`

**Checklist:**
- [ ] The worker container deploys successfully and the process stays running (not crash-looping)
- [ ] `GET /health` on the deployed worker returns `200` with `redisConnected: true`
- [ ] A real conversion job, created against the production web app, processes correctly using the deployed worker
- [ ] Manually killing the worker process causes it to auto-restart per the restart policy

---

## Prompt 20 — Monitoring, Final QA & Launch Readiness

**Branch:** `chore/launch-readiness`

**Task:**
1. Install `@sentry/nextjs` in `apps/web`: run `npx @sentry/wizard@latest -i nextjs` (or configure manually if the wizard isn't usable non-interactively — create `sentry.client.config.ts`, `sentry.server.config.ts`, `sentry.edge.config.ts` reading `SENTRY_DSN` from env).
2. Install `@sentry/node` in `apps/worker` and initialize it at the top of `src/index.ts`, wrapping the BullMQ processor in a try/catch that reports uncaught errors to Sentry before the existing error-handling logic from Prompt 15 runs.
3. Add structured logging in the worker: replace ad-hoc `console.log` calls in the conversion pipeline with a small logger (`console.log(JSON.stringify({ level, jobId, step, message, timestamp }))` is sufficient — no need for a full logging library) so each conversion step (download start, conversion start, conversion done, upload start, upload done) is traceable.
4. Add `apps/web/app/api/health/route.ts` — `GET` handler returning `200` with `{ status: "ok", dbConnected: boolean }` (do a trivial `SELECT 1` via Prisma to confirm DB connectivity).
5. Manually (as OpenCode, working through this systematically) test every Phase 1 source→target combination: for each of documents, spreadsheets, slides, and images, convert at least one file to every valid target format in that category. Log any failure — file name, source format, target format, error message — as a row in a new `LAUNCH_ISSUES.md` at the repo root.
6. Finish `README.md`: full local setup instructions (clone, `npm install`, env vars needed, `npx prisma migrate dev`, `npm run dev`), a short architecture overview paragraph, and a link to `DEPLOYMENT.md`.

**Constraints:** Don't silently skip a failing format combination — every failure must be logged in `LAUNCH_ISSUES.md`, even ones you plan to ship with as a known limitation.

**You provide manually:**
- Create a Sentry account and project; add `SENTRY_DSN` to both apps' environment variables (locally and in Vercel/Railway).
- Manually test the live production site end-to-end on both a desktop and a mobile browser.
- Review `LAUNCH_ISSUES.md` and decide which issues block launch versus ship as documented known limitations.

**Commit message:** `chore: add monitoring, complete phase 1 qa pass, finalize docs`

**Checklist:**
- [ ] Sentry receives a test error correctly from both `apps/web` and `apps/worker`
- [ ] Every Phase 1 format combination has been tested at least once, with results logged
- [ ] `LAUNCH_ISSUES.md` reviewed and each item triaged (fix now / known limitation)
- [ ] `README.md` and `DEPLOYMENT.md` are accurate enough that a new developer could set the project up from scratch using only them
- [ ] Production site manually verified end-to-end on both desktop and mobile

---

## After Prompt 20

Phase 1 is live with CI/CD, monitoring, and cleanup in place. Vectors, audio, video, and RAW image support (Phases 2–5) each follow the same pattern as Prompts 10–11: one prompt per new converter module in `apps/worker/src/converters/`, one prompt for the corresponding format-picker/UI updates, one prompt for expanded QA in `LAUNCH_ISSUES.md`. Use this same level of explicit, numbered detail for each — it's what made these 20 prompts work reliably with a smaller model.
