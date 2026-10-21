import test from 'node:test';
import assert from 'node:assert/strict';
import {
  validateEmail,
  validatePhone,
  passwordStrength,
  validateParticipantCount,
  generateRegistrationId,
  filterAndSortEvents,
  sanitizeDraftForStorage
} from '../js/logic.js';

test('validateEmail correctly accepts valid emails and rejects malformed', () => {
  assert.equal(validateEmail('user@example.com'), true);
  assert.equal(validateEmail('shreya.shukla@domain.co.in'), true);
  assert.equal(validateEmail(''), false);
  assert.equal(validateEmail('invalid-email'), false);
  assert.equal(validateEmail('@domain.com'), false);
  assert.equal(validateEmail('user@'), false);
  assert.equal(validateEmail('user@domain'), false);
});

test('validatePhone accepts Indian & international numbers and rejects invalid', () => {
  // Indian 10 digits
  const r1 = validatePhone('9876543210');
  assert.equal(r1.isValid, true);
  assert.equal(r1.normalized, '9876543210');

  // Formatted with spaces and plus
  const r2 = validatePhone('+91 98765 43210');
  assert.equal(r2.isValid, true);
  assert.equal(r2.normalized, '+919876543210');

  // International 12 digits
  const r3 = validatePhone('+1 (555) 234-5678');
  assert.equal(r3.isValid, true);
  assert.equal(r3.normalized, '+15552345678');

  // Too short (<8 digits)
  const r4 = validatePhone('12345');
  assert.equal(r4.isValid, false);

  // Contains letters
  const r5 = validatePhone('98765abcd0');
  assert.equal(r5.isValid, false);
});

test('passwordStrength enforces all five requirements and calculates tiers', () => {
  // Empty
  const pEmpty = passwordStrength('');
  assert.equal(pEmpty.level, 'empty');
  assert.equal(pEmpty.passedCount, 0);

  // Weak: only length and lowercase
  const pWeak = passwordStrength('abcdefgh');
  assert.equal(pWeak.rules.length, true);
  assert.equal(pWeak.rules.lowercase, true);
  assert.equal(pWeak.rules.uppercase, false);
  assert.equal(pWeak.rules.number, false);
  assert.equal(pWeak.rules.special, false);
  assert.equal(pWeak.passedCount, 2);
  assert.equal(pWeak.level, 'weak');

  // Medium: 4 rules passed (missing special)
  const pMed = passwordStrength('Abcdefg1');
  assert.equal(pMed.rules.length, true);
  assert.equal(pMed.rules.lowercase, true);
  assert.equal(pMed.rules.uppercase, true);
  assert.equal(pMed.rules.number, true);
  assert.equal(pMed.rules.special, false);
  assert.equal(pMed.passedCount, 4);
  assert.equal(pMed.level, 'medium');

  // Strong: all 5 rules passed
  const pStrong = passwordStrength('Roster#2026!');
  assert.equal(pStrong.rules.length, true);
  assert.equal(pStrong.rules.lowercase, true);
  assert.equal(pStrong.rules.uppercase, true);
  assert.equal(pStrong.rules.number, true);
  assert.equal(pStrong.rules.special, true);
  assert.equal(pStrong.passedCount, 5);
  assert.equal(pStrong.level, 'strong');
});

test('validateParticipantCount respects bounds and available seats', () => {
  assert.equal(validateParticipantCount(2, 10).isValid, true);
  assert.equal(validateParticipantCount(0, 10).isValid, false);
  assert.equal(validateParticipantCount(9, 10).isValid, false);
  assert.equal(validateParticipantCount(5, 3).isValid, false); // exceeds seats
  assert.equal(validateParticipantCount(3, 3).isValid, true);
});

test('generateRegistrationId produces properly formatted ROS-2026-XXXX-XXXX IDs', () => {
  const id1 = generateRegistrationId();
  const id2 = generateRegistrationId();
  assert.match(id1, /^ROS-2026-[A-Z0-9]{4}-[A-Z0-9]{4}$/);
  assert.notEqual(id1, id2);
});

test('filterAndSortEvents handles keyword query, category, and sorting', () => {
  const sampleEvents = [
    { id: '1', title: 'Kubernetes Workshop', category: 'Cloud', type: 'Workshop', date: '2026-12-01', priceValue: 2000 },
    { id: '2', title: 'Web Performance Masterclass', category: 'Web', type: 'Masterclass', date: '2026-11-15', priceValue: 1500 },
    { id: '3', title: 'AI Conference', category: 'AI', type: 'Conference', date: '2026-11-20', priceValue: 3000 }
  ];

  // Search keyword
  const searchResult = filterAndSortEvents(sampleEvents, { query: 'performance' });
  assert.equal(searchResult.length, 1);
  assert.equal(searchResult[0].id, '2');

  // Category filter
  const catResult = filterAndSortEvents(sampleEvents, { category: 'Cloud' });
  assert.equal(catResult.length, 1);
  assert.equal(catResult[0].id, '1');

  // Price sort ascending
  const sortedPriceAsc = filterAndSortEvents(sampleEvents, { sortBy: 'price-asc' });
  assert.equal(sortedPriceAsc[0].id, '2');
  assert.equal(sortedPriceAsc[2].id, '3');

  // Date sort descending
  const sortedDateDesc = filterAndSortEvents(sampleEvents, { sortBy: 'date-desc' });
  assert.equal(sortedDateDesc[0].id, '1');
});

test('sanitizeDraftForStorage removes passwords and file inputs', () => {
  const rawDraft = {
    fullName: 'Shreya Shukla',
    email: 'shreya@example.com',
    password: 'SuperSecretPassword#123',
    confirmPassword: 'SuperSecretPassword#123',
    selectedEvent: 'evt-web-perf',
    fileAttachment: { name: 'id.pdf', size: 1024 }
  };

  const clean = sanitizeDraftForStorage(rawDraft);
  assert.equal(clean.fullName, 'Shreya Shukla');
  assert.equal(clean.email, 'shreya@example.com');
  assert.equal(clean.selectedEvent, 'evt-web-perf');
  assert.equal(clean.password, undefined);
  assert.equal(clean.confirmPassword, undefined);
  assert.equal(clean.fileAttachment, undefined);
});
