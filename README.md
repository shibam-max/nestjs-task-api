# NestJS Task API

A production-style REST API built with **NestJS**, **PostgreSQL** and **TypeORM**, with JWT authentication, per-user data isolation, validation, pagination, Swagger docs, Docker and CI.

## Features

- **Auth:** register and login with bcrypt-hashed passwords and JWT access tokens (Passport JWT strategy).
- **Tasks CRUD:** create, list, view, update and delete tasks, scoped to the logged-in user, so users can never access each other's data.
- **Filtering and pagination:** filter by status and priority, search by title (`ILIKE`), paginated results with totals.
- **Summary endpoint:** task counts per status using a SQL `GROUP BY`.
- **Validation:** DTOs with `class-validator`; unknown fields are rejected.
- **PostgreSQL design:** UUID keys, enum columns, a composite index on `(ownerId, status)`, cascade delete.
- **API docs:** Swagger UI at `/docs`.
- **Health check:** `/api/health` verifies the database connection.
- **Testing:** unit tests for the service layer with Jest and a mocked repository.
- **DevOps:** Dockerfile (multi-stage), docker-compose with PostgreSQL, GitHub Actions CI.

## Tech stack

NestJS 10 · TypeScript · PostgreSQL 16 · TypeORM · Passport JWT · class-validator · Swagger · Jest · Docker

## Run locally

```bash
cp .env.example .env
docker compose up -d db      # start PostgreSQL
npm install
npm run start:dev            # http://localhost:3000/api, docs at http://localhost:3000/docs
```

Or run everything in Docker:

```bash
cp .env.example .env
docker compose up --build
```

## API

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Create an account, returns a JWT |
| POST | `/api/auth/login` | Log in, returns a JWT |
| GET | `/api/tasks?status=&priority=&search=&page=&limit=` | List your tasks |
| GET | `/api/tasks/summary` | Count of tasks per status |
| GET | `/api/tasks/:id` | Get one task |
| POST | `/api/tasks` | Create a task |
| PATCH | `/api/tasks/:id` | Update a task |
| DELETE | `/api/tasks/:id` | Delete a task |
| GET | `/api/health` | Health and database check |

Send the token as `Authorization: Bearer <token>` on task endpoints.

## Tests

```bash
npm test
```

## Notes

`DB_SYNC=true` auto-creates tables for local development. For production, turn it off and use TypeORM migrations.
