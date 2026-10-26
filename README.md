# Astro Soulprint by Alex

Multi-page site: `index.html`, five category pages, `roadmap.html`, and `style.css`. GitHub Pages builds it automatically with Jekyll; there is nothing to run yourself.

## Publish on GitHub Pages

1. Create a new **public** repository on github.com (for example `astro-soulprint`).
2. Upload everything in this folder to the repository root (`index.html`, `style.css`, `images/`).
3. In the repository, open **Settings → Pages**.
4. Under **Build and deployment → Source**, choose **Deploy from a branch**.
5. Set **Branch** to `main` and the folder to `/ (root)`, then click **Save**.
6. Wait 1–2 minutes. The site appears at `https://<your-username>.github.io/<repo-name>/`.

## Editing

- Prices, descriptions: the category page (e.g. `aligned-love.html`; search for `class="price"`).  Add a THB price with
  `<span class="alt">· 1,234 THB</span>`.
- Testimonials: add `testimonial-1.png` (shown in the Contact section of `index.html`) to `images/testimonials/`.
- Colours: the `:root` block at the top of `style.css`.
- Header, menu and footer: edit once in `_includes/header.html` / `_includes/footer.html`; every page picks it up.
- The five categories (menu, footer links): `_data/categories.yml`.
- Each page starts with a small `---` block (title, description, which menu item is highlighted). Leave it in place.
- Pages only render correctly once published (or built with Jekyll), not by double-clicking the file.

## Client intake form

`intake.html` (+ `intake.css`, `intake.js`) is the post-payment intake form. Setup steps: see `SETUP-INTAKE.md`.
