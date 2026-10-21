/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * roster — Event & Workshop Registration Portal
 * Core Client Application Architecture (Vanilla JavaScript + jQuery Enhancements)
 * MCA-1A Practical Assessment (MCS3014)
 */

'use strict';

/* ==========================================================================
   1. State Management & Configuration
   ========================================================================== */
const AppState = {
  events: [],
  filteredEvents: [],
  selectedEvent: null,
  isLoading: true,
  error: null,
  filters: {
    query: '',
    category: 'all',
    type: 'all',
    sortBy: 'default'
  },
  theme: 'light',
  storageAvailable: {
    local: false,
    session: false
  }
};

const STORAGE_KEYS = {
  THEME: 'eventPortalTheme',
  DRAFT: 'registrationDraft',
  REGISTRATIONS: 'rosterRegistrations'
};

/* ==========================================================================
   2. Pure Logic & Validation Helpers
   ========================================================================== */

/**
 * Checks availability of Web Storage APIs safely within a try...catch block
 */
function testStorageAvailability() {
  try {
    const testKey = '__roster_test__';
    window.localStorage.setItem(testKey, testKey);
    window.localStorage.removeItem(testKey);
    AppState.storageAvailable.local = true;
  } catch {
    AppState.storageAvailable.local = false;
  }

  try {
    const testKey = '__roster_test__';
    window.sessionStorage.setItem(testKey, testKey);
    window.sessionStorage.removeItem(testKey);
    AppState.storageAvailable.session = true;
  } catch {
    AppState.storageAvailable.session = false;
  }
}

/**
 * Validates email according to RFC specification
 */
function isValidEmail(email) {
  if (!email || typeof email !== 'string') return false;
  const regex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
  return regex.test(email.trim());
}

/**
 * Validates and normalizes phone numbers (Indian & International, 8-15 digits)
 */
function validatePhoneNumber(phone) {
  if (!phone || typeof phone !== 'string') {
    return { isValid: false, normalized: '', error: 'Phone number is required.' };
  }
  const cleaned = phone.trim().replace(/[\s().-]/g, '');
  const hasPlus = cleaned.startsWith('+');
  const digits = hasPlus ? cleaned.slice(1) : cleaned;

  if (!/^\d+$/.test(digits)) {
    return { isValid: false, normalized: '', error: 'Phone number must contain digits only.' };
  }
  if (digits.length < 8 || digits.length > 15) {
    return { isValid: false, normalized: '', error: 'Please enter a valid phone number (8 to 15 digits).' };
  }
  return { isValid: true, normalized: hasPlus ? `+${digits}` : digits };
}

/**
 * Calculates password strength satisfying all 5 mandatory conditions:
 * 1. >= 8 characters
 * 2. >= 1 uppercase letter
 * 3. >= 1 lowercase letter
 * 4. >= 1 number
 * 5. >= 1 special character
 */
function calculatePasswordStrength(password) {
  if (!password) {
    return {
      score: 0,
      level: 'empty',
      rules: { length: false, uppercase: false, lowercase: false, number: false, special: false },
      passedCount: 0
    };
  }

  const rules = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[^A-Za-z0-9]/.test(password)
  };

  const passedCount = Object.values(rules).filter(Boolean).length;
  let level = 'weak';
  if (passedCount === 0) level = 'empty';
  else if (passedCount <= 2) level = 'weak';
  else if (passedCount <= 4) level = 'medium';
  else if (passedCount === 5) level = 'strong';

  return { score: passedCount, level, rules, passedCount };
}

/**
 * Generates a unique registration ID: ROS-2026-XXXX-XXXX
 */
function createRegistrationId() {
  try {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      const u = crypto.randomUUID().replace(/-/g, '').toUpperCase().slice(0, 8);
      return `ROS-2026-${u.slice(0, 4)}-${u.slice(4, 8)}`;
    }
  } catch {
    // fallback
  }
  const r = Math.random().toString(36).substring(2, 10).toUpperCase();
  return `ROS-2026-${r.slice(0, 4)}-${r.slice(4, 8)}`;
}

/* ==========================================================================
   3. Theme Management (localStorage 'eventPortalTheme') & BOM matchMedia
   ========================================================================== */
function initTheme() {
  let preferredTheme = 'light';

  // 1. Check localStorage first
  if (AppState.storageAvailable.local) {
    try {
      const savedTheme = localStorage.getItem(STORAGE_KEYS.THEME);
      if (savedTheme === 'dark' || savedTheme === 'light') {
        preferredTheme = savedTheme;
      }
    } catch (err) {
      console.warn('Could not read theme from localStorage:', err);
    }
  }

  // 2. BOM: matchMedia fallback if not set
  if (!localStorage.getItem(STORAGE_KEYS.THEME) && window.matchMedia) {
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      preferredTheme = 'dark';
    }
  }

  applyTheme(preferredTheme);

  // Setup toggle listener
  const toggleBtn = document.getElementById('theme-toggle-btn');
  if (toggleBtn) {
    toggleBtn.addEventListener('click', toggleTheme);
  }
}

function applyTheme(theme) {
  AppState.theme = theme;
  document.documentElement.setAttribute('data-theme', theme);

  if (AppState.storageAvailable.local) {
    try {
      localStorage.setItem(STORAGE_KEYS.THEME, theme);
    } catch (err) {
      console.warn('Failed to persist theme in localStorage:', err);
    }
  }

  const toggleBtn = document.getElementById('theme-toggle-btn');
  if (toggleBtn) {
    toggleBtn.setAttribute('aria-label', theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');
    toggleBtn.setAttribute('title', theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');
    const icon = toggleBtn.querySelector('.theme-icon');
    if (icon) {
      icon.textContent = theme === 'dark' ? '☀️' : '🌙';
    }
  }
}

function toggleTheme() {
  const newTheme = AppState.theme === 'dark' ? 'light' : 'dark';
  applyTheme(newTheme);
}

/* ==========================================================================
   4. AJAX & Runtime JSON Data Loading
   ========================================================================== */
async function loadEventsData() {
  const grid = document.getElementById('events-grid');
  AppState.isLoading = true;
  AppState.error = null;

  renderEventsLoading(grid);

  try {
    // Runtime fetch of local JSON file
    const response = await fetch('/data/events.json', {
      headers: { 'Accept': 'application/json' }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    if (!Array.isArray(data) || data.length === 0) {
      throw new Error('Event data payload is empty or malformed.');
    }

    AppState.events = data;
    AppState.filteredEvents = [...data];
    AppState.isLoading = false;

    // Populate registration select options
    populateEventSelectOptions(data);

    // Initial render of discovery grid
    applyFiltersAndRender();

    // Select the first event by default to populate details & schedule without scrolling or altering initial URL
    if (!AppState.selectedEvent && data.length > 0) {
      selectEvent(data[0].id, false, false);
    }

    // Populate schedule table
    renderScheduleTable(data);

    // BOM: check if location.hash points to an explicit target
    if (window.location.hash && window.location.hash.length > 1) {
      handleHashNavigation();
    }

  } catch (err) {
    console.error('AJAX Data Fetch Failed:', err);
    AppState.isLoading = false;
    AppState.error = err.message || 'Unable to retrieve event catalog.';
    renderEventsError(grid, AppState.error);
  }
}

function renderEventsLoading(container) {
  if (!container) return;
  container.replaceChildren();

  const stateBox = document.createElement('div');
  stateBox.className = 'state-container';

  const spinner = document.createElement('div');
  spinner.className = 'spinner';
  spinner.setAttribute('role', 'status');
  spinner.setAttribute('aria-label', 'Loading upcoming events and workshops');

  const title = document.createElement('h3');
  title.className = 'state-title';
  title.textContent = 'Loading Curated Catalog';

  const copy = document.createElement('p');
  copy.className = 'state-copy';
  copy.textContent = 'Fetching event schedules, seat allocations, and speaker profiles via AJAX...';

  stateBox.appendChild(spinner);
  stateBox.appendChild(title);
  stateBox.appendChild(copy);
  container.appendChild(stateBox);
}

function renderEventsError(container, errorMessage) {
  if (!container) return;
  container.replaceChildren();

  const stateBox = document.createElement('div');
  stateBox.className = 'state-container';

  const title = document.createElement('h3');
  title.className = 'state-title';
  title.style.color = 'var(--color-status-rose)';
  title.textContent = 'Unable to Load Events';

  const copy = document.createElement('p');
  copy.className = 'state-copy';
  copy.textContent = `A network or data parsing error occurred: ${errorMessage}. Please check your connection or try again.`;

  const retryBtn = document.createElement('button');
  retryBtn.id = 'retry-fetch-btn';
  retryBtn.className = 'btn btn-primary btn-sm';
  retryBtn.textContent = 'Retry Loading Events';
  retryBtn.addEventListener('click', () => {
    loadEventsData();
  });

  stateBox.appendChild(title);
  stateBox.appendChild(copy);
  stateBox.appendChild(retryBtn);
  container.appendChild(stateBox);
}

/* ==========================================================================
   5. Event Discovery, Safe DOM Rendering, and Filtering
   ========================================================================== */
function applyFiltersAndRender() {
  const { query, category, type, sortBy } = AppState.filters;

  const q = query.trim().toLowerCase();
  const c = category.toLowerCase();
  const t = type.toLowerCase();

  let results = AppState.events.filter(item => {
    // Search query matching
    if (q) {
      const matchTitle = (item.title || '').toLowerCase().includes(q);
      const matchSpeaker = (item.speaker || '').toLowerCase().includes(q);
      const matchDesc = (item.description || '').toLowerCase().includes(q);
      const matchCat = (item.category || '').toLowerCase().includes(q);
      if (!matchTitle && !matchSpeaker && !matchDesc && !matchCat) {
        return false;
      }
    }

    // Category filter
    if (c !== 'all' && (item.category || '').toLowerCase() !== c) {
      return false;
    }

    // Event type filter
    if (t !== 'all' && (item.type || '').toLowerCase() !== t) {
      return false;
    }

    return true;
  });

  // Sorting
  results.sort((a, b) => {
    if (sortBy === 'date-asc') {
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    }
    if (sortBy === 'date-desc') {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    }
    if (sortBy === 'price-asc') {
      return (a.priceValue || 0) - (b.priceValue || 0);
    }
    if (sortBy === 'price-desc') {
      return (b.priceValue || 0) - (a.priceValue || 0);
    }
    return 0;
  });

  AppState.filteredEvents = results;

  // Update counter
  const counterEl = document.getElementById('results-count');
  if (counterEl) {
    counterEl.textContent = results.length.toString();
  }

  // Render cards safely
  renderEventCards(results);
}

/**
 * Renders event cards using safe DOM methods (createElement, textContent)
 * Zero innerHTML with user or untrusted data to eliminate XSS risks
 */
function renderEventCards(eventsList) {
  const grid = document.getElementById('events-grid');
  if (!grid) return;

  grid.replaceChildren();

  if (eventsList.length === 0) {
    const emptyBox = document.createElement('div');
    emptyBox.className = 'state-container';

    const title = document.createElement('h3');
    title.className = 'state-title';
    title.textContent = 'No Matching Events Found';

    const copy = document.createElement('p');
    copy.className = 'state-copy';
    copy.textContent = 'Try adjusting your search keywords, clearing filters, or switching categories.';

    const resetBtn = document.createElement('button');
    resetBtn.className = 'btn btn-secondary btn-sm';
    resetBtn.textContent = 'Reset All Filters';
    resetBtn.addEventListener('click', resetAllFilters);

    emptyBox.appendChild(title);
    emptyBox.appendChild(copy);
    emptyBox.appendChild(resetBtn);
    grid.appendChild(emptyBox);
    return;
  }

  eventsList.forEach(event => {
    const card = document.createElement('article');
    card.className = 'event-card';
    card.setAttribute('data-id', event.id);
    if (AppState.selectedEvent && AppState.selectedEvent.id === event.id) {
      card.classList.add('selected-card');
    }

    // Media
    const media = document.createElement('div');
    media.className = 'card-media';

    const img = document.createElement('img');
    img.src = event.image;
    img.alt = event.alt || event.title;
    img.loading = 'lazy';
    media.appendChild(img);

    // Content container
    const content = document.createElement('div');
    content.className = 'card-content';

    // Zero-Pill Kicker: Category · Format
    const kicker = document.createElement('div');
    kicker.className = 'card-kicker';

    const catSpan = document.createElement('span');
    catSpan.textContent = event.category;

    const sepSpan = document.createElement('span');
    sepSpan.className = 'meta-separator';
    sepSpan.textContent = '·';

    const typeSpan = document.createElement('span');
    typeSpan.textContent = event.type;

    kicker.appendChild(catSpan);
    kicker.appendChild(sepSpan);
    kicker.appendChild(typeSpan);

    // Title
    const title = document.createElement('h3');
    title.className = 'card-title';
    title.textContent = event.title;

    // Short Description
    const desc = document.createElement('p');
    desc.className = 'card-description';
    desc.textContent = event.description;

    // Meta List
    const metaList = document.createElement('div');
    metaList.className = 'card-meta-list';

    // Date & Time Row
    const dateRow = document.createElement('div');
    dateRow.className = 'card-meta-row';
    const dateLabel = document.createElement('span');
    dateLabel.className = 'card-meta-label';
    dateLabel.textContent = 'Date & Time';
    const dateVal = document.createElement('span');
    dateVal.className = 'card-meta-val';
    dateVal.textContent = `${formatDisplayDate(event.date)} · ${event.startTime}`;
    dateRow.appendChild(dateLabel);
    dateRow.appendChild(dateVal);

    // Speaker Row
    const speakerRow = document.createElement('div');
    speakerRow.className = 'card-meta-row';
    const speakerLabel = document.createElement('span');
    speakerLabel.className = 'card-meta-label';
    speakerLabel.textContent = 'Speaker';
    const speakerVal = document.createElement('span');
    speakerVal.className = 'card-meta-val';
    speakerVal.textContent = event.speaker;
    speakerRow.appendChild(speakerLabel);
    speakerRow.appendChild(speakerVal);

    // Seats Row
    const seatsRow = document.createElement('div');
    seatsRow.className = 'card-meta-row';
    const seatsLabel = document.createElement('span');
    seatsLabel.className = 'card-meta-label';
    seatsLabel.textContent = 'Availability';
    const seatsVal = document.createElement('span');
    seatsVal.className = 'card-meta-val seats-badge';
    if (event.availableSeats <= 10) {
      seatsVal.classList.add('low');
      seatsVal.textContent = `${event.availableSeats} seats left (Filling Fast)`;
    } else {
      seatsVal.textContent = `${event.availableSeats} seats available`;
    }
    seatsRow.appendChild(seatsLabel);
    seatsRow.appendChild(seatsVal);

    metaList.appendChild(dateRow);
    metaList.appendChild(speakerRow);
    metaList.appendChild(seatsRow);

    // Footer with Price & Actions
    const footer = document.createElement('div');
    footer.className = 'card-footer';

    const price = document.createElement('div');
    price.className = 'card-price';
    price.textContent = event.price;

    const actions = document.createElement('div');
    actions.className = 'card-actions';

    const detailsBtn = document.createElement('button');
    detailsBtn.type = 'button';
    detailsBtn.className = 'btn btn-secondary btn-sm';
    detailsBtn.textContent = 'View Details';
    detailsBtn.setAttribute('aria-label', `View details for ${event.title}`);
    detailsBtn.addEventListener('click', () => {
      selectEvent(event.id, true);
    });

    const regBtn = document.createElement('button');
    regBtn.type = 'button';
    regBtn.className = 'btn btn-primary btn-sm';
    regBtn.textContent = 'Register';
    regBtn.setAttribute('aria-label', `Register for ${event.title}`);
    regBtn.addEventListener('click', () => {
      selectEvent(event.id, false);
      scrollToRegistration(event.id);
    });

    actions.appendChild(detailsBtn);
    actions.appendChild(regBtn);

    footer.appendChild(price);
    footer.appendChild(actions);

    content.appendChild(kicker);
    content.appendChild(title);
    content.appendChild(desc);
    content.appendChild(metaList);
    content.appendChild(footer);

    card.appendChild(media);
    card.appendChild(content);

    grid.appendChild(card);
  });
}

function formatDisplayDate(dateStr) {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return dateStr;
  }
}

function resetAllFilters() {
  AppState.filters.query = '';
  AppState.filters.category = 'all';
  AppState.filters.type = 'all';
  AppState.filters.sortBy = 'default';

  const searchInput = document.getElementById('event-search-input');
  if (searchInput) {
    searchInput.value = '';
    toggleClearSearchBtn('');
  }

  const categorySelect = document.getElementById('category-filter-select');
  if (categorySelect) categorySelect.value = 'all';

  const sortSelect = document.getElementById('sort-filter-select');
  if (sortSelect) sortSelect.value = 'default';

  // Reset type buttons
  document.querySelectorAll('.type-filter-btn').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-type') === 'all');
  });

  applyFiltersAndRender();
}

/* ==========================================================================
   6. Event Details & Dynamic Synchronization
   ========================================================================== */
function selectEvent(eventId, shouldScroll = false, updateHash = true) {
  const found = AppState.events.find(e => e.id === eventId);
  if (!found) return;

  AppState.selectedEvent = found;

  // Mark selected card visually
  document.querySelectorAll('.event-card').forEach(card => {
    const isTarget = card.getAttribute('data-id') === eventId;
    card.classList.toggle('selected-card', isTarget);
  });

  // Render details panel safely
  renderEventDetailPanel(found);

  // Sync with registration form
  syncRegistrationEventSelect(found.id);

  // Update order summary
  updateOrderSummary(found);

  // BOM: Update URL hash without full reload using history.replaceState
  if (updateHash && window.history && window.history.replaceState) {
    window.history.replaceState(null, '', `#event-${found.id}`);
  }

  if (shouldScroll) {
    const detailSection = document.getElementById('event-detail-section');
    if (detailSection) {
      detailSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
}

function renderEventDetailPanel(event) {
  const panel = document.getElementById('event-detail-panel');
  if (!panel) return;

  panel.replaceChildren();

  const grid = document.createElement('div');
  grid.className = 'detail-grid';

  // Left column (Main details, agenda, requirements)
  const leftCol = document.createElement('div');
  leftCol.className = 'detail-main';

  // Kicker
  const kicker = document.createElement('div');
  kicker.className = 'detail-kicker';
  kicker.textContent = `${event.category} · ${event.type} · ${event.format}`;

  // Title
  const title = document.createElement('h3');
  title.className = 'detail-title';
  title.textContent = event.title;

  // Full Description
  const longDesc = document.createElement('p');
  longDesc.className = 'detail-long-desc';
  longDesc.textContent = event.longDescription;

  // Requirements
  const reqHeading = document.createElement('h4');
  reqHeading.className = 'detail-subheading';
  reqHeading.textContent = 'Prerequisites & Technical Requirements';

  const reqList = document.createElement('ul');
  reqList.className = 'detail-list';
  (event.requirements || []).forEach(req => {
    const li = document.createElement('li');
    li.className = 'detail-list-item';
    const bullet = document.createElement('span');
    bullet.className = 'detail-bullet';
    bullet.textContent = '→';
    const text = document.createElement('span');
    text.textContent = req;
    li.appendChild(bullet);
    li.appendChild(text);
    reqList.appendChild(li);
  });

  // Learning Outcomes
  const outHeading = document.createElement('h4');
  outHeading.className = 'detail-subheading';
  outHeading.textContent = 'Core Learning Outcomes';

  const outList = document.createElement('ul');
  outList.className = 'detail-list';
  (event.learningOutcomes || []).forEach(outcome => {
    const li = document.createElement('li');
    li.className = 'detail-list-item';
    const bullet = document.createElement('span');
    bullet.className = 'detail-bullet';
    bullet.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" style="color:var(--color-status-teal)"><polyline points="20 6 9 17 4 12"></polyline></svg>';
    const text = document.createElement('span');
    text.textContent = outcome;
    li.appendChild(bullet);
    li.appendChild(text);
    outList.appendChild(li);
  });

  // Agenda Timeline
  const agendaHeading = document.createElement('h4');
  agendaHeading.className = 'detail-subheading';
  agendaHeading.textContent = `Event Agenda (${event.duration})`;

  const agendaBox = document.createElement('div');
  agendaBox.className = 'agenda-timeline';
  (event.agenda || []).forEach(item => {
    const itemEl = document.createElement('div');
    itemEl.className = 'agenda-item';

    const timeSpan = document.createElement('span');
    timeSpan.className = 'agenda-time';
    timeSpan.textContent = item.time;

    const topicSpan = document.createElement('span');
    topicSpan.className = 'agenda-topic';
    topicSpan.textContent = item.topic;

    itemEl.appendChild(timeSpan);
    itemEl.appendChild(topicSpan);
    agendaBox.appendChild(itemEl);
  });

  leftCol.appendChild(kicker);
  leftCol.appendChild(title);
  leftCol.appendChild(longDesc);
  leftCol.appendChild(reqHeading);
  leftCol.appendChild(reqList);
  leftCol.appendChild(outHeading);
  leftCol.appendChild(outList);
  leftCol.appendChild(agendaHeading);
  leftCol.appendChild(agendaBox);

  // Right column (Speaker profile, venue, registration CTA)
  const rightCol = document.createElement('div');
  rightCol.className = 'detail-sidebar';

  // Speaker Card
  const speakerBox = document.createElement('div');
  speakerBox.className = 'sidebar-box speaker-profile';

  const speakerH4 = document.createElement('h4');
  speakerH4.className = 'section-eyebrow';
  speakerH4.textContent = 'Session Instructor';

  const speakerName = document.createElement('p');
  speakerName.className = 'speaker-name';
  speakerName.textContent = event.speaker;

  const speakerTitle = document.createElement('p');
  speakerTitle.className = 'speaker-title';
  speakerTitle.textContent = event.speakerTitle;

  const speakerBio = document.createElement('p');
  speakerBio.className = 'speaker-bio';
  speakerBio.textContent = event.speakerBio;

  speakerBox.appendChild(speakerH4);
  speakerBox.appendChild(speakerName);
  speakerBox.appendChild(speakerTitle);
  speakerBox.appendChild(speakerBio);

  // Quick Booking Summary Box
  const bookingBox = document.createElement('div');
  bookingBox.className = 'sidebar-box booking-summary-strip';

  const bookH4 = document.createElement('h4');
  bookH4.className = 'section-eyebrow';
  bookH4.textContent = 'Event Information';

  const rows = [
    { label: 'Date', val: `${formatDisplayDate(event.date)}` },
    { label: 'Time', val: `${event.startTime} - ${event.endTime}` },
    { label: 'Location', val: event.location },
    { label: 'Format', val: event.format },
    { label: 'Seats Left', val: `${event.availableSeats} of ${event.totalSeats}` }
  ];

  rows.forEach(r => {
    const rowEl = document.createElement('div');
    rowEl.className = 'summary-row';
    const l = document.createElement('span');
    l.className = 'card-meta-label';
    l.textContent = r.label;
    const v = document.createElement('span');
    v.className = 'card-meta-val';
    v.textContent = r.val;
    rowEl.appendChild(l);
    rowEl.appendChild(v);
    bookingBox.appendChild(rowEl);
  });

  const priceRow = document.createElement('div');
  priceRow.className = 'summary-row';
  priceRow.style.paddingTop = '12px';
  priceRow.style.borderTop = '1px solid var(--color-border)';

  const priceLabel = document.createElement('span');
  priceLabel.className = 'card-meta-label';
  priceLabel.textContent = 'Standard Ticket';

  const priceVal = document.createElement('span');
  priceVal.className = 'summary-price';
  priceVal.textContent = event.price;

  priceRow.appendChild(priceLabel);
  priceRow.appendChild(priceVal);
  bookingBox.appendChild(priceRow);

  const registerNowBtn = document.createElement('button');
  registerNowBtn.type = 'button';
  registerNowBtn.className = 'btn btn-primary';
  registerNowBtn.style.width = '100%';
  registerNowBtn.style.marginTop = '12px';
  registerNowBtn.textContent = 'Proceed to Registration';
  registerNowBtn.addEventListener('click', () => {
    scrollToRegistration(event.id);
  });
  bookingBox.appendChild(registerNowBtn);

  rightCol.appendChild(speakerBox);
  rightCol.appendChild(bookingBox);

  grid.appendChild(leftCol);
  grid.appendChild(rightCol);

  panel.appendChild(grid);
}

function syncRegistrationEventSelect(eventId) {
  const selectEl = document.getElementById('reg-event');
  if (selectEl && selectEl.value !== eventId) {
    selectEl.value = eventId;
  }
}

function updateOrderSummary(event) {
  const summaryBox = document.getElementById('order-summary-content');
  if (!summaryBox || !event) return;

  const countInput = document.getElementById('reg-count');
  const count = parseInt(countInput ? countInput.value : '1', 10) || 1;
  const totalPrice = (event.priceValue || 0) * count;

  summaryBox.replaceChildren();

  const detailsList = document.createElement('div');
  detailsList.className = 'summary-details-list';

  const rows = [
    { label: 'Event', val: event.title },
    { label: 'Date', val: `${formatDisplayDate(event.date)}` },
    { label: 'Unit Price', val: event.price },
    { label: 'Participants', val: `${count} attendee${count > 1 ? 's' : ''}` }
  ];

  rows.forEach(r => {
    const rowEl = document.createElement('div');
    rowEl.className = 'summary-row';
    const l = document.createElement('span');
    l.className = 'card-meta-label';
    l.textContent = r.label;
    const v = document.createElement('span');
    v.className = 'card-meta-val';
    v.textContent = r.val;
    rowEl.appendChild(l);
    rowEl.appendChild(v);
    detailsList.appendChild(rowEl);
  });

  const totalRow = document.createElement('div');
  totalRow.className = 'total-row';
  const totalLabel = document.createElement('span');
  totalLabel.textContent = 'Total Payable';
  const totalVal = document.createElement('span');
  totalVal.className = 'total-amount';
  totalVal.textContent = totalPrice === 0 ? 'Free' : `₹${totalPrice.toLocaleString('en-IN')}`;

  totalRow.appendChild(totalLabel);
  totalRow.appendChild(totalVal);

  summaryBox.appendChild(detailsList);
  summaryBox.appendChild(totalRow);
}

function populateEventSelectOptions(events) {
  const select = document.getElementById('reg-event');
  if (!select) return;

  select.replaceChildren();

  const defaultOpt = document.createElement('option');
  defaultOpt.value = '';
  defaultOpt.textContent = '— Select an event or workshop —';
  select.appendChild(defaultOpt);

  events.forEach(e => {
    const opt = document.createElement('option');
    opt.value = e.id;
    opt.textContent = `${e.title} (${e.price})`;
    select.appendChild(opt);
  });
}

function scrollToRegistration(eventId) {
  syncRegistrationEventSelect(eventId);
  const regSection = document.getElementById('register');
  if (regSection) {
    regSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    const nameInput = document.getElementById('reg-name');
    if (nameInput) nameInput.focus();
  }
}

/* ==========================================================================
   7. Schedule Table (Semantic HTML Table Population)
   ========================================================================== */
function renderScheduleTable(events) {
  const tbody = document.getElementById('schedule-tbody');
  if (!tbody) return;

  tbody.replaceChildren();

  events.forEach(e => {
    const tr = document.createElement('tr');

    const tdDate = document.createElement('td');
    tdDate.className = 'table-date';
    tdDate.textContent = formatDisplayDate(e.date);

    const tdTime = document.createElement('td');
    tdTime.className = 'table-time';
    tdTime.textContent = `${e.startTime} - ${e.endTime}`;

    const tdSession = document.createElement('td');
    const titleSpan = document.createElement('span');
    titleSpan.className = 'table-session-title';
    titleSpan.textContent = e.title;
    const formatSpan = document.createElement('div');
    formatSpan.className = 'card-meta-label';
    formatSpan.textContent = `${e.type} · ${e.format}`;
    tdSession.appendChild(titleSpan);
    tdSession.appendChild(formatSpan);

    const tdSpeaker = document.createElement('td');
    tdSpeaker.textContent = e.speaker;

    const tdVenue = document.createElement('td');
    tdVenue.textContent = e.location;

    const tdAction = document.createElement('td');
    const selectBtn = document.createElement('button');
    selectBtn.type = 'button';
    selectBtn.className = 'btn btn-secondary btn-sm';
    selectBtn.textContent = 'Details';
    selectBtn.setAttribute('aria-label', `View details for schedule session ${e.title}`);
    selectBtn.addEventListener('click', () => {
      selectEvent(e.id, true);
    });
    tdAction.appendChild(selectBtn);

    tr.appendChild(tdDate);
    tr.appendChild(tdTime);
    tr.appendChild(tdSession);
    tr.appendChild(tdSpeaker);
    tr.appendChild(tdVenue);
    tr.appendChild(tdAction);

    tbody.appendChild(tr);
  });
}

/* ==========================================================================
   8. Form Validation & Password Strength Calculation
   ========================================================================== */
function initFormValidation() {
  const form = document.getElementById('registration-form');
  if (!form) return;

  const passwordInput = document.getElementById('reg-password');
  if (passwordInput) {
    passwordInput.addEventListener('input', (e) => {
      updatePasswordStrengthUI(e.target.value);
    });
  }

  // Event select change updates price summary and minimum date
  const eventSelect = document.getElementById('reg-event');
  if (eventSelect) {
    eventSelect.addEventListener('change', (e) => {
      const chosen = AppState.events.find(ev => ev.id === e.target.value);
      if (chosen) {
        AppState.selectedEvent = chosen;
        updateOrderSummary(chosen);
        const dateInput = document.getElementById('reg-date');
        if (dateInput && !dateInput.value) {
          dateInput.value = chosen.date;
        }
      }
      saveDraft();
    });
  }

  const countInput = document.getElementById('reg-count');
  if (countInput) {
    countInput.addEventListener('input', () => {
      if (AppState.selectedEvent) {
        updateOrderSummary(AppState.selectedEvent);
      }
      saveDraft();
    });
  }

  // Auto-save draft on any input or change event
  form.addEventListener('input', (e) => {
    if (e.target.id !== 'reg-password') {
      saveDraft();
    }
  });

  form.addEventListener('change', (e) => {
    if (e.target.id !== 'reg-password') {
      saveDraft();
    }
  });

  // Reset button clears draft
  form.addEventListener('reset', () => {
    setTimeout(() => {
      clearDraft();
      updatePasswordStrengthUI('');
      if (AppState.selectedEvent) {
        updateOrderSummary(AppState.selectedEvent);
      }
      clearAllErrors();
    }, 10);
  });

  // Submit Handler
  form.addEventListener('submit', handleFormSubmit);

  // Restore draft if present in sessionStorage
  restoreDraft();
}

function updatePasswordStrengthUI(password) {
  const res = calculatePasswordStrength(password);

  const meterBar = document.getElementById('password-meter-bar');
  if (meterBar) {
    meterBar.className = 'meter-bar';
    if (res.level !== 'empty') {
      meterBar.classList.add(res.level);
    }
  }

  const ruleItems = {
    length: document.getElementById('rule-length'),
    uppercase: document.getElementById('rule-uppercase'),
    lowercase: document.getElementById('rule-lowercase'),
    number: document.getElementById('rule-number'),
    special: document.getElementById('rule-special')
  };

  for (const [key, el] of Object.entries(ruleItems)) {
    if (el) {
      const isValid = res.rules[key];
      el.className = `rule-item ${isValid ? 'valid' : 'invalid'}`;
      const icon = el.querySelector('.rule-icon');
      if (icon) {
        if (isValid) {
          icon.innerHTML = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" style="color:var(--color-status-teal)"><polyline points="20 6 9 17 4 12"></polyline></svg>';
        } else {
          icon.innerHTML = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color:var(--color-text-muted)"><circle cx="12" cy="12" r="9"></circle></svg>';
        }
      }
    }
  }
}

function showFieldError(fieldId, errorMsg) {
  const inputEl = document.getElementById(fieldId);
  const errorEl = document.getElementById(`${fieldId}-error`);

  if (inputEl) {
    inputEl.setAttribute('aria-invalid', 'true');
    inputEl.classList.add('input-error');
  }
  if (errorEl) {
    errorEl.textContent = errorMsg;
  }
}

function clearFieldError(fieldId) {
  const inputEl = document.getElementById(fieldId);
  const errorEl = document.getElementById(`${fieldId}-error`);

  if (inputEl) {
    inputEl.removeAttribute('aria-invalid');
    inputEl.classList.remove('input-error');
  }
  if (errorEl) {
    errorEl.textContent = '';
  }
}

function clearAllErrors() {
  const fieldIds = ['reg-name', 'reg-email', 'reg-phone', 'reg-password', 'reg-date', 'reg-count', 'reg-event', 'reg-type', 'reg-interests', 'reg-file'];
  fieldIds.forEach(clearFieldError);
}

function validateFile(fileInput) {
  if (!fileInput || !fileInput.files || fileInput.files.length === 0) {
    return { isValid: true }; // File is optional
  }
  const file = fileInput.files[0];
  const allowedMimeTypes = ['application/pdf', 'image/jpeg', 'image/png'];
  const maxSize = 5 * 1024 * 1024; // 5 MB

  if (!allowedMimeTypes.includes(file.type)) {
    return {
      isValid: false,
      error: 'Allowed document formats are PDF, JPG, or PNG only.'
    };
  }

  if (file.size > maxSize) {
    return {
      isValid: false,
      error: `File size (${(file.size / (1024 * 1024)).toFixed(1)} MB) exceeds the 5 MB limit.`
    };
  }

  return { isValid: true, fileName: file.name, fileSize: file.size };
}

function handleFormSubmit(e) {
  e.preventDefault();
  clearAllErrors();

  let hasErrors = false;

  // 1. Full Name
  const nameInput = document.getElementById('reg-name');
  const nameVal = nameInput ? nameInput.value.trim() : '';
  if (!nameVal) {
    showFieldError('reg-name', 'Full name is required.');
    hasErrors = true;
  }

  // 2. Email Address
  const emailInput = document.getElementById('reg-email');
  const emailVal = emailInput ? emailInput.value.trim() : '';
  if (!emailVal) {
    showFieldError('reg-email', 'Email address is required.');
    hasErrors = true;
  } else if (!isValidEmail(emailVal)) {
    showFieldError('reg-email', 'Please enter a valid email address.');
    hasErrors = true;
  }

  // 3. Telephone
  const phoneInput = document.getElementById('reg-phone');
  const phoneVal = phoneInput ? phoneInput.value.trim() : '';
  const phoneCheck = validatePhoneNumber(phoneVal);
  if (!phoneCheck.isValid) {
    showFieldError('reg-phone', phoneCheck.error || 'Please enter a valid phone number.');
    hasErrors = true;
  }

  // 4. Password Strength (All 5 mandatory rules must pass)
  const passwordInput = document.getElementById('reg-password');
  const passwordVal = passwordInput ? passwordInput.value : '';
  const passCheck = calculatePasswordStrength(passwordVal);
  if (!passwordVal) {
    showFieldError('reg-password', 'Password is required.');
    hasErrors = true;
  } else if (passCheck.passedCount < 5) {
    showFieldError('reg-password', 'Password must satisfy all 5 security conditions.');
    hasErrors = true;
  }

  // 5. Selected Event
  const eventSelect = document.getElementById('reg-event');
  const eventId = eventSelect ? eventSelect.value : '';
  const selectedEventObj = AppState.events.find(ev => ev.id === eventId);
  if (!eventId || !selectedEventObj) {
    showFieldError('reg-event', 'Please select an event or workshop from the catalog.');
    hasErrors = true;
  }

  // 6. Attendance Date
  const dateInput = document.getElementById('reg-date');
  const dateVal = dateInput ? dateInput.value : '';
  if (!dateVal) {
    showFieldError('reg-date', 'Attendance date is required.');
    hasErrors = true;
  } else {
    const todayStr = new Date().toISOString().split('T')[0];
    if (dateVal < todayStr) {
      showFieldError('reg-date', 'Attendance date must be in the future.');
      hasErrors = true;
    }
  }

  // 7. Participant Count
  const countInput = document.getElementById('reg-count');
  const countVal = parseInt(countInput ? countInput.value : '1', 10);
  if (isNaN(countVal) || countVal < 1 || countVal > 8) {
    showFieldError('reg-count', 'Participant count must be between 1 and 8.');
    hasErrors = true;
  } else if (selectedEventObj && countVal > selectedEventObj.availableSeats) {
    showFieldError('reg-count', `Only ${selectedEventObj.availableSeats} seats remaining for this event.`);
    hasErrors = true;
  }

  // 8. Attendance Type (Radio button)
  const attendanceTypeChecked = document.querySelector('input[name="attendanceType"]:checked');
  if (!attendanceTypeChecked) {
    showFieldError('reg-type', 'Please select your preferred attendance format.');
    hasErrors = true;
  }

  // 9. Interests (Checkboxes: at least 1 required)
  const interestCheckboxes = document.querySelectorAll('input[name="interests"]:checked');
  if (interestCheckboxes.length === 0) {
    showFieldError('reg-interests', 'Please select at least one technical interest.');
    hasErrors = true;
  }

  // 10. File Validation
  const fileInput = document.getElementById('reg-file');
  const fileCheck = validateFile(fileInput);
  if (!fileCheck.isValid) {
    showFieldError('reg-file', fileCheck.error || 'Invalid file format.');
    hasErrors = true;
  }

  if (hasErrors) {
    const liveRegion = document.getElementById('form-live-status');
    if (liveRegion) {
      liveRegion.textContent = 'Please correct the highlighted form errors before submitting.';
    }
    return;
  }

  // All validations passed!
  processSuccessfulRegistration({
    name: nameVal,
    email: emailVal,
    phone: phoneCheck.normalized,
    event: selectedEventObj,
    date: dateVal,
    count: countVal,
    attendanceType: attendanceTypeChecked.value,
    interests: Array.from(interestCheckboxes).map(cb => cb.value),
    specialRequirements: (document.getElementById('reg-special')?.value || '').trim()
  });
}

/* ==========================================================================
   9. Registration Success Flow & Web Storage
   ========================================================================== */
function processSuccessfulRegistration(regData) {
  const regId = createRegistrationId();
  const timestamp = new Date().toISOString();

  const record = {
    registrationId: regId,
    participantName: regData.name,
    email: regData.email,
    eventId: regData.event.id,
    eventTitle: regData.event.title,
    attendanceDate: regData.date,
    participantCount: regData.count,
    attendanceType: regData.attendanceType,
    timestamp: timestamp
  };

  // Persist demo registration in localStorage
  if (AppState.storageAvailable.local) {
    try {
      const existingRaw = localStorage.getItem(STORAGE_KEYS.REGISTRATIONS);
      const existing = existingRaw ? JSON.parse(existingRaw) : [];
      existing.unshift(record);
      localStorage.setItem(STORAGE_KEYS.REGISTRATIONS, JSON.stringify(existing.slice(0, 20)));
    } catch (err) {
      console.warn('Failed to save registration record to localStorage:', err);
    }
  }

  // Clear session draft
  clearDraft();

  // Reset the form
  const form = document.getElementById('registration-form');
  if (form) form.reset();
  updatePasswordStrengthUI('');

  // Render Confirmation Screen safely
  renderRegistrationSuccess(record, regData.event);
}

function renderRegistrationSuccess(record, eventObj) {
  const container = document.getElementById('registration-success');
  const formCard = document.getElementById('registration-card-wrapper');
  if (!container) return;

  // Populate data fields using safe textContent
  const nameEl = document.getElementById('conf-participant-name');
  if (nameEl) nameEl.textContent = record.participantName;

  const eventEl = document.getElementById('conf-event-title');
  if (eventEl) eventEl.textContent = eventObj.title;

  const dateEl = document.getElementById('conf-attendance-date');
  if (dateEl) dateEl.textContent = formatDisplayDate(record.attendanceDate);

  const countEl = document.getElementById('conf-count');
  if (countEl) countEl.textContent = `${record.participantCount} Person(s)`;

  const typeEl = document.getElementById('conf-type');
  if (typeEl) typeEl.textContent = record.attendanceType;

  const idEl = document.getElementById('conf-reg-id');
  if (idEl) idEl.textContent = record.registrationId;

  // Hide form and reveal confirmation with jQuery effect (Feature 3)
  if (window.jQuery) {
    window.jQuery(formCard).hide();
    window.jQuery(container).slideDown(400);
  } else {
    if (formCard) formCard.style.display = 'none';
    container.style.display = 'block';
  }

  container.scrollIntoView({ behavior: 'smooth', block: 'start' });

  // Copy Registration ID Button with BOM Clipboard API
  const copyBtn = document.getElementById('btn-copy-id');
  if (copyBtn) {
    copyBtn.onclick = () => {
      copyRegistrationId(record.registrationId, copyBtn);
    };
  }

  // Register Another Action
  const anotherBtn = document.getElementById('btn-register-another');
  if (anotherBtn) {
    anotherBtn.onclick = () => {
      if (window.jQuery) {
        window.jQuery(container).hide();
        window.jQuery(formCard).slideDown(300);
      } else {
        container.style.display = 'none';
        if (formCard) formCard.style.display = 'block';
      }
      formCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };
  }

  // Back to Events Action
  const backBtn = document.getElementById('btn-back-events');
  if (backBtn) {
    backBtn.onclick = () => {
      const eventsSection = document.getElementById('events');
      if (eventsSection) {
        eventsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    };
  }
}

/**
 * BOM Clipboard API with accessible toast confirmation
 */
async function copyRegistrationId(regId, buttonEl) {
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(regId);
      const originalText = buttonEl.textContent;
      buttonEl.textContent = 'Copied to Clipboard!';
      buttonEl.classList.add('btn-primary');
      setTimeout(() => {
        buttonEl.textContent = originalText;
        buttonEl.classList.remove('btn-primary');
      }, 2000);
    } else {
      throw new Error('Clipboard API unavailable.');
    }
  } catch (err) {
    console.warn('Clipboard write failed, using fallback prompt:', err);
    window.prompt('Copy your Registration ID:', regId);
  }
}

/* ==========================================================================
   10. sessionStorage Registration Draft Persistence
   ========================================================================== */
function saveDraft() {
  if (!AppState.storageAvailable.session) return;

  const form = document.getElementById('registration-form');
  if (!form) return;

  const draft = {
    fullName: (document.getElementById('reg-name')?.value || '').trim(),
    email: (document.getElementById('reg-email')?.value || '').trim(),
    phone: (document.getElementById('reg-phone')?.value || '').trim(),
    eventId: document.getElementById('reg-event')?.value || '',
    date: document.getElementById('reg-date')?.value || '',
    count: document.getElementById('reg-count')?.value || '1',
    attendanceType: document.querySelector('input[name="attendanceType"]:checked')?.value || '',
    interests: Array.from(document.querySelectorAll('input[name="interests"]:checked')).map(cb => cb.value),
    specialRequirements: (document.getElementById('reg-special')?.value || '').trim()
  };

  // Security Rule: NEVER store passwords or file objects in storage
  try {
    sessionStorage.setItem(STORAGE_KEYS.DRAFT, JSON.stringify(draft));
    updateStorageStatusMessage('Draft saved automatically in sessionStorage.');
  } catch (err) {
    console.warn('Failed to save draft to sessionStorage:', err);
  }
}

function restoreDraft() {
  if (!AppState.storageAvailable.session) return;

  try {
    const raw = sessionStorage.getItem(STORAGE_KEYS.DRAFT);
    if (!raw) return;

    const draft = JSON.parse(raw);
    if (!draft || typeof draft !== 'object') return;

    if (draft.fullName) document.getElementById('reg-name').value = draft.fullName;
    if (draft.email) document.getElementById('reg-email').value = draft.email;
    if (draft.phone) document.getElementById('reg-phone').value = draft.phone;
    if (draft.eventId) {
      const select = document.getElementById('reg-event');
      if (select) select.value = draft.eventId;
      const found = AppState.events.find(e => e.id === draft.eventId);
      if (found) {
        AppState.selectedEvent = found;
        updateOrderSummary(found);
      }
    }
    if (draft.date) document.getElementById('reg-date').value = draft.date;
    if (draft.count) document.getElementById('reg-count').value = draft.count;

    if (draft.attendanceType) {
      const radio = document.querySelector(`input[name="attendanceType"][value="${draft.attendanceType}"]`);
      if (radio) radio.checked = true;
    }

    if (Array.isArray(draft.interests)) {
      draft.interests.forEach(val => {
        const cb = document.querySelector(`input[name="interests"][value="${val}"]`);
        if (cb) cb.checked = true;
      });
    }

    if (draft.specialRequirements) {
      document.getElementById('reg-special').value = draft.specialRequirements;
    }

    updateStorageStatusMessage('Draft restored from this browser session. Password must be re-entered.');
  } catch (err) {
    console.warn('Could not restore draft from sessionStorage:', err);
  }
}

function clearDraft() {
  if (AppState.storageAvailable.session) {
    try {
      sessionStorage.removeItem(STORAGE_KEYS.DRAFT);
      updateStorageStatusMessage('Session draft cleared.');
    } catch (err) {
      console.warn('Failed to clear sessionStorage draft:', err);
    }
  }
}

function updateStorageStatusMessage(msg) {
  const statusEl = document.getElementById('storage-status-text');
  if (statusEl) {
    statusEl.textContent = msg;
  }
}

/* ==========================================================================
   11. jQuery Enhancements (3 Distinct Genuine Features)
   ========================================================================== */
function initJQueryFeatures() {
  if (typeof window.jQuery === 'undefined') {
    console.warn('jQuery not loaded. Fallbacks active.');
    return;
  }

  const $ = window.jQuery;

  // ------------------------------------------------------------------------
  // Feature 1: jQuery-Powered Smooth Scrolling Navigation with Active Links
  // ------------------------------------------------------------------------
  $('a[href^="#"]').on('click', function(e) {
    const targetId = $(this).attr('href');
    if (!targetId || targetId === '#') return;

    const $target = $(targetId);
    if ($target.length) {
      e.preventDefault();

      // Check prefers-reduced-motion via BOM matchMedia
      const prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const duration = prefersReducedMotion ? 0 : 500;

      $('html, body').stop().animate({
        scrollTop: $target.offset().top - 80
      }, duration, function() {
        // Focus management
        $target.attr('tabindex', '-1').focus();
      });

      // Update active state in nav
      $('.nav-link').removeClass('active');
      $(`.nav-link[href="${targetId}"]`).addClass('active');

      // Close mobile menu if open
      $('.nav-menu').removeClass('open');
      $('.mobile-menu-toggle').attr('aria-expanded', 'false');
    }
  });

  // ------------------------------------------------------------------------
  // Feature 2: jQuery Event-Driven FAQ Accordion Disclosure
  // ------------------------------------------------------------------------
  $('.faq-question').on('click', function() {
    const $button = $(this);
    const $item = $button.closest('.faq-item');
    const $answer = $item.find('.faq-answer');
    const isExpanded = $button.attr('aria-expanded') === 'true';

    // Slide up other answers
    $('.faq-item').not($item).removeClass('active')
      .find('.faq-answer').slideUp(200);
    $('.faq-item').not($item)
      .find('.faq-question').attr('aria-expanded', 'false');

    // Toggle clicked answer
    if (isExpanded) {
      $answer.slideUp(200);
      $button.attr('aria-expanded', 'false');
      $item.removeClass('active');
    } else {
      $answer.slideDown(250);
      $button.attr('aria-expanded', 'true');
      $item.addClass('active');
    }
  });

  // ------------------------------------------------------------------------
  // Feature 3: jQuery Clear Search Button Effect
  // ------------------------------------------------------------------------
  $('#search-clear-btn').on('click', function() {
    const $input = $('#event-search-input');
    $input.val('').focus();
    $(this).fadeOut(150);
    AppState.filters.query = '';
    applyFiltersAndRender();
  });
}

function toggleClearSearchBtn(val) {
  const clearBtn = document.getElementById('search-clear-btn');
  if (!clearBtn) return;
  if (val && val.length > 0) {
    if (window.jQuery) {
      window.jQuery(clearBtn).fadeIn(150);
    } else {
      clearBtn.style.display = 'block';
    }
  } else {
    if (window.jQuery) {
      window.jQuery(clearBtn).fadeOut(150);
    } else {
      clearBtn.style.display = 'none';
    }
  }
}

/* ==========================================================================
   12. BOM Hash Deep Linking & Navigation State
   ========================================================================== */
function handleHashNavigation() {
  const hash = window.location.hash;
  if (!hash) return;

  if (hash.startsWith('#event-')) {
    const eventId = hash.replace('#event-', '');
    const found = AppState.events.find(e => e.id === eventId);
    if (found) {
      selectEvent(found.id, true);
    }
  } else if (hash === '#workshops') {
    // Filter by workshop type
    AppState.filters.type = 'Workshop';
    document.querySelectorAll('.type-filter-btn').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-type') === 'Workshop');
    });
    applyFiltersAndRender();
  }
}

/* ==========================================================================
   13. Client-Side XSS Protection Interactive Demonstration
   ========================================================================== */
function initXSSDemonstration() {
  const testInput = document.getElementById('xss-test-input');
  const safeOutput = document.getElementById('xss-safe-output');
  const runBtn = document.getElementById('btn-run-xss-test');

  if (!testInput || !safeOutput) return;

  function renderSanitizedPayload() {
    const rawPayload = testInput.value;
    // DEMONSTRATION: Safe DOM insertion using textContent.
    // The payload is strictly treated as text characters, NOT executable markup.
    safeOutput.textContent = rawPayload;
  }

  if (runBtn) {
    runBtn.addEventListener('click', renderSanitizedPayload);
  }

  testInput.addEventListener('input', renderSanitizedPayload);
  renderSanitizedPayload();
}

/* ==========================================================================
   14. Application Initialization
   ========================================================================== */
document.addEventListener('DOMContentLoaded', () => {
  // Test storage availability
  testStorageAvailability();

  // Initialize Theme
  initTheme();

  // Load Event Data via AJAX
  loadEventsData();

  // Setup Discovery Controls
  const searchInput = document.getElementById('event-search-input');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const val = e.target.value;
      AppState.filters.query = val;
      toggleClearSearchBtn(val);
      applyFiltersAndRender();
    });
  }

  const categorySelect = document.getElementById('category-filter-select');
  if (categorySelect) {
    categorySelect.addEventListener('change', (e) => {
      AppState.filters.category = e.target.value;
      applyFiltersAndRender();
    });
  }

  const sortSelect = document.getElementById('sort-filter-select');
  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      AppState.filters.sortBy = e.target.value;
      applyFiltersAndRender();
    });
  }

  // Segmented Type Filter Buttons
  document.querySelectorAll('.type-filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.type-filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      AppState.filters.type = btn.getAttribute('data-type') || 'all';
      applyFiltersAndRender();
    });
  });

  const resetBtn = document.getElementById('btn-reset-filters');
  if (resetBtn) {
    resetBtn.addEventListener('click', resetAllFilters);
  }

  // Mobile menu toggle
  const mobileToggle = document.getElementById('mobile-menu-toggle');
  const navMenu = document.getElementById('nav-menu');
  if (mobileToggle && navMenu) {
    mobileToggle.addEventListener('click', () => {
      const isOpen = navMenu.classList.toggle('open');
      mobileToggle.setAttribute('aria-expanded', isOpen.toString());
    });
  }

  // Initialize Form Validation & Storage
  initFormValidation();

  // Initialize jQuery enhancements
  initJQueryFeatures();

  // Initialize XSS Demonstration
  initXSSDemonstration();

  // Listen to hash changes (BOM)
  window.addEventListener('hashchange', handleHashNavigation);
});
