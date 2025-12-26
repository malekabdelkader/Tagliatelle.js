# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.x.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

We take security seriously. If you discover a security vulnerability in Tagliatelle.js, please report it responsibly.

### How to Report

1. **Do NOT** open a public GitHub issue for security vulnerabilities
2. Email security concerns to: [Create a private security advisory](https://github.com/malekabdelkader/Tagliatelle.js/security/advisories/new)
3. Include as much detail as possible:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

### What to Expect

- **Acknowledgment**: Within 48 hours
- **Initial Assessment**: Within 1 week
- **Resolution Timeline**: Depends on severity
  - Critical: 24-48 hours
  - High: 1 week
  - Medium: 2 weeks
  - Low: Next release

### Scope

The following are in scope:
- Tagliatelle.js core framework (`/src/*`)
- CLI tool
- Security utilities (`security.ts`)

Out of scope:
- Example applications
- Third-party dependencies (report to respective maintainers)

## Security Best Practices

When using Tagliatelle.js:

1. **Always validate input** using the provided security utilities
2. **Use rate limiting** with `<RateLimiter />` for auth endpoints
3. **Sanitize error messages** with `sanitizeErrorMessage()`
4. **Track auth failures** with `authFailureTracker`
5. **Set appropriate CORS** policies in production

Thank you for helping keep Tagliatelle.js secure! 🍝🔒

