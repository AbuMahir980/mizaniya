# Frontend coding rules

**The content this file would hold is in
[docs/05-coding-standards.md](05-coding-standards.md).** This is a pointer, not a
second document.

## Why one file and not two

The workflow produces a shared standards index at `05` and a frontend one at
`07`. On this project they would say the same thing: there is no backend in v1,
so every `auto` rule is a frontend rule, and both files would map the same rules
to the same ESLint config.

Two documents describing one enforcement setup is the drift this project keeps
designing against — and the readable copy is the one that goes stale
(`docs/concepts/one-source-of-truth.md`). So `05` holds the map, with an honest
**Enforced / Partial / Not yet** status against every rule, and this file points
at it.

## What lives where

| Looking for | Go to |
|---|---|
| Every `auto` rule and what fails the build when it breaks | [05-coding-standards.md](05-coding-standards.md) §3 |
| Every `review` rule, as the code-review checklist | [CONTEXT.md](../CONTEXT.md) |
| The rules themselves | [docs/standards/](standards/) — authoritative, and they win on any conflict |
| The token contract | [docs/design/tokens.md](design/tokens.md) |
| What is still owed, and which phase owes it | [05-coding-standards.md](05-coding-standards.md) §5 |
