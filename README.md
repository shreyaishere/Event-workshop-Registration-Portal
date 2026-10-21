# roster — Event & Workshop Registration Portal
**MCA-1A Web Technology and Server-Side Scripting Practical Assessment (MCS3014)**

---

## 1. Project Introduction
**roster** is a responsive, accessible, and complete Event & Workshop Registration Portal engineered for the MCA-1A practical examination (MCS3014). The portal serves as a curated registration desk for engineers, designers, and technology leaders attending high-signal masterclasses, technical workshops, and executive roundtables.

- **Product Name**: `roster`
- **Brand Personality**: Curated, electric, considered.
- **Tagline**: *"Choose a room worth showing up for."*
- **Supporting Hero Copy**: *"Put the next idea on your calendar."*
- **Signal Element**: Leading `//` mark paired with the lowercase wordmark `roster`.

---

## 2. Theme & Objectives
The application simulates a professional event-tech web portal operating entirely on standard web technologies without external dependencies, databases, or paid APIs. It demonstrates:
- Semantic HTML5 structure and landmark accessibility.
- Hand-crafted CSS3 layout architecture using Flexbox and CSS Grid (zero CSS frameworks).
- Dynamic JavaScript DOM manipulation and state synchronization.
- Asynchronous data fetching (AJAX) using a local JSON catalog.
- Web Storage persistence (`localStorage` for themes and `sessionStorage` for form drafts).
- Custom form validation and a 5-factor password strength calculation.
- Three genuine jQuery interactive features.
- Browser Object Model (BOM) APIs (`matchMedia`, `location.hash`, `history.replaceState`, `navigator.clipboard`).
- Defensive client-side security against Cross-Site Scripting (XSS).
- Academic visual demonstrations of the CSS Box Model and Web Storage mechanics.

---

## 3. Technologies Used
| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Markup** | HTML5 | Semantic structure (`header`, `nav`, `main`, `section`, `article`, `table`, `form`, `fieldset`, `legend`, `footer`, `video`) |
| **Styling** | CSS3 | Custom properties (CSS variables), Flexbox, CSS Grid, media queries, dark mode |
| **Client Logic** | Vanilla JavaScript (ES2022) | Application state, DOM rendering, form validation, Web Storage, AJAX |
| **DOM Enhancement** | jQuery 3.7.1 | Smooth scrolling, FAQ accordion disclosure, confirmation transitions |
| **Local Data** | JSON (`data/events.json`) | Catalog of 6 rich technical workshops and masterclasses |
| **Runtime Server** | Node.js HTTP Server (`server.js`) | Local static file serving, MIME type mapping, directory traversal security |

---

## 4. Installation & Prerequisites
- **Node.js**: Version 18.0.0 or higher.
- **Web Browser**: Any modern browser (Google Chrome, Firefox, Safari, Edge).
- No external databases, cloud services, or API keys are required.

---

## 5. How to Start the Local Server
From the project root directory, launch the Node.js server using either of the following commands:

```bash
# Using standard npm script
npm start

# Or directly with Node.js
node server.js
```

By default, the server listens on port `3000` (or the environment variable `PORT` if specified):
```
http://localhost:3000
```
Open `http://localhost:3000` in Google Chrome to test the portal.

---

## 6. Project Structure
```
roster-event-portal/
├── index.html                   # Semantic HTML5 entry point with all 12 sections
├── css/
│   └── style.css                # Pure CSS3 design system, tokens, Grid, Flexbox, dark theme
├── js/
│   ├── script.js                # Core vanilla JS application logic & jQuery enhancements
│   └── logic.js                 # Pure decoupled business logic (ES6+)
├── data/
│   └── events.json              # Local catalog with 6 rich event records
├── assets/
│   ├── images/                  # Responsive SVG illustrations for each workshop & hero
│   │   ├── perf_workshop.svg
│   │   ├── cloud_workshop.svg
│   │   ├── design_workshop.svg
│   │   ├── security_workshop.svg
│   │   ├── ai_workshop.svg
│   │   ├── leadership_workshop.svg
│   │   └── video_poster.svg
│   └── video/                   # Media directory for HTML5 video assets
├── test/
│   └── logic.test.js            # Native Node.js unit tests (node --test)
├── screenshots/
│   └── README.md                # DevTools inspection steps and verification checklist
├── server.js                    # Secure standalone Node.js HTTP server
├── package.json                 # Scripts and metadata
├── plan.md                      # Architecture and branding plan
├── TODO.md                      # Implementation outcomes and status
└── README.md                    # Comprehensive documentation and viva guide
```

---

## 7. Website Features
1. **Dynamic Catalog Discovery**: Asynchronous loading of events via AJAX.
2. **Instant Search & Keyword Filter**: Filters across event titles, topics, speakers, and categories with a clear button.
3. **Multi-Factor Filtering & Sorting**: Filter by category and format (Workshop, Masterclass, Conference, Panel) and sort by date or price.
4. **Synchronized Details Pane**: Clicking any event reveals complete learning outcomes, prerequisites, and hourly agendas while syncing the registration dropdown.
5. **Interactive Schedule Timetable**: Semantic HTML table with session breakdowns and direct detail triggers.
6. **Multi-Control Registration Form**: 13 distinct HTML form controls with real-time field-level validation.
7. **5-Rule Password Entropy Meter**: Requires length, uppercase, lowercase, number, and special character.
8. **Automated Session Drafts**: Preserves form inputs in `sessionStorage` across tab reloads (passwords strictly excluded).
9. **Dark & Light Mode Persistence**: Stored via `localStorage` under `eventPortalTheme`.
10. **Unique Registration ID Generator**: Produces `ROS-2026-XXXX-XXXX` with one-click clipboard copy.
11. **Behind the Room Video**: HTML5 `<video controls>` presentation with poster and fallback text.
12. **Educational Box Model Demo**: Identifiable inspection target (`#box-model-demo`) showcasing margin, border, padding, and content.
13. **Storage Comparison Matrix**: Clear educational breakdown of Cookies vs localStorage vs sessionStorage.
14. **Defensive XSS Demonstration**: Live interactive sandbox testing `<img src=x onerror=alert(1)>`.

---

## 8. Semantic HTML5 Implementation
All landmark and content elements adhere strictly to W3C semantic guidelines:
- `<header role="banner">`: Houses the 3-zone navigation bar, logo, and theme switch.
- `<nav role="navigation">`: Unordered list of accessible anchor navigation links.
- `<main id="main-content">`: Wraps primary page content for assistive skip links.
- `<section>` & `<article>`: Dedicated containers for each logical subsection and individual event cards.
- `<table class="schedule-table">`: Genuine tabular data structure with `<caption>`, `<thead>`, `<tbody>`, `<tr>`, `<th scope="col">`, and `<td>`.
- `<form novalidate>`: Grouped with `<fieldset>` and `<legend>` blocks for credentials, event choices, and accommodations.
- `<video controls>`: Media player with `<source>` and fallback markup.
- `<footer role="contentinfo">`: Academic disclaimers, syllabus mapping, and copyright.

---

## 9. Flexbox & CSS Grid Usage
- **CSS Flexbox**:
  - Site header: 3-zone contract (`space-between`, `gap: 32px`).
  - Hero statistics strip: `display: flex; gap: 36px`.
  - Filter controls toolbar: top and bottom toolbars with flexible search input.
  - Card kicker & metadata rows: `display: flex; justify-content: space-between`.
  - Radio and checkbox groups: horizontal wrap layouts.
  - Footer bottom row.
- **CSS Grid**:
  - Hero composition: Asymmetric 2-column split (`1.15fr 0.85fr`).
  - Event discovery grid: 3-column desktop layout (`repeat(3, 1fr)`).
  - Selected event details: 2-column layout (`1.4fr 1fr`).
  - Registration layout: Form card and Order Summary sidebar (`1.5fr 1fr`).
  - Form fields: 2-column paired input grid (`1fr 1fr`).
  - Storage comparison cards: 3-column grid (`repeat(3, 1fr)`).
  - Box model demo split: 2-column layout (`1.1fr 0.9fr`).

---

## 10. Responsive Breakpoints & Testing Widths
The portal implements explicit media queries tested at all mandatory assessment viewports:
- **1440px (Desktop Large)**: 3-column event grid, asymmetric hero split, full navigation links.
- **1024px (Tablet Landscape)**: 2-column event grid, stacked event details, 2-column footer.
- **768px (Tablet Portrait)**: Mobile hamburger navigation drawer (`aria-expanded`), single-column event grid, accessible horizontal scrolling schedule table.
- **375px (Mobile Standard)**: Stacked form fields, fluid typography, full-width action buttons.
- **320px (Mobile Compact)**: Zero horizontal overflow, compact box model visualization, touch targets >= 44px.

---

## 11. AJAX & Local JSON Loading
- **File**: `data/events.json`
- **Implementation**: `loadEventsData()` in `js/script.js`.
- **Mechanism**: Invokes runtime `fetch('/data/events.json', { headers: { 'Accept': 'application/json' } })`.
- **States Handled**:
  - **Loading**: Renders animated spinner with `aria-label="Loading upcoming events and workshops"`.
  - **Success**: Parses JSON array, verifies structure, populates registration dropdowns, and renders cards without full page reloads.
  - **Error & Retry**: Catches network/HTTP errors, displays a user-friendly error notice, and provides a "Retry Loading Events" button that re-executes the fetch without creating duplicate DOM nodes.

---

## 12. JavaScript DOM & BOM Implementation
The application operates in strict mode (`'use strict'`) with modular functions:
- **DOM Creation**: Uses `document.createElement`, `element.textContent`, `element.setAttribute`, and `container.replaceChildren()`. Never uses `innerHTML` with user-supplied data.
- **BOM APIs Employed**:
  1. `window.matchMedia()`:
     - `(prefers-color-scheme: dark)`: Automatically detects system theme preference on first visit.
     - `(prefers-reduced-motion: reduce)`: Dynamically adjusts smooth scroll duration in jQuery and CSS animations.
  2. `window.location.hash` / `location`:
     - Listens to `hashchange` events to allow deep-linking directly to specific events (e.g., `#event-evt-web-perf`) or views (`#workshops`).
  3. `history.replaceState()`:
     - Updates clean browser URL hashes when selecting cards without triggering intrusive browser history stack pollution.
  4. `navigator.clipboard.writeText()`:
     - Allows one-click copying of the generated Registration ID to the system clipboard with an accessible visual confirmation toast and prompt fallback.

---

## 13. jQuery Features & Code Locations
jQuery 3.7.1 is included to demonstrate three distinct, non-redundant library capabilities:

| Feature | jQuery Methods Used | Code Location | Description |
| :--- | :--- | :--- | :--- |
| **1. Smooth Scrolling Nav** | `$('a[href^="#"]').on('click')`, `animate({ scrollTop })`, `stop()`, `addClass()` | `js/script.js` (`initJQueryFeatures()`) | Smoothly scrolls to targeted anchor sections, highlights the active link, and manages focus while honoring `prefers-reduced-motion`. |
| **2. FAQ Disclosure Accordion** | `$('.faq-question').on('click')`, `closest()`, `find()`, `slideToggle()`, `slideUp()`, `slideDown()` | `js/script.js` (`initJQueryFeatures()`) | Provides an animated accordion disclosure for frequently asked questions while updating `aria-expanded` attributes. |
| **3. Registration Reveal & Clear Search** | `$('#registration-success').slideDown(400)`, `$('#search-clear-btn').fadeOut(150)` | `js/script.js` (`renderRegistrationSuccess()` & `initJQueryFeatures()`) | Smoothly reveals the confirmed registration ticket banner upon valid submission, and animates the search clear button. |

---

## 14. Form Input Types & Custom Validation
The registration form (`#registration-form`) sets `novalidate` to demonstrate custom client-side validation logic:

| Input Control | Type / Tag | Validation Rule & Business Logic |
| :--- | :--- | :--- |
| **Full Name** | `<input type="text">` | Required, leading/trailing whitespace trimmed, rejects empty input. |
| **Email Address** | `<input type="email">` | Required, RFC regex pattern validation, rejects malformed syntax. |
| **Phone Number** | `<input type="tel">` | Required, normalizes spaces/parentheses/dashes, validates 8–15 digits, supports Indian (+91) & international numbers. |
| **Password** | `<input type="password">` | Required, evaluated against all 5 mandatory complexity conditions. |
| **Attendance Date** | `<input type="date">` | Required, validated to ensure date is in the future relative to current date. |
| **Participant Count** | `<input type="number">` | Required, integer between 1 and 8, validated against `availableSeats`. |
| **Attendance Format** | `<input type="radio">` | Required selection across In-Person, Virtual, or Hybrid. |
| **Interests** | `<input type="checkbox">` | Requires at least one interest checkbox to be selected. |
| **Event Selection** | `<select>` | Required, validated against loaded catalog records, updates order summary. |
| **Identity Document** | `<input type="file">` | Optional, validated client-side for MIME type (`pdf`, `jpg`, `png`) and <= 5 MB size. |
| **Special Requests** | `<textarea>` | Optional accessibility and dietary notes. |
| **Submit Action** | `<button type="submit">` | Triggers complete validation cycle and confirmation generation. |
| **Reset Action** | `<button type="reset">` | Resets form fields, clears errors, and removes stored session draft. |

---

## 15. Password-Strength Implementation
Calculated via `calculatePasswordStrength()` in `js/script.js` and verified in `js/logic.js`. Requires all 5 conditions to pass:
1. At least 8 characters.
2. At least one uppercase letter (`[A-Z]`).
3. At least one lowercase letter (`[a-z]`).
4. At least one number digit (`[0-9]`).
5. At least one special character (`[^A-Za-z0-9]`).

The UI provides real-time visual feedback:
- **Color-Coded Meter Bar**: Red (Weak, <= 2 checks) → Amber (Medium, 3-4 checks) → Teal/Green (Strong, 5 checks).
- **Checklist Indicators**: Real-time checkmarks (`✓`) beside each of the 5 rules.
- **Form Gate**: Submissions are strictly rejected with an error message unless all 5 conditions are fulfilled.

---

## 16. localStorage & sessionStorage Behavior
- **`localStorage` (Key: `eventPortalTheme`)**:
  - Stores `'light'` or `'dark'`.
  - Restored on page load, setting `data-theme` on the `<html>` root element.
  - Updates button accessible label (`aria-label`) and icon.
  - Also persists non-sensitive confirmed registration logs under `rosterRegistrations`.
- **`sessionStorage` (Key: `registrationDraft`)**:
  - Debounced auto-save listener triggers as the user types or toggles inputs.
  - **Zero Password Storage**: Password values and binary file attachments are strictly excluded to prevent credential theft.
  - On page refresh within the same browser tab, draft data is restored into inputs with a status notification: *"Draft restored from this browser session. Password must be re-entered."*
  - Automatically cleared upon successful form submission or form reset.
- **Error Handling**: All storage calls are wrapped in `try...catch` blocks to prevent crashes in private browsing modes where storage access may be denied.

---

## 17. Cookies vs. Web Storage
| Attribute | HTTP Cookies | `localStorage` | `sessionStorage` |
| :--- | :--- | :--- | :--- |
| **Storage Capacity** | ~4 KB | ~5 MB to 10 MB | ~5 MB |
| **Data Lifetime** | Configurable (`Expires`/`Max-Age`) | Persistent until explicitly cleared | Scoped to active browser tab |
| **Network Overhead** | Sent with every matching HTTP request | Never sent over HTTP | Never sent over HTTP |
| **Security Flags** | Supports `HttpOnly`, `Secure`, `SameSite` | Accessible via client JavaScript | Accessible via client JavaScript |
| **roster Application** | Not used (avoids header bloat) | Theme preference & confirmed logs | Ephemeral registration drafts |

---

## 18. Error Handling
- **Defensive DOM Checks**: All DOM queries verify element existence before attaching handlers.
- **Storage Availability Probe**: `testStorageAvailability()` validates quota and privacy modes before storage invocations.
- **Network Failures**: `try...catch` in `loadEventsData()` handles HTTP status errors, JSON syntax errors, and missing properties with user-friendly retry states.
- **Form Errors**: Field-level containers and live regions (`aria-live="polite"`) announce validation issues to screen readers.

---

## 19. XSS Prevention & The Security Test
To demonstrate protection against Cross-Site Scripting (XSS), the portal includes an interactive security demonstration testing the payload:
```html
<img src=x onerror=alert(1)>
```
### Why `textContent` is Safe:
1. `innerHTML` treats input strings as markup and passes them to the HTML parser, causing the browser to evaluate the `onerror` attribute and execute arbitrary JavaScript.
2. `textContent` and `createTextNode` treat input exclusively as raw text strings. The characters `<`, `>`, and `"` are converted to literal text representations without invoking the browser's execution engine.
3. Verification: Entering `<img src=x onerror=alert(1)>` into the participant name field or the security sandbox renders the text literally on screen without triggering an alert dialog or executing scripts.

---

## 20. HTML5 Video Implementation
- Located in the "Behind the Room" section (`#about`).
- Element: `<video controls preload="metadata" poster="/assets/images/video_poster.svg">`.
- Source: Encoded MP4 stream with MIME type `video/mp4`.
- Fallback: Descriptive fallback paragraph for legacy browsers unable to render HTML5 video.

---

## 21. SVG Implementation
- **Hero Graphic**: Inline SVG with responsive `viewBox="0 0 540 380"`, orbital paths, track coordinates, and CSS keyframe pulse animations.
- **Event Visuals**: Original standalone SVGs (`perf_workshop.svg`, `cloud_workshop.svg`, `design_workshop.svg`, `security_workshop.svg`, `ai_workshop.svg`, `leadership_workshop.svg`) loaded inside card media containers with descriptive `alt` tags.
- **Reduced Motion**: All SVG animations respect `prefers-reduced-motion: reduce`.

---

## 22. CSS Box Model Explanation
Located at `#box-model-demo`, the demonstration renders four physically nested layers:
1. **Content Box**: Core area containing element text and child nodes (`width` × `height`).
2. **Padding**: 28px internal clearance between content and border (`background-color: #bae6fd`).
3. **Border**: 12px solid line wrapping padding (`border: 12px solid #2563eb`).
4. **Margin**: 32px external breathing space separating the element from neighbors (`box-shadow: 0 0 0 20px #fef3c7`).

### DevTools Inspection Steps:
1. Right-click `#box-model-demo` in Google Chrome and choose **Inspect**.
2. Select the **Computed** tab in DevTools.
3. Observe the live computed box model diagram reflecting dimensions and box-sizing calculations.

---

## 23. Accessibility Practices
- **WCAG AA Compliance**: High-contrast ratios meeting the 4.5:1 requirement in both light and dark themes.
- **Keyboard Operability**: Full navigation support via Tab, Enter, Space, and Escape.
- **Visible Focus Rings**: `:focus-visible` styled with `2px solid #2563eb` and `outline-offset: 2px`.
- **Form Associations**: Explicit `<label for="...">`, `<span class="required-mark">*</span>`, and `aria-describedby` links to field error containers.
- **Live Regions**: Form validation feedback announced through `aria-live="polite"`.

---

## 24. Lighthouse & WAVE Audit Guidelines
To audit the live portal:
1. Open `http://localhost:3000` in Google Chrome.
2. Open DevTools (`Ctrl+Shift+I` or `Cmd+Option+I`) and navigate to the **Lighthouse** tab.
3. Select **Desktop** or **Mobile** mode and check **Accessibility**, **Best Practices**, and **SEO**.
4. Click **Analyze page load**.
5. Target scores: Performance >= 95, Accessibility = 100, Best Practices = 100, SEO = 100.
6. For WAVE, install the WAVE Chrome extension and run an audit to confirm 0 errors.

---

## 25. Testing Checklist
- [x] Local JSON data fetched via AJAX without page reloads.
- [x] Search filters events by title, speaker, and keywords.
- [x] Category and type filter pills update card count and grid view.
- [x] Sorting by date and price updates cards deterministically.
- [x] Reset filters restores default card set.
- [x] Selected card updates details pane and syncs registration select element.
- [x] Schedule table displays all events and allows direct session inspection.
- [x] Form submission blocks invalid emails, short/long phone numbers, and weak passwords.
- [x] Password meter verifies all 5 conditions in real time.
- [x] Registration draft saves to `sessionStorage` and restores on refresh.
- [x] Theme preference saves to `localStorage` and persists on page reload.
- [x] XSS payload `<img src=x onerror=alert(1)>` renders safely as literal text.
- [x] Valid submission reveals confirmation screen with unique Registration ID.
- [x] Registration ID copies to clipboard with visual confirmation.
- [x] All 7 automated unit tests pass cleanly via `node --test test/logic.test.js`.

---

## 26. Requirement-to-Implementation Mapping Table

| Assessment PDF Requirement | Implementation File | Function / Section |
| :--- | :--- | :--- |
| **Semantic HTML5** | `index.html` | `<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<table>`, `<form>`, `<footer>` |
| **CSS3 Design Tokens & Layout** | `css/style.css` | `:root`, `[data-theme="dark"]`, Flexbox, CSS Grid |
| **Responsive Media Queries** | `css/style.css` | Breakpoints for 320px, 375px, 768px, 1024px, 1440px |
| **AJAX JSON Loading** | `js/script.js` | `loadEventsData()` requesting `data/events.json` |
| **Dynamic Filtering & Search** | `js/script.js` | `applyFiltersAndRender()`, `resetAllFilters()` |
| **Synchronized Details Pane** | `js/script.js` | `selectEvent()`, `renderEventDetailPanel()` |
| **13 Form Control Types** | `index.html` | Text, Email, Tel, Password, Date, Number, Radio, Checkbox, Select, File, Textarea, Submit, Reset |
| **Custom Form Validation** | `js/script.js` | `handleFormSubmit()`, `showFieldError()`, `isValidEmail()`, `validatePhoneNumber()` |
| **5-Rule Password Meter** | `js/script.js` | `calculatePasswordStrength()`, `updatePasswordStrengthUI()` |
| **Web Storage (`localStorage`)** | `js/script.js` | `initTheme()`, `applyTheme()`, `toggleTheme()` with key `eventPortalTheme` |
| **Web Storage (`sessionStorage`)** | `js/script.js` | `saveDraft()`, `restoreDraft()`, `clearDraft()` with key `registrationDraft` |
| **BOM APIs (3+ used)** | `js/script.js` | `window.matchMedia`, `location.hash`, `history.replaceState`, `navigator.clipboard` |
| **jQuery Feature 1 (Smooth Scroll)** | `js/script.js` | `$('a[href^="#"]').on('click')` with reduced motion check |
| **jQuery Feature 2 (FAQ Accordion)** | `js/script.js` | `$('.faq-question').on('click')` with `slideToggle()` |
| **jQuery Feature 3 (Confirmation Reveal)** | `js/script.js` | `$('#registration-success').slideDown(400)` & clear search |
| **XSS Protection Demonstration** | `index.html`, `js/script.js` | Safe DOM text insertion using `textContent` for `<img src=x onerror=alert(1)>` |
| **CSS Box Model Demonstration** | `index.html`, `css/style.css` | Identifiable `#box-model-demo` with visual layers and DevTools instructions |
| **Cookies vs Web Storage Guide** | `index.html` | Section `#security` with 3 comparative educational cards |
| **HTML5 Video** | `index.html` | Section `#about` with `<video controls>`, poster, and fallback |
| **Node.js HTTP Server** | `server.js` | Listens on port 3000, safe path resolution, MIME types, security headers |
