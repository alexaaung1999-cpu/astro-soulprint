const test = require('node:test');
const assert = require('node:assert/strict');
const data = require('../js/hd-data.js');
const calc = require('../js/hd-calc.js');
const content = require('../js/content.js');

const opposite = (g) => data.GATE_WHEEL[(data.GATE_WHEEL.indexOf(g) + 32) % 64];

/* ---- colour / tone / base ---- */
test('colour, tone and base: first and last positions of a gate', () => {
  const first = calc.lonToActivation(data.WHEEL_START + 0.0001);
  assert.deepEqual([first.gate, first.line, first.color, first.tone, first.base], [41, 1, 1, 1, 1]);
  const last = calc.lonToActivation(data.WHEEL_START + data.GATE_WIDTH - 0.0001);
  assert.deepEqual([last.gate, last.line, last.color, last.tone, last.base], [41, 6, 6, 6, 5]);
});

test('colour is 0.15625 deg wide and tone 0.0260417 deg wide', () => {
  const start = data.WHEEL_START + 2 * data.GATE_WIDTH + 3 * data.LINE_WIDTH;     // start of line 4 of gate 13
  const a = calc.lonToActivation(start + 0.15625 * 2 + 0.0260417 * 3 + 0.001);
  assert.deepEqual([a.gate, a.line, a.color, a.tone], [13, 4, 3, 4]);
});

test('arrow direction: tones 1-3 left, 4-6 right', () => {
  const ch = calc.chartFromUtc(Date.parse('1990-05-10T08:00:00Z'));
  for (const key of ['digestion', 'environment', 'motivation', 'perspective']) {
    const v = ch.variables[key];
    assert.equal(v.side, v.tone <= 3 ? 'left' : 'right', key);
    assert.ok(v.color >= 1 && v.color <= 6 && v.tone >= 1 && v.tone <= 6);
  }
});

test('the four arrows come from the right planets', () => {
  const ch = calc.chartFromUtc(Date.parse('1984-07-30T03:10:00Z'));
  assert.equal(ch.variables.motivation.tone, ch.personality.sun.tone);
  assert.equal(ch.variables.perspective.tone, ch.personality.northNode.tone);
  assert.equal(ch.variables.digestion.tone, ch.design.sun.tone);
  assert.equal(ch.variables.environment.tone, ch.design.northNode.tone);
  assert.equal(ch.variables.digestion.gate, ch.design.sun.gate);
});

test('arrow content: six colour names each', () => {
  for (const v of Object.values(content.VARIABLES)) {
    assert.equal(v.colors.length, 6);
    assert.equal(v.subtypes.length, 6);
  }
});

/* ---- Not-Self theme and Signature ---- */
test('every type has a Not-Self theme and a Signature', () => {
  for (const type of Object.keys(content.TYPES)) {
    assert.ok(content.NOT_SELF[type].name && content.SIGNATURE[type].name, type);
  }
  assert.equal(content.NOT_SELF['generator'].name, 'Frustration');
  assert.equal(content.NOT_SELF['projector'].name, 'Bitterness');
  assert.equal(content.SIGNATURE['reflector'].name, 'Surprise');
});

/* ---- Incarnation crosses ---- */
const angleOf = (pl, dl) => ((pl + '/' + dl) === '4/1' ? 'juxtaposition' : pl <= 4 ? 'right' : 'left');

function allCrosses() {
  const crosses = {};
  for (let gi = 0; gi < 64; gi++) {
    const g = data.GATE_WHEEL[gi];
    for (let line = 1; line <= 6; line++) {
      for (let k = 0; k < 6; k++) {
        const lon = (data.WHEEL_START + gi * data.GATE_WIDTH + (line - 1) * data.LINE_WIDTH + (k + 0.5) * data.LINE_WIDTH / 6) % 360;
        const p = calc.lonToActivation(lon), q = calc.lonToActivation((lon - 88 + 360) % 360);
        const key = g + '|' + angleOf(p.line, q.line);
        const gates = [p.gate, opposite(p.gate), q.gate, opposite(q.gate)];
        (crosses[key] = crosses[key] || new Set()).add(gates.join(','));
      }
    }
  }
  return crosses;
}

test('there are exactly 192 crosses and each has one fixed set of four gates', () => {
  const crosses = allCrosses();
  assert.equal(Object.keys(crosses).length, 192);
  for (const [k, v] of Object.entries(crosses)) assert.equal(v.size, 1, k);
});

test('every cross has a name (64 per angle)', () => {
  for (const angle of ['right', 'left', 'juxtaposition']) {
    assert.equal(Object.keys(content.CROSS_NAMES[angle]).length, 64, angle);
    for (const g of data.GATE_WHEEL) assert.ok(content.CROSS_NAMES[angle][g], angle + ' ' + g);
  }
});

test('crosses in the same named family share the same four gates', () => {
  const crosses = allCrosses();
  const check = (angle, families) => {
    for (const [name, gates] of families) {
      const sets = new Set(gates.map((g) => [...new Set([...crosses[g + '|' + angle]][0].split(',').map(Number))].sort((a, b) => a - b).join(',')));
      assert.equal(sets.size, 1, angle + ' ' + name);
    }
  };
  check('right', content.RAC_FAMILIES);
  check('left', content.LAC_FAMILIES);
});

test('cross names: known examples', () => {
  const crosses = allCrosses();
  // Left Angle Cross of Dominion (64/63 | 45/26)
  assert.equal(content.crossTitle('left', 64), 'Left Angle Cross of Dominion');
  assert.equal([...crosses['64|left']][0], '64,63,45,26');
  // Right Angle Cross of the Sphinx (13/7 | 1/2)
  assert.equal(content.crossTitle('right', 13), 'Right Angle Cross of the Sphinx');
  assert.equal([...crosses['13|right']][0], '13,7,1,2');
  // Juxtaposition Cross of Listening (13/7 | 43/23)
  assert.equal(content.crossTitle('juxtaposition', 13), 'Juxtaposition Cross of Listening');
  assert.equal([...crosses['13|juxtaposition']][0], '13,7,43,23');
});

test('a full chart gets a cross title', () => {
  const ch = calc.chartFromUtc(Date.parse('1990-05-10T08:00:00Z'));
  const t = content.crossTitle(ch.cross.angle, ch.cross.personalitySun);
  assert.match(t, /^(Right Angle|Left Angle|Juxtaposition) Cross of .+/);
});
