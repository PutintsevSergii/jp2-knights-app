# Local Container Smoke

These Dockerfiles are the Phase 13 local containerization baseline for the API
and Admin Lite Cloud Run services. They build from the repository root, run as
the non-root `node` user, expose port `8080`, and do not bake secret values into
image layers.

Build the images:

```bash
docker build -f infra/docker/api.Dockerfile -t jp2-api:local .
docker build -f infra/docker/admin.Dockerfile -t jp2-admin:local .
```

Run the local compose smoke profile:

```bash
docker compose -f infra/docker/docker-compose.yml --profile app up --build
```

Smoke endpoints:

```bash
curl -fsS http://127.0.0.1:8080/api/health
curl -fsS http://127.0.0.1:8081/admin/dashboard
```

The compose file keeps Redis available only for local Socket.IO compatibility
smoke checks. The pilot and production deployment path remains Firebase RTDB for
silent-prayer aggregate counts and must not provision Redis/Memorystore unless a
future owner-approved scope change reverses that decision.
