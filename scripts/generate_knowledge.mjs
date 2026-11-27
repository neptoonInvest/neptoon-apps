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
