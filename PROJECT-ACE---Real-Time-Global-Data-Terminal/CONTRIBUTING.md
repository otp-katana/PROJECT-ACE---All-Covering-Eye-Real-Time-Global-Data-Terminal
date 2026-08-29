# Contributing to Project ACE

Thanks for considering a contribution. This project is still young and moves fast, so a short conversation before a large PR saves everyone time — please open an issue before starting on anything beyond a small, self-contained fix.

## Before You Start

- **Read the [README](./README.md)**, especially the [Philosophy](./README.md#philosophy) and [Architecture](./README.md#architecture) sections. They explain *why* the project is structured the way it is, not just what it does — most "why not do X instead" questions are answered there.
- **Check open issues** to avoid duplicate work.
- **For new modules or globe-interaction features**, open an issue describing the approach first. The globe's interaction model (rotation, selection, navigation, pulse/breath feedback) has some non-obvious constraints documented in the README's [Engineering Notes](./README.md#engineering-notes) — a quick discussion avoids reintroducing bugs that were already fixed once.

## Development Setup

Follow the [Getting Started](./README.md#getting-started) section in the README to get both the frontend and backend running locally. Both must be running to test any change that touches live data — the UI degrades gracefully to `OFFLINE` when the backend is down, which can mask bugs if you only test against a stopped backend.

## Code Style

### Documentation headers
Files are organized into numbered `PART` sections, and larger blocks within a `PART` use `SUB` sections. Each header carries a short explanatory comment — not just a label, but a sentence or two on *why* that section exists and how it relates to the rest of the file.

JavaScript / CSS (double-line frame):
```js
// ───────────────────────────────────────────────────────────────────────────
// ── PART: 1 ][ SECTION NAME ─────────────────────────────────────────────────
// ───────────────────────────────────────────────────────────────────────────
// Explanation of what this section does and why it's organized this way.
```

Inside JSX (comments must use the `{/* */}` form, not `//`):
```jsx
{/* ─────────────────────────────────────────────────────────────────────── */}
{/* ── SUB: SECTION NAME ────────────────────────────────────────────────── */}
{/* ─────────────────────────────────────────────────────────────────────── */}
{/* Explanation. */}
```

Python (single-line frame):
```python
# ─────────────────────────────────────────────────────────────────────────
# ── PART: 1 ][ SECTION NAME ─────────────────────────────────────────────
# ─────────────────────────────────────────────────────────────────────────
# Explanation.
```

A `Contents` comment at the top of larger files lists all `PART`/`SUB` names, so the file can be scanned or searched (`Ctrl+F`) without reading it top to bottom.

**When to add a header:** only when a block represents a genuine functional distinction (e.g. "empty state" vs. "populated state", not every new `<div>`). Over-splitting hurts readability as much as under-documenting does.

### General
- English only — code, comments, identifiers, and commit messages. (The project's working language during development was Turkish; anything you find still in Turkish is a known cleanup item, not an intentional choice — feel free to flag or fix it.)
- Prefer `Field(..., description=...)` / JSDoc-style comments on public functions over relying on naming alone.
- Favor small, named helper functions over duplicated inline logic, especially for math shared across multiple call sites (see `latLonToVector3` in `useGlobe.js` for the pattern).
- Don't introduce a new state-management library, CSS framework, or major dependency without discussing it in an issue first — the project intentionally stays lean.

## Scientific & Data Integrity

This is the one area with zero flexibility:

- Never present a statistical estimate as a fact or a prediction. Earthquake prediction is not scientifically possible — any forecast-like feature (e.g. Omori's Law aftershock counts) must be visibly labeled as a model output, with the same kind of disclaimer already established in this codebase's history (see the legacy `OmoriPrediction.jsx` disclaimer referenced in project notes, if you're rebuilding that feature).
- Never fabricate precision that the underlying data doesn't have. If a data source doesn't report a value, represent it as unknown/missing — don't substitute a plausible-looking placeholder without clearly documenting it as one (see `gvp.py`'s `PLACEHOLDER_MAGNITUDE` for the expected pattern: named, commented, and visible in code review).
- If you're integrating a new data source, document its licensing/usage terms in the PR description, even if it's publicly available data.

## Submitting a Pull Request

1. Fork and branch from `main`.
2. Keep PRs scoped to one logical change — a single feature, fix, or refactor. Large, mixed PRs are harder to review and more likely to be asked to split.
3. Write a commit message with a short, specific title summarizing the change (not a generic placeholder) and, if useful, a bulleted body describing what changed and why.
4. In the PR description, note what you tested and how (which browser, whether both servers were running, etc.).
5. Be patient — this is a small project maintained part-time.

## Reporting Bugs

Open an issue with:
- What you expected to happen vs. what happened
- Steps to reproduce
- Browser/OS, and whether the backend was running
- Console errors, if any (browser DevTools console output is usually the fastest way to diagnose a blank-screen issue in this codebase specifically — see the README's engineering notes on why)

## Questions

If something in the architecture seems unnecessarily complex or you think a simpler approach would work, ask — a lot of the current structure exists because a simpler version was tried first and hit a specific, documented problem. Knowing *which* problem helps more than a general "why not simplify this."