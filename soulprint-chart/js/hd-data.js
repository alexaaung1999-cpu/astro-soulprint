/* Static tables for the Soulprint Chart: the 64-gate wheel, the 36 channels and the 9 centers.
   Works both in the browser (window.Soulprint.data) and in Node (require). */
(function (root, factory) {
  var data = factory();
  if (typeof module === 'object' && module.exports) module.exports = data;
  else { root.Soulprint = root.Soulprint || {}; root.Soulprint.data = data; }
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  // Gate 41 starts at 2 degrees Aquarius (302 degrees of ecliptic longitude).
  // Each gate covers 5.625 degrees (360 / 64) and each line 0.9375 degrees (5.625 / 6).
  var WHEEL_START = 302;
  var GATE_WIDTH = 360 / 64;
  var LINE_WIDTH = GATE_WIDTH / 6;
  var GATE_WHEEL = [
    41, 19, 13, 49, 30, 55, 37, 63, 22, 36, 25, 17, 21, 51, 42, 3,
    27, 24, 2, 23, 8, 20, 16, 35, 45, 12, 15, 52, 39, 53, 62, 56,
    31, 33, 7, 4, 29, 59, 40, 64, 47, 6, 46, 18, 48, 57, 32, 50,
    28, 44, 1, 43, 14, 34, 9, 5, 26, 11, 10, 58, 38, 54, 61, 60
  ];

  var CENTER_ORDER = ['Head', 'Ajna', 'Throat', 'G', 'Heart', 'Spleen', 'SolarPlexus', 'Sacral', 'Root'];
  var CENTER_NAMES = {
    Head: 'Head', Ajna: 'Ajna', Throat: 'Throat', G: 'G Center', Heart: 'Heart',
    Spleen: 'Spleen', SolarPlexus: 'Solar Plexus', Sacral: 'Sacral', Root: 'Root'
  };
  var CENTER_GATES = {
    Head: [64, 61, 63],
    Ajna: [47, 24, 4, 17, 43, 11],
    Throat: [62, 23, 56, 35, 12, 45, 33, 8, 31, 20, 16],
    G: [1, 13, 25, 46, 2, 15, 10, 7],
    Heart: [21, 26, 51, 40],
    Spleen: [48, 57, 44, 50, 32, 28, 18],
    SolarPlexus: [36, 22, 37, 6, 49, 55, 30],
    Sacral: [5, 14, 29, 59, 9, 3, 42, 27, 34],
    Root: [53, 60, 52, 19, 39, 41, 58, 38, 54]
  };
  // The four "motor" centers, used to work out Type.
  var MOTORS = ['Sacral', 'Heart', 'SolarPlexus', 'Root'];

  var GATE_CENTER = {};
  CENTER_ORDER.forEach(function (c) {
    CENTER_GATES[c].forEach(function (g) { GATE_CENTER[g] = c; });
  });

  var CHANNELS = [
    { a: 1, b: 8, name: 'Inspiration' }, { a: 2, b: 14, name: 'The Beat' },
    { a: 3, b: 60, name: 'Mutation' }, { a: 4, b: 63, name: 'Logic' },
    { a: 5, b: 15, name: 'Rhythm' }, { a: 6, b: 59, name: 'Intimacy' },
    { a: 7, b: 31, name: 'The Alpha' }, { a: 9, b: 52, name: 'Concentration' },
    { a: 10, b: 20, name: 'Awakening' }, { a: 10, b: 34, name: 'Exploration' },
    { a: 10, b: 57, name: 'Perfected Form' }, { a: 11, b: 56, name: 'Curiosity' },
    { a: 12, b: 22, name: 'Openness' }, { a: 13, b: 33, name: 'The Prodigal' },
    { a: 16, b: 48, name: 'Wavelength' }, { a: 17, b: 62, name: 'Acceptance' },
    { a: 18, b: 58, name: 'Judgment' }, { a: 19, b: 49, name: 'Sensitivity' },
    { a: 20, b: 34, name: 'Charisma' }, { a: 20, b: 57, name: 'The Brainwave' },
    { a: 21, b: 45, name: 'Money' }, { a: 23, b: 43, name: 'Structuring' },
    { a: 24, b: 61, name: 'Awareness' }, { a: 25, b: 51, name: 'Initiation' },
    { a: 26, b: 44, name: 'Surrender' }, { a: 27, b: 50, name: 'Preservation' },
    { a: 28, b: 38, name: 'Struggle' }, { a: 29, b: 46, name: 'Discovery' },
    { a: 30, b: 41, name: 'Recognition' }, { a: 32, b: 54, name: 'Transformation' },
    { a: 34, b: 57, name: 'Power' }, { a: 35, b: 36, name: 'Transitoriness' },
    { a: 37, b: 40, name: 'Community' }, { a: 39, b: 55, name: 'Emoting' },
    { a: 42, b: 53, name: 'Maturation' }, { a: 47, b: 64, name: 'Abstraction' }
  ].map(function (c) {
    return { a: c.a, b: c.b, name: c.name, key: c.a + '-' + c.b, centers: [GATE_CENTER[c.a], GATE_CENTER[c.b]] };
  });

  // Order used in the Personality / Design tables.
  var BODIES = [
    { key: 'sun', name: 'Sun' }, { key: 'earth', name: 'Earth' },
    { key: 'northNode', name: 'North Node' }, { key: 'southNode', name: 'South Node' },
    { key: 'moon', name: 'Moon' }, { key: 'mercury', name: 'Mercury' },
    { key: 'venus', name: 'Venus' }, { key: 'mars', name: 'Mars' },
    { key: 'jupiter', name: 'Jupiter' }, { key: 'saturn', name: 'Saturn' },
    { key: 'uranus', name: 'Uranus' }, { key: 'neptune', name: 'Neptune' },
    { key: 'pluto', name: 'Pluto' }
  ];

  return {
    WHEEL_START: WHEEL_START, GATE_WIDTH: GATE_WIDTH, LINE_WIDTH: LINE_WIDTH,
    GATE_WHEEL: GATE_WHEEL, CENTER_ORDER: CENTER_ORDER, CENTER_NAMES: CENTER_NAMES,
    CENTER_GATES: CENTER_GATES, MOTORS: MOTORS, GATE_CENTER: GATE_CENTER,
    CHANNELS: CHANNELS, BODIES: BODIES
  };
}));
