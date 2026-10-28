# TicketNest

Sample static ticket-booking site. Open `index.html` in a browser.

## Localization

- All UI text is in `locales/<code>.js` (one flat key/value map per language).
- `i18n.js` picks the locale (saved choice, then browser language, then `en`), sets `<html lang dir>`, fills `data-i18n` / `data-i18n-attr` elements, and formats money and dates with `Intl`.
- Plural strings use `_one` / `_other` (and other CLDR) suffixes. Pass `count` to `t()`.

### Add a language

1. Copy `locales/en.js` to `locales/<code>.js`. Change `LOCALES.en` to `LOCALES.<code>`.
2. Set `meta.name`, `meta.dir` (`ltr` or `rtl`) and `meta.currency`. Translate the messages.
3. Add `<script src="locales/<code>.js"></script>` before `i18n.js` in each HTML page.

A language picker appears in the header when two or more locales load. Prices are stored in USD and are not converted.
