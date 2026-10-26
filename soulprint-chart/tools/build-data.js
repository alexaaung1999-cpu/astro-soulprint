/* Builds the small data files used by the city / time zone picker.
   Run with:  npm install && npm run build:data
   Sources (all open): GeoNames city list via "all-the-cities" (CC BY 4.0),
   IANA time zone data via "countries-and-timezones" (MIT), "tz-lookup" (CC0). */
const fs = require('fs');
const path = require('path');
const cities = require('all-the-cities');
const tzlookup = require('tz-lookup');
const ct = require('countries-and-timezones');
const { offsetSeconds } = require('../js/hd-calc.js');

const OUT = path.join(__dirname, '..', 'data');
const MIN_POP = 5000; // shipped city list, only for countries that have more than one time zone

const countries = ct.getAllCountries();
const byCountry = {};
for (const c of cities) (byCountry[c.country] = byCountry[c.country] || []).push(c);

// Myanmar has one time zone, so the city never changes the chart. This list only powers
// the type-ahead suggestions, plus old spellings people still use.
const MM = [
  ['Yangon', 'Rangoon'], ['Mandalay', ''], ['Nay Pyi Taw', 'Naypyidaw Naypyitaw Nay Pyi Daw'],
  ['Mawlamyine', 'Moulmein'], ['Bago', 'Pegu'], ['Pathein', 'Bassein'], ['Monywa', ''],
  ['Sittwe', 'Akyab'], ['Meiktila', ''], ['Myeik', 'Mergui'], ['Taunggyi', ''], ['Myingyan', ''],
  ['Dawei', 'Tavoy'], ['Pyay', 'Prome'], ['Hinthada', 'Henzada'], ['Lashio', ''], ['Pakokku', ''],
  ['Taungoo', 'Toungoo'], ['Magway', 'Magwe'], ['Shwebo', ''], ['Sagaing', ''], ['Mogok', ''],
  ['Pyin Oo Lwin', 'Maymyo May Myo'], ['Hpa-An', 'Pa-an Hpa An'], ['Myitkyina', ''], ['Bhamo', ''],
  ['Loikaw', ''], ['Hakha', ''], ['Kawthoung', 'Victoria Point'], ['Thaton', ''], ['Kyaukse', ''],
  ['Minbu', ''], ['Chauk', ''], ['Thayetmyo', ''], ['Yenangyaung', ''], ['Pyinmana', ''],
  ['Letpadan', ''], ['Maubin', ''], ['Pyapon', ''], ['Wakema', ''], ['Bogale', ''], ['Twante', ''],
  ['Thanlyin', 'Syriam'], ['Kyaikto', ''], ['Mudon', ''], ['Mottama', 'Martaban'],
  ['Tachileik', 'Tachilek'], ['Mawlaik', ''], ['Falam', ''], ['Kengtung', 'Kyaingtong'],
  ['Hpakant', ''], ['Putao', ''], ['Kale', 'Kalay'], ['Tamu', ''], ['Kyaukpyu', ''],
  ['Thandwe', 'Sandoway'], ['Nyaungshwe', 'Inle'], ['Hsipaw', ''], ['Kyaikkami', ''],
  ['Paungde', ''], ['Thongwa', ''], ['Kyauktan', ''], ['Dala', ''], ['Insein', ''], ['Hlaingthaya', '']
].map(([n, a]) => [n, '', 0, a]);

// Two zone names can be the same clock (for example the old name "Europe/Kiev" and the new "Europe/Kyiv").
// Compare their real UTC offsets (including daylight saving) from 1970 to 2025 to tell.
const SAMPLES = [];
for (let t = Date.UTC(1970, 0, 1); t < Date.UTC(2025, 0, 1); t += 20 * 864e5) SAMPLES.push(t);
const sigCache = {};
function signature(tz) {
  if (sigCache[tz] !== undefined) return sigCache[tz];
  let sig = null;
  try { sig = SAMPLES.map((t) => offsetSeconds(t, tz)).join(','); } catch (e) { sig = null; }
  return (sigCache[tz] = sig);
}
const zoneCities = {}; // tz -> [[name, pop]]
const countryOut = [];
fs.mkdirSync(path.join(OUT, 'cities'), { recursive: true });
for (const f of fs.readdirSync(path.join(OUT, 'cities'))) fs.unlinkSync(path.join(OUT, 'cities', f));

for (const code of Object.keys(countries).sort()) {
  const info = countries[code];
  if (!info.timezones.length) continue;
  let allowed = info.timezones.slice();

  // For countries with several zones, keep only zones that real cities (1,000+ people) fall into.
  const everyCity = byCountry[code] || [];
  const lookedUp = allowed.length > 1 ? everyCity.map((c) => {
    let tz = null;
    try { tz = tzlookup(c.loc.coordinates[1], c.loc.coordinates[0]); } catch (e) { /* ignore */ }
    const sig = tz && signature(tz);
    return { c, sig, match: sig ? allowed.find((a) => signature(a) === sig) : undefined };
  }) : [];
  if (allowed.length > 1) {
    // Border towns can be misread by the coarse lookup, so a zone needs real support:
    // at least 12 cities, or at least 3 cities and 0.5% of the country's cities.
    const counts = {};
    lookedUp.forEach((r) => { if (r.match) counts[r.match] = (counts[r.match] || 0) + 1; });
    const total = lookedUp.length || 1;
    const top = Object.keys(counts).sort((a, b) => counts[b] - counts[a])[0];
    const used = new Set(Object.keys(counts).filter((z) => z === top || counts[z] >= 12 || (counts[z] >= 3 && counts[z] / total >= 0.005)));
    if (used.size >= 1) allowed = allowed.filter((a) => used.has(a));
  }
  const multi = allowed.length > 1;
  const entry = { c: code, n: info.name, tz: allowed };
  countryOut.push(entry);

  if (code === 'MM') { entry.k = 1; write(code, allowed, MM); continue; }
  if (!multi) continue;

  const good = lookedUp.filter((r) => r.match && allowed.includes(r.match));
  const nearest = (r) => {
    let best = null, bd = Infinity;
    for (const g of good) {
      const dx = g.c.loc.coordinates[0] - r.c.loc.coordinates[0], dy = g.c.loc.coordinates[1] - r.c.loc.coordinates[1];
      const d = dx * dx + dy * dy;
      if (d < bd) { bd = d; best = g.match; }
    }
    return best || allowed[0];
  };
  let fallbacks = 0;
  const entries = lookedUp
    .filter((r) => r.c.population >= MIN_POP)
    .sort((a, b) => b.c.population - a.c.population)
    .map((r) => {
      let tz = r.match && allowed.includes(r.match) ? r.match : null;
      if (!tz) { tz = nearest(r); fallbacks++; }
      (zoneCities[tz] = zoneCities[tz] || []).push([r.c.name, r.c.population]);
      const admin = /^[A-Z]{2,3}$/.test(r.c.adminCode) ? r.c.adminCode : '';
      return [r.c.name, admin, allowed.indexOf(tz), ''];
    });
  entry.k = 1; // k = this country has a city file to load
  if (fallbacks) console.log(code + ': ' + fallbacks + ' of ' + entries.length + ' cities needed nearest-neighbour zone');
  write(code, allowed, entries);
}

function write(code, tz, entries) {
  const body = 'window.Soulprint=window.Soulprint||{};(Soulprint.cityData=Soulprint.cityData||{})[' + JSON.stringify(code) + ']=' + JSON.stringify(entries) + ';\n';
  fs.writeFileSync(path.join(OUT, 'cities', code + '.js'), body);
}

// "e.g. Chicago, Dallas" hints so people can recognise their zone in a list.
const hints = {};
for (const tz of Object.keys(zoneCities)) {
  hints[tz] = zoneCities[tz].sort((a, b) => b[1] - a[1]).slice(0, 3).map((x) => x[0]).join(', ');
}

// Zones that older phones may not know by their newest name.
const bad = [];
for (const c of countryOut) for (const tz of c.tz) { try { new Intl.DateTimeFormat('en', { timeZone: tz }); } catch (e) { bad.push(tz); } }
if (bad.length) console.warn('Time zones this Node cannot format:', bad.join(', '));

fs.writeFileSync(path.join(OUT, 'countries.js'),
  'window.Soulprint=window.Soulprint||{};Soulprint.countries=' + JSON.stringify(countryOut) + ';Soulprint.zoneHints=' + JSON.stringify(hints) + ';\n');
const sizes = fs.readdirSync(path.join(OUT, 'cities')).map((f) => fs.statSync(path.join(OUT, 'cities', f)).size);
console.log('countries:', countryOut.length, '| city files:', sizes.length, '| total city bytes:', sizes.reduce((a, b) => a + b, 0), '| biggest:', Math.max(...sizes));
