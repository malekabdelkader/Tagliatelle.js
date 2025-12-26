# Contributing to Tagliatelle.js 🍝

First off, thanks for taking the time to contribute! Every contribution helps make this delicious framework even better.

## Code of Conduct

Be kind, be respectful. We're all here to build something cool together.

## How Can I Contribute?

### 🐛 Reporting Bugs

Before creating a bug report:
1. Check [existing issues](https://github.com/malekabdelkader/Tagliatelle.js/issues) to avoid duplicates
2. Use the latest version

When reporting:
- Use a clear, descriptive title
- Describe steps to reproduce
- Include expected vs actual behavior
- Add code samples if possible
- Mention your Node.js and TypeScript versions

### 💡 Suggesting Features

We love new ideas! When suggesting:
- Check if it's already been suggested
- Explain the use case
- Consider how it fits the JSX paradigm
- Bonus: Propose the JSX component API

### 🔧 Pull Requests

1. **Fork & Clone**
   ```bash
   git clone https://github.com/YOUR_USERNAME/Tagliatelle.js.git
   cd Tagliatelle.js
   npm install
   ```

2. **Create a Branch**
   ```bash
   git checkout -b feature/amazing-feature
   # or
   git checkout -b fix/bug-description
   ```

3. **Make Your Changes**
   - Follow existing code style
   - Add/update tests if applicable
   - Update documentation if needed

4. **Test Your Changes**
   ```bash
   npm run build
   npm run example
   ```

5. **Commit**
   ```bash
   git commit -m "feat: add amazing feature"
   # or
   git commit -m "fix: resolve bug description"
   ```

   We use [Conventional Commits](https://www.conventionalcommits.org/):
   - `feat:` - New feature
   - `fix:` - Bug fix
   - `docs:` - Documentation
   - `refactor:` - Code refactoring
   - `test:` - Adding tests
   - `chore:` - Maintenance

6. **Push & Create PR**
   ```bash
   git push origin feature/amazing-feature
   ```

## Development Setup

### Prerequisites
- Node.js >= 18.0.0
- npm or yarn
- TypeScript knowledge

### Project Structure
```
tagliatelle/
├── src/
│   ├── index.ts        # Main exports
│   ├── tagliatelle.ts  # Core components
│   ├── router.ts       # File-based routing
│   ├── jsx-runtime.ts  # JSX runtime
│   ├── security.ts     # Security utilities
│   ├── cli.ts          # CLI tool
│   └── types.ts        # TypeScript types
├── examples/           # Example application
└── dist/               # Compiled output
```

### Building
```bash
npm run build
```

### Testing Examples
```bash
npm run example
```

## Roadmap

Looking for something to work on? Here are some ideas:

- [ ] WebSocket support (`<WebSocket />`)
- [ ] OpenAPI schema generation
- [ ] Static file serving (`<Static />`)
- [ ] GraphQL integration
- [ ] Database adapters
- [ ] Request validation schemas
- [ ] Plugin system improvements

## Questions?

Open a [Discussion](https://github.com/malekabdelkader/Tagliatelle.js/discussions) or reach out!

---

**Made with ❤️ and plenty of carbs. Chahya Tayba!** 🇹🇳

