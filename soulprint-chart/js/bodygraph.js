/* Draws the bodygraph as an inline SVG string. No libraries.
   Personality (conscious) = deep emerald, Design (unconscious) = gold. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory(require('./hd-data.js'));
  else { root.Soulprint = root.Soulprint || {}; root.Soulprint.bodygraph = factory(root.Soulprint.data); }
}(typeof self !== 'undefined' ? self : this, function (data) {
  'use strict';

  var COLORS = { personality: '#0d5c47', design: '#c08a2a', track: '#ece6d6', openStroke: '#cdc4ad', ink: '#3b2a1b' };

  // Shapes of the nine centers (SVG polygon points) and where their name is written.
  var CENTER_SHAPES = {
    Head:        { points: '220,14 264,86 176,86', round: 24,               label: [220, 66] },
    Ajna:        { points: '176,112 264,112 220,178', round: 24,            label: [220, 135] },
    Throat:      { points: '176,212 264,212 264,284 176,284', round: 20,    label: [220, 248] },
    G:           { points: '220,302 272,350 220,398 168,350', round: 18,    label: [220, 350] },
    Heart:       { points: '306,316 340,372 272,372', round: 11,            label: [312, 361] },
    Spleen:      { points: '128,374 128,496 36,435', round: 22,             label: [100, 435] },
    SolarPlexus: { points: '318,394 318,522 410,458', round: 22,            label: [346, 458] },
    Sacral:      { points: '176,452 264,452 264,522 176,522', round: 20,    label: [220, 487] },
    Root:        { points: '176,572 264,572 264,642 176,642', round: 20,    label: [220, 607] }
  };

  // Where each gate number sits on its center's edge.
  var GATE_POS = {
    64: [196, 86], 61: [220, 86], 63: [244, 86],
    47: [196, 112], 24: [220, 112], 4: [244, 112], 17: [203, 150], 43: [220, 170], 11: [237, 150],
    62: [196, 212], 23: [220, 212], 56: [244, 212],
    16: [176, 228], 20: [176, 262], 35: [264, 226], 12: [264, 248], 45: [264, 270],
    31: [196, 284], 8: [220, 284], 33: [244, 284],
    1: [220, 309], 7: [197, 325], 13: [243, 325], 10: [178, 350], 25: [262, 350],
    15: [197, 375], 2: [220, 392], 46: [243, 375],
    21: [300, 332], 51: [285, 352], 26: [286, 372], 40: [326, 372],
    48: [96, 397], 57: [128, 394], 44: [128, 422], 50: [128, 452],
    32: [65, 453], 28: [87, 467], 18: [110, 482],
    37: [329, 403], 36: [358, 424], 22: [383, 441], 6: [318, 486],
    30: [385, 474], 55: [358, 492], 49: [334, 509],
    5: [196, 452], 14: [220, 452], 29: [244, 452], 34: [176, 470], 27: [176, 500], 59: [264, 486],
    42: [196, 522], 3: [220, 522], 9: [244, 522],
    53: [196, 572], 60: [220, 572], 52: [244, 572],
    58: [176, 588], 38: [176, 606], 54: [176, 624], 19: [264, 588], 39: [264, 606], 41: [264, 624]
  };

  // Extra bend points for channels that need to travel around a center.
  var CHANNEL_VIA = {
    '20-34': [[154, 292], [154, 446]],
    '26-44': [[250, 414]],
    '35-36': [[366, 296]],
    '12-22': [[392, 332]]
  };

  function channelPoints(ch) {
    var pts = [GATE_POS[ch.a]];
    (CHANNEL_VIA[ch.key] || []).forEach(function (p) { pts.push(p); });
    pts.push(GATE_POS[ch.b]);
    return pts;
  }

  function dist(a, b) { return Math.sqrt((a[0] - b[0]) * (a[0] - b[0]) + (a[1] - b[1]) * (a[1] - b[1])); }

  // Splits a polyline into its first and second half (by length).
  function halves(pts) {
    var total = 0, i;
    for (i = 1; i < pts.length; i++) total += dist(pts[i - 1], pts[i]);
    var target = total / 2, acc = 0;
    for (i = 1; i < pts.length; i++) {
      var seg = dist(pts[i - 1], pts[i]);
      if (acc + seg >= target) {
        var t = (target - acc) / seg;
        var mid = [pts[i - 1][0] + (pts[i][0] - pts[i - 1][0]) * t, pts[i - 1][1] + (pts[i][1] - pts[i - 1][1]) * t];
        return [pts.slice(0, i).concat([mid]), [mid].concat(pts.slice(i))];
      }
      acc += seg;
    }
    return [pts, pts];
  }

  function polyline(pts, attrs) {
    return '<polyline points="' + pts.map(function (p) { return p[0].toFixed(1) + ',' + p[1].toFixed(1); }).join(' ') + '" ' + attrs + '/>';
  }

  // Turns "x,y x,y ..." into a soft, rounded-corner path.
  function roundedPath(pointsText, radius) {
    var pts = pointsText.split(' ').map(function (t) { var a = t.split(','); return [+a[0], +a[1]]; });
    var n = pts.length, d = '';
    for (var i = 0; i < n; i++) {
      var prev = pts[(i + n - 1) % n], cur = pts[i], next = pts[(i + 1) % n];
      var l1 = dist(prev, cur), l2 = dist(cur, next);
      var r = Math.min(radius, l1 / 2.2, l2 / 2.2);
      var a = [cur[0] + (prev[0] - cur[0]) * r / l1, cur[1] + (prev[1] - cur[1]) * r / l1];
      var b = [cur[0] + (next[0] - cur[0]) * r / l2, cur[1] + (next[1] - cur[1]) * r / l2];
      d += (i === 0 ? 'M' : 'L') + a[0].toFixed(1) + ',' + a[1].toFixed(1) + ' Q' + cur[0] + ',' + cur[1] + ' ' + b[0].toFixed(1) + ',' + b[1].toFixed(1) + ' ';
    }
    return d + 'Z';
  }

  var SHORT = { sun: 'Sun', earth: 'Earth', northNode: 'N Node', southNode: 'S Node', moon: 'Moon', mercury: 'Merc', venus: 'Venus', mars: 'Mars', jupiter: 'Jup', saturn: 'Sat', uranus: 'Ura', neptune: 'Nep', pluto: 'Pluto' };
  var BODY_X = 50;      // the bodygraph is shifted right to make room for the Design column
  var VIEW_W = 534;

  // One side column: every planet with its gate.line.
  function column(chart, side) {
    var isP = side === 'personality';
    var x = isP ? VIEW_W - 70 : 2, color = isP ? COLORS.personality : COLORS.design;
    var out = ['<text x="' + (x + 34) + '" y="30" class="bg-col-title" text-anchor="middle" fill="' + color + '">' + (isP ? 'PERSONALITY' : 'DESIGN') + '</text>'];
    data.BODIES.forEach(function (b, i) {
      var a = chart[side][b.key], y = 46 + i * 27;
      out.push('<rect x="' + x + '" y="' + y + '" width="68" height="23" rx="11.5" fill="' + color + '" fill-opacity="0.12" stroke="' + color + '" stroke-opacity="0.55" stroke-width="1"/>');
      out.push('<text x="' + (x + 9) + '" y="' + (y + 15.3) + '" class="bg-col-name" fill="' + color + '">' + SHORT[b.key] + '</text>');
      out.push('<text x="' + (x + 61) + '" y="' + (y + 15.5) + '" class="bg-col-val" text-anchor="end" fill="' + color + '">' + a.gate + '.' + a.line + '</text>');
    });
    return out.join('');
  }

  function render(chart) {
    var out = [];
    var pg = chart.personalityGates, dg = chart.designGates;
    function state(g) { return pg[g] && dg[g] ? 'both' : pg[g] ? 'personality' : dg[g] ? 'design' : 'none'; }

    out.push('<svg class="bodygraph" viewBox="0 0 ' + VIEW_W + ' 660" role="img" aria-labelledby="bgTitle bgDesc" xmlns="http://www.w3.org/2000/svg">');
    out.push('<title id="bgTitle">Your Soulprint Chart bodygraph</title>');
    out.push('<desc id="bgDesc">Defined centers: ' + (chart.definedCenterList.map(function (c) { return data.CENTER_NAMES[c]; }).join(', ') || 'none') + '. Defined channels: ' + (chart.channels.map(function (c) { return c.key; }).join(', ') || 'none') + '.</desc>');
    out.push('<defs>' +
      '<linearGradient id="defFill" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#a6dcc6"/><stop offset="0.55" stop-color="#cfe6c4"/><stop offset="1" stop-color="#f1dfaa"/></linearGradient>' +
      '<radialGradient id="halo" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="#d7ecdf" stop-opacity="0.75"/><stop offset="1" stop-color="#d7ecdf" stop-opacity="0"/></radialGradient>' +
      '<filter id="soft" x="-20%" y="-20%" width="140%" height="150%"><feDropShadow dx="0" dy="2.5" stdDeviation="3.2" flood-color="#0d5c47" flood-opacity="0.22"/></filter>' +
      '</defs>');

    out.push(column(chart, 'design'));
    out.push(column(chart, 'personality'));

    out.push('<g transform="translate(' + BODY_X + ',0)">');
    out.push('<ellipse cx="223" cy="335" rx="190" ry="335" fill="url(#halo)"/>');

    // 1. soft tracks for every channel
    data.CHANNELS.forEach(function (ch) {
      out.push(polyline(channelPoints(ch), 'fill="none" stroke="' + COLORS.track + '" stroke-width="5.5" stroke-linecap="round" stroke-linejoin="round"'));
    });

    // 2. coloured halves for activated gates
    data.CHANNELS.forEach(function (ch) {
      var h = halves(channelPoints(ch));
      [[ch.a, h[0]], [ch.b, h[1]]].forEach(function (pair) {
        var s = state(pair[0]);
        if (s === 'none') return;
        var base = 'fill="none" stroke-width="5.5" stroke-linecap="round" stroke-linejoin="round"';
        if (s === 'personality') out.push(polyline(pair[1], base + ' stroke="' + COLORS.personality + '"'));
        else if (s === 'design') out.push(polyline(pair[1], base + ' stroke="' + COLORS.design + '"'));
        else {
          out.push(polyline(pair[1], base + ' stroke="' + COLORS.personality + '"'));
          out.push(polyline(pair[1], 'fill="none" stroke-width="5.5" stroke-linejoin="round" stroke="' + COLORS.design + '" stroke-dasharray="5 5"'));
        }
      });
    });

    // 3. centers with rounded corners
    data.CENTER_ORDER.forEach(function (c) {
      var shape = CENTER_SHAPES[c], on = chart.definedCenters[c];
      var round = shape.round;
      out.push('<path d="' + roundedPath(shape.points, round) + '" fill="' + (on ? 'url(#defFill)' : '#fffdf9') + '" stroke="' + (on ? '#c9a24b' : COLORS.openStroke) + '" stroke-width="' + (on ? 1.8 : 1.5) + '" stroke-linejoin="round"' + (on ? ' filter="url(#soft)"' : '') + '/>');
      out.push('<text x="' + shape.label[0] + '" y="' + shape.label[1] + '" class="bg-center-label' + (on ? ' on' : '') + '" text-anchor="middle">' + data.CENTER_NAMES[c].toUpperCase() + '</text>');
    });

    // 4. gate numbers
    Object.keys(GATE_POS).forEach(function (g) {
      var p = GATE_POS[g], s = state(+g);
      if (s === 'none') {
        out.push('<circle cx="' + p[0] + '" cy="' + p[1] + '" r="7.6" fill="#fffdf9" stroke="#ddd5c0" stroke-width="1"/>');
        out.push('<text x="' + p[0] + '" y="' + (p[1] + 2.9) + '" class="bg-gate off" text-anchor="middle">' + g + '</text>');
      } else if (s === 'both') {
        out.push('<circle cx="' + p[0] + '" cy="' + p[1] + '" r="9.6" fill="' + COLORS.design + '" stroke="#fffdf9" stroke-width="1.4"/>');
        out.push('<path d="M' + p[0] + ',' + (p[1] - 9.6) + ' A9.6,9.6 0 0 1 ' + p[0] + ',' + (p[1] + 9.6) + ' Z" fill="' + COLORS.personality + '"/>');
        out.push('<text x="' + p[0] + '" y="' + (p[1] + 3.4) + '" class="bg-gate on" text-anchor="middle">' + g + '</text>');
      } else {
        out.push('<circle cx="' + p[0] + '" cy="' + p[1] + '" r="9.6" fill="' + COLORS[s] + '" stroke="#fffdf9" stroke-width="1.4"/>');
        out.push('<text x="' + p[0] + '" y="' + (p[1] + 3.4) + '" class="bg-gate on" text-anchor="middle">' + g + '</text>');
      }
    });

    out.push('</g></svg>');
    return out.join('');
  }

  return { render: render, GATE_POS: GATE_POS, CENTER_SHAPES: CENTER_SHAPES, COLORS: COLORS };
}));
