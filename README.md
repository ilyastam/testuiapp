# TicketNest

Sample static ticket-booking site. Open `index.html` in a browser.

## Localization

- Translatable text is in `locales/<code>.json`: nested JSON with ICU MessageFormat (`{name}`, `{count, plural, one {# ticket} other {# tickets}}`). The folder holds only these files, so you can upload it to Lokalise as it is. Keys are never numeric.
- `scripts/locales.config.json` holds per-language settings that are not translated: display name, text direction (`ltr`/`rtl`) and currency.
- Browsers block `fetch()` of JSON on `file://`, so `node scripts/build-locales.js` wraps each JSON file in `assets/locales/<code>.js`. Run it after you edit a JSON file. The generated `.js` files are committed.
- `i18n.js` picks the locale (saved choice, then browser language, then `en`), sets `<html lang dir>`, fills `data-i18n` / `data-i18n-attr` elements, and formats money and dates with `Intl`.

### Add a language

1. Add the language to `scripts/locales.config.json`. Put the translated file at `locales/<code>.json` (for example, one downloaded from Localize.com).
2. Run `node scripts/build-locales.js`.
3. Add `<script src="assets/locales/<code>.js"></script>` before `i18n.js` in each HTML page.

A language picker appears in the header when two or more locales load. Prices are stored in USD and are not converted.
