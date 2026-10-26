const test = require('node:test');
const assert = require('node:assert/strict');
const data = require('../js/hd-data.js');
const calc = require('../js/hd-calc.js');

const T_OF = (ms) => (ms / 86400000 + 2440587.5 - 2451545) / 36525;
const norm = (x) => ((x % 360) + 360) % 360;
const angDiff = (a, b) => Math.abs(((a - b + 540) % 360) - 180);

test('gate wheel: 64 unique gates, opposite gates are 32 steps apart', () => {
  assert.equal(new Set(data.GATE_WHEEL).size, 64);
  // Known Sun/Earth pairs
  const pairs = [[41, 31], [19, 33], [13, 7], [49, 4], [25, 46], [1, 2], [57, 51], [20, 34], [10, 15]];
  for (const [a, b] of pairs) {
    const i = data.GATE_WHEEL.indexOf(a), j = data.GATE_WHEEL.indexOf(b);
    assert.equal((i + 32) % 64, j, `${a} should oppose ${b}`);
  }
});

test('gate wheel anchors: gate 25 begins 28°15\' Pisces, gate 1 begins 13°15\' Scorpio, gate 41 begins 2° Aquarius', () => {
  assert.equal(calc.lonToActivation(358.25).gate, 25);
  assert.equal(calc.lonToActivation(358.2499).gate, 36); // gate 36 ends just before gate 25
  assert.equal(calc.lonToActivation(0).gate, 25);
  assert.equal(calc.lonToActivation(223.25).gate, 1);
  assert.equal(calc.lonToActivation(302).gate, 41);
  assert.equal(calc.lonToActivation(302).line, 1);
  assert.equal(calc.lonToActivation(302 + 5.625 - 0.0001).line, 6);
  assert.equal(calc.lonToActivation(301.9999).gate, 60);
});

test('36 channels, every gate belongs to a center once', () => {
  assert.equal(data.CHANNELS.length, 36);
  assert.equal(Object.keys(data.GATE_CENTER).length, 64);
});

test('Sun longitude agrees with the independent Meeus formula (within 0.01°)', () => {
  const dates = ['1955-02-03T04:00:00Z', '1978-08-19T13:30:00Z', '1990-05-10T08:00:00Z', '2003-12-25T22:10:00Z', '2020-03-20T03:50:00Z', '2024-07-04T00:00:00Z'];
  for (const iso of dates) {
    const ms = Date.parse(iso), T = T_OF(ms);
    const L0 = 280.46646 + 36000.76983 * T + 0.0003032 * T * T;
    const M = (357.52911 + 35999.05029 * T - 0.0001537 * T * T) * Math.PI / 180;
    const C = (1.914602 - 0.004817 * T - 0.000014 * T * T) * Math.sin(M) + (0.019993 - 0.000101 * T) * Math.sin(2 * M) + 0.000289 * Math.sin(3 * M);
    const omega = (125.04 - 1934.136 * T) * Math.PI / 180;
    const apparent = norm(L0 + C - 0.00569 - 0.00478 * Math.sin(omega));
    assert.ok(angDiff(apparent, calc.sunLongitude(new Date(ms))) < 0.01, iso);
  }
});

test('March equinox 2024 (20 Mar 03:06 UTC): Sun is at 0° Aries, gate 25', () => {
  const lon = calc.sunLongitude(new Date('2024-03-20T03:06:00Z'));
  assert.ok(angDiff(lon, 0) < 0.01, 'lon ' + lon);
});

test('true node stays within 2° of the mean node, and South is opposite', () => {
  for (const iso of ['1960-01-01T00:00:00Z', '1985-06-15T12:00:00Z', '2001-11-11T11:11:00Z', '2015-03-03T03:03:00Z']) {
    const ms = Date.parse(iso), T = T_OF(ms);
    const mean = norm(125.04452 - 1934.136261 * T);
    const lons = calc.allLongitudes(new Date(ms));
    assert.ok(angDiff(lons.northNode, mean) < 2, iso);
    assert.ok(angDiff(lons.southNode, lons.northNode + 180) < 1e-9);
  }
});

test('Design Sun is exactly 88° before the birth Sun', () => {
  for (const iso of ['1962-03-14T05:20:00Z', '1990-05-10T08:00:00Z', '2001-09-17T16:30:00Z', '1975-12-31T23:59:00Z']) {
    const ms = Date.parse(iso);
    const d = calc.findDesignTime(ms);
    const diff = norm(calc.sunLongitude(new Date(ms)) - calc.sunLongitude(new Date(d)));
    assert.ok(Math.abs(diff - 88) < 1e-5, iso + ' diff ' + diff);
    const days = (ms - d) / 86400000;
    assert.ok(days > 84 && days < 92, 'about 88 days, got ' + days);
  }
});

test('Earth is opposite the Sun and profile lines come from the Sun', () => {
  const ch = calc.chartFromUtc(Date.parse('1990-05-10T08:00:00Z'));
  assert.equal(ch.personality.sun.gate, 23);
  assert.equal(ch.personality.earth.gate, 43);
  assert.equal(ch.profile, ch.personality.sun.line + '/' + ch.design.sun.line);
  assert.equal(Object.keys(ch.personality).length, 13);
});

/* ---- Time zones ---- */
test('Myanmar time: 10 May 1990 2:30 PM in Yangon is 08:00 UTC', () => {
  const r = calc.localToUtc(1990, 5, 10, 14, 30, 'Asia/Yangon');
  assert.equal(new Date(r.ms).toISOString(), '1990-05-10T08:00:00.000Z');
  assert.equal(calc.offsetLabel(r.offset), 'UTC+06:30');
});

test('daylight saving: New York summer is UTC-4, winter UTC-5', () => {
  assert.equal(new Date(calc.localToUtc(2023, 7, 1, 12, 0, 'America/New_York').ms).toISOString(), '2023-07-01T16:00:00.000Z');
  assert.equal(new Date(calc.localToUtc(2023, 1, 1, 12, 0, 'America/New_York').ms).toISOString(), '2023-01-01T17:00:00.000Z');
});

test('daylight saving: Sydney is UTC+11 in January and UTC+10 in July', () => {
  assert.equal(new Date(calc.localToUtc(2022, 1, 15, 12, 0, 'Australia/Sydney').ms).toISOString(), '2022-01-15T01:00:00.000Z');
  assert.equal(new Date(calc.localToUtc(2022, 7, 15, 12, 0, 'Australia/Sydney').ms).toISOString(), '2022-07-15T02:00:00.000Z');
});

test('clock change edge cases are flagged', () => {
  const gap = calc.localToUtc(2023, 3, 12, 2, 30, 'America/New_York');
  assert.equal(gap.nonexistent, true);
  const twice = calc.localToUtc(2023, 11, 5, 1, 30, 'America/New_York');
  assert.equal(twice.ambiguous, true);
  assert.equal(new Date(twice.ms).toISOString(), '2023-11-05T05:30:00.000Z'); // first occurrence (still daylight time)
});

test('historical time zones: Malaysia (Kuala Lumpur) was UTC+7:30 in 1975; Singapore likewise', () => {
  assert.equal(calc.offsetLabel(calc.localToUtc(1975, 6, 1, 12, 0, 'Asia/Singapore').offset), 'UTC+07:30');
  assert.equal(calc.offsetLabel(calc.localToUtc(1990, 6, 1, 12, 0, 'Asia/Singapore').offset), 'UTC+08:00');
});

test('historical time zones: Thailand stays UTC+7, India UTC+5:30', () => {
  assert.equal(calc.offsetLabel(calc.localToUtc(1985, 6, 1, 12, 0, 'Asia/Bangkok').offset), 'UTC+07:00');
  assert.equal(calc.offsetLabel(calc.localToUtc(1985, 6, 1, 12, 0, 'Asia/Kolkata').offset), 'UTC+05:30');
});

/* ---- Type / Authority / Definition logic (synthetic gate sets) ---- */
function actsFor(gates) {
  const bodies = data.BODIES.map((b) => b.key);
  const filler = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];
  const p = {}, d = {};
  bodies.forEach((k, i) => {
    p[k] = { gate: gates[i] !== undefined ? gates[i] : null, line: 1 };
    d[k] = { gate: null, line: 1 };
  });
  return { p, d };
}
function analyseGates(gates) {
  const { p, d } = actsFor(gates);
  // unused slots get gate 0 (belongs to no channel)
  Object.keys(p).forEach((k) => { if (p[k].gate === null) p[k].gate = 0; if (d[k].gate === null) d[k].gate = 0; });
  return calc.analyse(p, d);
}
const cases = [
  ['34-57 (Sacral+Spleen)', [34, 57], 'generator', 'sacral', 'single'],
  ['20-34 (Throat-Sacral)', [20, 34], 'manifesting-generator', 'sacral', 'single'],
  ['6-59 (SP-Sacral)', [6, 59], 'generator', 'emotional', 'single'],
  ['6-59 + 12-22 (Sacral + SP to Throat)', [6, 59, 12, 22], 'manifesting-generator', 'emotional', 'single'],
  ['21-45 (Heart-Throat)', [21, 45], 'manifestor', 'ego', 'single'],
  ['12-22 (SP-Throat)', [12, 22], 'manifestor', 'emotional', 'single'],
  ['10-20 (G-Throat)', [10, 20], 'projector', 'self-projected', 'single'],
  ['28-38 (Spleen-Root)', [28, 38], 'projector', 'splenic', 'single'],
  ['47-64 (Ajna-Head)', [47, 64], 'projector', 'mental', 'single'],
  ['25-51 (G-Heart)', [25, 51], 'projector', 'ego', 'single'],
  ['4-63 + 10-20 (two groups)', [4, 63, 10, 20], 'projector', 'self-projected', 'split'],
  ['no channels', [1, 2, 3, 4, 5, 6], 'reflector', 'lunar', 'none'],
  ['three groups', [4, 63, 10, 20, 28, 38], 'projector', 'splenic', 'triple']
];
for (const [label, gates, type, authority, definition] of cases) {
  test('logic: ' + label, () => {
    const r = analyseGates(gates);
    assert.equal(r.type, type);
    assert.equal(r.authority, authority);
    assert.equal(r.definition, definition);
  });
}

test('logic: Root connected to Throat through the Spleen makes a Manifestor', () => {
  const r = analyseGates([18, 58, 57, 20]); // 18-58 Spleen-Root, 20-57 Throat-Spleen
  assert.equal(r.type, 'manifestor');
  assert.equal(r.authority, 'splenic');
});

test('logic: incarnation cross angle follows the profile', () => {
  const make = (pl, dl) => {
    const { p, d } = actsFor([]);
    Object.keys(p).forEach((k) => { p[k].gate = 0; d[k].gate = 0; });
    p.sun.line = pl; d.sun.line = dl;
    return calc.analyse(p, d).cross.angle;
  };
  assert.equal(make(1, 3), 'right'); assert.equal(make(2, 5), 'right'); assert.equal(make(4, 6), 'right');
  assert.equal(make(4, 1), 'juxtaposition');
  assert.equal(make(5, 2), 'left'); assert.equal(make(6, 3), 'left');
});
