# REST API Conventions

## Status and contract authority

This document defines the public API conventions. The starter implements no application routes, OpenAPI file, generated types, or contract tooling. Examples describe intended interfaces, not implemented endpoints or real user records.

Laravel is the runtime authority for validation, business rules, and authorization. OpenAPI is the reviewed description of the public HTTP interface. Tests MUST verify that Laravel's behavior matches that contract, and the frontend MUST consume generated types from it.

See [backend architecture](backend.md), [frontend architecture](frontend.md), and [authentication](authentication.md) for implementation responsibilities. Mandatory standards and recommendations use the terminology defined in [the overview](overview.md).

## API versioning and endpoint naming

- Application endpoints MUST use `/api/v1`.
- `/sanctum/csrf-cookie` is a framework-owned, documented security-bootstrap exception. Do not place a fake alias under `/api/v1`.
- Operational health routes, if later needed, require a documented operational contract; they must not become unversioned business APIs.
- Use resource-oriented plural nouns and lowercase kebab-case path segments for multiword names. Avoid database table internals and arbitrary verb-based CRUD paths.
- Authentication uses the explicitly approved command-like paths `/auth/login`, `/auth/logout`, and the current-identity path `/auth/me`.
- Include parent resources only when the relationship is meaningful and authorized. Avoid deep nesting without a clear need.
- Breaking changes require an explicit compatibility/versioning decision and approval. Do not silently replace v1 behavior or add `/api/v2` preemptively.

Within v1, compatible additive fields can be introduced when consumers tolerate them. Removing fields, changing field types, adding new required request input, altering authorization semantics, or changing error/status behavior can break consumers and must be reviewed as contract changes.

## HTTP method semantics

| Method | Convention |
| --- | --- |
| `GET` / `HEAD` | Safe reads; no business-state mutations |
| `POST` | Create a resource or invoke an explicitly documented operation |
| `PUT` | Full replacement only when that behavior is implemented and documented |
| `PATCH` | Partial update with explicit absent-versus-null behavior |
| `DELETE` | Remove a resource according to its documented lifecycle |
| `OPTIONS` | CORS/preflight handling where applicable; no authenticated business operation |

Do not advertise both `PUT` and `PATCH` with indistinguishable semantics merely for convenience. Automatic mutation retries are prohibited unless a specific endpoint has an approved idempotency contract. No global idempotency-key system is required initially.

## Requests, validation, and naming

JSON is the default request and response representation. The frontend sends `Accept: application/json` and sends JSON content type for JSON bodies. An eventual file-upload contract may use multipart requests and must document its fields and limits; clients must not manually break multipart boundary generation.

Use `snake_case` for public JSON fields and query parameters. OpenAPI defines every field's type, required status, nullability, length/range, and relevant format. A field being optional is different from its value being `null`; partial-update behavior must distinguish them.

Laravel Form Requests validate structural input and accepted fields. Actions enforce business invariants; Policies enforce permissions. Use validated, allowlisted input and reject or safely ignore undocumented fields according to the endpoint's declared policy. Protected fields MUST never be mass assigned from raw payloads.

Normalize only where part of the documented contract. Do not trim or otherwise transform passwords. Zod may provide earlier feedback but is never the authoritative validator.

Identifiers MUST have one documented wire type and remain consistent across requests, responses, and generated types. Prefer strings for large integer IDs that could exceed JavaScript's safe range. An opaque or random identifier does not establish authorization.

Represent timestamps as ISO 8601 values with an explicit timezone, normalized to UTC. Represent date-only values separately, without inventing a timezone. Exact decimal quantities such as money use decimal strings, with units/currency defined by the relevant feature contract.

## Success responses

Use Laravel API Resource conventions. A single-resource response has a `data` object:

```json
{
  "data": {
    "id": "42",
    "name": "Example User"
  }
}
```

These sample fields and identifier type are illustrative; the future user schema must specify its actual approved fields. A non-paginated collection has a `data` array. Paginated collections use `data`, `links`, and `meta`.

Do not add a redundant `success: true` flag, return arbitrary model serialization, or wrap a documented `204` in JSON. An empty collection returns an empty array; a missing single resource returns the documented error.

Use explicit Resources to prevent accidental exposure of newly added model columns. Sensitive identity and authentication representations MUST prevent shared caching. The frontend's in-memory query cache does not override HTTP cache-security requirements.

## Error responses

Application-controlled `/api/v1` errors MUST use a consistent JSON representation and meaningful HTTP status, including failures raised by authentication, authorization, validation, throttling, request-forgery protection, or missing routes.

```json
{
  "message": "The submitted data is invalid.",
  "code": "validation_failed",
  "errors": {
    "profile.email": [
      "The email field must be a valid email address."
    ]
  }
}
```

- `message` is a safe, human-readable summary; clients MUST NOT parse its wording for control flow.
- `code` is a stable `snake_case` machine-readable identifier.
- `errors` is optional and appears only for applicable field validation. Values are arrays of strings keyed by documented dot paths.
- Do not expose stack traces, SQL statements, password hashes, tokens, or internal exception details.
- Preserve relevant headers, including `Retry-After` for throttling.
- Network, proxy, and infrastructure failures may lack this JSON body. The frontend must normalize those failures safely rather than assume every response matches the application contract.

Invalid login credentials use `422` with `code: invalid_credentials` and a generic message. They may include a generic login-field error if documented; do not identify whether the account exists. Structural login validation uses `validation_failed`.

## HTTP status codes

| Status | Meaning and expected handling |
| --- | --- |
| `200 OK` | Successful read, update with representation, or login |
| `201 Created` | Resource created; include the representation and `Location` when meaningful |
| `202 Accepted` | Only for a genuinely asynchronous operation with a documented follow-up contract |
| `204 No Content` | Successful no-body operation, including CSRF bootstrap and logout |
| `400 Bad Request` | Malformed input or a documented invalid request context |
| `401 Unauthorized` | No valid authenticated identity for a protected operation |
| `403 Forbidden` | Authenticated identity lacks permission |
| `404 Not Found` | Missing resource or a consistently documented concealment policy |
| `405 Method Not Allowed` | Path exists but the method is unsupported |
| `409 Conflict` | Documented resource-state or concurrency conflict |
| `415 Unsupported Media Type` | Request representation is unsupported |
| `419` | Laravel CSRF/session token mismatch; explicitly documented nonstandard status |
| `422 Unprocessable Content` | Structural validation or generic invalid credentials |
| `429 Too Many Requests` | Rate limit reached; expose and respect `Retry-After` |
| `500 Internal Server Error` | Unexpected application failure with a safe public message |
| `503 Service Unavailable` | Temporary application/service unavailability when applicable |

Example stable codes include `bad_request`, `unauthenticated`, `forbidden`, `not_found`, `method_not_allowed`, `conflict`, `unsupported_media_type`, `csrf_token_mismatch`, `validation_failed`, `invalid_credentials`, `too_many_requests`, `internal_error`, and `service_unavailable`. Document the exact code and schema for each endpoint response.

Do not implement unused asynchronous or conflict-handling infrastructure just because its status is listed. Do not return a success status for a failed operation or redirect an API error to an HTML login page.

## Pagination, filtering, and sorting

Use page-based pagination initially:

- `page`: positive integer, default `1`.
- `per_page`: positive integer, default `25`, maximum `100`.
- Invalid, out-of-range, or unsupported pagination input returns the validation error contract; do not silently permit unbounded results.
- Every list endpoint defines a stable default ordering with a unique tie-breaker where needed.
- An out-of-range page returns an empty collection with valid pagination metadata unless a different behavior is explicitly justified in the contract.

The response follows this Resource shape:

```json
{
  "data": [],
  "links": {
    "first": "https://api.example.com/api/v1/example-resources?page=1",
    "last": "https://api.example.com/api/v1/example-resources?page=1",
    "prev": null,
    "next": null
  },
  "meta": {
    "current_page": 1,
    "from": null,
    "last_page": 1,
    "path": "https://api.example.com/api/v1/example-resources",
    "per_page": 25,
    "to": null,
    "total": 0
  }
}
```

This is an illustrative subset of the planned Laravel Resource representation, not a real endpoint. The actual OpenAPI schema must cover the chosen serializer output, including additional framework pagination metadata that is retained.

Filters use endpoint-specific names such as `filter[status]`. Sorting uses an allowlisted `sort` parameter, with a leading `-` for descending order and a comma-separated list only where explicitly supported. Document allowable names, defaults, combinations, and parameter encoding in OpenAPI.

Never interpolate client-provided column names or SQL fragments directly. Apply authorization scopes before pagination and totals, so metadata does not disclose inaccessible records. Cursor pagination, arbitrary includes, generic query builders, and unbounded exports require a demonstrated feature need and contract review.

## Authentication and authorization requirements

| Endpoint | Security requirement | Success |
| --- | --- | --- |
| `GET /sanctum/csrf-cookie` | Browser bootstrap; no prior login | `204` |
| `POST /api/v1/auth/login` | First-party session context and request-forgery protection; no prior login | `200` user Resource |
| `GET /api/v1/auth/me` | Session authenticated through `auth:sanctum` | `200` user Resource |
| `POST /api/v1/auth/logout` | Session authenticated through `auth:sanctum` and request-forgery protection | `204` |

Use session cookies and the XSRF header as defined in [authentication](authentication.md). Every protected business operation also requires a Policy or equivalent explicit backend authorization check. Frontend guards and hidden controls do not authorize API access.

No personal-access-token creation endpoint, bearer security scheme, JWT, or refresh-token endpoint is included in the approved SPA baseline.

## OpenAPI 3.1.2 conventions

The planned contract is `docs/api/openapi.yaml`. Create it with the first endpoint. It MUST:

1. Declare `openapi: 3.1.2`, an API information version, and deployment-neutral server configuration.
2. Include all exposed application operations and the unversioned CSRF bootstrap operation. Use full operation paths from the server origin so the bootstrap path is represented correctly.
3. Give each operation a unique, stable `operationId`, meaningful tags, request/response schemas, examples, and documented failure statuses.
4. Define shared Resource, pagination, error, and field-error schemas under `components`, without obscuring endpoint-specific requirements.
5. Define a session security scheme with `type: apiKey`, `in: cookie`, and the actual configured session cookie name. This documents cookie authentication; it does not describe a bearer token or instruct JavaScript to read an HttpOnly cookie.
6. Apply session security to protected operations. Mark public/bootstrap/login operations explicitly as not requiring an existing authenticated session, while describing their CSRF and browser-origin requirements.
7. Document the readable XSRF cookie and `X-XSRF-TOKEN` header and their lifecycle separately from session authentication. A session security declaration alone cannot describe the complete browser handshake.
8. Describe `204` without response content. Document `419` explicitly rather than pretending it is a standard HTTP status.
9. Use OpenAPI 3.1 / JSON Schema nullability forms such as `type: [string, 'null']` where applicable, not the OpenAPI 3.0-only `nullable` convention.
10. Document required fields, explicit nulls, read-only/write-only properties, identifier types, timestamps, decimal strings, pagination, and filter serialization accurately.

Interactive documentation tools may be constrained by browser cookie policies. A tool's inability to execute cookie authentication is not a reason to add token authentication or weaken CSRF.

## Generated TypeScript types

Select and pin a generator supporting OpenAPI 3.1.2 when contract tooling is introduced. `openapi-typescript` is the current recommendation; the requirement is generated TypeScript types, not a mandatory generator.

Generated files belong under `FE/src/shared/api/generated/` and are committed. Feature API functions use those types with Axios. Do not introduce a replacement HTTP client as a side effect of type generation, maintain duplicate handwritten public DTOs, or edit generated output manually.

Generation must be deterministic from the local reviewed contract. Ordinary frontend builds consume committed output and do not require generation, remote schema access, PHP, or a running backend. A separate check regenerates into temporary/in-memory output or a controlled working tree and detects differences without accepting them silently.

TypeScript types are compile-time checks, not runtime validation or evidence that a live server satisfies the contract. Backend contract tests and browser integration tests remain necessary.

## Contract maintenance workflow

For an API change:

1. Review the external behavior and compatibility impact before implementation.
2. Update OpenAPI request/response/security definitions and examples alongside the intended behavior.
3. Implement backend validation, Actions, Policies, Resources, and exception mapping.
4. Test Laravel responses and relevant requests against the same contract, including expected errors.
5. Regenerate frontend types and update affected consumers and fixtures.
6. Run contract validation, generation-drift checks, type checks, and relevant Pest, Vitest, and Playwright coverage.
7. Review the complete change together. Obtain explicit approval for architectural or breaking changes before they are made.

Exact validator, generator, compatibility-check tooling, and scripts remain pending. The starter contains no OpenAPI file, package, CI job, or generated TypeScript file.

## References

- [Architecture overview](overview.md)
- [Backend architecture](backend.md)
- [Frontend architecture](frontend.md)
- [Authentication](authentication.md)
- [Project scope](../scope.md)
- [OpenAPI Specification 3.1.2](https://spec.openapis.org/oas/v3.1.2.html)
- [Laravel API Resources](https://laravel.com/docs/13.x/eloquent-resources)
- [Laravel validation](https://laravel.com/docs/13.x/validation)
- [openapi-typescript documentation](https://openapi-ts.dev/introduction)
