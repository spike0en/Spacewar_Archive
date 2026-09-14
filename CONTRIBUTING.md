# Contributing to Nothing Archive

Thank you for contributing to Nothing Archive.

## Ways to Contribute

We welcome community participation in two primary areas:

### 1. Documentation Maintenance & Growth
This involves the continuous upkeep and expansion of the main English documentation. Contributions include:
- Adding new entries to `apps.md`, `projects.md`, and `official.md`.
- Updating information in `devices.md`, `photography.md`, and `guides.md`.
- Fixing typos, updating broken links, and improving readability.

### 2. Technical Development & Enhancements
Contribute to the website's infrastructure by resolving bugs or adding features. Technical contributions should:
- Respect existing coding conventions to ensure future scalability and ease of maintenance.
- Keep the user interface clean and responsive while avoiding unnecessary divergence from the upstream codebase.

## Restricted Files & Directories

To ensure accuracy and preserve integrity, **do not** submit pull requests that modify the following files or directories:
- `website/docs/firmware.md`
- `website/docs/changelogs/`
- `website/src/data/showcase-config.json` (Editor's Choice and featured showcase selections are curated exclusively by the repository maintainer)

These are maintained only by the project authors and collaborators.

## Documentation Guidelines

Entries added to `website/docs/apps.md` and `website/docs/projects.md` automatically populate the interactive **Showcase Catalog (`/showcase`)** during the build process. To ensure clean catalog cards, accurate platform tags, and correct alphabetical ordering, follow these guidelines:

### 1. Table Row Format
All entries must use the standard 3-column markdown table structure:
```markdown
| [Display Name](PrimaryLink) | Developer | Description |
```

- **Primary Link**: Google Play Store, Apple App Store, GitHub repository, or live project page.
- **Dual Links**: If an app has both a store release and an open-source repository, link the store release on the display name and include the repository in the description:
  ```markdown
  | [Glimpse](https://play.google.com/store/apps/details?id=com.example.glimpse) | dev_user | Minimal notification peek tool for Nothing OS. ([Repo](https://github.com/dev_user/glimpse)) |
  ```
- **Cross-Platform Links**: If an iOS build exists, link it in the description using `([iOS](https://apps.apple.com/...))` or `([App Store](...))`.
- **Description Quality**: Keep descriptions to a single, concise sentence. State what the application or project does plainly and factually. Avoid promotional hype, marketing adjectives, buzzwords, and clichés (such as "unlock the full potential", "seamless", "vibrant", "revolutionary", or "beautifully crafted"). Avoid participle tails (such as ", featuring...") and em dashes. Do not include raw HTML (`<br>`, `<img ...>`), line breaks, or Markdown images inside table cells.
- **Platform Keywords**: For desktop, CLI, or web utilities (e.g. earbud controllers, desktop rices, screensavers, developer tools), explicitly state the supported operating systems in the description (e.g. *for Windows*, *for macOS*, *for Linux*, *for Windows and macOS*, *for Windows, Linux, and macOS*, *Web-based*). Avoid ambiguous labels like "PC". Explicit OS keywords ensure the Showcase prebuild parser accurately tags the entry for Target Platform filters.

### 2. Naming Conventions

* **Clean display names**: Keep product titles clean without parenthetical OS tags (e.g., **Nothing Clock**, **Attune**, **Nothing Desktop**, **EarA**).
* **Parenthetical disambiguation**: Reserve `(OS)` suffixes in titles strictly for disambiguating identical project names across authors or platforms (e.g., **Nothing X (macOS)** vs **Nothing X (Windows)**, or **Notes (Windows)** vs mobile Notes).
* **Add spaces between words**: Use **Glyph Glow** instead of `GlyphGlow`, **Nothing OS** instead of `NothingOS`, and **Better Battery** instead of `BetterBattery`.
* **Use title case**: Capitalize words properly. Avoid all-lowercase or repo-style names (e.g., **Nothing Rice** instead of `nothing-rice`).
* **Preserve acronyms & abbreviations**: Keep 2-4 letter technical acronyms, protocol abbreviations, and product codes in ALL CAPS (**FMC**, **SDDM**, **KWGT**, **AOD**, **BLE**, **PWA**, **ADB**, **GUI**, **CLI**).

### 3. Alphabetical Sorting
* All entries within a table must be sorted **alphabetically by display name** (inside the square brackets `[...]`).
* Sorting is case-insensitive (e.g., `No Volume` comes before `Nothing Audio`).

## How to Contribute

1. Fork the repository on GitHub.
2. Make your changes in `website/docs/` (English content).
3. Test your changes locally to ensure prebuild parsers run cleanly:
   ```bash
   cd website
   npm run build
   ```
4. Commit your changes with a clear, descriptive message.
5. Push your branch and open a Pull Request (PR) to `main`.
6. Verify that automated GitHub Actions checks pass, and wait for review and merge.

Thank you for helping grow Nothing Archive.
