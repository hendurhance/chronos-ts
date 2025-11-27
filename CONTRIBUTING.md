# Contributing to Chronos-ts

First off, thank you for considering contributing to Chronos-ts! 🎉 It's people like you that make Chronos-ts such a great tool.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [Making Changes](#making-changes)
- [Coding Guidelines](#coding-guidelines)
- [Testing](#testing)
- [Pull Request Process](#pull-request-process)
- [Issue Guidelines](#issue-guidelines)

## Code of Conduct

This project and everyone participating in it is governed by our commitment to providing a welcoming and inclusive environment. By participating, you are expected to uphold this standard. Please be respectful and constructive in all interactions.

## Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/hendurhance/chronos-ts.git
   cd chronos-ts
   ```
3. **Add the upstream remote**:
   ```bash
   git remote add upstream https://github.com/hendurhance/chronos-ts.git
   ```

## Development Setup

### Prerequisites

- Node.js 18.x or higher
- npm 9.x or higher

### Installation

```bash
# Install dependencies
npm install

# Build the project
npm run build

# Run tests
npm test
```

### Available Scripts

| Script | Description |
|--------|-------------|
| `npm run build` | Compile TypeScript to JavaScript |
| `npm test` | Run the test suite |
| `npm run test:coverage` | Run tests with coverage report |
| `npm run lint` | Run ESLint on source files |
| `npm run format` | Format code with Prettier |

## Project Structure

```
chronos-ts/
├── src/
│   ├── core/                 # Core classes
│   │   ├── chronos.ts        # Main Chronos class
│   │   ├── interval.ts       # ChronosInterval class
│   │   ├── period.ts         # ChronosPeriod class
│   │   ├── periodCollection.ts # ChronosPeriodCollection class
│   │   ├── timezone.ts       # ChronosTimezone class
│   │   └── index.ts          # Core barrel export
│   ├── locales/              # Locale configurations
│   │   └── index.ts          # All locale definitions
│   ├── types/                # TypeScript type definitions
│   │   └── index.ts          # All types and interfaces
│   ├── utils/                # Utility functions
│   │   └── index.ts          # All utility functions
│   └── index.ts              # Main entry point
├── test/                     # Test files
│   ├── chronos.test.ts
│   ├── interval.test.ts
│   ├── period.test.ts
│   ├── periodCollection.test.ts
│   └── timezone.test.ts
├── .github/
│   └── workflows/            # GitHub Actions
│       ├── ci.yml            # CI workflow
│       └── publish.yml       # NPM publish workflow
├── dist/                     # Compiled output (generated)
├── eslint.config.mjs         # ESLint configuration
├── jest.config.js            # Jest configuration
├── tsconfig.json             # TypeScript configuration
└── package.json
```

## Making Changes

### Branch Naming

Use descriptive branch names:
- `feature/add-new-method` - For new features
- `fix/timezone-offset-bug` - For bug fixes
- `docs/update-readme` - For documentation updates
- `refactor/improve-performance` - For refactoring

### Commit Messages

Follow conventional commit format:

```
type(scope): description

[optional body]

[optional footer]
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation only
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples:**
```
feat(period): add splitByMonths method
fix(chronos): correct timezone offset calculation
docs(readme): update installation instructions
test(interval): add tests for fromISO method
```

## Coding Guidelines

### TypeScript

- Use strict TypeScript (`strict: true` in tsconfig)
- Prefer `const` over `let` when possible
- Use explicit return types for public methods
- Document public APIs with JSDoc comments

```typescript
/**
 * Add a duration to this Chronos instance
 * 
 * @param duration - The duration to add
 * @returns A new Chronos instance with the added duration
 * 
 * @example
 * ```typescript
 * const future = Chronos.now().add({ days: 5, hours: 3 });
 * ```
 */
add(duration: Duration): Chronos {
  // implementation
}
```

### Code Style

- Use 2 spaces for indentation
- Use single quotes for strings
- No trailing semicolons (handled by Prettier)
- Maximum line length: 100 characters

Run `npm run format` before committing to ensure consistent formatting.

### Immutability

Chronos-ts follows an immutable-by-default pattern. All manipulation methods should return new instances:

```typescript
// ✅ Correct - returns new instance
addDays(days: number): Chronos {
  const newDate = new Date(this._date);
  newDate.setDate(newDate.getDate() + days);
  return new Chronos(newDate);
}

// ❌ Incorrect - mutates existing instance
addDays(days: number): Chronos {
  this._date.setDate(this._date.getDate() + days);
  return this;
}
```

## Testing

### Writing Tests

- Place test files in the `test/` directory
- Name test files with `.test.ts` suffix
- Use descriptive test names

```typescript
describe('ChronosPeriod', () => {
  describe('Factory Methods', () => {
    test('create() with start and end creates valid period', () => {
      const period = ChronosPeriod.create('2024-01-01', '2024-01-31');
      
      expect(period.start.format('YYYY-MM-DD')).toBe('2024-01-01');
      expect(period.end?.format('YYYY-MM-DD')).toBe('2024-01-31');
    });
  });
});
```

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run specific test file
npm test -- test/chronos.test.ts

# Run tests with coverage
npm run test:coverage
```

### Coverage Requirements

We aim for high test coverage:
- Branches: ≥70%
- Functions: ≥80%
- Lines: ≥80%
- Statements: ≥80%

## Pull Request Process

1. **Update your fork**:
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

2. **Create a feature branch**:
   ```bash
   git checkout -b feature/your-feature
   ```

3. **Make your changes** following the coding guidelines

4. **Run checks**:
   ```bash
   npm run lint
   npm run format
   npm test
   ```

5. **Commit your changes** using conventional commits

6. **Push to your fork**:
   ```bash
   git push origin feature/your-feature
   ```

7. **Open a Pull Request** against the `main` branch

### PR Checklist

Before submitting your PR, ensure:

- [ ] Code follows the project's coding guidelines
- [ ] Tests have been added for new functionality
- [ ] All tests pass (`npm test`)
- [ ] Linting passes (`npm run lint`)
- [ ] Code is formatted (`npm run format`)
- [ ] Documentation has been updated if needed
- [ ] Commit messages follow conventional commit format

### PR Review

- PRs require at least one approval before merging
- CI checks must pass
- Address all review comments

## Issue Guidelines

### Reporting Bugs

When reporting bugs, please include:

1. **Description**: Clear description of the bug
2. **Steps to Reproduce**: Minimal steps to reproduce the issue
3. **Expected Behavior**: What you expected to happen
4. **Actual Behavior**: What actually happened
5. **Environment**: Node.js version, OS, chronos-ts version
6. **Code Sample**: Minimal code that reproduces the issue

```markdown
### Bug Description
The `addMonths()` method returns incorrect date when adding months to January 31st.

### Steps to Reproduce
1. Create a Chronos instance for January 31, 2024
2. Call `addMonths(1)`
3. Check the resulting date

### Expected Behavior
Should return February 29, 2024 (last day of February in leap year)

### Actual Behavior
Returns March 2, 2024

### Environment
- Node.js: 20.x
- OS: macOS 14.0
- chronos-ts: 2.0.0

### Code Sample
```typescript
const date = Chronos.create(2024, 1, 31);
const result = date.addMonths(1);
console.log(result.format('YYYY-MM-DD')); // Expected: 2024-02-29
```
```

### Requesting Features

When requesting features, please include:

1. **Description**: Clear description of the feature
2. **Use Case**: Why this feature would be useful
3. **Proposed API**: How you envision the API looking
4. **Alternatives**: Any alternatives you've considered

## Adding New Locales

To add a new locale:

1. Add the locale configuration in `src/locales/index.ts`:

```typescript
export const xx: LocaleConfig = {
  code: 'xx',
  months: [...],
  monthsShort: [...],
  weekdays: [...],
  weekdaysShort: [...],
  weekdaysMin: [...],
  ordinal: (n: number): string => ...,
  formats: {...},
  relativeTime: {...},
  week: {
    dow: 0, // First day of week (0 = Sunday)
    doy: 6, // First week of year contains Jan 1st
  },
};
```

2. Register the locale in `locales` map
3. Export the locale from `src/index.ts`
4. Add tests for the locale

## Questions?

If you have questions, feel free to:

- Open a [GitHub Discussion](https://github.com/hendurhance/chronos-ts/discussions)
- Open an [Issue](https://github.com/hendurhance/chronos-ts/issues)

Thank you for contributing! 🙏
