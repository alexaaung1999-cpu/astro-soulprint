/* Page logic: form, validation, city suggestions and drawing the results. */
(function () {
  'use strict';

  var S = window.Soulprint, D = S.data, C = S.calc, T = S.content, CFG = S.config || {};
  var $ = function (id) { return document.getElementById(id); };

  var MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  var POPULAR = ['MM', 'TH', 'SG', 'MY', 'US', 'AU', 'GB', 'JP', 'KR', 'CA', 'AE', 'IN'];
  // Old names for time zones, in case a phone's browser does not know the newer name yet.
  var ZONE_ALIASES = {
    'Asia/Yangon': 'Asia/Rangoon', 'Europe/Kyiv': 'Europe/Kiev', 'Asia/Kolkata': 'Asia/Calcutta',
    'Asia/Ho_Chi_Minh': 'Asia/Saigon', 'Asia/Kathmandu': 'Asia/Katmandu', 'America/Nuuk': 'America/Godthab',
    'Pacific/Kanton': 'Pacific/Enderbury', 'America/Ciudad_Juarez': 'America/Ojinaga'
  };

  var countries = S.countries || [];
  var countryByCode = {};
  countries.forEach(function (c) { countryByCode[c.c] = c; });

  var state = { cityList: [], selectedCity: null, activeIndex: -1 };

  /* ---------- small helpers ---------- */

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (ch) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]; });
  }
  function fold(s) {
    var t = String(s).toLowerCase();
    if (t.normalize) t = t.normalize('NFD').replace(/[̀-ͯ]/g, '');
    return t.replace(/[’'`.]/g, '').replace(/\s+/g, ' ').trim();
  }
  function option(value, label, extra) {
    var o = document.createElement('option');
    o.value = value; o.textContent = label;
    if (extra && extra.disabled) o.disabled = true;
    if (extra && extra.selected) o.selected = true;
    return o;
  }
  function myBlock(text) { return text ? '<p class="my-slot" lang="my">' + esc(text) + '</p>' : ''; }
  function countryName(c) {
    try { if (window.Intl && Intl.DisplayNames) return new Intl.DisplayNames(['en'], { type: 'region' }).of(c.c) || c.n; } catch (e) { /* fall back */ }
    return c.n;
  }
  function zoneLabel(tz) {
    var hint = (S.zoneHints || {})[tz];
    return tz.replace(/_/g, ' ') + (hint ? ' – ' + hint : '');
  }
  function usableZone(tz) {
    var tries = [tz, ZONE_ALIASES[tz]];
    for (var i = 0; i < tries.length; i++) {
      if (!tries[i]) continue;
      try { new Intl.DateTimeFormat('en-US', { timeZone: tries[i] }); return tries[i]; } catch (e) { /* try next */ }
    }
    return null;
  }

  /* ---------- build the form controls ---------- */

  function fillSelect(el, placeholder, items) {
    el.innerHTML = '';
    el.appendChild(option('', placeholder, { disabled: true, selected: true }));
    items.forEach(function (it) { el.appendChild(option(it[0], it[1])); });
  }

  function initForm() {
    var days = [], hours = [], mins = [], i;
    for (i = 1; i <= 31; i++) days.push([String(i), String(i)]);
    for (i = 1; i <= 12; i++) hours.push([String(i), String(i)]);
    for (i = 0; i < 60; i++) mins.push([String(i), (i < 10 ? '0' : '') + i]);
    fillSelect($('day'), 'Day', days);
    fillSelect($('month'), 'Month', MONTHS.map(function (m, idx) { return [String(idx + 1), m]; }));
    fillSelect($('hour'), 'Hour', hours);
    fillSelect($('minute'), 'Min', mins);

    var sel = $('country');
    sel.innerHTML = '';
    sel.appendChild(option('', 'Choose your birth country', { disabled: true }));
    var named = countries.map(function (c) { return { c: c, name: countryName(c) }; });
    var byName = function (a, b) { return a.name.localeCompare(b.name); };
    var pop = document.createElement('optgroup'); pop.label = 'Popular';
    POPULAR.forEach(function (code) {
      var hit = named.filter(function (x) { return x.c.c === code; })[0];
      if (hit) pop.appendChild(option(code, hit.name));
    });
    sel.appendChild(pop);
    var all = document.createElement('optgroup'); all.label = 'All countries';
    named.slice().sort(byName).forEach(function (x) { all.appendChild(option(x.c.c, x.name)); });
    sel.appendChild(all);
    sel.value = 'MM';
    onCountryChange();
  }

  /* ---------- country / city / time zone ---------- */

  function loadCities(code) {
    var info = countryByCode[code];
    state.cityList = [];
    if (!info || !info.k) return;
    function ready() {
      var raw = (S.cityData || {})[code] || [];
      if ($('country').value !== code) return; // user already picked another country
      state.cityList = raw.map(function (e) { return { name: e[0], admin: e[1], tz: e[2], f: fold(e[0]), alt: fold(e[3] || '') }; });
    }
    if (S.cityData && S.cityData[code]) { ready(); return; }
    var s = document.createElement('script');
    s.src = 'data/cities/' + code + '.js';
    s.onload = ready;
    document.head.appendChild(s);
  }

  function onCountryChange() {
    var code = $('country').value, info = countryByCode[code];
    state.selectedCity = null;
    $('city').value = '';
    hideSuggest();
    $('city').placeholder = code === 'MM' ? 'e.g. Yangon' : 'Type your city or town';
    loadCities(code);

    var zoneField = $('zoneField'), zone = $('zone');
    zone.innerHTML = '';
    if (info && info.tz.length > 1) {
      zone.appendChild(option('', 'Choose the closest time zone', { selected: true }));
      info.tz.forEach(function (tz) { zone.appendChild(option(tz, zoneLabel(tz))); });
      zoneField.hidden = false;
      $('zoneHint').textContent = 'This country has more than one time zone. Pick your city above and we will fill this in, or choose the closest one.';
    } else {
      zoneField.hidden = true;
    }
  }

  function searchCities(q) {
    var f = fold(q);
    if (!f) return [];
    var hits = [];
    for (var i = 0; i < state.cityList.length && hits.length < 60; i++) {
      var c = state.cityList[i], score = -1;
      if (c.f.indexOf(f) === 0) score = 0;
      else if ((' ' + c.f).indexOf(' ' + f) !== -1 || c.f.indexOf('-' + f) !== -1) score = 1;
      else if (c.alt && (' ' + c.alt).indexOf(' ' + f) !== -1) score = 2;
      if (score >= 0) hits.push({ c: c, score: score, order: i });
    }
    hits.sort(function (a, b) { return a.score - b.score || a.order - b.order; });
    return hits.slice(0, 7).map(function (h) { return h.c; });
  }

  function hideSuggest() {
    $('citySuggest').hidden = true;
    $('city').setAttribute('aria-expanded', 'false');
    state.activeIndex = -1;
  }

  function showSuggest(items) {
    var ul = $('citySuggest');
    if (!items.length) { hideSuggest(); return; }
    ul.innerHTML = items.map(function (c, i) {
      return '<li role="option" data-i="' + i + '" id="sg' + i + '">' + esc(c.name) + (c.admin ? ' <span>' + esc(c.admin) + '</span>' : '') + '</li>';
    }).join('');
    ul._items = items;
    ul.hidden = false;
    $('city').setAttribute('aria-expanded', 'true');
    state.activeIndex = -1;
  }

  function chooseCity(c) {
    var info = countryByCode[$('country').value];
    state.selectedCity = c;
    $('city').value = c.name;
    hideSuggest();
    if (info && info.tz.length > 1) {
      $('zone').value = info.tz[c.tz];
      $('zoneHint').textContent = 'We filled this in from your city. Change it only if it looks wrong.';
    }
  }

  function exactCity(text) {
    var f = fold(text);
    for (var i = 0; i < state.cityList.length; i++) if (state.cityList[i].f === f) return state.cityList[i];
    return null;
  }

  function initCityBox() {
    var input = $('city'), ul = $('citySuggest');
    input.addEventListener('input', function () {
      state.selectedCity = null;
      showSuggest(searchCities(input.value));
    });
    input.addEventListener('keydown', function (e) {
      var items = ul._items || [];
      if (ul.hidden || !items.length) return;
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        state.activeIndex = (state.activeIndex + (e.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length;
        Array.prototype.forEach.call(ul.children, function (li, i) { li.classList.toggle('active', i === state.activeIndex); });
      } else if (e.key === 'Enter' && state.activeIndex >= 0) {
        e.preventDefault();
        chooseCity(items[state.activeIndex]);
      } else if (e.key === 'Escape') hideSuggest();
    });
    input.addEventListener('blur', function () { setTimeout(hideSuggest, 150); });
    // pointerdown so a tap selects before the input loses focus
    ul.addEventListener('pointerdown', function (e) {
      var li = e.target.closest ? e.target.closest('li') : null;
      if (!li) return;
      e.preventDefault();
      chooseCity(ul._items[+li.getAttribute('data-i')]);
    });
    $('country').addEventListener('change', onCountryChange);
  }

  /* ---------- reading the form ---------- */

  function showError(msg, focusEl) {
    var el = $('formError');
    el.textContent = msg; el.hidden = false;
    if (focusEl) focusEl.focus();
  }

  function readForm() {
    var name = $('name').value.trim();
    if (!name) return { error: 'Please type your name.', el: $('name') };

    var day = parseInt($('day').value, 10), month = parseInt($('month').value, 10);
    var yearText = $('year').value.trim(), year = parseInt(yearText, 10);
    if (!day || !month) return { error: 'Please choose your birth day and month.', el: !day ? $('day') : $('month') };
    var thisYear = new Date().getFullYear();
    if (!/^\d{4}$/.test(yearText) || year < 1900 || year > thisYear) return { error: 'Please type your birth year with 4 numbers, for example 1992.', el: $('year') };
    var test = new Date(Date.UTC(year, month - 1, day));
    if (test.getUTCMonth() !== month - 1 || test.getUTCDate() !== day) return { error: 'That date does not exist. Please check the day and month.', el: $('day') };
    if (test.getTime() > Date.now() + 864e5) return { error: 'That birth date is in the future. Please check it.', el: $('year') };

    var h12 = parseInt($('hour').value, 10), minute = parseInt($('minute').value, 10);
    if (!h12 || isNaN(minute)) return { error: 'Please choose your birth time. A best estimate is fine.', el: !h12 ? $('hour') : $('minute') };
    var ampm = $('ampm').value;
    var hour = (h12 % 12) + (ampm === 'PM' ? 12 : 0);

    var code = $('country').value, info = countryByCode[code];
    if (!info) return { error: 'Please choose your birth country.', el: $('country') };
    var cityText = $('city').value.trim();
    if (!cityText) return { error: 'Please type your birth city or town.', el: $('city') };

    var tz, city = state.selectedCity || exactCity(cityText);
    if (info.tz.length === 1) tz = info.tz[0];
    else {
      if (city && !$('zone').value) $('zone').value = info.tz[city.tz];
      tz = $('zone').value;
      if (!tz) return { error: 'Please choose the time zone closest to your birth place.', el: $('zone') };
    }
    var usable = usableZone(tz);
    if (!usable) return { error: 'Sorry, this phone does not know the time zone for that place. Please try another browser.', el: $('country') };

    return {
      name: name, year: year, month: month, day: day, hour: hour, minute: minute, h12: h12, ampm: ampm,
      city: city ? city.name : cityText, countryName: countryName(info), timeZone: usable
    };
  }

  /* ---------- drawing the results ---------- */

  function fmtDate(y, m, d) { return d + ' ' + MONTHS[m - 1] + ' ' + y; }
  function fmtTimeParts(h12, minute, ampm) { return h12 + ':' + (minute < 10 ? '0' : '') + minute + ' ' + ampm; }

  function infoCard(label, title, subtitle, text, my) {
    return '<article class="card info-card"><span class="tag">' + esc(label) + '</span>' +
      '<h3>' + esc(title) + '</h3>' +
      (subtitle ? '<p class="card-sub">' + esc(subtitle) + '</p>' : '') +
      '<p>' + esc(text) + '</p>' + myBlock(my) + '</article>';
  }

  function profileTitle(key) {
    var parts = key.split('/');
    return key + ' · ' + T.PROFILE_LINES[parts[0]] + ' / ' + T.PROFILE_LINES[parts[1]];
  }

  function renderSummary(chart) {
    var type = T.TYPES[chart.type], strat = T.STRATEGIES[chart.strategy], auth = T.AUTHORITIES[chart.authority];
    var prof = T.PROFILES[chart.profile], def = T.DEFINITIONS[chart.definition], angle = T.CROSS_ANGLES[chart.cross.angle];
    var x = chart.cross;
    var gates = x.personalitySun + '/' + x.personalityEarth + ' | ' + x.designSun + '/' + x.designEarth;
    var crossName = T.CROSS_NAMES[gates];
    var crossTitle = crossName ? crossName : angle.name;
    var crossSub = (crossName ? angle.name + ' · ' : '') + 'Gates ' + gates;

    $('summaryCards').innerHTML =
      infoCard('Type', type.name, '', type.en, type.my) +
      infoCard('Strategy', strat.name, '', strat.en, strat.my) +
      infoCard('Inner Authority', auth.name, '', auth.en, auth.my) +
      infoCard('Profile', profileTitle(chart.profile), '', prof.en, prof.my) +
      infoCard('Definition', def.name, '', def.en, def.my) +
      infoCard('Incarnation Cross', crossTitle, crossSub, angle.en, angle.my);
  }

  function renderCenters(chart) {
    function list(arr) {
      return arr.length ? '<ul class="sparkle-list cols">' + arr.map(function (c) { return '<li>' + esc(D.CENTER_NAMES[c]) + '</li>'; }).join('') + '</ul>' : '<p class="muted">None</p>';
    }
    $('centersCard').innerHTML =
      '<h3>Your centers</h3>' +
      '<p class="muted">Defined centers are where your energy is steady and reliable. Open centers are where you take in, and sometimes amplify, the energy of the people around you.</p>' +
      '<div class="two-col"><div><h4><span class="dot dot-def"></span>Defined</h4>' + list(chart.definedCenterList) + '</div>' +
      '<div><h4><span class="dot dot-open"></span>Open</h4>' + list(chart.openCenterList) + '</div></div>';
  }

  function renderChannels(chart) {
    var body;
    if (!chart.channels.length) {
      body = '<p class="muted">You have no complete channels. This is the pattern of a Reflector, who stays wonderfully open to the world.</p>';
    } else {
      body = '<ul class="sparkle-list">' + chart.channels.map(function (ch) {
        return '<li><span class="chan-key">' + ch.a + '&ndash;' + ch.b + '</span> <strong>' + esc(ch.name) + '</strong> <span class="muted">' +
          esc(D.CENTER_NAMES[ch.centers[0]]) + ' &harr; ' + esc(D.CENTER_NAMES[ch.centers[1]]) + '</span></li>';
      }).join('') + '</ul>';
    }
    $('channelsCard').innerHTML = '<h3>Your defined channels</h3>' +
      '<p class="muted">A channel is a bridge between two centers. It forms when both of its gates are active.</p>' + body;
  }

  function renderGates(chart, tz) {
    var designDay = new Intl.DateTimeFormat('en-GB', { timeZone: tz, day: 'numeric', month: 'long', year: 'numeric' }).format(chart.designUtc);
    var rows = D.BODIES.map(function (b) {
      var p = chart.personality[b.key], d = chart.design[b.key];
      return '<tr><th scope="row">' + esc(b.name) + '</th>' +
        '<td><span class="gl gl-p">' + p.gate + '.' + p.line + '</span></td>' +
        '<td><span class="gl gl-d">' + d.gate + '.' + d.line + '</span></td></tr>';
    }).join('');
    $('gatesCard').innerHTML = '<h3>Your activated gates</h3>' +
      '<p class="muted">Each number shows the gate and line. Personality is your birth moment. Design is the moment about 88 days earlier when the Sun was 88&deg; behind its birth position (around ' + esc(designDay) + ').</p>' +
      '<table class="gates"><thead><tr><th></th><th scope="col"><span class="dot dot-p"></span>Personality</th><th scope="col"><span class="dot dot-d"></span>Design</th></tr></thead><tbody>' + rows + '</tbody></table>';
  }

  function renderInvite() {
    var links = CFG.packageLinks || [];
    $('inviteActions').innerHTML = links.map(function (l) {
      return '<a class="btn ' + (l.primary ? 'btn-light' : 'btn-outline-light') + '" href="' + esc(l.href) + '">' + esc(l.label) + '</a>';
    }).join('');
  }

  function showResults(inputs, chart) {
    $('resultsSub').textContent = 'For ' + inputs.name + ' · born ' + fmtDate(inputs.year, inputs.month, inputs.day) + ', ' +
      fmtTimeParts(inputs.h12, inputs.minute, inputs.ampm) + ' · ' + inputs.city + ', ' + inputs.countryName + ' (' + chart.timeInfo.offsetLabel + ')';

    var notice = $('resultsNotice');
    if (chart.timeInfo.nonexistent) {
      notice.textContent = 'On that day the clocks jumped forward, so that exact time did not happen. Please double-check your birth time.';
      notice.hidden = false;
    } else if (chart.timeInfo.ambiguous) {
      notice.textContent = 'On that day the clocks were turned back, so that time happened twice. We used the first one. If you were born the second time around, please let Alex know.';
      notice.hidden = false;
    } else notice.hidden = true;

    $('bodygraph').innerHTML = S.bodygraph.render(chart);
    renderSummary(chart);
    renderCenters(chart);
    renderChannels(chart);
    renderGates(chart, inputs.timeZone);
    renderInvite();

    var res = $('results');
    res.hidden = false;
    var title = $('resultsTitle');
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    res.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
    title.focus({ preventScroll: true });
  }

  function onSubmit(e) {
    e.preventDefault();
    $('formError').hidden = true;
    var inputs = readForm();
    if (inputs.error) { showError(inputs.error, inputs.el); return; }
    var chart;
    try {
      chart = C.calculateChart({ year: inputs.year, month: inputs.month, day: inputs.day, hour: inputs.hour, minute: inputs.minute, timeZone: inputs.timeZone });
    } catch (err) {
      showError('Sorry, something went wrong while calculating. Please check your details and try again.');
      if (window.console) console.error(err);
      return;
    }
    showResults(inputs, chart);
  }

  /* ---------- start ---------- */

  function init() {
    initForm();
    initCityBox();
    $('chartForm').addEventListener('submit', onSubmit);
    $('againBtn').addEventListener('click', function () { setTimeout(function () { $('name').focus(); }, 400); });
    $('year').addEventListener('input', function () { this.value = this.value.replace(/\D/g, '').slice(0, 4); });
    $('footMessenger').href = CFG.messengerUrl || $('footMessenger').href;
    $('footFacebook').href = CFG.facebookUrl || $('footFacebook').href;
    $('footYear').textContent = new Date().getFullYear();
  }

  init();
}());
