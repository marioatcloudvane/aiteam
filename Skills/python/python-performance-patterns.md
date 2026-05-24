---
name: python-performance-patterns
description: Performance anti-patterns and their correct alternatives for Python SaaS backends. Read by the code reviewer during Phase 1.5. Each pattern includes a BLOCKING or ADVISORY classification and the exact code shape to look for.
---

# Python Performance Patterns

Use this document to identify performance problems in committed code. Each section describes the anti-pattern, its severity, how to spot it, and the correct alternative.

---

## N+1 Queries — ADVISORY

**What it is:** One query to fetch a list, then one query per item to fetch a related object. At 100 rows this fires 101 queries; at 1,000 rows it fires 1,001.

**How to spot it:** A loop body that accesses a relationship attribute without it having been eagerly loaded.

```python
# Anti-pattern — N+1
projects = await session.execute(select(Project))
for project in projects.scalars():
    print(project.owner.name)  # triggers a new SELECT per project
```

**Correct — eager load at query time:**
```python
stmt = select(Project).options(selectinload(Project.owner))
projects = await session.execute(stmt)
for project in projects.scalars():
    print(project.owner.name)  # already loaded, no extra query
```

**When to use `joinedload` vs `selectinload`:**
- `selectinload` — one additional `SELECT ... WHERE id IN (...)` query. Best for to-many relationships.
- `joinedload` — SQL JOIN, fetches everything in one query. Best for to-one relationships, avoid for to-many (row multiplication).

**Flag trigger:** Any `for` or `async for` loop body that accesses `instance.relationship_attr` where the relationship is not in an `.options(selectinload(...))` or `.options(joinedload(...))` on the driving query.

---

## Sequential Awaits on Independent Sources — ADVISORY

**What it is:** Two or more `await` calls that do not depend on each other run one after another, wasting wall-clock time equal to the sum of their latencies.

**How to spot it:** Multiple `await` statements in sequence where the second does not use the result of the first.

```python
# Anti-pattern — sequential, ~200ms total if each takes 100ms
user = await user_repo.get_by_id(user_id)
tenant = await tenant_repo.get_by_id(tenant_id)
```

**Correct — concurrent with `asyncio.gather`:**
```python
user, tenant = await asyncio.gather(
    user_repo.get_by_id(user_id),
    tenant_repo.get_by_id(tenant_id),
)
# ~100ms total — both run at the same time
```

**Flag trigger:** Two or more consecutive `await expr` lines where `expr` calls do not share arguments or use each other's results. Applies to repo calls, HTTP calls, and cache lookups.

**Exception:** Do not flag sequential awaits that are inside a transaction and must execute in order for correctness.

---

## Sync Call Inside Async Handler — BLOCKING

**What it is:** A synchronous blocking call inside an `async def` function stalls the entire asyncio event loop for its duration. No other requests can be handled while it runs.

**How to spot it:** Any of the following inside an `async def`:

```python
# All BLOCKING — stall the event loop
requests.get(url)           # sync HTTP
time.sleep(n)               # sync sleep
open(path).read()           # sync file I/O (large files)
subprocess.run(cmd)         # sync subprocess
```

**Correct — use async equivalents:**
```python
# Async HTTP
async with httpx.AsyncClient() as client:
    response = await client.get(url)

# Async sleep
await asyncio.sleep(n)

# Async file I/O (if unavoidable)
import aiofiles
async with aiofiles.open(path) as f:
    content = await f.read()

# CPU-bound work — offload to thread pool
result = await asyncio.get_event_loop().run_in_executor(None, blocking_fn, arg)
```

**Flag trigger:** Any call to `requests.*`, `urllib.*`, `time.sleep`, synchronous `open()` for large reads, or `subprocess.run` / `os.system` inside an `async def`. Flag as BLOCKING — this is an event-loop correctness issue, not just performance.

---

## Per-Request HTTP Client Creation — ADVISORY

**What it is:** Creating a new `httpx.AsyncClient()` (or `aiohttp.ClientSession`) per request bypasses connection pooling. Each request pays TCP + TLS handshake overhead. At scale this exhausts file descriptors.

**How to spot it:**

```python
# Anti-pattern — new client per call
async def call_payment_api(data: dict) -> dict:
    async with httpx.AsyncClient() as client:  # new pool every time
        response = await client.post(PAYMENT_URL, json=data)
```

**Correct — shared client injected via Depends:**
```python
# In core/http_client.py
_client: httpx.AsyncClient | None = None

async def get_http_client() -> httpx.AsyncClient:
    global _client
    if _client is None:
        _client = httpx.AsyncClient(timeout=10.0)
    return _client

# In route / service
async def call_payment_api(
    data: dict,
    client: httpx.AsyncClient = Depends(get_http_client),
) -> dict:
    response = await client.post(PAYMENT_URL, json=data)
```

**Flag trigger:** `httpx.AsyncClient()` or `aiohttp.ClientSession()` constructed inside a service method or route handler body (not injected via Depends or passed as parameter).

---

## Missing Bulk Operation — ADVISORY

**What it is:** Inserting or updating records one at a time in a loop fires one SQL statement per row. For >~20 rows this becomes a significant bottleneck.

**How to spot it:**

```python
# Anti-pattern — one INSERT per iteration
for item in items:
    await session.execute(insert(Project).values(**item.dict()))
```

**Correct — bulk insert:**
```python
# SQLAlchemy bulk insert — one statement
await session.execute(insert(Project), [item.dict() for item in items])
await session.commit()
```

**Flag trigger:** An `await session.execute(insert(...).values(...))` or `await repo.save(...)` call inside a `for` loop over a collection. Flag as ADVISORY when the collection could plausibly be >20 items.

---

## Unindexed Filter Column — ADVISORY

**What it is:** Filtering or ordering by a column with no database index causes a full table scan. Not a code bug, but worth flagging when a new query shape is introduced.

**How to spot it:** A repository method that filters by a column other than `id` or `tenant_id`, where no migration adds an index for that column.

**Flag trigger:** A `.where(Model.status == ...)` or `.order_by(Model.created_at)` on a column that is not the primary key or foreign key, and no corresponding `op.create_index(...)` appears in the migration files for this feature.

**Note:** This is informational — the architect or migration author must confirm whether an index exists. Do not mark BLOCKING based on code alone.
