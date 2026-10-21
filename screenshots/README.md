# roster — Screenshot & Verification Checklist

This directory contains verification instructions and records of visual inspections performed on the running roster event portal.

### Verification Viewports Tested
1. **Desktop Viewport (1440 × 900)**:
   - Full asymmetric hero layout with animated inline SVG.
   - 3-zone sticky navigation header.
   - 3-column event discovery grid.
   - 2-column event details breakdown.
   - Full-width registration form and summary sidebar.
   - CSS Box model visual layers.

2. **Tablet Viewport (768 × 1024)**:
   - 2-column event grid layout.
   - Stacked hero and event details.
   - Accessible table horizontal scroll container.

3. **Mobile Viewport (390 × 844 / 320 × 568)**:
   - Collapsible mobile hamburger menu (`aria-expanded`).
   - Single-column event cards.
   - Tappable controls and full-width form inputs.
   - No horizontal layout overflow.

### Chrome DevTools Box Model Capture Protocol
1. Open the running portal in Google Chrome (`http://localhost:3000`).
2. Scroll to section with heading "The CSS Box Model Demonstration".
3. Right-click on `#box-model-demo` and select **Inspect**.
4. In DevTools, open the **Computed** panel on the right.
5. Capture the Box Model diagram showing Margin (32px), Border (12px), Padding (28px), and Content.
6. Save the capture as `screenshots/devtools-box-model.png`.
