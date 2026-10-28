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
  const msgs = LOCALES[locale].messages;
  const fallback = LOCALES[FALLBACK].messages;
  const plural = new Intl.PluralRules(locale);

  // Looks up key (with plural suffix when params.count is set) and fills {placeholders}.
  function t(key, params = {}) {
    let s;
    if (params.count !== undefined) {
      const k = key + "_" + plural.select(params.count);
      s = msgs[k] ?? msgs[key + "_other"] ?? fallback[k] ?? fallback[key + "_other"];
    }
    s = s ?? msgs[key] ?? fallback[key] ?? key;
    return s.replace(/\{(\w+)\}/g, (m, name) => (params[name] !== undefined ? params[name] : m));
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
