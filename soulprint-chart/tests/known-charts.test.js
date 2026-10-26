const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const calc = require('../js/hd-calc.js');
const content = require('../js/content.js');

const file = JSON.parse(fs.readFileSync(path.join(__dirname, 'known-charts.json'), 'utf8'));
const verified = file.charts.filter((c) => c.status === 'verified');

test('known charts file is readable (' + verified.length + ' verified chart(s))', () => {
  assert.ok(Array.isArray(file.charts));
});

for (const c of verified) {
  test('known chart: ' + c.label, () => {
    const ch = calc.calculateChart(c.birth), e = c.expected;
    const norm = (s) => String(s).toLowerCase().replace(/[^a-z0-9]/g, '');
    if (e.type) assert.equal(norm(content.TYPES[ch.type].name), norm(e.type), 'type');
    if (e.authority) assert.ok(norm(content.AUTHORITIES[ch.authority].name).includes(norm(e.authority)) || norm(e.authority).includes(norm(ch.authority)), 'authority: got ' + ch.authority);
    if (e.profile) assert.equal(ch.profile, e.profile, 'profile');
    if (e.definition) assert.ok(norm(content.DEFINITIONS[ch.definition].name).includes(norm(e.definition)), 'definition: got ' + ch.definition);
    if (e.definedChannels) assert.deepEqual(ch.channels.map((x) => x.key).sort(), e.definedChannels.slice().sort(), 'channels');
    for (const side of ['personality', 'design']) {
      for (const [body, val] of Object.entries(e[side] || {})) {
        assert.equal(ch[side][body].gate + '.' + ch[side][body].line, val, side + ' ' + body);
      }
    }
  });
}
