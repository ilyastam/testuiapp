// Wraps each locales/<code>.json in locales/<code>.js so the site works when opened from file://
// (browsers block fetch() of JSON there). Run: node scripts/build-locales.js
const fs = require("fs");
const path = require("path");
const dir = path.join(__dirname, "..", "locales");
const meta = JSON.parse(fs.readFileSync(path.join(dir, "locales.json"), "utf8"));
for (const [code, m] of Object.entries(meta)) {
  const messages = JSON.parse(fs.readFileSync(path.join(dir, code + ".json"), "utf8"));
  const out = "// Generated from " + code + ".json by scripts/build-locales.js. Do not edit.\n" +
    "window.LOCALES = window.LOCALES || {};\n" +
    "window.LOCALES[" + JSON.stringify(code) + "] = " + JSON.stringify({ meta: m, messages }, null, 2) + ";\n";
  fs.writeFileSync(path.join(dir, code + ".js"), out);
  console.log("wrote locales/" + code + ".js");
}
