# Contributing

## Setup

Run `pnpm install`. It also installs the Git hooks:

- `pre-commit` checks staged files with Biome.
- `commit-msg` checks the commit message with commitlint.

Before opening a pull request, run `pnpm lint`, `pnpm typecheck`, and
`pnpm test:e2e`. CI runs the same checks.

## Commit messages

Use [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/):

```text
<type>[optional scope][optional !]: <description>
```

A commit message is a single line. Bodies and footers are not allowed.

Write a short, specific description in English, starting with a lowercase
letter and without a trailing period.

Types:

- `feat`: add a feature.
- `fix`: fix a bug.
- `docs`: update documentation.
- `test`: add or update tests and fixtures.
- `refactor`: restructure code without changing its behavior.
- `perf`: improve performance.
- `build`: change packaging, build tools, or dependencies.
- `ci`: change CI workflows.
- `style`: change code formatting without changing its behavior.
- `revert`: revert an earlier commit.
- `chore`: perform other maintenance.

Scopes are optional. When used, pick one of:

- `viewer`: the page, drawing with Pele, and error messages.
- `link`: reading `#pako:` and `#base64:` links.
- `zoom`: zooming and panning.
- `e2e`: end-to-end tests.
- `ci`: GitHub Actions workflows.
- `deps`: dependency updates.

Examples:

```text
feat(zoom): keep the point under the cursor fixed while zooming
fix(link): accept links with standard base64 characters
test(e2e): cover links opened on the edit path
docs: describe the weekly CDN check
build(deps): update all dependencies
```

Mark breaking changes with `!` before the colon, for example
`feat(link)!: drop support for base64 links`.
