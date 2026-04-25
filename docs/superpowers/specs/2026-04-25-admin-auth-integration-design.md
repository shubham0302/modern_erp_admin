# Admin Auth & Backend Integration — Design

**Date:** 2026-04-25
**Status:** Approved (pending spec review)
**Scope:** First backend integration for `modern_erp_admin`. Establishes the HTTP client, auth flow (login, profile validation, token refresh, logout), and route protection that all future feature integrations will build on.

## Goals

1. Wire the admin app to the backend at `http://localhost:4000/api/v1` (via env var).
2. Implement admin login at `POST /admin/login`, persist tokens, route to dashboard.
3. Validate session on app load via `GET /admin/profile`.
4. Auto-refresh the access token on `401 TOKEN_EXPIRED` via `POST /admin/refresh`, queueing concurrent failed requests so refresh runs only once.
5. Force logout (clear tokens, redirect to `/login`) when refresh itself fails with `401`, or any non-`TOKEN_EXPIRED` `401` arrives.
6. Wire the existing "Log out" button to clear local state and call `POST /admin/logout`.
7. Replace hardcoded admin info in `AdminHeader` with the real authenticated admin.

## Non-Goals

- No `@tanstack/react-query` yet. Plain axios calls per feature for now.
- No "remember me" / extended session.
- No password reset / forgot password.
- No multi-tab logout synchronization (e.g. `BroadcastChannel`).
- No CSRF handling (bearer tokens, not cookies).
- No backend changes.

## Stack Decisions

| Decision | Choice | Reason |
|---|---|---|
| HTTP client | `axios` | Built-in interceptors make refresh-on-401 significantly cleaner than fetch. |
| Token storage | `localStorage` for both `accessToken` and `refreshToken` | Standard for internal admin tools; matches the JSON-token response shape; survives reload. Acceptable XSS posture for v1. |
| State management | `zustand` (already installed) | Used for `admin` object and `status`. Tokens themselves do **not** live in the store — they live in `localStorage` (single source of truth). |
| Login route | `/login` at the top level (NOT under `_app`) | Avoids rendering `AdminHeader` on the login screen. |
| Route protection | TanStack Router `beforeLoad` guards on `_app` and `/login` | Single place to enforce auth; integrates with router's redirect/search-param flow. |
| Startup UX | Full-screen spinner while `/admin/profile` validates | Deterministic — no flash of authenticated UI. Runs once per session. |

## File Layout

```
.env                                    VITE_API_BASE_URL=http://localhost:4000/api/v1
.env.example                            committed template

src/lib/api/client.ts                   Axios instance + request/response interceptors
src/lib/api/endpoints.ts                Endpoint path constants
src/lib/api/types.ts                    ApiSuccess<T>, ApiError, error code constants

src/features/auth/api.ts                login(), logout(), refresh(), fetchProfile()
src/features/auth/store.ts              Zustand auth store (admin, status)
src/features/auth/storage.ts            localStorage helpers (get/set/clear tokens)
src/features/auth/types.ts              Admin, LoginRequest, LoginResponse, RefreshResponse
src/features/auth/LoginPage.tsx         Login form UI

src/routes/login.tsx                    /login route (standalone)
src/routes/_app.tsx                     UPDATED: beforeLoad guard + profile bootstrap
src/components/layout/AdminHeader.tsx   UPDATED: read admin from store, wire Log out
src/vite-env.d.ts                       UPDATED: typed VITE_API_BASE_URL
```

## API Surface

### `POST /admin/login`

Request: `{ email: string; password: string }`
Response: `{ success: true; data: { accessToken, refreshToken, expiresIn, admin } }`

### `GET /admin/profile`

Headers: `Authorization: Bearer <accessToken>`
Response: `{ success: true; data: { admin } }`
Used: on app startup to validate the session.

### `POST /admin/refresh`

Request: `{ refreshToken: string }`
Response: `{ success: true; data: { accessToken, refreshToken, expiresIn } }`
Headers: NO `Authorization` header sent. Triggered automatically by the response interceptor on `401 TOKEN_EXPIRED`.

### `POST /admin/logout`

Headers: `Authorization: Bearer <accessToken>`
Body: none.
Fire-and-forget; failures are silently ignored because the user is already logged out locally.

> **Assumption:** `/admin/logout` takes no body. If the backend expects `{ refreshToken }` to blacklist it, this assumption needs to be revised.

### Error envelope (all endpoints)

```ts
{
  success: false,
  error: {
    statusCode: number,
    errorCode: string,        // e.g. "TOKEN_EXPIRED", "INVALID_CREDENTIALS"
    message: string,
    requestId: string,
    path: string,
  }
}
```

## Component & Module Design

### `src/lib/api/types.ts`

```ts
export type ApiSuccess<T> = { success: true; data: T };
export type ApiError = {
  success: false;
  error: {
    statusCode: number;
    errorCode: string;
    message: string;
    requestId: string;
    path: string;
  };
};

export const ERROR_CODES = {
  TOKEN_EXPIRED: "TOKEN_EXPIRED",
} as const;
```

### `src/lib/api/client.ts`

A single `axios` instance, exported as `apiClient`.

- `baseURL: import.meta.env.VITE_API_BASE_URL`
- `headers: { 'Content-Type': 'application/json' }`

**Request interceptor:** if `getAccessToken()` returns a value, set `Authorization: Bearer <token>`. Skipped if the request already has an explicit `Authorization` header (so `/admin/refresh` can opt out).

**Response interceptor:**

- On success: pass through.
- On error:
  - If status !== 401 → reject as-is.
  - If status === 401 and `error.response.data.error.errorCode !== 'TOKEN_EXPIRED'` → force logout (see "Force logout" below), reject.
  - If status === 401, `errorCode === 'TOKEN_EXPIRED'`, and the request URL is `/admin/refresh` or `/admin/login` → force logout, reject (defensive, prevents loops).
  - Otherwise → enter the **refresh-and-queue** flow.

**Refresh-and-queue flow** (module-level state in `client.ts`):

```ts
let refreshPromise: Promise<string> | null = null;
const pendingQueue: Array<{
  resolve: (token: string) => void;
  reject: (err: unknown) => void;
}> = [];
```

- If `refreshPromise` is `null`: assign it to a new `POST /admin/refresh` call (using a *bare* axios call without our interceptor's auth header, to avoid sending the expired access token).
- The current failed request waits on `refreshPromise`. Other concurrent 401s push to `pendingQueue`.
- When refresh resolves with a new `accessToken`: write new tokens to localStorage, drain `pendingQueue` with `resolve(newAccessToken)`, set `refreshPromise = null`. Each waiter retries its original request once with the new token.
- When refresh rejects (any error): drain `pendingQueue` with `reject(err)`, set `refreshPromise = null`, force logout.
- Each waiter retries its original request **exactly once** with a config flag (e.g. `_retried: true`) added. The interceptor checks this flag at entry — if set, it skips the refresh-and-queue path entirely and rejects the error immediately, calling `forceLogout` if it's a 401. This prevents infinite loops.

**Force logout** (module-level helper):

```ts
function forceLogout(reason: 'expired' | 'unauthorized' = 'expired') {
  clearTokens();
  useAuthStore.getState().clear();
  toast.error('Session expired, please login again');
  // Hard navigation so any in-flight component state is wiped:
  window.location.assign('/login');
}
```

Using `window.location.assign` (rather than the router) is intentional: it guarantees a clean slate after a forced logout, with no risk of a route guard racing the store update.

### `src/features/auth/storage.ts`

Thin wrappers around `localStorage` keyed by `'modern_erp_admin.accessToken'` and `'modern_erp_admin.refreshToken'`. Functions: `getAccessToken()`, `getRefreshToken()`, `setTokens({ accessToken, refreshToken })`, `clearTokens()`. Returns `null` for missing values; never throws.

### `src/features/auth/store.ts`

```ts
type AuthStatus = 'idle' | 'loading' | 'authenticated' | 'unauthenticated';

type AuthState = {
  admin: Admin | null;
  status: AuthStatus;
  setAuth: (admin: Admin) => void;          // sets admin + status='authenticated'
  setStatus: (status: AuthStatus) => void;
  clear: () => void;                         // admin=null, status='unauthenticated'
};
```

Tokens are deliberately NOT in the store (single source of truth = localStorage). The store is a lightweight cache of "who is logged in" used by the header and route guards.

Initial state:
- `admin: null`
- `status: getAccessToken() ? 'idle' : 'unauthenticated'`

### `src/features/auth/api.ts`

Pure functions wrapping `apiClient`:

```ts
login({ email, password }): Promise<LoginResponse>
fetchProfile(): Promise<{ admin: Admin }>
refresh(refreshToken: string): Promise<RefreshResponse>     // used internally by interceptor
logout(): Promise<void>                                      // fire-and-forget
```

`refresh()` makes a *bare* axios call (its own short-lived axios instance or a config-level skip flag) to avoid the interceptor and to avoid sending the expired access token.

### `src/features/auth/LoginPage.tsx`

- Centered card layout, plain Tailwind, reusing existing `Button` and `Input` from `src/components/ui/`.
- Controlled email + password fields, `submit` button with loading state.
- On submit:
  1. Set local `loading=true`.
  2. Call `login(...)`.
  3. On success: `setTokens(...)`, `setAuth(admin)`, `toast.success('Welcome back, <name>')`, `router.navigate({ to: redirectSearch || '/dashboard' })`.
  4. On failure: `toast.error(err.response?.data?.error?.message ?? 'Login failed')`, keep form populated, clear `loading`.

### `src/routes/login.tsx`

```ts
export const Route = createFileRoute('/login')({
  validateSearch: (s) => ({ redirect: typeof s.redirect === 'string' ? s.redirect : undefined }),
  beforeLoad: ({ search }) => {
    if (getAccessToken()) {
      throw redirect({ to: search.redirect ?? '/dashboard' });
    }
  },
  component: LoginPage,
});
```

### `src/routes/_app.tsx` (UPDATED)

Two responsibilities added:

1. **`beforeLoad` guard:** if no `accessToken` in localStorage, throw `redirect({ to: '/login', search: { redirect: location.href } })`.
2. **Profile bootstrap:** on mount, if `status === 'idle'`, set `status='loading'` and call `fetchProfile()`.
   - On success: `setAuth(admin)`.
   - On 401: handled by the response interceptor (refresh-and-queue → either retry succeeds and we resolve normally, or `forceLogout` redirects away).
   - On any other error (network, 500, etc.): catch in the effect, call `forceLogout()` directly so the user is not left on a frozen spinner.
   - While `status === 'loading'`, render a full-screen centered spinner instead of `<AdminHeader /> + <Outlet />`.

The bootstrap effect runs exactly once per session — it's keyed on `status === 'idle'`, and after success becomes `'authenticated'`, so subsequent in-app navigations do not re-fetch.

### `src/components/layout/AdminHeader.tsx` (UPDATED)

- Read `admin` from `useAuthStore`. While unexpectedly null (shouldn't happen inside `_app`), render placeholder text.
- Replace `"Super Admin"` (top button + dropdown header) with `admin.name`.
- Replace `"admin@modernerp.com"` (dropdown subtitle) with `admin.email`.
- Replace dicebear `seed=Admin` with `seed={encodeURIComponent(admin.name)}`.
- Wire "Log out" button: `onClick={handleLogout}` where `handleLogout`:
  1. Closes the menu.
  2. Calls `logout()` (fire-and-forget; do NOT `await`).
  3. `clearTokens()`, `useAuthStore.getState().clear()`.
  4. `router.navigate({ to: '/login' })`.

### `src/vite-env.d.ts` (UPDATED)

```ts
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
```

### `.env` and `.env.example`

```
# .env (gitignored)
VITE_API_BASE_URL=http://localhost:4000/api/v1
```

```
# .env.example (committed)
VITE_API_BASE_URL=http://localhost:4000/api/v1
```

Confirm `.env` is in `.gitignore` (it is — checked in current `.gitignore`).

## Data Flow Diagrams

### Login

```
User submits form
  → LoginPage calls login()
  → apiClient.post('/admin/login', { email, password })
  → on success:
      setTokens({ accessToken, refreshToken })
      authStore.setAuth(admin)
      toast.success
      router.navigate('/dashboard')
  → on error:
      toast.error(err.response.data.error.message)
```

### App startup (with stored token)

```
App mounts → router resolves /dashboard (or whatever URL)
  → _app beforeLoad: accessToken exists → allow
  → _app component effect: status === 'idle' → setStatus('loading'), call fetchProfile()
       → 200 OK: setAuth(admin) → render <AdminHeader /> + <Outlet />
       → 401 TOKEN_EXPIRED: interceptor runs refresh
             → refresh OK: retry profile → setAuth(admin)
             → refresh fails: forceLogout → /login
       → other 401: forceLogout → /login
```

### Authenticated request hits expired access token

```
Component fires apiClient.get('/some-endpoint')
  → 401 TOKEN_EXPIRED
  → interceptor: refreshPromise === null
        → refreshPromise = POST /admin/refresh
        → request waits on refreshPromise
  → meanwhile 4 other requests also 401 → push to pendingQueue
  → refresh resolves with new tokens
        → setTokens(new)
        → drain queue, retry each request once with new token
  → all 5 succeed, app continues
```

### Refresh fails

```
refresh promise rejects
  → drain pendingQueue with reject
  → forceLogout: clearTokens, store.clear, toast, window.location='/login'
```

### Logout (user-initiated)

```
ProfileMenu "Log out" clicked
  → handleLogout:
      logout()                              // fire-and-forget
      clearTokens()
      authStore.clear()
      router.navigate('/login')
```

## Error Handling Summary

| Situation | Behavior |
|---|---|
| Login wrong credentials (any non-200) | Toast `error.message`, keep form. |
| 401 TOKEN_EXPIRED on any request | Refresh once, retry. Queue concurrent 401s. |
| 401 with any other errorCode | Force logout. |
| Refresh itself returns 401 (or any error) | Force logout. |
| Network error / timeout on user request | Reject normally; calling code handles. |
| Network error on logout API | Ignored (already logged out locally). |
| Network error on profile bootstrap | Treated as auth failure → force logout. |

## Testing Notes (manual, since no test setup exists yet)

1. Start backend on `localhost:4000`. Start dev server (`yarn dev`). Visit `/` → should redirect to `/login`.
2. Login with valid credentials → toast, redirect to `/dashboard`, header shows real admin name/email.
3. Refresh page on `/dashboard` → spinner briefly, then dashboard.
4. Manually corrupt `accessToken` in localStorage → make any authenticated request → should refresh and succeed (only if `refreshToken` still valid). If both corrupted → force logout.
5. Simulate expired token: wait `expiresIn` (15 min) or set short TTL on backend → next request triggers refresh transparently.
6. Click "Log out" → tokens cleared, redirected to `/login`. Hitting browser back must not show authenticated content.
7. Visit `/login` while authenticated → redirect to `/dashboard`.

## Open Questions

1. Does `/admin/logout` need `{ refreshToken }` in the body? (Spec assumes no.)
2. Should we also display admin role / superadmin badge in the header? (Out of scope unless requested.)
