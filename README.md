# FlyQM API

FastAPI service for FlyQM authentication, flight search, bookings, pricing, and airline data.

## Product repository

This service is also maintained as the [`api`](https://github.com/Khant26/flyqm/tree/api) branch of the combined [FlyQM repository](https://github.com/Khant26/flyqm). The original repository is preserved.

Quick links:
- API documentation: [docs/API.md](docs/API.md)
- API examples: [docs/EXAMPLES.md](docs/EXAMPLES.md)
- Backend service: `backend/`
- Docker compose: `infra/docker-compose.yml`

Getting started (recommended: Docker Compose)

1. Copy the environment example and edit values:

```bash
cp .env.example .env
# edit .env to set SECRET_KEY, TICKET_API_KEY, etc.
```

2. Start the stack (from `infra/`):

```bash
cd infra
docker-compose up --build
```

This starts the `backend` service on port `8000` and a Postgres database on `5433`.

Local development (without Docker)

1. Create a Python virtual environment and install requirements:

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r backend/requirements.txt
```

2. Create a `.env` file (see `.env.example`) and ensure your `DATABASE_URL` points to a running Postgres instance.

3. Run the backend:

```bash
uvicorn app.main:app --reload --port 8000 --app-dir backend
```

API docs are available as Markdown and OpenAPI artifacts in `docs/`. The running service also exposes interactive documentation at `/docs`.

## Verification

Run the isolated unit suite without PostgreSQL or external API access:

```bash
PYTHONPATH=backend DATABASE_URL=sqlite:///./test.db SECRET_KEY=test TICKET_API_KEY=test python -m unittest discover -s backend/tests -v
```

The suite covers authentication security, schema validation, JWT handling, and the one-way/round-trip pricing engine. GitHub Actions also compiles the Python source and runs these tests on pushes and pull requests.
