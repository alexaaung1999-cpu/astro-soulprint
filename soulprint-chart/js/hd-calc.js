/* Human Design Chart calculation engine.
   Pure JavaScript, no network calls. Uses the open-source "astronomy-engine" library (MIT)
   for planet positions. Works in the browser (window.Soulprint.calc) and in Node (require). */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory(require('./hd-data.js'), require('./vendor/astronomy.browser.min.js'));
  } else {
    root.Soulprint = root.Soulprint || {};
    root.Soulprint.calc = factory(root.Soulprint.data, root.Astronomy);
  }
}(typeof self !== 'undefined' ? self : this, function (data, Astronomy) {
  'use strict';

  var DESIGN_ARC = 88; // degrees of Sun travel before birth
  var DAY_MS = 86400000;

  function norm360(x) { x = x % 360; return x < 0 ? x + 360 : x; }
  function signedDiff(a, b) { var d = norm360(a - b); return d > 180 ? d - 360 : d; } // a - b in (-180, 180]

  /* ---------------- Time zones ---------------- */

  var dtfCache = {};
  function formatter(tz) {
    if (!dtfCache[tz]) {
      dtfCache[tz] = new Intl.DateTimeFormat('en-US', {
        timeZone: tz, hourCycle: 'h23', year: 'numeric', month: 'numeric', day: 'numeric',
        hour: 'numeric', minute: 'numeric', second: 'numeric'
      });
    }
    return dtfCache[tz];
  }

  // Offset of a time zone from UTC, in seconds, at a given instant (uses the browser's tz database,
  // so daylight saving and historical changes are handled).
  function offsetSeconds(utcMs, tz) {
    var secMs = Math.floor(utcMs / 1000) * 1000;
    var p = {};
    formatter(tz).formatToParts(new Date(secMs)).forEach(function (x) { p[x.type] = parseInt(x.value, 10); });
    var asUtc = Date.UTC(p.year, p.month - 1, p.day, p.hour === 24 ? 0 : p.hour, p.minute, p.second);
    return Math.round((asUtc - secMs) / 1000);
  }

  function offsetLabel(seconds) {
    var sign = seconds < 0 ? '-' : '+';
    var a = Math.abs(seconds);
    var h = Math.floor(a / 3600), m = Math.round((a % 3600) / 60);
    return 'UTC' + sign + (h < 10 ? '0' : '') + h + ':' + (m < 10 ? '0' : '') + m;
  }

  // Converts a local wall-clock time in an IANA time zone to a UTC instant.
  // Returns { ms, offset, ambiguous, nonexistent }.
  function localToUtc(y, mo, d, h, mi, tz) {
    var naive = Date.UTC(y, mo - 1, d, h, mi, 0);
    var tries = [offsetSeconds(naive - DAY_MS, tz), offsetSeconds(naive + DAY_MS, tz)];
    var seen = {}, valid = [];
    tries.forEach(function (off) {
      var cand = naive - off * 1000;
      if (seen[cand]) return;
      seen[cand] = true;
      if (offsetSeconds(cand, tz) === off) valid.push({ ms: cand, offset: off });
    });
    if (valid.length === 0) {
      // Clock time skipped by a "spring forward" change: use the offset from before the change.
      var before = tries[0];
      return { ms: naive - before * 1000, offset: before, ambiguous: false, nonexistent: true };
    }
    valid.sort(function (a, b) { return a.ms - b.ms; });
    return { ms: valid[0].ms, offset: valid[0].offset, ambiguous: valid.length > 1, nonexistent: false };
  }

  /* ---------------- Positions ---------------- */

  function sunLongitude(date) { return norm360(Astronomy.SunPosition(date).elon); }

  function geoLongitude(body, date) {
    return norm360(Astronomy.Ecliptic(Astronomy.GeoVector(body, date, true)).elon);
  }

  // True (osculating) lunar node: where the Moon's actual orbital plane crosses the ecliptic.
  function trueNorthNode(date) {
    var dt = 0.01 * DAY_MS;
    var t = date.getTime();
    function ecl(ms) { return Astronomy.Ecliptic(Astronomy.GeoVector('Moon', new Date(ms), false)).vec; }
    var r0 = ecl(t - dt), r1 = ecl(t + dt), r = ecl(t);
    var v = { x: r1.x - r0.x, y: r1.y - r0.y, z: r1.z - r0.z };
    var hx = r.y * v.z - r.z * v.y;
    var hy = r.z * v.x - r.x * v.z;
    return norm360(Math.atan2(hx, -hy) * 180 / Math.PI);
  }

  function lonToActivation(lon) {
    var off = norm360(lon - data.WHEEL_START);
    var idx = Math.floor(off / data.GATE_WIDTH);
    if (idx > 63) idx = 63;
    var within = off - idx * data.GATE_WIDTH;
    var line = Math.floor(within / data.LINE_WIDTH) + 1;
    if (line > 6) line = 6;
    // Each line splits into 6 colours, each colour into 6 tones, each tone into 5 bases.
    var inLine = within - (line - 1) * data.LINE_WIDTH;
    var colorWidth = data.LINE_WIDTH / 6, toneWidth = colorWidth / 6, baseWidth = toneWidth / 5;
    var color = Math.min(6, Math.floor(inLine / colorWidth) + 1);
    var inColor = inLine - (color - 1) * colorWidth;
    var tone = Math.min(6, Math.floor(inColor / toneWidth) + 1);
    var inTone = inColor - (tone - 1) * toneWidth;
    var base = Math.min(5, Math.floor(inTone / baseWidth) + 1);
    return { lon: lon, gate: data.GATE_WHEEL[idx], line: line, color: color, tone: tone, base: base };
  }

  function allLongitudes(date) {
    var sun = sunLongitude(date);
    var node = trueNorthNode(date);
    return {
      sun: sun,
      earth: norm360(sun + 180),
      northNode: node,
      southNode: norm360(node + 180),
      moon: geoLongitude('Moon', date),
      mercury: geoLongitude('Mercury', date),
      venus: geoLongitude('Venus', date),
      mars: geoLongitude('Mars', date),
      jupiter: geoLongitude('Jupiter', date),
      saturn: geoLongitude('Saturn', date),
      uranus: geoLongitude('Uranus', date),
      neptune: geoLongitude('Neptune', date),
      pluto: geoLongitude('Pluto', date)
    };
  }

  function activationsAt(date) {
    var lons = allLongitudes(date), out = {};
    data.BODIES.forEach(function (b) { out[b.key] = lonToActivation(lons[b.key]); });
    return out;
  }

  // Finds the moment when the Sun was exactly 88 degrees of longitude behind its birth position.
  function findDesignTime(birthMs) {
    var target = norm360(sunLongitude(new Date(birthMs)) - DESIGN_ARC);
    var t = birthMs - (DESIGN_ARC / 0.9856) * DAY_MS;
    for (var i = 0; i < 30; i++) {
      var diff = signedDiff(target, sunLongitude(new Date(t)));
      if (Math.abs(diff) < 1e-8) break;
      t += (diff / 0.9856) * DAY_MS;
    }
    return t;
  }

  /* ---------------- Interpretation (centers, type, authority...) ---------------- */

  function analyse(personality, design) {
    var active = {}, pGates = {}, dGates = {};
    data.BODIES.forEach(function (b) {
      pGates[personality[b.key].gate] = true;
      dGates[design[b.key].gate] = true;
      active[personality[b.key].gate] = true;
      active[design[b.key].gate] = true;
    });

    var channels = data.CHANNELS.filter(function (c) { return active[c.a] && active[c.b]; });

    var defined = {};
    var adj = {};
    data.CENTER_ORDER.forEach(function (c) { defined[c] = false; adj[c] = []; });
    channels.forEach(function (c) {
      defined[c.centers[0]] = true;
      defined[c.centers[1]] = true;
      adj[c.centers[0]].push(c.centers[1]);
      adj[c.centers[1]].push(c.centers[0]);
    });

    // Groups of defined centers that are joined to each other through channels.
    var groupOf = {}, groups = [];
    data.CENTER_ORDER.forEach(function (c) {
      if (!defined[c] || groupOf[c] !== undefined) return;
      var idx = groups.length, stack = [c], members = [];
      groupOf[c] = idx;
      while (stack.length) {
        var cur = stack.pop();
        members.push(cur);
        adj[cur].forEach(function (n) { if (groupOf[n] === undefined) { groupOf[n] = idx; stack.push(n); } });
      }
      groups.push(members);
    });

    var definedList = data.CENTER_ORDER.filter(function (c) { return defined[c]; });

    // Is a motor center joined (by any route) to the Throat?
    var motorToThroat = false;
    if (defined.Throat) {
      data.MOTORS.forEach(function (m) { if (defined[m] && groupOf[m] === groupOf.Throat) motorToThroat = true; });
    }
    var type;
    if (defined.Sacral) type = motorToThroat ? 'manifesting-generator' : 'generator';
    else if (definedList.length === 0) type = 'reflector';
    else type = motorToThroat ? 'manifestor' : 'projector';

    var authority;
    if (defined.SolarPlexus) authority = 'emotional';
    else if (defined.Sacral) authority = 'sacral';
    else if (defined.Spleen) authority = 'splenic';
    else if (defined.Heart) authority = 'ego';
    else if (defined.G) authority = 'self-projected';
    else if (type === 'reflector') authority = 'lunar';
    else authority = 'mental';

    var strategy = {
      'generator': 'respond',
      'manifesting-generator': 'respond-inform',
      'projector': 'invitation',
      'manifestor': 'inform',
      'reflector': 'lunar-cycle'
    }[type];

    var definition = ['none', 'single', 'split', 'triple', 'quadruple'][groups.length] || 'quadruple';

    var pl = personality.sun.line, dl = design.sun.line;
    var profileKey = pl + '/' + dl;
    var angle;
    if (profileKey === '4/1') angle = 'juxtaposition';
    else if (pl <= 4) angle = 'right';
    else angle = 'left';

    // The four arrows (Variables). Tones 1-3 point left, 4-6 point right.
    function arrow(a) { return { color: a.color, tone: a.tone, base: a.base, side: a.tone <= 3 ? 'left' : 'right', gate: a.gate, line: a.line }; }
    var variables = {
      digestion: arrow(design.sun),            // top left:     Design Sun
      environment: arrow(design.northNode),    // bottom left:  Design North Node
      motivation: arrow(personality.sun),      // top right:    Personality Sun
      perspective: arrow(personality.northNode) // bottom right: Personality North Node
    };

    return {
      variables: variables,
      activeGates: active,
      personalityGates: pGates,
      designGates: dGates,
      channels: channels,
      definedCenters: defined,
      definedCenterList: definedList,
      openCenterList: data.CENTER_ORDER.filter(function (c) { return !defined[c]; }),
      groups: groups,
      type: type,
      strategy: strategy,
      authority: authority,
      definition: definition,
      profile: profileKey,
      cross: {
        angle: angle,
        personalitySun: personality.sun.gate, personalityEarth: personality.earth.gate,
        designSun: design.sun.gate, designEarth: design.earth.gate
      }
    };
  }

  /* ---------------- Public entry points ---------------- */

  // Chart from an exact UTC instant (ms). Used by tests and by calculateChart.
  function chartFromUtc(birthMs) {
    var designMs = findDesignTime(birthMs);
    var personality = activationsAt(new Date(birthMs));
    var design = activationsAt(new Date(designMs));
    var chart = analyse(personality, design);
    chart.personality = personality;
    chart.design = design;
    chart.birthUtc = new Date(birthMs);
    chart.designUtc = new Date(designMs);
    return chart;
  }

  // input: { year, month (1-12), day, hour (0-23), minute, timeZone (IANA name) }
  function calculateChart(input) {
    var conv = localToUtc(input.year, input.month, input.day, input.hour, input.minute, input.timeZone);
    var chart = chartFromUtc(conv.ms);
    chart.timeInfo = {
      timeZone: input.timeZone,
      offsetSeconds: conv.offset,
      offsetLabel: offsetLabel(conv.offset),
      ambiguous: conv.ambiguous,
      nonexistent: conv.nonexistent
    };
    return chart;
  }

  return {
    calculateChart: calculateChart,
    chartFromUtc: chartFromUtc,
    localToUtc: localToUtc,
    offsetSeconds: offsetSeconds,
    offsetLabel: offsetLabel,
    sunLongitude: sunLongitude,
    trueNorthNode: trueNorthNode,
    allLongitudes: allLongitudes,
    lonToActivation: lonToActivation,
    findDesignTime: findDesignTime,
    analyse: analyse
  };
}));
