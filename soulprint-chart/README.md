# Soulprint Chart (free calculator)

A free chart calculator for Astro Soulprint by Alex. Plain HTML, CSS and JavaScript. No build step, no paid services,
and nothing a visitor types ever leaves their phone.

It lives inside your main site repository, in the `soulprint-chart` folder. Once your site is published on GitHub Pages
the calculator is at: `https://<your-username>.github.io/<repo-name>/soulprint-chart/`

## Put it online (beginner steps)

Your main site is already on GitHub Pages, so there is nothing new to set up.

1. Merge this branch into `main` on github.com (open the branch, click **Contribute / Open pull request**, then **Merge**).
2. Wait 1 to 2 minutes, then open the link above. Share that link on Facebook.
3. Check it on your phone: fill in a chart, and make sure the buttons at the bottom open your main site.

## Things you will want to change

Click the file on github.com, click the pencil icon, edit, then **Commit changes**. Wait a minute for the site to update.

| What | File | Notes |
|------|------|-------|
| Package buttons, Messenger and Facebook links | `js/config.js` | Only change the text between the quote marks. `../soulprint-core.html` means "the Soulprint Core page of the main site". |
| Burmese text | `js/content.js` | Under each English paragraph is a line `my: ''`. Type Burmese between the quotes. It appears automatically. |
| Colours | `css/style.css` (top, the `:root` block) | The emerald is `--emerald`. Change it to match your logo exactly. |
| Logo | upload a square `logo.png` into `soulprint-chart/assets/` | It shows in the top bar. If the file is missing, the top bar just shows your name. |
| Incarnation Cross names | `js/content.js`, `CROSS_NAMES` | The page shows the cross type and its four gates. Add names there if you want them. |

**If a change doesn't show on your phone:** your phone may keep an old copy. Open `index.html`, and change `?v=5` to `?v=6` (every place it appears), then save. That forces a fresh copy.

## How accurate is it?

- Planet positions come from the open-source **astronomy-engine** library (MIT licence), run in the browser.
- Time zones and daylight saving (including old historical changes, such as Malaysia and Singapore being UTC+7:30 before 1982)
  come from the phone's own built-in time zone database.
- Design is calculated as the exact moment the Sun was 88 degrees of longitude earlier.
- The Nodes are the "true" nodes.
- During development the engine was compared with the Swiss Ephemeris on 3,000 random births. Type, Authority, Profile and
  Cross matched every time. Positions differ by only a few arc-seconds, so on very rare births (about 1 in 1,000) a planet
  sitting right on a gate edge may land in the neighbouring gate in other software.

## Tests

Tests need Node.js (only on a computer, not for the website). In this folder:

```
npm install
npm test
```

GitHub also runs the tests for you each time you save a change (see the **Actions** tab).

**Adding real charts to test against:** open `tests/known-charts.json`, copy the example block, put in a real birth and the
correct answers from software you trust, and change `"status"` from `"template"` to `"verified"`. Only fill in what you know.
`npm test` then checks every verified chart.

## Updating the city list (rarely needed)

`npm run build:data` rebuilds the files in `data/` from open data (GeoNames, CC BY 4.0). Myanmar has one time zone, so the
city never changes a Myanmar chart. Countries with several zones (USA, Canada, Australia, Russia, and so on) use the city to
choose the zone, and let the visitor pick one by hand.

## Credits

Planet positions: astronomy-engine (MIT). City data: GeoNames (CC BY 4.0). Time zone data: IANA via
countries-and-timezones (MIT) and tz-lookup (CC0). The Human Design system was originated by Ra Uru Hu.
