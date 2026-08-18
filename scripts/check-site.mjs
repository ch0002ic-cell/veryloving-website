import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const HOME_STRIPE_URL = "https://buy.stripe.com/8x2dR1duX7UD9MvcVo2kw02";
const FAQ_STRIPE_URL = "https://buy.stripe.com/28E00b0Ib3En3o7aNg2kw00";
const SUBSCRIBE_URL = "https://forms.gle/14Kyc8APdbFMVHSQ8";
const YOUTUBE_EMBED_URL = "https://www.youtube-nocookie.com/embed/Ccb4uPe0yR0";
const EMAIL_URL = "mailto:george@verylovinginc.com";

const expectedPages = new Map([
  ["index.html", "https://ch0002ic-cell.github.io/veryloving-website/"],
  [
    "faq.html",
    "https://ch0002ic-cell.github.io/veryloving-website/faq.html",
  ],
  [
    "accessibility-statement.html",
    "https://ch0002ic-cell.github.io/veryloving-website/accessibility-statement.html",
  ],
  [
    "privacy.html",
    "https://ch0002ic-cell.github.io/veryloving-website/privacy.html",
  ],
  [
    "products.html",
    "https://ch0002ic-cell.github.io/veryloving-website/products.html",
  ],
  [
    "wearable.html",
    "https://ch0002ic-cell.github.io/veryloving-website/wearable.html",
  ],
  [
    "home-companion.html",
    "https://ch0002ic-cell.github.io/veryloving-website/home-companion.html",
  ],
]);

const originalPages = new Set([
  "index.html",
  "faq.html",
  "privacy.html",
  "accessibility-statement.html",
]);

const productPages = new Set([
  "products.html",
  "wearable.html",
  "home-companion.html",
]);

const expectedAssets = new Map([
  [
    "assets/ces-badge.avif",
    { type: "avif", width: 1242, height: 1200, maximumBytes: 100_000 },
  ],
  [
    "assets/charm-preview.avif",
    { type: "avif", width: 490, height: 560, maximumBytes: 80_000 },
  ],
  [
    "assets/favicon.png",
    { type: "png", width: 64, height: 64, maximumBytes: 30_000 },
  ],
  [
    "assets/giveaway-instagram.avif",
    { type: "avif", width: 120, height: 120, maximumBytes: 20_000 },
  ],
  [
    "assets/giveaway-linkedin.avif",
    { type: "avif", width: 120, height: 120, maximumBytes: 20_000 },
  ],
  [
    "assets/giveaway-x.avif",
    { type: "avif", width: 120, height: 120, maximumBytes: 20_000 },
  ],
  [
    "assets/guardian-star.avif",
    { type: "avif", width: 162, height: 162, maximumBytes: 20_000 },
  ],
  [
    "assets/how-it-works.avif",
    { type: "avif", width: 1206, height: 674, maximumBytes: 80_000 },
  ],
  [
    "assets/location-sharing.avif",
    { type: "avif", width: 1458, height: 1106, maximumBytes: 180_000 },
  ],
  [
    "assets/loud-alert.avif",
    { type: "avif", width: 1420, height: 1068, maximumBytes: 120_000 },
  ],
  [
    "assets/phone-map-preview.avif",
    { type: "avif", width: 252, height: 516, maximumBytes: 80_000 },
  ],
  [
    "assets/veryloving-logo.avif",
    { type: "avif", width: 368, height: 82, maximumBytes: 30_000 },
  ],
  [
    "assets/wear-peace.avif",
    { type: "avif", width: 1454, height: 1196, maximumBytes: 180_000 },
  ],
]);

const expectedFonts = new Map([
  ["assets/borel-regular.woff2", 80_000],
  ["assets/inter-latin.woff2", 60_000],
]);

const expectedFiles = new Set([
  ".gitignore",
  ...expectedPages.keys(),
  ...expectedAssets.keys(),
  ...expectedFonts.keys(),
  "package.json",
  "scripts/check-site.mjs",
  "product-pages.css",
  "site.js",
  "styles.css",
]);

const homeImages = [
  "assets/veryloving-logo.avif",
  "assets/phone-map-preview.avif",
  "assets/charm-preview.avif",
  "assets/ces-badge.avif",
  "assets/how-it-works.avif",
  "assets/giveaway-linkedin.avif",
  "assets/giveaway-instagram.avif",
  "assets/giveaway-x.avif",
  "assets/wear-peace.avif",
  "assets/loud-alert.avif",
  "assets/location-sharing.avif",
  "assets/guardian-star.avif",
];

const homeCopy = [
  "Bringing warmer companionship with VeryLoving",
  "More than jewelry, it brings warmth, connection, and peace of mind to every journey.",
  "Veryloving,Inc. is a Silicon Valley–based AI safety technology company dedicated to advancing personal safety, AI-powered emotional companionship, and next-generation wearable intelligence for a global market. Founded in 2025, the company began its global expansion in 2026.",
  "Our multidisciplinary team combines expertise in artificial intelligence, smart hardware engineering, and global connectivity to develop the next generation of the Wearable AI Guardian System—designed to protect users in critical moments while providing warmth, reassurance, and companionship in everyday life.",
  "In 2026, Veryloving AI showcased its innovations at the Consumer Electronics Show (CES) and received recognition at BEYOND Expo for innovation, as well as a Silicon Valley wearable technology innovation award. The company also actively participates in global conversations on women's safety, AI, and emerging technologies.",
  "Our mission is simple: to make the world safer—and more compassionate.",
  "Connect to a caring voice",
  "Tap your jewelry to hear a calming AI voice companion that offers supportive conversation and gentle encouragement throughout your day.",
  "Win $200 by following us on",
  "Wear peace of mind",
  "A beautifully designed accessory that combines elegance and smart connectivity, bringing comfort and confidence to everyday life.",
  "Trigger a loud alert",
  "Designed for everyday wear, the charm remains discreet and can emit a loud alert sound when activated.",
  "Stay connected in real time",
  "Inspired by the idea of a guardian angel, the Veryloving charm helps users stay connected with loved ones by allowing them to share their location when they choose.",
];

const faqItems = [
  {
    question: "How does the Veryloving charm work?",
    answer:
      "The Veryloving charm is a wearable accessory designed to be worn as jewelry. It connects with your smartphone through wireless technology and a companion mobile app to enable connected features and experiences.",
  },
  {
    question: "How long does the battery last?",
    answer: "The battery lasts about 7–14 days, depending on usage.",
  },
  {
    question: "Is the jewelry water-resistant?",
    answer:
      "Yes. It’s resistant to water splashes and sweat. We don’t recommend fully submerging it in water.",
  },
  {
    question: "Who can see my location?",
    answer: "Only the contacts you choose will be able to see your location.",
  },
  {
    question: "Does the jewelry work without a phone connection?",
    answer:
      "The Veryloving charm connects with your smartphone through wireless technology and works together with the companion mobile app to enable its smart features.",
  },
  {
    question: "What happens if I press the charm button by accident?",
    answer:
      "The charm includes safeguards to help prevent accidental activation. If the button is pressed unintentionally, the action can be canceled easily by holding the star button for 5 seconds or cancel through the companion app.",
  },
  {
    question: "Do I need a subscription to use the app?",
    answer: "No. Currently, you can enjoy the in-app experience for free!",
  },
  {
    question: "Where do you ship the jewelry?",
    answer: "We currently ship within the United States.",
  },
  {
    question: "When can I buy it?",
    answer: "You can pre-order it now! Shipping summer 2026.",
  },
  {
    question: "Who can I reach out to with more questions?",
    answer:
      "Contact us at george@verylovinginc.com, and we’d love to hear from you!",
  },
];

const errors = [];

function fail(file, message) {
  errors.push(`${file}: ${message}`);
}

function slash(file) {
  return file.split(path.sep).join("/");
}

async function walk(directory) {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (entry.name === ".git" || entry.name === "node_modules") continue;
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...(await walk(absolute)));
    else files.push(absolute);
  }
  return files;
}

function tags(source, name) {
  return source.match(new RegExp(`<${name}\\b[^>]*>`, "gi")) ?? [];
}

function allOpeningTags(source) {
  return source.match(/<[a-z][a-z0-9-]*\b[^>]*>/giu) ?? [];
}

function attributes(tag) {
  const result = new Map();
  const body = tag.replace(/^<[^\s>]+\s*/u, "").replace(/\/?\s*>$/u, "");
  const pattern = /([^\s=/>]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/gu;
  for (const match of body.matchAll(pattern)) {
    result.set(match[1].toLowerCase(), match[2] ?? match[3] ?? match[4] ?? "");
  }
  return result;
}

function hasClass(attrs, className) {
  return (attrs.get("class") ?? "").split(/\s+/u).includes(className);
}

function pairedElements(source, tagName) {
  const pattern = new RegExp(
    `<${tagName}\\b([^>]*)>([\\s\\S]*?)</${tagName}>`,
    "gi",
  );
  return [...source.matchAll(pattern)].map((match) => ({
    attrs: attributes(`<${tagName}${match[1]}>`),
    body: match[2],
    markup: match[0],
  }));
}

function elementsWithClass(source, tagName, className) {
  return pairedElements(source, tagName).filter((element) =>
    hasClass(element.attrs, className),
  );
}

function shallowElementsWithClass(source, tagName, className) {
  const results = [];
  const openingPattern = new RegExp(`<${tagName}\\b[^>]*>`, "gi");
  for (const match of source.matchAll(openingPattern)) {
    const attrs = attributes(match[0]);
    if (!hasClass(attrs, className)) continue;
    const bodyStart = match.index + match[0].length;
    const bodyEnd = source.indexOf(`</${tagName}>`, bodyStart);
    if (bodyEnd === -1) continue;
    results.push({ attrs, body: source.slice(bodyStart, bodyEnd) });
  }
  return results;
}

function decodeHtmlEntities(value) {
  const named = new Map([
    ["amp", "&"],
    ["apos", "'"],
    ["copy", "©"],
    ["gt", ">"],
    ["hellip", "…"],
    ["ldquo", "“"],
    ["lt", "<"],
    ["mdash", "—"],
    ["nbsp", " "],
    ["ndash", "–"],
    ["quot", '"'],
    ["rdquo", "”"],
    ["rsquo", "’"],
  ]);
  return value.replace(/&(#(?:x[\da-f]+|\d+)|[a-z][a-z\d]+);/giu, (entity, key) => {
    if (key.startsWith("#x") || key.startsWith("#X")) {
      return String.fromCodePoint(Number.parseInt(key.slice(2), 16));
    }
    if (key.startsWith("#")) {
      return String.fromCodePoint(Number.parseInt(key.slice(1), 10));
    }
    return named.get(key.toLowerCase()) ?? entity;
  });
}

function normalizedText(markup) {
  return decodeHtmlEntities(
    markup
      .replace(/<!--[\s\S]*?-->/gu, " ")
      .replace(/<script\b[\s\S]*?<\/script>/giu, " ")
      .replace(/<style\b[\s\S]*?<\/style>/giu, " ")
      .replace(/<svg\b[\s\S]*?<\/svg>/giu, " ")
      .replace(/<[^>]+>/gu, " "),
  )
    .replace(/\s+/gu, " ")
    .replace(/\s+([,.;:!?])/gu, "$1")
    .trim();
}

function normalizedElement(source, tagName, className) {
  for (const element of pairedElements(source, tagName)) {
    if (!hasClass(element.attrs, className)) continue;
    return element.markup
      .replace(/\s+aria-current\s*=\s*(["'])page\1/giu, "")
      .replace(/\s+>/gu, ">")
      .replace(
        /(<(?:section|div|h[1-6]|p|nav|footer|header|main)\b[^>]*>)\s+/giu,
        "$1",
      )
      .replace(
        /\s+(<\/(?:section|div|h[1-6]|p|nav|footer|header|main)>)/giu,
        "$1",
      )
      .replace(/>\s+</gu, "><")
      .replace(/\s+/gu, " ")
      .trim();
  }
  return null;
}

function normalizedHeader(source) {
  const header = normalizedElement(source, "header", "site-header");
  if (!header) return null;
  return header
    .replace(
      /<a\b(?=[^>]*\bclass\s*=\s*(["'])[^"']*\bheader-preorder\b[^"']*\1)[^>]*>[\s\S]*?<\/a>/giu,
      "",
    )
    .replace(/>\s+</gu, "><")
    .replace(/\s+/gu, " ")
    .trim();
}

function valuesFor(source, tagName, attributeName) {
  return tags(source, tagName)
    .map((tag) => attributes(tag).get(attributeName))
    .filter((value) => value !== undefined);
}

function pageHasId(source, id) {
  return allOpeningTags(source).some((tag) => attributes(tag).get("id") === id);
}

function checkSingleMeta(page, source, key, value, expectedValue) {
  const matches = tags(source, "meta").filter(
    (tag) => attributes(tag).get(key) === value,
  );
  if (matches.length !== 1) {
    fail(page, `must contain exactly one meta ${key}="${value}"`);
    return null;
  }
  const content = attributes(matches[0]).get("content") ?? "";
  if (!content.trim()) fail(page, `meta ${key}="${value}" must not be empty`);
  if (expectedValue !== undefined && content !== expectedValue) {
    fail(page, `meta ${key}="${value}" must be exactly ${expectedValue}`);
  }
  return content;
}

function checkOrderedCopy(file, pageText, expectedCopy) {
  let previousIndex = -1;
  for (const copy of expectedCopy) {
    const normalizedCopy = normalizedText(copy);
    const index = pageText.indexOf(normalizedCopy, previousIndex + 1);
    if (index === -1) {
      fail(file, `must contain official copy in order: ${JSON.stringify(normalizedCopy)}`);
      continue;
    }
    previousIndex = index;
  }
}

function imageDimensions(buffer, type) {
  if (type === "png") {
    const signature = "89504e470d0a1a0a";
    if (buffer.length < 24 || buffer.subarray(0, 8).toString("hex") !== signature) {
      return null;
    }
    return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
  }
  if (type === "avif") {
    if (buffer.length < 24 || buffer.subarray(4, 8).toString("ascii") !== "ftyp") {
      return null;
    }
    const ispe = buffer.indexOf(Buffer.from("ispe", "ascii"));
    if (ispe === -1 || ispe + 16 > buffer.length) return null;
    return {
      width: buffer.readUInt32BE(ispe + 8),
      height: buffer.readUInt32BE(ispe + 12),
    };
  }
  return null;
}

const allFiles = await walk(root);
const relativeFiles = allFiles.map((file) => slash(path.relative(root, file))).sort();
const expectedRelativeFiles = [...expectedFiles].sort();
if (JSON.stringify(relativeFiles) !== JSON.stringify(expectedRelativeFiles)) {
  const differences = relativeFiles
    .filter((file) => !expectedFiles.has(file))
    .map((file) => `unexpected ${file}`)
    .concat(
      expectedRelativeFiles
        .filter((file) => !relativeFiles.includes(file))
        .map((file) => `missing ${file}`),
    );
  fail("site", `reviewed file inventory mismatch (${differences.join(", ") || "unknown"})`);
}

const htmlFiles = allFiles
  .filter((file) => path.extname(file).toLowerCase() === ".html")
  .map((file) => slash(path.relative(root, file)))
  .sort();
const wantedPages = [...expectedPages.keys()].sort();
if (JSON.stringify(htmlFiles) !== JSON.stringify(wantedPages)) {
  fail(
    "site",
    `must contain exactly these ${wantedPages.length} HTML pages: ${wantedPages.join(", ")} (found: ${htmlFiles.join(", ") || "none"})`,
  );
}

const pages = new Map();
for (const page of expectedPages.keys()) {
  try {
    pages.set(page, await readFile(path.join(root, page), "utf8"));
  } catch (error) {
    fail(page, `cannot be read (${error.message})`);
  }
}

const titles = new Map();
const descriptions = new Map();
const headers = new Map();
const footers = new Map();
const signups = new Map();
const shippedHtml = [];

for (const [page, canonical] of expectedPages) {
  const source = pages.get(page);
  if (!source) continue;
  shippedHtml.push(source);

  if (!/^\s*<!doctype html>/iu.test(source)) fail(page, "must begin with an HTML doctype");
  if (!/<html\b[^>]*\blang\s*=\s*(["'])en\1/iu.test(source)) {
    fail(page, 'must declare html lang="en"');
  }
  if (!/<meta\b[^>]*\bcharset\s*=\s*(["'])?utf-8\1?/iu.test(source)) {
    fail(page, "must declare UTF-8 encoding");
  }

  checkSingleMeta(page, source, "name", "viewport");
  const description = checkSingleMeta(page, source, "name", "description");
  checkSingleMeta(page, source, "property", "og:title");
  checkSingleMeta(page, source, "property", "og:description");
  checkSingleMeta(page, source, "property", "og:url", canonical);
  if (description) descriptions.set(page, description);

  const titleElements = pairedElements(source, "title");
  if (titleElements.length !== 1) {
    fail(page, "must contain exactly one title");
  } else {
    const title = normalizedText(titleElements[0].body);
    if (!title) fail(page, "title must not be empty");
    if (title.length > 70) fail(page, "title should be at most 70 characters");
    titles.set(page, title);
  }

  const canonicalLinks = tags(source, "link").filter((tag) => {
    const rel = attributes(tag).get("rel") ?? "";
    return rel.split(/\s+/u).includes("canonical");
  });
  if (canonicalLinks.length !== 1) {
    fail(page, "must contain exactly one canonical link");
  } else if (attributes(canonicalLinks[0]).get("href") !== canonical) {
    fail(page, `canonical URL must be exactly ${canonical}`);
  }

  const styleLinks = tags(source, "link").filter((tag) =>
    (attributes(tag).get("rel") ?? "").split(/\s+/u).includes("stylesheet"),
  );
  const expectedStyles = originalPages.has(page)
    ? ["styles.css"]
    : productPages.has(page)
      ? ["styles.css", "product-pages.css"]
      : [];
  const actualStyles = styleLinks.map((tag) => attributes(tag).get("href") ?? "");
  if (JSON.stringify(actualStyles) !== JSON.stringify(expectedStyles)) {
    fail(page, `must load the reviewed stylesheets in order: ${expectedStyles.join(", ")}`);
  }

  const iconLinks = tags(source, "link").filter((tag) =>
    (attributes(tag).get("rel") ?? "").split(/\s+/u).includes("icon"),
  );
  if (
    iconLinks.length !== 1 ||
    attributes(iconLinks[0]).get("href") !== "assets/favicon.png"
  ) {
    fail(page, "must load exactly one local assets/favicon.png icon");
  }

  const scriptTags = tags(source, "script");
  const scriptElements = pairedElements(source, "script");
  const needsAccordionScript = page === "faq.html";
  if (
    scriptTags.length !== (needsAccordionScript ? 1 : 0) ||
    scriptElements.length !== (needsAccordionScript ? 1 : 0)
  ) {
    fail(
      page,
      needsAccordionScript
        ? "FAQ must load exactly one script"
        : "pages without FAQ controls must not load JavaScript",
    );
  } else if (needsAccordionScript) {
    const scriptAttrs = attributes(scriptTags[0]);
    if (scriptAttrs.get("src") !== "site.js" || !scriptAttrs.has("defer")) {
      fail(page, "FAQ must load only the local site.js with the defer attribute");
    }
    if (scriptElements[0].body.trim()) fail(page, "must not contain inline script code");
  }

  const h1Elements = pairedElements(source, "h1");
  if (h1Elements.length !== 1) {
    fail(page, `must contain exactly one h1 (found ${h1Elements.length})`);
  }
  const skipLinks = tags(source, "a").filter((tag) => {
    const attrs = attributes(tag);
    return hasClass(attrs, "skip-link") && attrs.get("href") === "#main-content";
  });
  if (skipLinks.length !== 1) fail(page, "must contain one skip link to #main-content");
  const mains = tags(source, "main").filter((tag) => {
    const attrs = attributes(tag);
    return attrs.get("id") === "main-content" && attrs.get("tabindex") === "-1";
  });
  if (mains.length !== 1) {
    fail(page, "must contain one focusable main#main-content landmark");
  }

  const pageIds = new Set();
  for (const tag of allOpeningTags(source)) {
    const id = attributes(tag).get("id");
    if (!id) continue;
    if (pageIds.has(id)) fail(page, `must not duplicate id ${id}`);
    pageIds.add(id);
  }
  for (const tag of allOpeningTags(source)) {
    const attrs = attributes(tag);
    for (const attributeName of ["aria-controls", "aria-labelledby"]) {
      const value = attrs.get(attributeName);
      if (!value) continue;
      for (const id of value.split(/\s+/u)) {
        if (!pageIds.has(id)) fail(page, `${attributeName} references missing id ${id}`);
      }
    }
  }

  const header = normalizedHeader(source);
  const footer = normalizedElement(source, "footer", "site-footer");
  const signup = normalizedElement(source, "section", "guardian-signup");
  if (!header) fail(page, "must use the shared site-header shell");
  else headers.set(page, header);
  if (!footer) fail(page, "must use the shared site-footer shell");
  else footers.set(page, footer);
  if (!signup) fail(page, "must use the shared guardian-signup shell");
  else signups.set(page, signup);

  if (header) {
    const headerLinks = valuesFor(header, "a", "href");
    for (const required of ["index.html", "faq.html"]) {
      if (!headerLinks.includes(required)) fail(page, `shared header must link to ${required}`);
    }
    const headerImages = valuesFor(header, "img", "src");
    if (!headerImages.includes("assets/veryloving-logo.avif")) {
      fail(page, "shared header must use the VeryLoving logo");
    }
  }

  const rawHeader = normalizedElement(source, "header", "site-header");
  if (rawHeader) {
    const checkoutLinks = valuesFor(rawHeader, "a", "href").filter((href) =>
      href.startsWith("https://buy.stripe.com/"),
    );
    if (
      page === "index.html" &&
      (checkoutLinks.length !== 1 || checkoutLinks[0] !== HOME_STRIPE_URL)
    ) {
      fail(page, `official Home header checkout must use ${HOME_STRIPE_URL}`);
    }
    if (page !== "index.html" && checkoutLinks.length) {
      fail(page, "only Home may show the responsive header checkout control");
    }
  }

  if (signup) {
    const signupText = normalizedText(signup);
    for (const required of [
      "Be the 1st guardian angel",
      "to make our world veryloving",
      "Subscribe",
    ]) {
      if (!signupText.includes(required)) fail(page, `shared signup must contain ${required}`);
    }
    const signupLinks = valuesFor(signup, "a", "href");
    if (!signupLinks.includes(SUBSCRIBE_URL)) {
      fail(page, `shared signup must link to ${SUBSCRIBE_URL}`);
    }
    const signupImages = valuesFor(signup, "img", "src");
    if (!signupImages.includes("assets/guardian-star.avif")) {
      fail(page, "shared signup must use assets/guardian-star.avif");
    }
    const guardianStar = tags(signup, "img")
      .map(attributes)
      .find((attrs) => attrs.get("src") === "assets/guardian-star.avif");
    if (
      guardianStar?.get("loading") !== "lazy" ||
      guardianStar?.get("decoding") !== "async"
    ) {
      fail(page, "shared guardian star must load lazily and decode asynchronously");
    }
  }

  if (footer) {
    const footerText = normalizedText(footer).toLowerCase();
    for (const required of [
      "2 marina blvd b300, san francisco, california 94123",
      "650-762-6230",
      "george@verylovinginc.com",
      "privacy policy",
      "accessibility statement",
      "© 2025 by veryloving",
      "built at founders inc.",
    ]) {
      if (!footerText.includes(required)) fail(page, `shared footer must contain ${required}`);
    }
    const footerLinks = valuesFor(footer, "a", "href");
    for (const required of ["privacy.html", "accessibility-statement.html", EMAIL_URL]) {
      if (!footerLinks.includes(required)) fail(page, `shared footer must link to ${required}`);
    }
    if (
      footerLinks.some((href) =>
        /(?:linkedin\.com|instagram\.com|youtube\.com|x\.com)/iu.test(href),
      )
    ) {
      fail(page, "shared footer must not include social links hidden in the Wix source");
    }
  }

  if (/<(?:form|input|textarea)\b/iu.test(source)) {
    fail(page, "hidden forms, inputs, and textareas are not part of the rendered static suite");
  }
  if (/<style\b/iu.test(source) || /\sstyle\s*=/iu.test(source)) {
    fail(page, "all presentation must remain in reviewed local stylesheets");
  }
  if (/\son[a-z]+\s*=/iu.test(source)) fail(page, "inline event handlers are not permitted");
  if (/(?:href|src|action)\s*=\s*(["'])(?:javascript:|data:|\/\/|\/)/iu.test(source)) {
    fail(page, "root-absolute, protocol-relative, javascript:, and data: references are not permitted");
  }

  for (const anchorTag of tags(source, "a")) {
    const attrs = attributes(anchorTag);
    const href = attrs.get("href") ?? "";
    if (!href) fail(page, "every anchor must have a non-empty href");
    if (attrs.get("target") === "_blank") {
      const rel = (attrs.get("rel") ?? "").split(/\s+/u);
      if (!rel.includes("noopener") || !rel.includes("noreferrer")) {
        fail(page, `target="_blank" link must use noopener noreferrer (${href})`);
      }
    }
  }

  for (const [tagName, attributeName] of [
    ["a", "href"],
    ["link", "href"],
    ["img", "src"],
    ["iframe", "src"],
    ["script", "src"],
  ]) {
    for (const tag of tags(source, tagName)) {
      const reference = attributes(tag).get(attributeName);
      if (!reference) continue;
      if (/^(?:https?:|mailto:|tel:)/iu.test(reference)) continue;
      if (/^[a-z][a-z0-9+.-]*:/iu.test(reference)) {
        fail(page, `unsupported ${attributeName} scheme in ${reference}`);
        continue;
      }
      const [pathAndQuery, fragment] = reference.split("#", 2);
      const relativeTarget = pathAndQuery.split("?", 1)[0];
      let decodedTarget;
      try {
        decodedTarget = decodeURIComponent(relativeTarget || page);
      } catch {
        fail(page, `cannot decode local reference ${reference}`);
        continue;
      }
      const target = path.resolve(root, path.dirname(page), decodedTarget);
      if (target !== root && !target.startsWith(`${root}${path.sep}`)) {
        fail(page, `local reference escapes the site root: ${reference}`);
        continue;
      }
      try {
        const targetStat = await stat(target);
        if (!targetStat.isFile()) fail(page, `local reference is not a file: ${reference}`);
      } catch {
        fail(page, `broken local reference: ${reference}`);
        continue;
      }
      if (fragment && path.extname(target).toLowerCase() === ".html") {
        const targetPage = slash(path.relative(root, target));
        const targetSource = pages.get(targetPage) ?? (await readFile(target, "utf8"));
        let decodedFragment;
        try {
          decodedFragment = decodeURIComponent(fragment);
        } catch {
          fail(page, `cannot decode fragment in ${reference}`);
          continue;
        }
        if (!pageHasId(targetSource, decodedFragment)) {
          fail(page, `missing fragment target in ${reference}`);
        }
      }
    }
  }

  for (const imageTag of tags(source, "img")) {
    const attrs = attributes(imageTag);
    if (!attrs.has("alt")) fail(page, "every image must declare an alt attribute");
    const width = attrs.get("width") ?? "";
    const height = attrs.get("height") ?? "";
    if (!/^\d+$/u.test(width) || !/^\d+$/u.test(height) || Number(width) < 1 || Number(height) < 1) {
      fail(page, "every image must declare positive numeric width and height");
    }
    const asset = attrs.get("src");
    if (asset && !asset.startsWith("assets/")) {
      fail(page, `content images must be local assets (${asset})`);
    }
  }

  const iframeTags = tags(source, "iframe");
  if (page === "index.html") {
    if (iframeTags.length !== 1) {
      fail(page, "must contain exactly one privacy-enhanced YouTube embed");
    } else {
      const iframe = attributes(iframeTags[0]);
      if (iframe.get("src") !== YOUTUBE_EMBED_URL) {
        fail(page, `embedded product video must use ${YOUTUBE_EMBED_URL}`);
      }
      if (!(iframe.get("title") ?? "").trim()) fail(page, "video iframe must have a title");
      if (iframe.get("loading") !== "lazy") fail(page, "video iframe must lazy-load");
      if (!iframe.has("allowfullscreen")) fail(page, "video iframe must allow fullscreen");
      if (iframe.get("referrerpolicy") !== "strict-origin-when-cross-origin") {
        fail(page, "video iframe must use a strict-origin-when-cross-origin referrer policy");
      }
    }
  } else if (iframeTags.length) {
    fail(page, "only Home may contain the reviewed YouTube embed");
  }
}

for (const [label, values] of [
  ["title", titles],
  ["meta description", descriptions],
]) {
  const seen = new Map();
  for (const [page, value] of values) {
    const duplicate = seen.get(value);
    if (duplicate) fail(page, `${label} duplicates ${duplicate}`);
    else seen.set(value, page);
  }
}

for (const [label, shells] of [
  ["header", headers],
  ["signup", signups],
  ["footer", footers],
]) {
  const baseline = shells.get("index.html");
  if (!baseline) continue;
  for (const [page, shell] of shells) {
    if (shell !== baseline) {
      fail(page, `shared ${label} markup must match index.html apart from aria-current`);
    }
  }
}

const home = pages.get("index.html") ?? "";
const homeText = normalizedText(home);
const homeH1 = pairedElements(home, "h1").map((element) => normalizedText(element.body));
if (homeH1.length === 1 && homeH1[0] !== "Bringing warmer companionship with VeryLoving") {
  fail("index.html", "h1 must match the official Home heading");
}
if (titles.get("index.html") !== "VeryLoving: AI-powered smart jewelry for love & safety") {
  fail("index.html", "title must match the official Home title");
}
checkOrderedCopy("index.html", homeText, homeCopy);

const homeH2 = pairedElements(home, "h2").map((element) => normalizedText(element.body));
const expectedHomeH2 = [
  "Connect to a caring voice",
  "Win $200 by following us on",
  "Wear peace of mind",
  "Trigger a loud alert",
  "Stay connected in real time",
  "Be the 1st guardian angel to make our world veryloving",
];
if (JSON.stringify(homeH2) !== JSON.stringify(expectedHomeH2)) {
  fail("index.html", "h2 headings must match the complete official Home sequence");
}

const homeImageSources = valuesFor(home, "img", "src");
if (JSON.stringify(homeImageSources) !== JSON.stringify(homeImages)) {
  fail("index.html", "images must match the complete ordered official Home asset suite");
}
const homeStripeLinks = valuesFor(home, "a", "href").filter((href) =>
  href.startsWith("https://buy.stripe.com/"),
);
if (homeStripeLinks.length !== 7 || homeStripeLinks.some((href) => href !== HOME_STRIPE_URL)) {
  fail(
    "index.html",
    `all seven official Home checkout controls must use ${HOME_STRIPE_URL}`,
  );
}
const homeLinks = valuesFor(home, "a", "href");
for (const required of [
  SUBSCRIBE_URL,
  "https://www.linkedin.com/company/veryloving",
  "https://www.instagram.com/verylovinginc/",
  "https://x.com/verylovinginc",
]) {
  if (!homeLinks.includes(required)) fail("index.html", `must link to ${required}`);
}

const faq = pages.get("faq.html") ?? "";
const faqH1 = pairedElements(faq, "h1").map((element) => normalizedText(element.body));
if (faqH1.length === 1 && faqH1[0] !== "FAQ") {
  fail("faq.html", "h1 must be exactly FAQ");
}
if (titles.get("faq.html") !== "FAQ | VeryLoving") {
  fail("faq.html", "title must match the official FAQ title");
}
if (/<(?:details|summary)\b/iu.test(faq)) {
  fail("faq.html", "must use the official-style custom button accordion, not details/summary");
}

const faqItemTags = allOpeningTags(faq).filter((tag) =>
  hasClass(attributes(tag), "faq-item"),
);
if (faqItemTags.length !== faqItems.length) {
  fail("faq.html", `must contain exactly ${faqItems.length} .faq-item elements`);
}

const questionElements = elementsWithClass(faq, "button", "faq-question");
const panelElements = shallowElementsWithClass(faq, "div", "faq-panel");
if (questionElements.length !== faqItems.length) {
  fail("faq.html", `must contain exactly ${faqItems.length} .faq-question buttons`);
}
if (panelElements.length !== faqItems.length) {
  fail("faq.html", `must contain exactly ${faqItems.length} .faq-panel regions`);
}
if (panelElements[0] && !hasClass(panelElements[0].attrs, "faq-panel-featured")) {
  fail("faq.html", "the first FAQ answer must retain its featured 240px panel treatment");
}
if (panelElements.slice(1).some((panel) => hasClass(panel.attrs, "faq-panel-featured"))) {
  fail("faq.html", "only the first FAQ answer may use the featured panel treatment");
}

for (let index = 0; index < faqItems.length; index += 1) {
  const expected = faqItems[index];
  const question = questionElements[index];
  const panel = panelElements[index];
  if (question) {
    const questionText = normalizedText(question.body);
    if (questionText !== expected.question) {
      fail(
        "faq.html",
        `question ${index + 1} must be exactly ${JSON.stringify(expected.question)}`,
      );
    }
    const id = question.attrs.get("id") ?? "";
    const controls = question.attrs.get("aria-controls") ?? "";
    if (question.attrs.get("type") !== "button") {
      fail("faq.html", `question ${index + 1} must use type="button"`);
    }
    if (question.attrs.get("aria-expanded") !== "false") {
      fail("faq.html", `question ${index + 1} must be initially collapsed`);
    }
    if (!id || !controls) {
      fail("faq.html", `question ${index + 1} must have id and aria-controls`);
    }
    const chevrons = allOpeningTags(question.body).filter((tag) =>
      hasClass(attributes(tag), "faq-chevron"),
    );
    if (
      chevrons.length !== 1 ||
      attributes(chevrons[0]).get("aria-hidden") !== "true"
    ) {
      fail("faq.html", `question ${index + 1} must contain one aria-hidden chevron`);
    }
    if (panel) {
      if (panel.attrs.get("id") !== controls || panel.attrs.get("aria-labelledby") !== id) {
        fail("faq.html", `question ${index + 1} and panel ARIA ids must point to each other`);
      }
      if (panel.attrs.get("role") !== "region") {
        fail("faq.html", `panel ${index + 1} must use role="region"`);
      }
      if (!panel.attrs.has("hidden") && panel.attrs.get("aria-hidden") !== "true") {
        fail("faq.html", `panel ${index + 1} must be hidden initially`);
      }
    }
  }
  if (panel && normalizedText(panel.body) !== expected.answer) {
    fail(
      "faq.html",
      `answer ${index + 1} must be exactly ${JSON.stringify(expected.answer)}`,
    );
  }
}

const faqStripeLinks = valuesFor(faq, "a", "href").filter((href) =>
  href.startsWith("https://buy.stripe.com/"),
);
if (faqStripeLinks.length !== 1 || faqStripeLinks[0] !== FAQ_STRIPE_URL) {
  fail("faq.html", `must contain one FAQ preorder link to ${FAQ_STRIPE_URL}`);
}
if (!valuesFor(faq, "a", "href").includes(EMAIL_URL)) {
  fail("faq.html", `must link the contact answer to ${EMAIL_URL}`);
}
const allowedFaqImages = new Set([
  "assets/veryloving-logo.avif",
  "assets/guardian-star.avif",
]);
for (const image of valuesFor(faq, "img", "src")) {
  if (!allowedFaqImages.has(image)) fail("faq.html", `unexpected FAQ image ${image}`);
}
for (const image of allowedFaqImages) {
  if (!valuesFor(faq, "img", "src").includes(image)) {
    fail("faq.html", `must use shared image ${image}`);
  }
}

for (const legalPage of ["privacy.html", "accessibility-statement.html"]) {
  const source = pages.get(legalPage) ?? "";
  const imageSources = valuesFor(source, "img", "src");
  for (const required of [
    "assets/veryloving-logo.avif",
    "assets/guardian-star.avif",
  ]) {
    if (!imageSources.includes(required)) fail(legalPage, `must use shared image ${required}`);
  }
  for (const image of imageSources) {
    if (
      image !== "assets/veryloving-logo.avif" &&
      image !== "assets/guardian-star.avif"
    ) {
      fail(legalPage, `unexpected legal-page image ${image}`);
    }
  }
  if (valuesFor(source, "a", "href").some((href) => href.startsWith("https://buy.stripe.com/"))) {
    fail(legalPage, "legal pages must not add a checkout control");
  }
}

const productPageRequirements = new Map([
  [
    "products.html",
    {
      title: "Product Family | VeryLoving",
      h1: "Companionship that moves with you—and grows with home",
      activeHref: "products.html",
      copy: [
        "Under development",
        "NorthStar wearable",
        "Research only",
        "Home Companion",
        "No physical robot, sensor, or remote control system is connected today.",
        "Warmth, with clear boundaries",
      ],
    },
  ],
  [
    "wearable.html",
    {
      title: "NorthStar Wearable | VeryLoving",
      h1: "A wearable companion, led by your choices",
      activeHref: "wearable.html",
      copy: [
        "Under development",
        "NorthStar does not provide emergency help. Gestures only open phone screens; they do not automatically start audio, share location, or contact anyone.",
        "A development path, not a safety promise",
        "A single tap can open the AI companion screen. You still choose when to press Start and begin a conversation.",
        "Opening the phone’s share sheet does not prove that another person received the location.",
        "What NorthStar does not claim",
        "No automatic SOS, emergency calling, contact notification, or delivery receipt.",
      ],
    },
  ],
  [
    "home-companion.html",
    {
      title: "Home Companion Research | VeryLoving",
      h1: "A future companion for the home",
      activeHref: "home-companion.html",
      copy: [
        "Research only",
        "Static research concept",
        "No physical Home Companion is connected.",
        "Warm presence",
        "Supportive routines",
        "Human connection",
        "No physical integration",
        "No physical-device availability claim",
      ],
    },
  ],
]);

for (const [page, requirements] of productPageRequirements) {
  const source = pages.get(page) ?? "";
  const pageText = normalizedText(source);
  const h1 = pairedElements(source, "h1").map((element) => normalizedText(element.body));
  if (titles.get(page) !== requirements.title) {
    fail(page, `title must be exactly ${JSON.stringify(requirements.title)}`);
  }
  if (h1.length === 1 && h1[0] !== requirements.h1) {
    fail(page, `h1 must be exactly ${JSON.stringify(requirements.h1)}`);
  }
  checkOrderedCopy(page, pageText, requirements.copy);

  const productNavElement = elementsWithClass(source, "nav", "product-nav")[0];
  const productNav = productNavElement?.markup ?? "";
  if (!productNavElement) {
    fail(page, "must contain the shared product-family navigation");
  } else {
    const productLinks = valuesFor(productNav, "a", "href");
    const expectedProductLinks = [
      "products.html",
      "wearable.html",
      "home-companion.html",
    ];
    if (JSON.stringify(productLinks) !== JSON.stringify(expectedProductLinks)) {
      fail(page, "product-family navigation must link to all three product pages in order");
    }
    const activeLinks = tags(productNav, "a")
      .map(attributes)
      .filter((attrs) => attrs.get("aria-current") === "page");
    if (
      activeLinks.length !== 1 ||
      activeLinks[0].get("href") !== requirements.activeHref
    ) {
      fail(page, `product-family navigation must mark ${requirements.activeHref} current`);
    }
  }
}

const productOverview = pages.get("products.html") ?? "";
for (const requiredCopy of [
  "Mobile AI + foreground map",
  "It is not a monitoring or emergency service.",
]) {
  if (!normalizedText(productOverview).includes(requiredCopy)) {
    fail("products.html", `must retain the product-status boundary ${JSON.stringify(requiredCopy)}`);
  }
}
if (valuesFor(productOverview, "a", "href").some((href) => href.startsWith("https://buy.stripe.com/"))) {
  fail("products.html", "the product overview must not collapse both maturity levels into a checkout");
}

const wearablePage = pages.get("wearable.html") ?? "";
const wearableCheckoutLinks = valuesFor(wearablePage, "a", "href").filter((href) =>
  href.startsWith("https://buy.stripe.com/"),
);
if (
  wearableCheckoutLinks.length !== 2 ||
  wearableCheckoutLinks.some((href) => href !== HOME_STRIPE_URL)
) {
  fail("wearable.html", `both wearable checkout controls must use ${HOME_STRIPE_URL}`);
}

const homeCompanionPage = pages.get("home-companion.html") ?? "";
if (valuesFor(homeCompanionPage, "a", "href").some((href) => href.startsWith("https://buy.stripe.com/"))) {
  fail("home-companion.html", "research-only Home Companion must not include a checkout");
}
if (/<(?:form|button|input|video|iframe)\b/iu.test(homeCompanionPage)) {
  fail("home-companion.html", "research-only Home Companion must remain a static information page");
}

const siteText = shippedHtml.join("\n");
const residuePatterns = [
  [/_api\//iu, "captured API path"],
  [/access[-_]?tokens?/iu, "access-token residue"],
  [/(?:wix|parastorage|thunderbolt|webpack|fedops)/iu, "Wix/runtime residue"],
  [/(?:sentry\.io|telemetry)/iu, "telemetry residue"],
  [/-----BEGIN [A-Z ]*PRIVATE KEY-----/u, "private key"],
  [/\bBearer\s+[A-Za-z0-9._~-]{20,}/u, "bearer credential"],
  [/\b(?:sk_live|AIza)[A-Za-z0-9_-]{12,}/u, "API credential"],
  [/\beyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{10,}\b/u, "JWT"],
];
for (const [pattern, label] of residuePatterns) {
  if (pattern.test(siteText)) fail("site", `${label} must not be present in shipped pages`);
}

const termsPatterns = [
  /terms(?:-and-conditions|-of-(?:service|use))?\.html/iu,
  /\bterms and conditions\b/iu,
  /\bterms of (?:service|use)\b/iu,
  /\b(?:accept|agree to)(?: the)? terms\b/iu,
  /\bterms[- +]plus[- +]privacy\b/iu,
  /\bterms acceptance\b/iu,
  /\bEULA\b/u,
];
for (const pattern of termsPatterns) {
  if (pattern.test(siteText)) fail("site", "must not add a Terms page or acceptance requirement");
}
if (/(?:yongxin12\.github\.io|veryloving-privacy|www\.verylovinginc\.com\/privacy)/iu.test(siteText)) {
  fail("site", "legacy Privacy Policy URLs must not be present");
}

const privacy = pages.get("privacy.html") ?? "";
const currentPrivacyUrl = "https://ch0002ic-cell.github.io/veryloving-website/privacy.html";
if (!privacy.includes(currentPrivacyUrl)) {
  fail("privacy.html", `must identify the current Privacy Policy URL as ${currentPrivacyUrl}`);
}
if (!/under review/iu.test(privacy)) {
  fail("privacy.html", "must disclose that the privacy inventory is under review");
}
if (!/(?:not|does not)[^.]{0,80}(?:release|store)[^.]{0,40}approv(?:al|ed)/iu.test(privacy)) {
  fail("privacy.html", "must not present the candidate notice as store-release approval");
}
const unsafePrivacyClaims = [
  [/\b(?:within|after|for)\s+\d+\s+(?:calendar\s+)?(?:days?|months?|years?)\b/iu, "fixed retention/deletion duration"],
  [/\b\d+[- ](?:day|month|year)\b/iu, "fixed retention/deletion duration"],
  [/\b(?:no|never|do not|does not)\b[^.]{0,50}\bhistorical location\b/iu, "blanket historical-location claim"],
  [/\b(?:encrypted|encryption) at rest\b/iu, "unverified at-rest encryption claim"],
  [/\b(?:complete|full) (?:data )?export\b/iu, "unverified complete-export claim"],
  [/\b(?:immediately|permanently) delet(?:e|ed|ion)\b/iu, "unverified deletion guarantee"],
  [/\b(?:all|every)\b[^.]{0,40}\b(?:data|information)\b[^.]{0,40}\bdelet(?:e|ed)\b/iu, "blanket deletion guarantee"],
  [/\bindustry[- ]standard (?:security|encryption)\b/iu, "unverified security claim"],
];
for (const [pattern, label] of unsafePrivacyClaims) {
  if (pattern.test(privacy)) fail("privacy.html", `must not make an unsafe ${label}`);
}

const accessibility = pages.get("accessibility-statement.html") ?? "";
const accessibilityText = normalizedText(accessibility);
for (const requiredScopeCopy of [
  "these seven static webpages",
  "Product Family",
  "NorthStar Wearable",
  "Home Companion Research",
  "Last updated: 18 August 2026",
]) {
  if (!accessibilityText.includes(requiredScopeCopy)) {
    fail(
      "accessibility-statement.html",
      `must keep the seven-page scope current with ${JSON.stringify(requiredScopeCopy)}`,
    );
  }
}
if (/these four static webpages/iu.test(accessibilityText)) {
  fail("accessibility-statement.html", "must not retain the superseded four-page scope");
}
if (/\{\{|\}\}|\[(?:insert|company|organization|date|email|phone|address|name|url)[^\]]*\]|lorem ipsum/iu.test(accessibility)) {
  fail("accessibility-statement.html", "template placeholders must be replaced");
}
if (
  /\b(?:fully\s+)?(?:conforms?|complies|compliant|meets?)\s+(?:with\s+|to\s+)?WCAG\b/iu.test(
    accessibility,
  ) || /\bWCAG\b[^.<]{0,60}\b(?:compliant|conformant|certified)\b/iu.test(accessibility)
) {
  fail("accessibility-statement.html", "must not overclaim WCAG conformance");
}
if (/native disclosure controls/iu.test(accessibility)) {
  fail("accessibility-statement.html", "must describe the custom FAQ accordion accurately");
}
if (!/(?:accordion|disclosure controls)/iu.test(accessibility)) {
  fail("accessibility-statement.html", "must mention the keyboard-accessible FAQ accordion");
}

let siteJs = "";
try {
  siteJs = await readFile(path.join(root, "site.js"), "utf8");
  try {
    new Function(siteJs);
  } catch (error) {
    fail("site.js", `must be valid classic JavaScript (${error.message})`);
  }
} catch (error) {
  fail("site.js", `cannot be read (${error.message})`);
}
for (const [pattern, label] of residuePatterns) {
  if (pattern.test(siteJs)) fail("site.js", `${label} must not be present`);
}
for (const [pattern, requirement] of [
  [/faq-question/u, "operate on FAQ question buttons"],
  [/aria-expanded/u, "synchronize aria-expanded"],
  [/\bhidden\b/u, "synchronize hidden panels"],
  [/is-open/u, "synchronize the open-state class"],
  [/addEventListener\s*\(\s*(["'])click\1/u, "handle click activation"],
  [
    /for\s*\([^)]*\bbuttons\b[^)]*\)\s*close\s*\(/u,
    "close sibling accordion items before opening a new one",
  ],
]) {
  if (!pattern.test(siteJs)) fail("site.js", `must ${requirement}`);
}
for (const [pattern, label] of [
  [/\b(?:eval|Function)\s*\(/u, "dynamic code execution"],
  [/\b(?:fetch|XMLHttpRequest|WebSocket|EventSource)\b/u, "network API"],
  [/sendBeacon\s*\(/u, "telemetry API"],
  [/\.innerHTML\s*=/u, "innerHTML assignment"],
  [/\bimport\s*\(/u, "dynamic import"],
  [/https?:\/\//iu, "external URL"],
]) {
  if (pattern.test(siteJs)) fail("site.js", `must not use ${label}`);
}

let css = "";
try {
  css = await readFile(path.join(root, "styles.css"), "utf8");
} catch (error) {
  fail("styles.css", `cannot be read (${error.message})`);
}
for (const [pattern, label] of residuePatterns) {
  if (pattern.test(css)) fail("styles.css", `${label} must not be present`);
}
if (/@import\b/iu.test(css) || /url\(\s*(["']?)https?:/iu.test(css)) {
  fail("styles.css", "must not load external styles, fonts, or images");
}
for (const selector of [
  ":focus-visible",
  ".skip-link",
  ".site-header",
  ".primary-nav",
  ".guardian-signup",
  ".subscribe-pill",
  ".site-footer",
  ".faq-item",
  ".faq-question",
  ".faq-panel",
  ".is-open",
]) {
  if (!css.includes(selector)) fail("styles.css", `must define ${selector}`);
}
if (!/@media\s*\(\s*prefers-reduced-motion\s*:\s*reduce\s*\)/iu.test(css)) {
  fail("styles.css", "must include a reduced-motion media query");
}
if (!/@media\s*\([^)]*(?:min-width|max-width)\s*:\s*750px[^)]*\)/iu.test(css)) {
  fail("styles.css", "must include the official 750px phone breakpoint");
}
if (!/@media\s*\([^)]*(?:min-width|max-width)\s*:\s*1000px[^)]*\)/iu.test(css)) {
  fail("styles.css", "must include the official 1000px tablet breakpoint");
}
for (const [pattern, requirement] of [
  [/\.home-hero\s*\{[^}]*height\s*:\s*146\.735vw/isu, "scale the phone hero fluidly"],
  [/\.hero-products\s*\{[^}]*pointer-events\s*:\s*none/isu, "keep decorative hero artwork from blocking the Follow link"],
  [/\.feature-connect\s*\{[^}]*height\s*:\s*180\.1vw/isu, "scale phone feature sections fluidly"],
  [/\.how-it-works\s*\{[^}]*height\s*:\s*max\(80\.273vw,\s*47\.77vh\)/isu, "preserve the official responsive How-it-works stage"],
  [/\.how-it-works\s*\{[^}]*height\s*:\s*max\(473\.8828125px,\s*53\.735vw\)[^}]*overflow\s*:\s*visible/isu, "keep the tablet How-it-works artwork unclipped"],
  [/\.how-it-works\s*\{[^}]*height\s*:\s*max\(634\.1875px,\s*calc\(533\.008px\s*\+\s*7\.90516vw\),\s*45\.1594vw\)[^}]*overflow\s*:\s*visible/isu, "keep the desktop How-it-works artwork aligned and unclipped"],
  [/\.how-it-works\s+img\s*\{[^}]*position\s*:\s*relative/isu, "paint overflowing How-it-works artwork above the following cream section"],
  [/@media\s*\([^)]*min-width\s*:\s*1001px[^)]*\)\s*and\s*\([^)]*max-width\s*:\s*1439px[^)]*\)[^{]*\{[\s\S]*?\.home-hero\s*\{[^}]*width\s*:\s*78\.125vw[\s\S]*?\.hero-charm\s*\{[^}]*left\s*:\s*55\.317361vw[^}]*width\s*:\s*28\.271528vw/iu, "keep the intermediate desktop hero inside the viewport"],
  [/\.primary-nav\s*\{[^}]*margin-right\s*:\s*min\(175px,\s*calc\(\(1535px\s*-\s*100vw\)\s*\/\s*2\)\)/isu, "keep FAQ clear of the preorder control on intermediate desktops"],
  [/\.feature-copy\s*\{[^}]*min-width\s*:\s*0/isu, "allow intermediate desktop feature copy to shrink inside its grid track"],
  [/\.social-giveaway\s*\{[^}]*height\s*:\s*40\.465vh/isu, "preserve the official responsive social stage"],
  [/\.faq-list\s*\{[^}]*width\s*:\s*85\.277vw/isu, "keep the phone FAQ list fluid"],
  [/\.guardian-signup\s*\{[^}]*height\s*:\s*81\.94vw/isu, "keep the shared phone signup fluid"],
  [/\.site-footer\s*\{[^}]*justify-content\s*:\s*flex-end/isu, "bottom-anchor the phone footer stack"],
  [/\.footer-column\s+a\s*\{[^}]*min-height\s*:\s*24px[^}]*\}\s*\.footer-column\s+a\s*\+\s*a\s*>\s*span/isu, "retain 24px mobile footer targets without shifting the official baselines"],
  [/\.faq-question\[aria-expanded=["']true["']\]\s+\.faq-chevron::before/isu, "show the expanded FAQ chevron state"],
  [/\.faq-panel-featured\s*>\s*div\s*\{[^}]*min-height\s*:\s*0/isu, "let the featured FAQ grid row collapse before it animates"],
  [/\.faq-panel-featured\s+p\s*\{[^}]*min-height\s*:\s*240px/isu, "preserve the official featured FAQ open height"],
  [/box-shadow\s*:\s*0\s+0\s+0\s+3px\s+#fff/iu, "use a two-tone keyboard focus indicator"],
  [/@media\s*\([^)]*min-width\s*:\s*1001px[^)]*\)\s*and\s*\([^)]*max-height\s*:\s*850px[^)]*\)[^{]*\{[\s\S]*?\.home-page\s+\.header-preorder\s*\{[^}]*position\s*:\s*absolute[\s\S]*?\.home-page\s+\.preorder-dock\s*\{[^}]*position\s*:\s*relative/iu, "keep preorder controls in flow on short desktop viewports"],
]) {
  if (!pattern.test(css)) fail("styles.css", `must ${requirement}`);
}
if (/\.subscribe-pill:hover\s*\{[^}]*transform\s*:/isu.test(css)) {
  fail("styles.css", "Subscribe hover must not resize the control");
}
if (!/grid-template-rows\s*:\s*0fr/iu.test(css) || !/(?:250ms|0\.25s)/iu.test(css)) {
  fail("styles.css", "FAQ panels must use the official 0fr animation over 250ms");
}

for (const match of css.matchAll(/url\(\s*(["']?)([^"')]+)\1\s*\)/giu)) {
  const reference = match[2].trim();
  if (!reference || reference.startsWith("#")) continue;
  if (/^(?:data:|https?:|\/\/|\/)/iu.test(reference)) {
    fail("styles.css", `unsupported CSS URL ${reference}`);
    continue;
  }
  const target = path.resolve(root, reference.split(/[?#]/u, 1)[0]);
  if (target !== root && !target.startsWith(`${root}${path.sep}`)) {
    fail("styles.css", `CSS URL escapes the site root: ${reference}`);
    continue;
  }
  try {
    const targetStat = await stat(target);
    if (!targetStat.isFile()) fail("styles.css", `CSS URL is not a file: ${reference}`);
  } catch {
    fail("styles.css", `broken CSS URL: ${reference}`);
  }
}

let productCss = "";
try {
  productCss = await readFile(path.join(root, "product-pages.css"), "utf8");
} catch (error) {
  fail("product-pages.css", `cannot be read (${error.message})`);
}
for (const [pattern, label] of residuePatterns) {
  if (pattern.test(productCss)) fail("product-pages.css", `${label} must not be present`);
}
if (/@import\b/iu.test(productCss) || /url\(\s*(["']?)https?:/iu.test(productCss)) {
  fail("product-pages.css", "must not load external styles, fonts, or images");
}
for (const selector of [
  ".product-nav",
  ".product-hero",
  ".status-chip",
  ".concept-companion",
  ".interaction-steps",
  ".research-boundary",
  ".research-card-grid",
]) {
  if (!productCss.includes(selector)) {
    fail("product-pages.css", `must define ${selector}`);
  }
}
for (const [pattern, requirement] of [
  [/@media\s*\(max-width:\s*1000px\)/iu, "include the shared tablet breakpoint"],
  [/@media\s*\(max-width:\s*750px\)/iu, "include the shared phone breakpoint"],
  [/@media\s*\(prefers-reduced-motion:\s*reduce\)/iu, "respect reduced motion"],
  [/@media\s*\(forced-colors:\s*active\)/iu, "support forced colors"],
  [/\.product-button\s*\{[^}]*min-height\s*:\s*52px/isu, "keep primary product controls at least 52px tall"],
  [/\.product-nav\s+a\s*\{[^}]*min-height\s*:\s*44px/isu, "keep desktop product navigation targets at least 44px tall"],
  [/\.step-number\s*\{[^}]*color\s*:\s*#9f442c/isu, "keep interaction-step numbers legible"],
  [/\.research-boundary\s+p\s*\{[^}]*color\s*:\s*#6b5c4d/isu, "keep research-boundary copy legible"],
  [/\.product-page\s+\.guardian-signup\s*\{[^}]*background\s*:\s*#8b614f/isu, "keep the new-page signup band legible"],
]) {
  if (!pattern.test(productCss)) fail("product-pages.css", `must ${requirement}`);
}
for (const match of productCss.matchAll(/url\(\s*(["']?)([^"')]+)\1\s*\)/giu)) {
  const reference = match[2].trim();
  if (!reference || reference.startsWith("#")) continue;
  if (/^(?:data:|https?:|\/\/|\/)/iu.test(reference)) {
    fail("product-pages.css", `unsupported CSS URL ${reference}`);
    continue;
  }
  const target = path.resolve(root, reference.split(/[?#]/u, 1)[0]);
  if (target !== root && !target.startsWith(`${root}${path.sep}`)) {
    fail("product-pages.css", `CSS URL escapes the site root: ${reference}`);
    continue;
  }
  try {
    const targetStat = await stat(target);
    if (!targetStat.isFile()) {
      fail("product-pages.css", `CSS URL is not a file: ${reference}`);
    }
  } catch {
    fail("product-pages.css", `broken CSS URL: ${reference}`);
  }
}

let totalAssetBytes = 0;
for (const [asset, expected] of expectedAssets) {
  const absolute = path.join(root, asset);
  try {
    const details = await stat(absolute);
    if (!details.isFile() || details.size === 0) fail(asset, "must be a non-empty file");
    if (details.size > expected.maximumBytes) {
      fail(
        asset,
        `must be no larger than ${expected.maximumBytes.toLocaleString("en-US")} bytes`,
      );
    }
    totalAssetBytes += details.size;
    const buffer = await readFile(absolute);
    const dimensions = imageDimensions(buffer, expected.type);
    if (!dimensions) {
      fail(asset, `must contain a valid ${expected.type.toUpperCase()} image signature`);
    } else if (
      dimensions.width !== expected.width ||
      dimensions.height !== expected.height
    ) {
      fail(
        asset,
        `must be exactly ${expected.width}x${expected.height}px (found ${dimensions.width}x${dimensions.height}px)`,
      );
    }
  } catch (error) {
    fail(asset, `cannot be verified (${error.message})`);
  }
}
if (totalAssetBytes > 1_000_000) {
  fail("assets", "the reviewed image suite must total no more than 1 MB");
}

for (const [font, maximumBytes] of expectedFonts) {
  const absolute = path.join(root, font);
  try {
    const details = await stat(absolute);
    if (!details.isFile() || details.size === 0) fail(font, "must be a non-empty file");
    if (details.size > maximumBytes) {
      fail(
        font,
        `must be no larger than ${maximumBytes.toLocaleString("en-US")} bytes`,
      );
    }
    const buffer = await readFile(absolute);
    if (buffer.length < 4 || buffer.subarray(0, 4).toString("ascii") !== "wOF2") {
      fail(font, "must contain a valid WOFF2 signature");
    }
  } catch (error) {
    fail(font, `cannot be verified (${error.message})`);
  }
}

const shippedSources = `${siteText}\n${css}\n${productCss}`;
for (const asset of [...expectedAssets.keys(), ...expectedFonts.keys()]) {
  if (!shippedSources.includes(asset)) fail(asset, "must be referenced by the shipped site");
}

try {
  const packageJson = JSON.parse(await readFile(path.join(root, "package.json"), "utf8"));
  if (packageJson?.scripts?.check !== "node scripts/check-site.mjs") {
    fail("package.json", 'scripts.check must be exactly "node scripts/check-site.mjs"');
  }
  if (packageJson.dependencies || packageJson.devDependencies) {
    fail("package.json", "the static validator must remain dependency-free");
  }
} catch (error) {
  fail("package.json", `cannot be parsed (${error.message})`);
}

if (errors.length) {
  console.error(`Site checks failed (${errors.length}):`);
  for (const error of errors) console.error(`- ${error}`);
  process.exitCode = 1;
} else {
  console.log(
    `Site checks passed: ${expectedPages.size} pages, ${faqItems.length} exact FAQs, shared official shell, accessible local interactions, legal safeguards, and ${totalAssetBytes.toLocaleString("en-US")} bytes of reviewed images.`,
  );
}
