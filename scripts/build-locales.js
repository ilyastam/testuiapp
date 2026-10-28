// Wraps each locales/<code>.json in assets/locales/<code>.js so the site works when opened from file://
// (browsers block fetch() of JSON there). Run: node scripts/build-locales.js
const fs = require("fs");
const path = require("path");
const src = path.join(__dirname, "..", "locales");
const out_dir = path.join(__dirname, "..", "assets", "locales");
const meta = JSON.parse(fs.readFileSync(path.join(__dirname, "locales.config.json"), "utf8"));
for (const [code, m] of Object.entries(meta)) {
  const messages = JSON.parse(fs.readFileSync(path.join(src, code + ".json"), "utf8"));
  const out = "// Generated from " + code + ".json by scripts/build-locales.js. Do not edit.\n" +
    "window.LOCALES = window.LOCALES || {};\n" +
    "window.LOCALES[" + JSON.stringify(code) + "] = " + JSON.stringify({ meta: m, messages }, null, 2) + ";\n";
  fs.writeFileSync(path.join(out_dir, code + ".js"), out);
  console.log("wrote assets/locales/" + code + ".js");
}
