/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Pure decoupled business logic for roster event portal (Plain JavaScript ES6+).
 * Validates forms, calculates password entropy, filters/sorts events, and sanitizes drafts.
 */

/**
 * Validates an email address against standard specification.
 * @param {string} email
 * @returns {boolean}
 */
export function validateEmail(email) {
  if (!email || typeof email !== 'string') return false;
  const trimmed = email.trim();
  const regex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
  return regex.test(trimmed);
}

/**
 * Validates and normalizes phone numbers (Indian & International, 8-15 digits).
 * @param {string} phone
 * @returns {{ isValid: boolean, normalized: string, error?: string }}
 */
export function validatePhone(phone) {
  if (!phone || typeof phone !== 'string') {
    return { isValid: false, normalized: '', error: 'Phone number is required.' };
  }
  const cleaned = phone.trim().replace(/[\s().-]/g, '');
  const hasPlus = cleaned.startsWith('+');
  const digitsOnly = hasPlus ? cleaned.slice(1) : cleaned;

  if (!/^\d+$/.test(digitsOnly)) {
    return { isValid: false, normalized: '', error: 'Phone number must contain digits only.' };
  }

  if (digitsOnly.length < 8 || digitsOnly.length > 15) {
    return {
      isValid: false,
      normalized: '',
      error: 'Please enter a valid phone number (8 to 15 digits).'
    };
  }

  const normalized = hasPlus ? `+${digitsOnly}` : digitsOnly;
  return { isValid: true, normalized };
}

/**
 * Calculates password strength satisfying all 5 mandatory conditions:
 * 1. At least 8 characters
 * 2. At least 1 uppercase letter
 * 3. At least 1 lowercase letter
 * 4. At least 1 number
 * 5. At least 1 special character
 * @param {string} password
 * @returns {{ score: number, level: string, rules: Object, passedCount: number }}
 */
export function passwordStrength(password) {
  if (!password || typeof password !== 'string') {
    return {
      score: 0,
      level: 'empty',
      rules: {
        length: false,
        uppercase: false,
        lowercase: false,
        number: false,
        special: false
      },
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
  if (passedCount === 0) {
    level = 'empty';
  } else if (passedCount <= 2) {
    level = 'weak';
  } else if (passedCount <= 4) {
    level = 'medium';
  } else if (passedCount === 5) {
    level = 'strong';
  }

  return {
    score: passedCount,
    level,
    rules,
    passedCount
  };
}

/**
 * Validates participant count against available seats.
 * @param {number} count
 * @param {number} availableSeats
 * @returns {{ isValid: boolean, error?: string }}
 */
export function validateParticipantCount(count, availableSeats) {
  if (!Number.isInteger(count) || count < 1 || count > 8) {
    return { isValid: false, error: 'Participant count must be an integer between 1 and 8.' };
  }
  if (count > availableSeats) {
    return {
      isValid: false,
      error: `Only ${availableSeats} seats remaining. Cannot register ${count} participants.`
    };
  }
  return { isValid: true };
}

/**
 * Generates a unique registration ID with fallback.
 * Format: ROS-2026-XXXX-XXXX
 * @returns {string}
 */
export function generateRegistrationId() {
  try {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      const uuid = crypto.randomUUID().replace(/-/g, '').toUpperCase().slice(0, 8);
      return `ROS-2026-${uuid.slice(0, 4)}-${uuid.slice(4, 8)}`;
    }
  } catch {
    // fallback below
  }
  const randomHex = Math.random().toString(36).substring(2, 10).toUpperCase();
  return `ROS-2026-${randomHex.slice(0, 4)}-${randomHex.slice(4, 8)}`;
}

/**
 * Filters and sorts event records deterministically.
 * @param {Array} events
 * @param {Object} options
 * @returns {Array}
 */
export function filterAndSortEvents(events, options = {}) {
  if (!Array.isArray(events)) return [];

  const query = (options.query || '').trim().toLowerCase();
  const category = (options.category || 'all').toLowerCase();
  const type = (options.type || 'all').toLowerCase();
  const sortBy = options.sortBy || 'default';

  return events
    .filter((event) => {
      if (query) {
        const titleMatch = (event.title || '').toLowerCase().includes(query);
        const speakerMatch = (event.speaker || '').toLowerCase().includes(query);
        const descMatch = (event.description || '').toLowerCase().includes(query);
        const catMatch = (event.category || '').toLowerCase().includes(query);
        if (!titleMatch && !speakerMatch && !descMatch && !catMatch) {
          return false;
        }
      }

      if (category !== 'all' && (event.category || '').toLowerCase() !== category) {
        return false;
      }

      if (type !== 'all' && (event.type || '').toLowerCase() !== type) {
        return false;
      }

      return true;
    })
    .sort((a, b) => {
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
}

/**
 * Sanitizes form drafts before writing to sessionStorage.
 * Strictly excludes passwords and sensitive/binary file payloads.
 * @param {Object} draft
 * @returns {Object}
 */
export function sanitizeDraftForStorage(draft) {
  const sanitized = {};
  for (const [key, value] of Object.entries(draft)) {
    if (key.toLowerCase().includes('password') || key.toLowerCase().includes('file')) {
      continue;
    }
    sanitized[key] = value;
  }
  return sanitized;
}
