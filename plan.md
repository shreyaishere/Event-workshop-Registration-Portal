# roster — Event & Workshop Registration Portal
## Architectural & Engineering Plan (MCS3014 Assessment)

### 1. Executive Summary & Brand Identity
- **Product Name**: `roster`
- **Brand Personality**: Curated, electric, considered.
- **Tagline**: *"Choose a room worth showing up for."*
- **Supporting Hero Copy**: *"Put the next idea on your calendar."*
- **Aesthetic Direction**: Professional editorial event-tech foundation with warm white / cool slate, deep navy typography, professional blue (`#2563eb`), and emerald/teal (`#0d9488`) for positive status.
- **Signal Element**: Leading `//` mark paired with the lowercase wordmark `roster`.

---

### 2. Technology Stack & Governance
- **Semantic HTML5**: Native structural landmarks (`header`, `nav`, `main`, `section`, `article`, `table`, `form`, `fieldset`, `legend`, `footer`, `video`).
- **Pure CSS3**: Custom design tokens (CSS variables), Flexbox, CSS Grid, media queries (320px, 375px, 768px, 1024px, 1440px), and `prefers-reduced-motion` compliance. Zero third-party CSS frameworks.
- **Vanilla JavaScript**: State management, DOM manipulation, custom validation, password strength analysis, and Web Storage lifecycle.
- **jQuery (3 Genuine Features)**:
  1. Smooth-scroll navigation with active link highlighting and reduced-motion checks.
  2. Event-driven FAQ accordion disclosure (`slideToggle`).
  3. Interactive registration confirmation reveal (`slideDown`) & clear-search animations.
- **AJAX & Local JSON**: Runtime `fetch()` to `data/events.json` with loading states, error states, and retry logic.
- **Web Storage**:
  - `localStorage` (`eventPortalTheme`): Persists light/dark mode preference.
  - `sessionStorage` (`registrationDraft`): Auto-saves form input (passwords and files excluded).
- **Standalone Node.js Server**: Clean HTTP server on port 3000 handling MIME types, safe paths, and security headers.

---

### 3. Information Architecture & Section Hierarchy
1. **Header & Navigation**: 3-zone contract (Wordmark, Nav links, Theme toggle + Register CTA, Mobile menu).
2. **Hero & Statistics**: Asymmetric grid, strong copy, 3 key metrics (25+ Events, 1,500+ Participants, 40+ Speakers), and inline animated SVG.
3. **Event Discovery & Filtering**: Search bar, category filter, format pills, date/price sorting, active counter, and dynamic card grid.
4. **Selected Event Details**: Dynamic pane with agenda, speaker bio, prerequisites, and learning outcomes.
5. **Master Schedule**: Fully accessible semantic `<table>` with horizontal scrolling.
6. **Registration Desk**: Form with 13 distinct controls, 5-rule password strength meter, live error feedback, and order summary.
7. **Registration Confirmation**: Displays unique Registration ID (`ROS-2026-XXXX-XXXX`), details, and clipboard copy action.
8. **Behind the Room**: HTML5 `<video controls>` presentation with poster and fallback.
9. **Storage Comparison**: Educational breakdown of Cookies vs localStorage vs sessionStorage.
10. **CSS Box Model Demo**: Real nested layers (`#box-model-demo`) and Chrome DevTools inspection instructions.
11. **Client-Side Security Sandbox**: Safe rendering demonstration of `<img src=x onerror=alert(1)>` via `textContent`.
12. **FAQ Section**: Accordion with jQuery disclosure.
13. **Footer**: Quick links, syllabus mapping, and academic assessment disclaimer.

---

### 4. Validation & Security Matrix
- **Name**: Required, trimmed, whitespace rejection.
- **Email**: RFC regex pattern validation.
- **Phone**: 8-15 digits normalized, Indian (+91) & international format support.
- **Password**: 5 required conditions (length >= 8, uppercase, lowercase, number, special char).
- **Seat Allocation**: Prevents overbooking beyond `availableSeats`.
- **File Upload**: Optional, strictly validated for PDF/JPG/PNG and <= 5 MB.
- **XSS Defense**: Strict use of `textContent` and `createElement` for all dynamic data.
