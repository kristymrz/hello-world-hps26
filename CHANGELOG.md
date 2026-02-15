# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Created a new dashboard page at `/dashboard` and moved the existing root page content there.
- Created a new login page at the root (`/`) with a "Sign in with Google" button.
- Implemented an OAuth callback route at `/auth/callback` to handle the Google authentication flow.
- Updated the dashboard page to require authentication and display the user's email.
- Implemented middleware to protect the `/dashboard` route and handle session refreshing.

### Changed

- Converted the dashboard page to a Server Component and moved the image grid to a separate Client Component to handle client-side pagination.
- Updated the login page to display user-friendly error messages based on URL query parameters.

### Fixed

- Fixed a TypeScript error in `app/auth/callback/route.ts` where `createClient()` was incorrectly called with `cookieStore` as an argument. The `createClient()` function from `@/lib/supabase/server` now correctly handles cookies internally without requiring explicit parameters.
- Fixed a TypeScript error in `app/dashboard/page.tsx` where `createClient()` was incorrectly called with `cookieStore` as an argument. The `createClient()` function from `@/lib/supabase/server` now correctly handles cookies internally without requiring explicit parameters.
- Fixed a TypeScript error in `lib/supabase/server.ts` where the `cookies()` function was not awaited. The `createClient()` function is now `async` and correctly awaits the `cookies()` call.
- Fixed TypeScript errors in `app/auth/callback/route.ts` and `app/dashboard/page.tsx` where the `createClient()` call was not awaited. All calls to the async `createClient()` function from `@/lib/supabase/server` are now properly awaited.
- Fixed a Next.js error in `app/page.tsx` where `useSearchParams()` was not wrapped in a `Suspense` boundary. The error display logic has been extracted to a separate `ErrorDisplay` component and wrapped in `<Suspense>`.

### Refactored

- Refactored the Supabase client to support server-side rendering (SSR) and authentication. The single `lib/supabaseClient.ts` file was replaced with a more robust structure under `lib/supabase/`:
  - `client.ts`: For use in client-side components.
  - `server.ts`: For use in server-side components and API routes.
  - `middleware.ts`: For use in Next.js middleware to handle session management.
This change follows the recommended best practices for using Supabase with Next.js, improving security and enabling server-side features.
