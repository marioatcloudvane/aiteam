---
name: python-platform-constraints
description: Identifies Python/backend-specific constraints relevant to a planned feature. Invoked by python-app-architect during Plan mode's architect review. Returns findings inline as Architecture Notes bullets.
---

# Python / Backend Platform Constraints

Read these constraints against the feature spec. For each constraint, determine whether it applies to the planned feature and produce a bullet for the Architecture Notes section.

## Concurrency Model

- The GIL prevents true thread-level CPU parallelism — threads share one interpreter lock.
- **CPU-bound work** (encoding, parsing, computation) → use `multiprocessing`, a task queue (Celery, RQ), or a separate worker process. Do not use threads.
- **I/O-bound work** (network, database, file) → `asyncio` is the right tool; threads are acceptable but less efficient.
- Never call blocking functions (`requests.get()`, `time.sleep()`, synchronous file I/O) inside an `async def` — it blocks the entire event loop.
- **Flag if:** the feature is CPU-bound → needs a worker queue or separate process, not an async handler.
- **Flag if:** the feature mixes sync and async code paths → needs `run_in_executor` bridge; never nest `asyncio.run()` inside a running loop.

## Database & ORM

- **N+1 queries**: accessing a related object inside a loop is a silent N+1. Always use `select_related()` / `prefetch_related()` (Django) or joined/subquery loads (SQLAlchemy) for related objects.
- **Migration safety**: never add a NOT NULL column without a default to a table that has rows. Sequence: add nullable → backfill → add constraint.
- **Transactions**: wrap any multi-step write in an explicit transaction. Partial writes are worse than failures.
- **Bulk operations**: use `bulk_create()`, `bulk_update()`, or raw SQL for operations touching more than ~100 rows.
- **Flag if:** the feature touches multiple tables in one logical operation → explicit transaction required.
- **Flag if:** the feature adds a new column to an existing table → migration must be safe for a live database.

**N+1 — do this, not that:**
```python
# Wrong — fires one query per project
projects = await session.execute(select(Project))
for p in projects.scalars():
    print(p.owner.name)   # lazy load, N queries

# Correct — one query with join
stmt = select(Project).options(selectinload(Project.owner))
projects = await session.execute(stmt)
```

**Migration safety — safe NOT NULL addition:**
```python
# Step 1: add nullable (deploy this first)
op.add_column("projects", sa.Column("slug", sa.String(), nullable=True))

# Step 2: backfill in a data migration (separate Alembic revision)
op.execute("UPDATE projects SET slug = id::text WHERE slug IS NULL")

# Step 3: add the constraint (deploy after backfill is complete)
op.alter_column("projects", "slug", nullable=False)
```

**Transactions — explicit context manager:**
```python
async with session.begin():
    await repo.save(project)
    await repo.save(audit_log)
# Both committed together or neither — no partial write
```

## Data Validation

- Validate at every system boundary: API request bodies, background job inputs, webhook payloads.
- Use Pydantic models or dataclasses with type annotations — not raw `dict`.
- Never assume data read from the database is already valid — it may predate current validators.
- **Flag if:** the feature accepts external input → a Pydantic schema or equivalent is required at the boundary.

## Async Patterns

- Use `httpx` for HTTP calls in async context; `requests` only in sync code.
- Stream large HTTP responses — do not buffer >~10 MB in memory before processing.
- **Flag if:** the feature fetches from or pushes to an external HTTP service → verify the HTTP client is appropriate for the execution context.

**Blocking call in async context — do this, not that:**
```python
# Wrong — blocks the entire event loop
async def get_data():
    response = requests.get("https://api.example.com/data")  # sync!

# Correct — non-blocking
async def get_data():
    async with httpx.AsyncClient() as client:
        response = await client.get("https://api.example.com/data")

# Correct — reuse a shared client (inject via Depends, don't create per-call)
async def get_data(client: httpx.AsyncClient = Depends(get_http_client)):
    response = await client.get("https://api.example.com/data")
```

**Parallel independent calls — use gather, not sequential await:**
```python
# Slow — sequential even though calls are independent
user = await user_repo.get_by_id(user_id)
tenant = await tenant_repo.get_by_id(tenant_id)

# Fast — fires both concurrently
user, tenant = await asyncio.gather(
    user_repo.get_by_id(user_id),
    tenant_repo.get_by_id(tenant_id),
)
```

## Deployment Target

Confirm which deployment target applies before flagging constraints:

| Target | Key constraints |
|--------|----------------|
| AWS Lambda / serverless | 15-min max execution; 512 MB–10 GB RAM (configured); no persistent disk; cold-start latency on first invocation |
| Container (ECS, Cloud Run, K8s) | Horizontal scaling; shared filesystem only via mounted volume; init time matters for startup |
| VM / bare metal | Least constrained; watch file descriptor and connection pool limits at scale |

- **Flag if:** the feature's workload (duration, memory, disk) exceeds the deployment target's limits.
- **Flag if:** the feature requires state between invocations on a serverless target → needs external storage (DB, cache, S3).

## Type Safety

- All public function signatures must have type hints — no bare `def f(x, y)`.
- Use `TypedDict`, Pydantic models, or dataclasses for structured dictionaries — not raw `dict[str, Any]`.
- **Flag if:** the feature introduces a new public API surface → full type annotation required.

**Typed dict vs raw dict — do this, not that:**
```python
# Wrong — opaque, no validation, no IDE help
def process(data: dict) -> dict:
    return {"id": data["id"], "name": data["name"]}

# Correct — Pydantic at boundaries
class ProjectInput(BaseModel):
    id: UUID
    name: str

class ProjectOutput(BaseModel):
    id: UUID
    name: str

def process(data: ProjectInput) -> ProjectOutput:
    return ProjectOutput(id=data.id, name=data.name)
```

## Dependency Management

- Pin all new dependencies with exact or minimum-compatible versions in `requirements.txt` / `pyproject.toml`.
- Evaluate every new package for: licence compatibility, maintenance status (last commit, open issues), and known CVEs.
- Avoid top-level imports of expensive modules if they are only needed on specific code paths — lazy-import instead.
- **Flag if:** the feature requires a new third-party package → must be evaluated before the plan is confirmed.

## Output

For each constraint that applies, add to the plan's Architecture Notes:

```
Platform: <constraint summary> — <specific implication for this feature>
```

For constraints that do not apply:

```
Platform: <constraint> — not applicable (<one-word reason>)
```
