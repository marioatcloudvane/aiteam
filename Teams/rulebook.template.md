# Rulebook — <Team or Project Name>

This rulebook is read by scanner skills during the Two-Pass Codebase Tour (Research mode) and at the Implement mode exit gate. Each section maps to one scanner. Rules override generic best practices; omit a section to fall back to generic.

---

## architecture

Rules about structure, layering, module boundaries, and design patterns.

Examples (replace with your own):
- Services must not import directly from other services — communicate via interfaces or events
- Business logic must not live in route handlers or controllers
- All external integrations must be wrapped behind an adapter interface
- New modules must follow the directory structure of existing modules in the same layer

---

## security

Rules about authentication, authorisation, secrets, input validation, and data handling.

Examples:
- No credentials, API keys, or tokens in source files or committed config
- All user input must be validated and sanitised at the system boundary before use
- Authorisation checks must be enforced at the service layer, not only at the route layer
- Sensitive fields (PII, payment data) must not appear in logs

---

## testing

Rules about test isolation, coverage expectations, structure, and tooling.

Examples:
- Unit tests must not touch the database, network, or file system — use mocks at module boundaries
- Every public method on a service class must have at least one unit test
- Test names must describe the behaviour being tested (not the implementation)
- Integration tests must set up and tear down their own data — no shared state between tests
