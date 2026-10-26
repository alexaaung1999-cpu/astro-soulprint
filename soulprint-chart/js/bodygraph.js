/* Draws the bodygraph as an inline SVG string. No libraries.
   Layout follows the classic gold line-art bodygraph: a pointed Head and Ajna, a round Sacral,
   small bow-tie Spleen and Solar Plexus, and tidy nested curves.
   Design (unconscious) is gold on the left, Personality (conscious) is emerald on the right.
   The figure is drawn in its own units ("ref" units) and scaled into the SVG. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory(require('./hd-data.js'));
  else { root.Soulprint = root.Soulprint || {}; root.Soulprint.bodygraph = factory(root.Soulprint.data); }
}(typeof self !== 'undefined' ? self : this, function (data) {
  'use strict';

  var COLORS = { personality: '#0d5c47', design: '#c08a2a', tube: '#d4b96e', outline: '#c9a24b' };
  var CX = 475;                       // mirror line: x' = CX - x   (the figure is centred on x = 237.5)
  function M(p) { return [CX - p[0], p[1]]; }

  // Left-hand Spleen gates; the Solar Plexus uses the mirror image (36=48, 22=57, 37=44, 6=50, 49=32, 55=28, 30=18).
  var SPLEEN = { 48: [132, 305.8], 57: [141, 310.5], 44: [148.5, 315], 50: [156, 320], 32: [149.5, 326], 28: [142, 331], 18: [133.5, 334] };
  var SP_FROM = { 36: 48, 22: 57, 37: 44, 6: 50, 49: 32, 55: 28, 30: 18 };

  var GATE_POS = {
    64: [228.3, 68], 61: [237, 68], 63: [245.7, 68],
    47: [228.3, 88], 24: [237, 88], 4: [245.7, 88], 17: [230.8, 106.3], 11: [243.8, 106.3], 43: [237, 113.5],
    62: [229, 157], 23: [237, 157], 56: [245.5, 157],
    16: [223.5, 165], 20: [223.5, 173.5], 35: [251.5, 164.5], 12: [251.5, 172.5], 45: [251.5, 180.5],
    31: [228.5, 187], 8: [237, 187], 33: [245.5, 187],
    1: [237, 208.5], 7: [229.5, 214.5], 13: [244.5, 214.5], 10: [219, 227], 25: [256, 227],
    15: [230, 239.5], 46: [245, 239.5], 2: [237.5, 247.5],
    21: [291.5, 252], 51: [284, 262], 26: [274.5, 273], 40: [302, 279.5],
    5: [228.5, 306.5], 14: [237.5, 304], 29: [246.5, 306.5], 34: [224.5, 313.5], 27: [224.5, 324.5], 59: [251, 325.5],
    42: [230, 333], 3: [237.5, 335.5], 9: [245, 333],
    53: [228.8, 359.5], 60: [237.5, 359.5], 52: [246.2, 359.5],
    54: [224.3, 368], 38: [224.3, 376.5], 58: [224.3, 385], 19: [250.7, 368], 39: [250.7, 376.5], 41: [250.7, 385]
  };
  Object.keys(SPLEEN).forEach(function (g) { GATE_POS[g] = SPLEEN[g]; });
  Object.keys(SP_FROM).forEach(function (g) { GATE_POS[g] = M(SPLEEN[SP_FROM[g]]); });

  // Curved channels: "from" is where the curve starts; c holds one (quadratic) or two (cubic) bend points.
  // Anything not listed is a straight tube.
  var CURVES = {
    '16-48': { from: 16, c: [[165, 170], [118, 240]] },
    '20-57': { from: 20, c: [[170, 188], [130, 250]] },
    '10-57': { from: 10, c: [[180, 226], [146, 262]] },
    '10-34': { from: 10, c: [[150, 240], [165, 308]] },
    '20-34': { from: 20, c: [[140, 200], [150, 300]] },
    '34-57': { from: 34, c: [[185, 296]] },
    '27-50': { from: 27, c: [[190, 331]] },
    '26-44': { from: 26, c: [[200, 262]] },
    '25-51': { from: 25, c: [[272, 232]] },
    '21-45': { from: 45, c: [[270, 205], [284, 232]] },
    '35-36': { from: 35, c: [[310, 170], [357, 240]] },
    '12-22': { from: 12, c: [[305, 188], [345, 250]] },
    '6-59':  { from: 59, c: [[284, 331]] },
    '18-58': { from: 18, c: [[130, 377], [180, 385]] },
    '28-38': { from: 28, c: [[140, 370], [185, 376.5]] },
    '32-54': { from: 32, c: [[150, 363], [190, 368]] },
    '30-41': { from: 41, c: [[295, 385], [345, 377]] },
    '39-55': { from: 39, c: [[290, 376.5], [335, 370]] },
    '19-49': { from: 19, c: [[285, 368], [325, 363]] }
  };

  function sampleBezier(p0, ctrl, p3) {
    var pts = [], n = 32, i, t, u;
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
    return '<polyline points="' + pts.map(function (p) { return p[0].toFixed(2) + ',' + p[1].toFixed(2); }).join(' ') + '" ' + attrs + '/>';
  }

  // Polygon corner points to a rounded path.
  function roundedPoly(pts, radius) {
    var n = pts.length, d = '';
    for (var i = 0; i < n; i++) {
      var prev = pts[(i + n - 1) % n], cur = pts[i], next = pts[(i + 1) % n];
      var l1 = dist(prev, cur), l2 = dist(cur, next);
      var r = Math.min(radius, l1 / 2.2, l2 / 2.2);
      var a = [cur[0] + (prev[0] - cur[0]) * r / l1, cur[1] + (prev[1] - cur[1]) * r / l1];
      var b = [cur[0] + (next[0] - cur[0]) * r / l2, cur[1] + (next[1] - cur[1]) * r / l2];
      d += (i === 0 ? 'M' : 'L') + a[0].toFixed(2) + ',' + a[1].toFixed(2) + ' Q' + cur[0] + ',' + cur[1] + ' ' + b[0].toFixed(2) + ',' + b[1].toFixed(2) + ' ';
    }
    return d + 'Z';
  }
  function roundedRect(x, y, w, h, r) {
    return 'M' + (x + r) + ',' + y + ' H' + (x + w - r) + ' Q' + (x + w) + ',' + y + ' ' + (x + w) + ',' + (y + r) + ' V' + (y + h - r) +
      ' Q' + (x + w) + ',' + (y + h) + ' ' + (x + w - r) + ',' + (y + h) + ' H' + (x + r) + ' Q' + x + ',' + (y + h) + ' ' + x + ',' + (y + h - r) +
      ' V' + (y + r) + ' Q' + x + ',' + y + ' ' + (x + r) + ',' + y + ' Z';
  }

  var SPLEEN_PTS = [[127.5, 301.3], [163, 319.5], [125, 339]];
  var CENTER_PATHS = {
    Head: 'M217.8,73.8 L257.2,73.8 Q258,72.6 257,70 C256,60 248,54 237.5,47.5 C227,54 219,60 218,70 Q217,72.6 217.8,73.8 Z',
    Ajna: 'M218,82 L257,82 C257.5,98 250,110 237.5,121.5 C225,110 217.5,98 218,82 Z',
    Throat: roundedRect(217.5, 152.5, 40, 39, 4),
    G: roundedPoly([[237.5, 203.5], [263, 227.4], [237.5, 251.2], [212, 227.4]], 3.2),
    Heart: roundedPoly([[267, 273], [290, 245.5], [311, 284.5]], 3.4),
    Spleen: roundedPoly(SPLEEN_PTS, 3.4),
    SolarPlexus: roundedPoly(SPLEEN_PTS.map(M), 3.4),
    Sacral: 'M218,318.7 a19.5,19.5 0 1,0 39,0 a19.5,19.5 0 1,0 -39,0 Z',
    Root: roundedRect(217.5, 354, 40, 40, 4)
  };

  var SHORT = { sun: 'Sun', earth: 'Earth', northNode: 'N Node', southNode: 'S Node', moon: 'Moon', mercury: 'Merc', venus: 'Venus', mars: 'Mars', jupiter: 'Jup', saturn: 'Sat', uranus: 'Ura', neptune: 'Nep', pluto: 'Pluto' };
  var S = 1.5;                       // scale of the figure
  var TX = 77 - 118 * S, TY = 8 - 44 * S;
  var VIEW_W = 514, VIEW_H = 548;
  var PILL_W = 65;

  function column(chart, side) {
    var isP = side === 'personality';
    var x = isP ? VIEW_W - PILL_W - 1 : 1, color = isP ? COLORS.personality : COLORS.design;
    var out = ['<text x="' + (x + PILL_W / 2) + '" y="22" class="bg-col-title" text-anchor="middle" fill="' + color + '">' + (isP ? 'PERSONALITY' : 'DESIGN') + '</text>'];
    data.BODIES.forEach(function (b, i) {
      var a = chart[side][b.key], y = 32 + i * 25;
      out.push('<rect x="' + x + '" y="' + y + '" width="' + PILL_W + '" height="21.5" rx="10.75" fill="' + color + '" fill-opacity="0.12" stroke="' + color + '" stroke-opacity="0.55" stroke-width="1"/>');
      out.push('<text x="' + (x + 8) + '" y="' + (y + 14.4) + '" class="bg-col-name" fill="' + color + '">' + SHORT[b.key] + '</text>');
      out.push('<text x="' + (x + PILL_W - 7) + '" y="' + (y + 14.6) + '" class="bg-col-val" text-anchor="end" fill="' + color + '">' + a.gate + '.' + a.line + '</text>');
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
      '</defs>');

    out.push(column(chart, 'design'));
    out.push(column(chart, 'personality'));

    out.push('<g transform="translate(' + TX + ',' + TY + ') scale(' + S + ')">');

    var chans = data.CHANNELS.map(function (ch) { return { ch: ch, pts: channelPoints(ch) }; });

    // 1. hollow gold tubes: gold edge first, then a white core
    chans.forEach(function (c) { out.push(polyline(c.pts, 'fill="none" stroke="' + COLORS.tube + '" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"')); });
    chans.forEach(function (c) { out.push(polyline(c.pts, 'fill="none" stroke="#fffdf9" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"')); });

    // 2. colour the half of each tube whose gate is active
    chans.forEach(function (c) {
      var h = halves(c.pts), ch = c.ch;
      [[ch.a, h[0]], [ch.b, h[1]]].forEach(function (pair) {
        var s = state(pair[0]);
        if (s === 'none') return;
        var base = 'fill="none" stroke-width="2.1" stroke-linecap="butt" stroke-linejoin="round"';
        if (s === 'personality') out.push(polyline(pair[1], base + ' stroke="' + COLORS.personality + '"'));
        else if (s === 'design') out.push(polyline(pair[1], base + ' stroke="' + COLORS.design + '"'));
        else {
          out.push(polyline(pair[1], base + ' stroke="' + COLORS.personality + '"'));
          out.push(polyline(pair[1], 'fill="none" stroke-width="2.1" stroke-linejoin="round" stroke="' + COLORS.design + '" stroke-dasharray="2.2 2.2"'));
        }
      });
    });

    // 3. centers
    data.CENTER_ORDER.forEach(function (c) {
      var on = chart.definedCenters[c];
      out.push('<path d="' + CENTER_PATHS[c] + '" fill="' + (on ? 'url(#defFill)' : '#ffffff') + '" stroke="' + COLORS.outline + '" stroke-width="' + (on ? 1.1 : 0.9) + '" stroke-linejoin="round"/>');
    });

    // 4. gate numbers: plain numbers when quiet, coloured discs when active
    Object.keys(GATE_POS).forEach(function (g) {
      var p = GATE_POS[g], s = state(+g), r = 4;
      if (s === 'none') {
        out.push('<text x="' + p[0] + '" y="' + (p[1] + 1.8) + '" class="bg-gate off" text-anchor="middle">' + g + '</text>');
      } else if (s === 'both') {
        out.push('<circle cx="' + p[0] + '" cy="' + p[1] + '" r="' + r + '" fill="' + COLORS.design + '" stroke="#fffdf9" stroke-width="0.7"/>');
        out.push('<path d="M' + p[0] + ',' + (p[1] - r) + ' A' + r + ',' + r + ' 0 0 1 ' + p[0] + ',' + (p[1] + r) + ' Z" fill="' + COLORS.personality + '"/>');
        out.push('<text x="' + p[0] + '" y="' + (p[1] + 1.9) + '" class="bg-gate on" text-anchor="middle">' + g + '</text>');
      } else {
        out.push('<circle cx="' + p[0] + '" cy="' + p[1] + '" r="' + r + '" fill="' + COLORS[s] + '" stroke="#fffdf9" stroke-width="0.7"/>');
        out.push('<text x="' + p[0] + '" y="' + (p[1] + 1.9) + '" class="bg-gate on" text-anchor="middle">' + g + '</text>');
      }
    });

    out.push('</g></svg>');
    return out.join('');
  }

  return { render: render, GATE_POS: GATE_POS, COLORS: COLORS };
}));
