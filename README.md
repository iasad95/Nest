# NestJS API (portfolio)

Small [NestJS](https://nestjs.com/) API I keep around as a portfolio piece: env validation, Postgres or Mongo, JWT with roles, Swagger, health checks, rate limits, and a Docker-based check you can run the same way CI does.

**Stack:** Node 16 (see [`.nvmrc`](.nvmrc)), Nest 9, TypeScript 4.7, TypeORM 0.3 or Mongoose 6, Jest 28.

## Run it

```bash
npm install
cp env-example-relational .env   # or env-example-document for Mongo
npm run start:dev
```

Defaults: port **3000**, Swagger at [http://localhost:3000/docs](http://localhost:3000/docs), bare health at [http://localhost:3000/](http://localhost:3000/) (`GET /` sits outside the `API_PREFIX`).

## Configuration

Copy [`env-example-relational`](env-example-relational) or [`env-example-document`](env-example-document) to `.env` and change secrets before you seed or deploy anywhere real (`AUTH_JWT_SECRET`, `SEED_USER_PASSWORD`, DB passwords).

| Variable | What it does |
|----------|----------------|
| `NODE_ENV` | `production` turns off Swagger |
| `APP_PORT` | HTTP port |
| `API_PREFIX` | e.g. `api`; root `GET /` stays unprefixed |
| `CORS_ORIGIN` | CORS; `*` is fine locally |
| `SEED_USER_PASSWORD` | Used by seed scripts |
| `AUTH_JWT_SECRET` | JWT signing secret (examples need 32+ chars) |
| `AUTH_JWT_TOKEN_EXPIRES_IN` | e.g. `1d` |

Relational: set `DATABASE_TYPE` and connection fields (optional `DATABASE_URL`, `DATABASE_SYNCHRONIZE`). Document: follow the Mongo fields in the example file.

## Scripts

| Command | |
|---------|--|
| `npm run start:dev` / `start:debug` / `start:prod` | Dev, debug, or production |
| `npm run build` | `dist/` |
| `npm run format` / `npm run lint` | Prettier / ESLint |
| `npm test` / `test:watch` / `test:cov` | Jest |
| `npm run seed:run:relational` / `seed:run:document` | Seeds |
| `npm run migration:*` | TypeORM migrations (relational) |

Seeds read `SEED_USER_PASSWORD` from `.env` (examples use `ChangeMe_BeforeSeeding!`). Seeded logins: `admin@example.com` and `user@example.com`.

## HTTP routes

With `APP_PORT=3000` and `API_PREFIX=api`:

| Route | |
|-------|--|
| `GET /` | Small JSON health |
| `GET /api/v1/health` | Terminus |
| `POST /api/v1/auth/email/login` | Login (tighter rate limit) |
| `GET /api/v1/auth/me` | Bearer JWT |
| `GET/POST /api/v1/users` | List / create — admin |
| `GET /docs` | Swagger when not production |

## Docker

Same compose files as in CI. Relational path runs migrations, then seeds, then starts the app and hits a few endpoints ([`startup.relational.ci.sh`](startup.relational.ci.sh)). Document path is similar without relational migrations ([`startup.document.ci.sh`](startup.document.ci.sh)).

PostgreSQL:

```bash
docker compose -f docker-compose.relational.ci.yaml --env-file env-example-relational up --build --exit-code-from api
```

MongoDB:

```bash
docker compose -f docker-compose.document.ci.yaml --env-file env-example-document up --build --exit-code-from api
```

If you run both on one machine, add `-p ci-relational` or `-p ci-document` like CI does so names don’t clash.

## Layout

```
src/
├── auth/       # JWT login, strategies
├── users/      # REST + persistence (relational or document)
├── health/     # Terminus
├── database/   # data source, migrations, seeds
├── config/
├── roles/
└── common/     # guards, filters, logging, DTOs, middleware
```

Wiring lives in [`src/main.ts`](src/main.ts): prefix, versioning, Swagger, Helmet, pipes.

## Tests and CI

From a clean tree: `npm ci`, then `npm run build`, `npm run lint`, `npm test`. Jest picks up `*.spec.ts` next to sources; shared setup in [`test/setup-tests.ts`](test/setup-tests.ts).

`package.json` asks for Node 16; if you use something newer, `npm` might warn (`EBADENGINE`) unless you turn on `engine-strict`.

GitHub Actions ([`.github/workflows/docker-e2e.yml`](.github/workflows/docker-e2e.yml)) runs on **pull requests** to `main` or `master`: install, build, lint, then Docker compose for relational and document. Pushes alone don’t trigger it.
