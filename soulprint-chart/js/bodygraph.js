/* Draws the bodygraph as an inline SVG string. No libraries.
   Style: white rounded centers with a fine gold outline, hollow gold channel tubes,
   Design (unconscious) in gold on the left, Personality (conscious) in emerald on the right. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory(require('./hd-data.js'));
  else { root.Soulprint = root.Soulprint || {}; root.Soulprint.bodygraph = factory(root.Soulprint.data); }
}(typeof self !== 'undefined' ? self : this, function (data) {
  'use strict';

  var COLORS = { personality: '#0d5c47', design: '#c08a2a', tube: '#d9c58f', gold: '#c9a24b', openStroke: '#d4bf84' };

  // Shapes of the nine centers (corner points) and how round their corners are.
  var CENTER_SHAPES = {
    Head:        { points: '223,14 257,68 189,68',                 round: 8 },
    Ajna:        { points: '189,96 257,96 223,150',                round: 8 },
    Throat:      { points: '186,188 260,188 260,270 186,270',      round: 11 },
    G:           { points: '223,288 266,330 223,372 180,330',      round: 9 },
    Heart:       { points: '302,294 336,352 268,352',              round: 8 },
    Spleen:      { points: '40,370 120,420 40,472',                round: 9 },
    SolarPlexus: { points: '406,370 326,420 406,472',              round: 9 },
    Sacral:      { points: '186,420 260,420 260,492 186,492',      round: 11 },
    Root:        { points: '186,536 260,536 260,616 186,616',      round: 11 }
  };

  // Where each gate number sits inside its center.
  var GATE_POS = {
    64: [206, 58], 61: [223, 58], 63: [240, 58],
    47: [206, 106], 24: [223, 106], 4: [240, 106], 17: [212, 122], 11: [234, 122], 43: [223, 138],
    62: [203, 198], 23: [223, 198], 56: [243, 198],
    16: [196, 212], 20: [196, 236], 35: [250, 210], 12: [250, 232], 45: [250, 254],
    31: [205, 260], 8: [223, 260], 33: [241, 260],
    1: [223, 302], 7: [205, 317], 13: [241, 317], 10: [192, 331], 25: [254, 331],
    15: [205, 347], 2: [223, 358], 46: [241, 347],
    21: [302, 308], 51: [291, 326], 26: [282, 343], 40: [322, 343],
    48: [62, 384], 57: [84, 399], 44: [106, 414], 50: [104, 430], 18: [88, 442], 28: [70, 454], 32: [54, 464],
    36: [384, 384], 22: [362, 399], 37: [340, 414], 6: [342, 430], 49: [358, 442], 55: [376, 454], 30: [392, 464],
    5: [203, 430], 14: [223, 430], 29: [243, 430], 34: [196, 448], 27: [196, 470], 59: [250, 458],
    42: [203, 482], 3: [223, 482], 9: [243, 482],
    53: [203, 546], 60: [223, 546], 52: [243, 546],
    58: [196, 564], 38: [196, 582], 54: [196, 600], 19: [250, 564], 39: [250, 582], 41: [250, 600]
  };

  // Curved channels. "from" is the gate where the curve starts; c = bend (control) points.
  // Channels not listed here are straight lines.
  var CURVES = {
    '10-34': { from: 10, c: [[180, 392]] },
    '10-57': { from: 10, c: [[136, 352]] },
    '20-34': { from: 20, c: [[150, 262], [150, 420]] },
    '20-57': { from: 20, c: [[94, 240], [50, 330]] },
    '34-57': { from: 34, c: [[130, 432]] },
    '16-48': { from: 16, c: [[76, 215], [14, 300]] },
    '35-36': { from: 35, c: [[370, 215], [432, 300]] },
    '12-22': { from: 12, c: [[352, 236], [396, 330]] },
    '26-44': { from: 26, c: [[215, 395]] },
    '27-50': { from: 27, c: [[150, 468]] },
    '6-59':  { from: 59, c: [[296, 466]] },
    '18-58': { from: 18, c: [[90, 524], [140, 564]] },
    '28-38': { from: 28, c: [[68, 545], [130, 582]] },
    '32-54': { from: 32, c: [[50, 565], [120, 600]] },
    '19-49': { from: 19, c: [[306, 564], [358, 524]] },
    '39-55': { from: 39, c: [[316, 582], [378, 545]] },
    '30-41': { from: 41, c: [[326, 600], [396, 565]] }
  };

  function sampleBezier(p0, ctrl, p3) {
    var pts = [], n = 30, i, t, u;
    for (i = 0; i <= n; i++) {
      t = i / n; u = 1 - t;
      if (ctrl.length === 1) {
        pts.push([u * u * p0[0] + 2 * u * t * ctrl[0][0] + t * t * p3[0], u * u * p0[1] + 2 * u * t * ctrl[0][1] + t * t * p3[1]]);
      } else {
        pts.push([u * u * u * p0[0] + 3 * u * u * t * ctrl[0][0] + 3 * u * t * t * ctrl[1][0] + t * t * t * p3[0],
                  u * u * u * p0[1] + 3 * u * u * t * ctrl[0][1] + 3 * u * t * t * ctrl[1][1] + t * t * t * p3[1]]);
      }
    }
    return pts;
  }

  // Points of a channel, running from gate a to gate b.
  function channelPoints(ch) {
    var spec = CURVES[ch.key];
    if (!spec) return [GATE_POS[ch.a], GATE_POS[ch.b]];
    var other = spec.from === ch.a ? ch.b : ch.a;
    var pts = sampleBezier(GATE_POS[spec.from], spec.c, GATE_POS[other]);
    return spec.from === ch.a ? pts : pts.reverse();
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

  // "x,y x,y ..." to a rounded-corner path.
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
  var VIEW_H = 640;

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

    out.push('<svg class="bodygraph" viewBox="0 0 ' + VIEW_W + ' ' + VIEW_H + '" role="img" aria-labelledby="bgTitle bgDesc" xmlns="http://www.w3.org/2000/svg">');
    out.push('<title id="bgTitle">Your Soulprint Chart bodygraph</title>');
    out.push('<desc id="bgDesc">Defined centers: ' + (chart.definedCenterList.map(function (c) { return data.CENTER_NAMES[c]; }).join(', ') || 'none') + '. Defined channels: ' + (chart.channels.map(function (c) { return c.key; }).join(', ') || 'none') + '.</desc>');
    out.push('<defs>' +
      '<linearGradient id="defFill" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#a6dcc6"/><stop offset="0.55" stop-color="#cfe6c4"/><stop offset="1" stop-color="#f1dfaa"/></linearGradient>' +
      '<filter id="soft" x="-20%" y="-20%" width="140%" height="150%"><feDropShadow dx="0" dy="2" stdDeviation="2.6" flood-color="#0d5c47" flood-opacity="0.2"/></filter>' +
      '</defs>');

    out.push(column(chart, 'design'));
    out.push(column(chart, 'personality'));

    out.push('<g transform="translate(' + BODY_X + ',0)">');

    var chans = data.CHANNELS.map(function (ch) { return { ch: ch, pts: channelPoints(ch) }; });

    // 1. hollow gold tubes: gold outline first, then a white core
    chans.forEach(function (c) { out.push(polyline(c.pts, 'fill="none" stroke="' + COLORS.tube + '" stroke-width="7.4" stroke-linecap="round" stroke-linejoin="round"')); });
    chans.forEach(function (c) { out.push(polyline(c.pts, 'fill="none" stroke="#fffdf9" stroke-width="4.6" stroke-linecap="round" stroke-linejoin="round"')); });

    // 2. colour the half of each tube whose gate is active
    chans.forEach(function (c) {
      var h = halves(c.pts), ch = c.ch;
      [[ch.a, h[0]], [ch.b, h[1]]].forEach(function (pair) {
        var s = state(pair[0]);
        if (s === 'none') return;
        var base = 'fill="none" stroke-width="4.6" stroke-linecap="butt" stroke-linejoin="round"';
        if (s === 'personality') out.push(polyline(pair[1], base + ' stroke="' + COLORS.personality + '"'));
        else if (s === 'design') out.push(polyline(pair[1], base + ' stroke="' + COLORS.design + '"'));
        else {
          out.push(polyline(pair[1], base + ' stroke="' + COLORS.personality + '"'));
          out.push(polyline(pair[1], 'fill="none" stroke-width="4.6" stroke-linejoin="round" stroke="' + COLORS.design + '" stroke-dasharray="4.5 4.5"'));
        }
      });
    });

    // 3. centers
    data.CENTER_ORDER.forEach(function (c) {
      var shape = CENTER_SHAPES[c], on = chart.definedCenters[c];
      out.push('<path d="' + roundedPath(shape.points, shape.round) + '" fill="' + (on ? 'url(#defFill)' : '#ffffff') + '" stroke="' + (on ? '#c9a24b' : COLORS.openStroke) + '" stroke-width="' + (on ? 1.8 : 1.5) + '" stroke-linejoin="round"' + (on ? ' filter="url(#soft)"' : '') + '/>');
    });

    // 4. gate numbers: plain numbers when quiet, coloured discs when active
    Object.keys(GATE_POS).forEach(function (g) {
      var p = GATE_POS[g], s = state(+g), r = 8.3;
      if (s === 'none') {
        out.push('<text x="' + p[0] + '" y="' + (p[1] + 3) + '" class="bg-gate off" text-anchor="middle">' + g + '</text>');
      } else if (s === 'both') {
        out.push('<circle cx="' + p[0] + '" cy="' + p[1] + '" r="' + r + '" fill="' + COLORS.design + '" stroke="#fffdf9" stroke-width="1.3"/>');
        out.push('<path d="M' + p[0] + ',' + (p[1] - r) + ' A' + r + ',' + r + ' 0 0 1 ' + p[0] + ',' + (p[1] + r) + ' Z" fill="' + COLORS.personality + '"/>');
        out.push('<text x="' + p[0] + '" y="' + (p[1] + 3.2) + '" class="bg-gate on" text-anchor="middle">' + g + '</text>');
      } else {
        out.push('<circle cx="' + p[0] + '" cy="' + p[1] + '" r="' + r + '" fill="' + COLORS[s] + '" stroke="#fffdf9" stroke-width="1.3"/>');
        out.push('<text x="' + p[0] + '" y="' + (p[1] + 3.2) + '" class="bg-gate on" text-anchor="middle">' + g + '</text>');
      }
    });

    out.push('</g></svg>');
    return out.join('');
  }

  return { render: render, GATE_POS: GATE_POS, CENTER_SHAPES: CENTER_SHAPES, COLORS: COLORS };
}));
