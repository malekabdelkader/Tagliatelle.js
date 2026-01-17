# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Nothing yet

## [1.0.1] - 2026-01-04

### Changed
- Patch version bump for minor updates

## [1.0.0] - 2026-01-04

### Added
- Initial stable release
- JSX-based API architecture for Fastify
- File-based routing system (Next.js-style)
- Plugin system with `createPlugin()` API
- Security utilities module (`authFailureTracker`, `isSafeString`, etc.)
- CLI scaffolding tool (`npx tagliatelle init`)
- OpenAPI/Swagger integration support
- WebSocket plugin support
- Middleware scoping system with JSX components
- JSX response components (`<Response>`, `<Status>`, `<Body>`, `<Err>`)
- JSX middleware components (`<Augment>` for prop augmentation)
- Route configuration via `_config.tsx` files
- Dynamic route parameters (`[id].tsx`, `[...slug].tsx`)
- Handler props with full TypeScript support
- Runtime CLI options (port, host, open)
- Scoped context for middleware (respects JSX visual hierarchy)
- Enhanced documentation with mobile navigation

[Unreleased]: https://github.com/malekabdelkader/Tagliatelle.js/compare/v1.0.1...HEAD
[1.0.1]: https://github.com/malekabdelkader/Tagliatelle.js/compare/v1.0.0...v1.0.1
[1.0.0]: https://github.com/malekabdelkader/Tagliatelle.js/releases/tag/v1.0.0
