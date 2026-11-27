import fs from "node:fs";
import vm from "node:vm";
import path from "node:path";
import { fileURLToPath } from "node:url";

/* =========================================
   NEPTOON LIFE CYCLE
   SEO PUBLICATION ENGINE
========================================= */

const ROOT = fileURLToPath(
  new URL("../", import.meta.url)
);

const SOURCE = path.join(
  ROOT,
  "lifecycle",
  "index.html"
);

/* =========================================
   READ APPLICATION SOURCE
========================================= */

const html = fs.readFileSync(SOURCE, "utf8");

console.log("SOURCE LOADED", {
  file: SOURCE,
  characters: html.length
});

/* =========================================
   EXTRACT FAQ OBJECT
========================================= */

const match = html.match(
  /const\s+LIFE_CYCLE_FAQ\s*=\s*(\{[\s\S]*?\n\s*\});/
);

if (!match) {
  throw new Error("LIFE_CYCLE_FAQ not found");
}

const FAQ = vm.runInNewContext(
  `(${match[1]})`,
  Object.create(null),
  { timeout: 1000 }
);

/* =========================================
   VALIDATE CONTENT
========================================= */

for (const lang of ["da", "en"]) {

  const faq = FAQ[lang];

  if (!faq || !Array.isArray(faq.groups)) {
    throw new Error(`Invalid FAQ: ${lang}`);
  }

  const questions = faq.groups.flatMap(
    group => group.items
  );

  console.log("FAQ VALIDATED", {
    language: lang,
    categories: faq.groups.length,
    questions: questions.length
  });

  console.table(
    faq.groups.map(group => ({
      id: group.id,
      title: group.title,
      questions: group.items.length
    }))
  );

}

console.log("SEO EXTRACTION SUCCESSFUL");

/* =========================================
   SEO PUBLICATION TEST
   DANISH · SAVINGS
========================================= */

const group = FAQ.da.groups.find(
  g => g.id === "savings"
);

if (!group) {
  throw new Error("Savings category not found");
}

const escapeHTML = value =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const BASE =
  "https://webapps.neptoonwealth.com";

const canonical =
  `${BASE}/lifecycle/knowledge/da/opsparing/`;

const articles = group.items.map(item => `
  <article>
    <h2>${escapeHTML(item.q)}</h2>
    <p>${escapeHTML(item.a)}</p>
  </article>
`).join("\n");

const page = `<!DOCTYPE html>
<html lang="da">
<head>

<meta charset="utf-8">
<meta name="viewport"
      content="width=device-width,initial-scale=1">

<title>Opsparing og formueopbygning | Neptoon Wealth</title>

<meta name="description"
      content="Få svar på spørgsmål om månedlig opsparing, investering, afdrag og formueopbygning. Se, hvordan din opsparing påvirker din økonomiske fremtid.">

<meta name="robots" content="index, follow">

<link rel="canonical" href="${canonical}">

<style>

*{
  box-sizing:border-box;
}

body{
  margin:0;
  background:#fff;
  color:#243247;
  font-family:Arial,sans-serif;
  line-height:1.7;
}

header{
  background:#4E79BD;
  color:white;
  padding:24px;
}

header a{
  color:white;
  text-decoration:none;
  font-weight:600;
}

main{
  max-width:850px;
  margin:auto;
  padding:32px 20px;
}

.kicker{
  color:#4E79BD;
  font-size:12px;
  letter-spacing:2px;
  font-weight:600;
}

h1{
  font-size:clamp(28px,5vw,40px);
  line-height:1.2;
  font-weight:500;
}

h2{
  font-size:21px;
  line-height:1.4;
  font-weight:600;
}

article{
  padding:18px 0;
  border-bottom:1px solid #e0e5eb;
}

article p{
  white-space:pre-line;
}

.cta{
  background:#f2f5f9;
  padding:24px;
  margin:32px 0;
}

.button{
  display:inline-block;
  background:#4E79BD;
  color:white;
  padding:14px 24px;
  text-decoration:none;
}

footer{
  border-top:1px solid #ddd;
  padding:24px;
  text-align:center;
  font-size:13px;
}

footer a{
  color:#4E79BD;
}

</style>
</head>

<body>

<header>
  <a href="${BASE}/lifecycle/">
    NEPTOON WEALTH
  </a>
</header>

<main>

  <div class="kicker">
    NEPTOON VIDEN · PRIVATØKONOMI
  </div>

  <h1>Opsparing og formueopbygning</h1>

  <p>
    Hvordan påvirker din månedlige opsparing
    dine økonomiske muligheder gennem livet?
    Få svar på spørgsmål om opsparing,
    investering og opbygning af formue.
  </p>

  <div class="cta">
    <h2>Hvad betyder din opsparing for din fremtid?</h2>

    <p>
      Se dine egne økonomiske muligheder
      med Neptoon Life Cycle.
    </p>

    <a class="button" href="${BASE}/lifecycle/">
      Åbn Neptoon Life Cycle →
    </a>

    <p>Gratis · Ingen registrering</p>
  </div>

  ${articles}

  <div class="cta">
    <h2>Fra økonomisk viden til dine egne muligheder</h2>

    <a class="button" href="${BASE}/lifecycle/">
      Åbn Neptoon Life Cycle →
    </a>
  </div>

</main>

<footer>
  © Neptoon Wealth ·
  <a href="https://www.neptoonwealth.com/">
    Om Neptoon
  </a>
  <p>
    Økonomisk information og modelbaseret analyse.
    Ikke personlig investeringsrådgivning.
  </p>
</footer>

</body>
</html>`;

const output = path.join(
  ROOT,
  "lifecycle",
  "knowledge",
  "da",
  "opsparing"
);

fs.mkdirSync(output, { recursive: true });

fs.writeFileSync(
  path.join(output, "index.html"),
  page,
  "utf8"
);

console.log("SEO PAGE GENERATED", {
  category: group.id,
  questions: group.items.length,
  characters: page.length,
  canonical
});
