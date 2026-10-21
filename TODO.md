# roster — Implementation Outcomes & Acceptance Criteria (TODO.md)

### Phase 1: Analysis & System Architecture
- [x] Review academic requirements from MCA-1A MCS3014 specification.
- [x] Establish pure decoupled business logic module in `js/logic.js`.
- [x] Verify pure logic with deterministic Node unit tests (`test/logic.test.js`).

### Phase 2: Data & Local Runtime
- [x] Create rich event catalog in `data/events.json` with 6 detailed event records.
- [x] Implement robust Node.js HTTP server in `server.js` with port 3000 default.
- [x] Implement runtime AJAX data fetching with loading state, error state, and retry capability.
- [x] Provide responsive SVG media assets in `assets/images/` and video poster.

### Phase 3: Semantic HTML5 & CSS3 Design System
- [x] Build semantic structure in `index.html` with `<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<table>`, `<form>`, `<footer>`.
- [x] Construct pure CSS3 styling in `css/style.css` with CSS custom properties.
- [x] Implement Flexbox and CSS Grid layouts.
- [x] Add responsive breakpoints for 320px, 375px, 768px, 1024px, 1440px.
- [x] Implement dark mode support via `[data-theme="dark"]`.
- [x] Enforce zero-pill metadata discipline and typographic hierarchy.

### Phase 4: Interactive Client Features & DOM/BOM
- [x] Dynamic rendering of event cards using safe DOM methods (`createElement`, `textContent`).
- [x] Multi-factor filtering: keyword search, category, event format pills, date/price sorting, and filter reset.
- [x] Dynamic selected event details panel synchronized with selection and URL hash (`#event-id`).
- [x] Responsive schedule table with semantic headers (`<th scope="col">`).
- [x] Custom form validation with 13 distinct control types and accessible `aria-invalid` attributes.
- [x] Real-time password strength meter checking all 5 mandatory conditions.
- [x] Registration success state with unique ID generation (`ROS-2026-XXXX-XXXX`) and clipboard copy.
- [x] `localStorage` persistence for theme preference (`eventPortalTheme`).
- [x] `sessionStorage` persistence for form drafts (`registrationDraft`), excluding passwords and files.
- [x] Genuine BOM integrations: `matchMedia`, `location.hash`, `history.replaceState`, `navigator.clipboard`.

### Phase 5: jQuery Features & Security Hardening
- [x] jQuery Feature 1: Smooth scrolling navigation with active section highlighting.
- [x] jQuery Feature 2: Event-driven FAQ accordion disclosure.
- [x] jQuery Feature 3: Registration confirmation reveal (`slideDown`) & clear-search animations.
- [x] Safe input rendering via `textContent` preventing DOM-based XSS.
- [x] Live XSS test demonstration sandbox verifying `<img src=x onerror=alert(1)>`.
- [x] Client-side document upload validation (format and 5 MB size limit).

### Phase 6: Educational Demonstrations & Verification
- [x] HTML5 `<video controls>` presentation ("Behind the room").
- [x] Cookies vs. localStorage vs. sessionStorage comparison.
- [x] CSS Box Model visual demonstration (`#box-model-demo`) and DevTools inspection guide.
- [x] Headless browser verification via Playwright CLI.
