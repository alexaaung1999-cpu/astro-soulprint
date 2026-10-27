/* Draws the bodygraph as an inline SVG string. No libraries.
   Geometry is measured from the classic gold line-art bodygraph (pointed Head, shield-shaped Ajna,
   round Sacral, bow-tie Spleen and Solar Plexus, three-tube bundles down the middle, nested curves).
   Design (unconscious) is gold on the left, Personality (conscious) is emerald on the right.
   The figure is drawn in its own units ("ref" units) and scaled into the SVG. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory(require('./hd-data.js'));
  else { root.Soulprint = root.Soulprint || {}; root.Soulprint.bodygraph = factory(root.Soulprint.data); }
}(typeof self !== 'undefined' ? self : this, function (data) {
  'use strict';

  var COLORS = { personality: '#0d5c47', design: '#c08a2a', edge: '#d8a93c', core: '#fcefc4', outline: '#d4a640' };
  var CX = 475;                       // mirror line: x' = CX - x
  function M(p) { return [CX - p[0], p[1]]; }
  function Mseg(seg) { return seg.map(M); }
  function Rseg(seg) { return seg.slice().reverse(); }

  // Left-hand Spleen gates; the Solar Plexus is the mirror image (36=48, 22=57, 37=44, 6=50, 49=32, 55=28, 30=18).
  var SPLEEN = { 48: [131, 306], 57: [140.5, 310.5], 44: [148.5, 315], 50: [155.5, 320.5], 32: [149, 326.5], 28: [141.5, 331], 18: [133, 334] };
  var SP_FROM = { 36: 48, 22: 57, 37: 44, 6: 50, 49: 32, 55: 28, 30: 18 };

  // Where each gate number is written.
  var GATE_POS = {
    64: [229, 67.5], 61: [237.5, 67.5], 63: [247, 67.5],
    47: [228, 88], 24: [237.5, 88], 4: [246.5, 88], 17: [231, 104.5], 11: [244, 104.5], 43: [237.5, 113],
    62: [229, 157.5], 23: [237.5, 157.5], 56: [246.5, 157.5],
    16: [223.5, 166], 20: [223.5, 174.5], 35: [251.5, 165], 12: [251.5, 173], 45: [251.5, 181],
    31: [229, 187], 8: [237.5, 187], 33: [246, 187],
    1: [237.5, 208.5], 7: [229.5, 214.5], 13: [245, 214.5], 10: [219, 227.5], 25: [256, 227.5],
    15: [230.5, 239.5], 46: [244.5, 239.5], 2: [237.5, 247.5],
    21: [291, 252.5], 51: [284.5, 261.5], 26: [274, 272.5], 40: [301, 279.5],
    5: [229, 306.5], 14: [237.5, 304.5], 29: [246, 306.5], 34: [225, 314], 27: [225, 325], 59: [251, 325.5],
    42: [230.5, 333], 3: [237.5, 335.5], 9: [244.5, 333],
    53: [229, 359], 60: [237.5, 359], 52: [246, 359],
    54: [224.5, 368], 38: [224.5, 376.5], 58: [224.5, 385], 19: [250.5, 368], 39: [250.5, 376.5], 41: [250.5, 385]
  };
  Object.keys(SPLEEN).forEach(function (g) { GATE_POS[g] = SPLEEN[g]; });
  Object.keys(SP_FROM).forEach(function (g) { GATE_POS[g] = M(SPLEEN[SP_FROM[g]]); });

  // ---- Channels. "first" is the gate at the start of the path; segs are straight [p0,p1],
  // quadratic [p0,c,p3] or cubic [p0,c1,c2,p3] pieces. Tube bundles sit at x = 231, 237.5, 244.
  var AX = [231, 237.5, 244];
  function vert(x, yA, yB) { return { first: 'a', segs: [[[x, yA], [x, yB]]] }; }

  var LOOP_TOP = [[212, 229], [180, 231], [156, 245], [152, 266]];            // G left, curling out to the left
  var LOOP_BOTTOM = [[152, 266], [146, 290], [180, 312], [222, 314]];         // and back in to the Sacral
  var ARC_OUTER = [[222, 171], [185, 177], [140, 222], [130, 300]];           // Throat -> Spleen (outer)
  var ARC_INNER = [[222, 181], [195, 190], [153, 230], [141, 300]];           // Throat -> Spleen (inner)
  var LOW_A = [[152, 330], [158, 350], [185, 368], [222, 368]];               // Spleen -> Root, three nested arcs
  var LOW_B = [[145, 334], [148, 358], [180, 376], [222, 376.5]];
  var LOW_C = [[137, 337], [138, 365], [178, 384], [222, 385]];

  var CHANNEL_PATHS = {
    '47-64': vert(AX[0], 86, 70), '24-61': vert(AX[1], 86, 70), '4-63': vert(AX[2], 86, 70),
    '17-62': vert(AX[0], 108, 156), '23-43': vert(AX[1], 156, 112), '11-56': vert(AX[2], 108, 156),
    '7-31': vert(AX[0], 214, 186), '1-8': vert(AX[1], 212, 186), '13-33': vert(AX[2], 214, 186),
    '5-15': vert(AX[0], 306, 243), '2-14': vert(AX[1], 243, 306), '29-46': vert(AX[2], 306, 243),
    '42-53': vert(AX[0], 330, 358), '3-60': vert(AX[1], 330, 358), '9-52': vert(AX[2], 330, 358),

    '16-48': { first: 'a', segs: [ARC_OUTER] },
    '20-57': { first: 'a', segs: [ARC_INNER] },
    '35-36': { first: 'a', segs: [Mseg(ARC_OUTER)] },
    '12-22': { first: 'a', segs: [Mseg(ARC_INNER)] },

    '10-34': { first: 'a', segs: [LOOP_TOP, LOOP_BOTTOM] },
    '10-57': { first: 'a', segs: [LOOP_TOP, [[152, 266], [148, 278], [143, 290], [141, 300]]] },
    '20-34': { first: 'a', segs: [[[222, 181], [195, 190], [160, 232], [152, 266]], LOOP_BOTTOM] },
    '34-57': { first: 'a', segs: [[[222, 314], [190, 309], [160, 302], [143, 309]]] },
    '10-20': { first: 'a', segs: [[[213, 229], [217, 176]]] },

    '26-44': { first: 'a', segs: [[[267, 271.5], [215, 270], [180, 290], [152, 313]]] },
    '27-50': { first: 'a', segs: [[[222, 327], [190, 328], [160, 320]]] },
    '6-59':  { first: 'a', segs: [[[316, 321], [290, 328], [257, 327]]] },
    '25-51': { first: 'a', segs: [[[262, 228], [272, 238], [280, 254]]] },
    '21-45': { first: 'a', segs: [[[291, 250], [282, 230], [265, 205], [253, 190]]] },
    '37-40': { first: 'a', segs: [[[322, 312], [309, 283]]] },

    '32-54': { first: 'a', segs: [LOW_A] },
    '28-38': { first: 'a', segs: [LOW_B] },
    '18-58': { first: 'a', segs: [LOW_C] },
    '19-49': { first: 'a', segs: [Rseg(Mseg(LOW_A))] },
    '39-55': { first: 'a', segs: [Rseg(Mseg(LOW_B))] },
    '30-41': { first: 'a', segs: [Mseg(LOW_C)] }
  };

  function sampleSeg(seg) {
    var n = seg.length === 2 ? 1 : 32, pts = [], i, t, u, p = seg;
    for (i = 0; i <= n; i++) {
      t = i / n; u = 1 - t;
      if (p.length === 2) pts.push([p[0][0] + (p[1][0] - p[0][0]) * t, p[0][1] + (p[1][1] - p[0][1]) * t]);
      else if (p.length === 3) pts.push([u * u * p[0][0] + 2 * u * t * p[1][0] + t * t * p[2][0], u * u * p[0][1] + 2 * u * t * p[1][1] + t * t * p[2][1]]);
      else pts.push([u * u * u * p[0][0] + 3 * u * u * t * p[1][0] + 3 * u * t * t * p[2][0] + t * t * t * p[3][0],
                     u * u * u * p[0][1] + 3 * u * u * t * p[1][1] + 3 * u * t * t * p[2][1] + t * t * t * p[3][1]]);
    }
    return pts;
  }

  // Points of a channel running from gate a to gate b.
  function channelPoints(ch) {
    var spec = CHANNEL_PATHS[ch.key], pts = [];
    spec.segs.forEach(function (seg, i) { var s = sampleSeg(seg); pts = pts.concat(i ? s.slice(1) : s); });
    return pts;
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

  var SPLEEN_PTS = [[126, 302], [163.5, 320], [126, 338]];
  var CENTER_PATHS = {
    Head: 'M219.5,76 L254.5,76 Q258.5,76 257.5,71.5 C256,60 248,45 236.5,33 C225,45 217,60 216,71.5 Q215,76 219.5,76 Z',
    Ajna: 'M219.5,81.5 L254.5,81.5 Q258.5,81.5 257.5,86 C256,98 248,110 237,119.5 C226,110 218,98 216.5,86 Q215.5,81.5 219.5,81.5 Z',
    Throat: roundedRect(217, 151.5, 40, 40, 5),
    G: roundedPoly([[237.5, 203], [263, 227.5], [237.5, 251], [211.5, 227.5]], 3.4),
    Heart: 'M268,271 L289,243.5 C300,250 307,265 309.5,285 C295,286 278,282 268,271 Z',
    Spleen: roundedPoly(SPLEEN_PTS, 3.6),
    SolarPlexus: roundedPoly(SPLEEN_PTS.map(M), 3.6),
    Sacral: 'M218,319.3 a19.5,19.5 0 1,0 39,0 a19.5,19.5 0 1,0 -39,0 Z',
    Root: roundedRect(216.5, 351, 40.5, 40, 5)
  };

  var SHORT = { sun: 'Sun', earth: 'Earth', northNode: 'N Node', southNode: 'S Node', moon: 'Moon', mercury: 'Merc', venus: 'Venus', mars: 'Mars', jupiter: 'Jup', saturn: 'Sat', uranus: 'Ura', neptune: 'Nep', pluto: 'Pluto' };
  var S = 1.55;                       // scale of the figure
  var TX = 74 - 123 * S, TY = 8 - 33 * S;
  var VIEW_W = 503, VIEW_H = 572;
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
    out.push('<defs><linearGradient id="defFill" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#a6dcc6"/><stop offset="0.55" stop-color="#cfe6c4"/><stop offset="1" stop-color="#f1dfaa"/></linearGradient></defs>');

    out.push(column(chart, 'design'));
    out.push(column(chart, 'personality'));

    out.push('<g transform="translate(' + TX + ',' + TY + ') scale(' + S + ')">');

    var chans = data.CHANNELS.map(function (ch) { return { ch: ch, pts: channelPoints(ch) }; });
    var W_EDGE = 4.4, W_CORE = 2.5;

    // 1. gold tubes: gold edge first, then a pale core
    chans.forEach(function (c) { out.push(polyline(c.pts, 'fill="none" stroke="' + COLORS.edge + '" stroke-width="' + W_EDGE + '" stroke-linecap="round" stroke-linejoin="round"')); });
    chans.forEach(function (c) { out.push(polyline(c.pts, 'fill="none" stroke="' + COLORS.core + '" stroke-width="' + W_CORE + '" stroke-linecap="round" stroke-linejoin="round"')); });

    // 2. colour the half of each tube whose gate is active
    chans.forEach(function (c) {
      var h = halves(c.pts), ch = c.ch;
      [[ch.a, h[0]], [ch.b, h[1]]].forEach(function (pair) {
        var s = state(pair[0]);
        if (s === 'none') return;
        var base = 'fill="none" stroke-width="' + W_CORE + '" stroke-linecap="butt" stroke-linejoin="round"';
        if (s === 'personality') out.push(polyline(pair[1], base + ' stroke="' + COLORS.personality + '"'));
        else if (s === 'design') out.push(polyline(pair[1], base + ' stroke="' + COLORS.design + '"'));
        else {
          out.push(polyline(pair[1], base + ' stroke="' + COLORS.personality + '"'));
          out.push(polyline(pair[1], 'fill="none" stroke-width="' + W_CORE + '" stroke-linejoin="round" stroke="' + COLORS.design + '" stroke-dasharray="2.2 2.2"'));
        }
      });
    });

    // 3. centers
    data.CENTER_ORDER.forEach(function (c) {
      var on = chart.definedCenters[c];
      out.push('<path d="' + CENTER_PATHS[c] + '" fill="' + (on ? 'url(#defFill)' : '#ffffff') + '" stroke="' + COLORS.outline + '" stroke-width="1.2" stroke-linejoin="round"/>');
    });

    // 4. gate numbers: plain numbers when quiet, coloured discs when active
    Object.keys(GATE_POS).forEach(function (g) {
      var p = GATE_POS[g], s = state(+g), r = 4;
      if (s === 'none') {
        out.push('<text x="' + p[0] + '" y="' + (p[1] + 1.9) + '" class="bg-gate off" text-anchor="middle">' + g + '</text>');
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

  return { render: render, GATE_POS: GATE_POS, COLORS: COLORS, CENTER_PATHS: CENTER_PATHS, channelPoints: channelPoints };
}));
