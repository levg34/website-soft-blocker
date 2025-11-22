# website-soft-blocker

website-soft-blocker is a lightweight, page-based "soft blocker" designed to help users reduce visits to distracting websites without fully blocking access. Instead of a hard block, the project replaces the target site with a reminder page where the user chooses to either continue to the site or close the page. The app tracks simple usage statistics and awards badges to reward positive behaviour.

**Status:** Prototype / Early development

### Table of contents

- [Overview](#overview)
- [How it works](#how-it-works)
- [Features](#features)
- [Getting started](#getting-started)
- [Configuration](#configuration)
- [Privacy](#privacy)
- [Development](#development)
- [Contributing](#contributing)
- [License & Contact](#license--contact)
- [Planned stack](#planned-stack)

## Overview

This project provides a single HTML page (or small web app) that acts as an intermediate reminder page when a user attempts to visit a distracting site. The objective is to encourage mindful browsing by introducing a small friction and providing positive reinforcement via badges and streaks.

## How it works

- Host the reminder page and make visits to the target website load this page instead. Common local/testing methods are adjusting the `hosts` file or using browser autocomplete settings. Production options include DNS configuration or packaging as a browser extension.
- When the reminder page loads, the user sees their stats and two clear actions: **Continue to site** or **Close page**.
- Choosing **Continue to site** navigates to the original target (after user confirmation). Choosing **Close page** cancels the visit and increments the user's positive-action stats.
- Usage data and badge progress are stored locally by default (e.g., `localStorage`), avoiding remote tracking.

## Features

- Two-choice reminder page: `Continue to site` or `Close page`
- Local stats: counts of closes, number of visits, streak tracking
- Badges/achievements: e.g., first day without visiting, first 10 closes, 30-day streak
- Privacy-friendly: no remote telemetry by default
- Easy to host or integrate into a browser extension or gateway

## Getting started

1. Clone the repository:

   ```bash
   git clone https://github.com/levg34/website-soft-blocker.git
   cd website-soft-blocker
   ```

2. Preview the reminder page by opening `index.html` (if present) or by running a simple static server:

   ```bash
   python3 -m http.server 8000
   # then open http://localhost:8000 in your browser
   ```

3. For local testing, redirect the target domain to your machine using the `hosts` file (requires admin privileges). Example (Unix-like systems):

   ```text
   127.0.0.1  example-distracting-site.test
   ```

   Serve the reminder page for that hostname, or open the page directly and simulate the behaviour.

4. In production, consider DNS or browser-extension packaging to serve the page in place of the target site.

> Warning: modifying `hosts` or DNS affects how the machine resolves domains. Only change these settings if you understand the impact and have appropriate permissions.

## Configuration

- Configuration can be provided through a JSON file or an in-app settings UI depending on the implementation.
- Typical options:
  - Target site URL
  - Whitelisted domains
  - Badge thresholds and reward rules
  - Session/streak rules

I can add a sample `config.json` if you want a concrete starting point.

## Privacy

User progress is stored locally by default (e.g., `localStorage`). The project does not send telemetry or analytics externally unless a developer adds an optional backend — any such integration should be opt-in and documented.

## Development

- Recommended workflow:

  1. Branch from `main`: `git checkout -b feat/your-feature`
  2. Run the app locally (open `index.html` or use a static server)
  3. Open a PR with a clear description and screenshots for UI changes

- If you use a JavaScript toolchain (npm, Vite, etc.), add `package.json` scripts and document them here.

## Contributing

- Issues and PRs are welcome. For large features, open an issue first to discuss scope.
- Keep PRs focused and include manual verification steps for UI behaviour.

## License & Contact

This project is licensed under the GNU General Public License v3.0 (GNU GPLv3). See the `LICENSE` file in this repository for the full license text.

Author: `levg34` — open an issue or PR for questions and collaboration.

## Planned stack

The project is intended to evolve into a fullstack web application. Candidate frameworks/architectures under consideration include:

- Remix Run v7 (RRv7)
- TanStack Start
- Solid Start

Planned characteristics for the fullstack version:

- A backend service to optionally sync stats and badges across devices (opt-in).
- API endpoints for user sync, badge verification, and backups.
- Authentication would be optional and privacy-first; localStorage-only mode will remain available.

Simple mode: a minimal, single-page implementation using static HTML/JS and `localStorage` will be provided as a lightweight option. This mode requires no backend and keeps all user data locally.
