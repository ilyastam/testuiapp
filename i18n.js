// Minimal i18n runtime. Locale files (locales/*.js) register themselves on window.LOCALES.
(function () {
  const LOCALES = window.LOCALES || {};
  const codes = Object.keys(LOCALES);
  const FALLBACK = "en";

  function detect() {
    try {
      const saved = localStorage.getItem("locale");
      if (saved && LOCALES[saved]) return saved;
    } catch (e) {}
    for (const raw of navigator.languages || [navigator.language]) {
      const tag = (raw || "").toLowerCase();
      const match = codes.find(c => c.toLowerCase() === tag) ||
                    codes.find(c => c.toLowerCase() === tag.split("-")[0]);
      if (match) return match;
    }
    return FALLBACK;
  }

  const locale = detect();
  const meta = LOCALES[locale].meta;
  const plural = new Intl.PluralRules(locale);

  // Locale files are nested JSON; flatten to "a.b.c" keys once.
  function flatten(o, prefix = "", out = {}) {
    for (const [k, v] of Object.entries(o)) {
      const key = prefix ? prefix + "." + k : k;
      if (v && typeof v === "object") flatten(v, key, out); else out[key] = v;
    }
    return out;
  }
  const msgs = flatten(LOCALES[locale].messages);
  const fallback = flatten(LOCALES[FALLBACK].messages);
  const numFmt = new Intl.NumberFormat(locale);

  // Finds the "}" that closes the "{" at index i.
  function closing(s, i) {
    let depth = 0;
    for (let j = i; j < s.length; j++) {
      if (s[j] === "{") depth++;
      else if (s[j] === "}" && --depth === 0) return j;
    }
    return s.length;
  }

  // ICU MessageFormat subset: {name}, {n, plural, =0 {..} one {..} other {.. #}}, {x, select, a {..} other {..}}.
  function format(s, p, hash) {
    let out = "";
    for (let i = 0; i < s.length; i++) {
      if (s[i] === "{") {
        const end = closing(s, i);
        out += arg(s.slice(i + 1, end), p, hash);
        i = end;
      } else if (s[i] === "#" && hash !== undefined) out += numFmt.format(hash);
      else out += s[i];
    }
    return out;
  }

  function arg(body, p, hash) {
    const m = body.match(/^\s*(\w+)\s*(?:,\s*(plural|select)\s*,([\s\S]*))?$/);
    if (!m) return "{" + body + "}";
    const [, name, type, rest] = m;
    if (!type) return p[name] !== undefined ? p[name] : "{" + body + "}";
    const opts = {};
    for (let i = 0; i < rest.length; i++) {
      if (/\s/.test(rest[i])) continue;
      const open = rest.indexOf("{", i);
      if (open < 0) break;
      const end = closing(rest, open);
      opts[rest.slice(i, open).trim()] = rest.slice(open + 1, end);
      i = end;
    }
    const v = p[name];
    const pick = type === "plural"
      ? opts["=" + v] ?? opts[plural.select(v)] ?? opts.other
      : opts[v] ?? opts.other;
    return pick === undefined ? "" : format(pick, p, type === "plural" ? v : hash);
  }

  function t(key, params = {}) {
    return format(msgs[key] ?? fallback[key] ?? key, params);
  }

  const money = n => new Intl.NumberFormat(locale, { style: "currency", currency: meta.currency || "USD" }).format(n);
  const date = iso => new Intl.DateTimeFormat(locale, { weekday: "short", year: "numeric", month: "short", day: "numeric" })
    .format(new Date(iso + "T12:00:00"));

  // Fills elements marked data-i18n (text) and data-i18n-attr ("attr:key;attr:key").
  function apply(root = document) {
    root.querySelectorAll("[data-i18n]").forEach(el => { el.textContent = t(el.dataset.i18n); });
    root.querySelectorAll("[data-i18n-attr]").forEach(el => {
      el.dataset.i18nAttr.split(";").forEach(pair => {
        const [attr, key] = pair.split(":");
        el.setAttribute(attr.trim(), t(key.trim()));
      });
    });
    const page = document.body.dataset.page;
    document.title = t("title.template", { page: t("title." + page) });
  }

  function langPicker() {
    const slot = document.getElementById("lang");
    if (!slot || codes.length < 2) return;
    const sel = document.createElement("select");
    sel.setAttribute("aria-label", t("lang.label"));
    sel.innerHTML = codes.map(c => `<option value="${c}" lang="${c}">${LOCALES[c].meta.name}</option>`).join("");
    sel.value = locale;
    sel.onchange = () => {
      try { localStorage.setItem("locale", sel.value); } catch (e) {}
      location.reload();
    };
    slot.appendChild(sel);
  }

  document.documentElement.lang = locale;
  document.documentElement.dir = meta.dir || "ltr";
  window.I18N = { t, money, date, locale };
  document.addEventListener("DOMContentLoaded", () => { apply(); langPicker(); });
})();
