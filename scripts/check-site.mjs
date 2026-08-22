import { readdir, readFile, stat } from "node:fs/promises";
import { createHash } from "node:crypto";
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
  [
    "terms.html",
    "https://ch0002ic-cell.github.io/veryloving-website/terms.html",
  ],
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
  "More than jewelry, our vision brings warmth, connection, and peace of mind closer on every journey.",
  "Veryloving,Inc. is a Silicon Valley–based AI safety technology company dedicated to advancing personal safety, AI-powered emotional companionship, and next-generation wearable intelligence for a global market. Founded in 2025, the company began its global expansion in 2026.",
  "Our multidisciplinary team combines expertise in artificial intelligence, smart hardware engineering, and global connectivity to develop the next generation of the Wearable AI Guardian System—intended to support user-directed safety experiences while providing warmth, reassurance, and companionship in everyday life. Current prototypes do not provide automatic monitoring, emergency dispatch, or a guaranteed safety outcome.",
  "In 2026, Veryloving AI showcased its innovations at the Consumer Electronics Show (CES) and received recognition at BEYOND Expo for innovation, as well as a Silicon Valley wearable technology innovation award. The company also actively participates in global conversations on women's safety, AI, and emerging technologies.",
  "Our mission is simple: to make the world safer—and more compassionate.",
  "Connect to a caring voice",
  "Our product vision pairs a deliberate jewelry tap with a calming AI voice companion. In the current app, the user still chooses when to press Start and begin a supportive conversation.",
  "Win $200 by following us on",
  "Wear peace of mind",
  "A beautifully designed accessory that combines elegance and smart connectivity, bringing comfort and confidence to everyday life.",
  "Trigger a loud alert",
  "The planned charm is designed to remain discreet and provide a loud local alert when deliberately activated, subject to final physical-hardware and acoustic validation.",
  "Share when you choose",
  "The VeryLoving app can prepare a fresh foreground location for the phone’s share sheet after the user requests it. The user selects the destination; opening the sheet does not prove delivery.",
];

const faqItems = [
  {
    question: "How does the Veryloving charm work?",
    answer:
      "The VeryLoving charm is envisioned as jewelry that works with a smartphone and companion app. The current engineering milestone uses software-only localhost simulators; it does not implement or connect physical jewelry, a radio, or a safety service.",
  },
  {
    question: "How long does the battery last?",
    answer:
      "Seven to fourteen days is a design target, not a validated current specification. Final battery life will depend on physical hardware, firmware, radio use, charging, environment, and independent testing.",
  },
  {
    question: "Is the jewelry water-resistant?",
    answer:
      "Splash and sweat resistance is a product target. A final ingress rating and care instructions will be published only after the production design is tested. Until then, do not assume water resistance.",
  },
  {
    question: "Who can see my location?",
    answer:
      "The current Quick Share flow obtains a fresh foreground location only after you press Share and opens your phone’s share sheet. You choose the destination. Opening the sheet does not prove delivery, and a VeryLoving friend does not automatically receive location access.",
  },
  {
    question: "Does the jewelry work without a phone connection?",
    answer:
      "The product vision is designed to work with the VeryLoving mobile app. The current software rehearsal also requires the app and two same-computer simulators; it does not establish phone-independent, cellular, or physical-wearable operation.",
  },
  {
    question: "What happens if I press the charm button by accident?",
    answer:
      "Accidental-activation safeguards and cancellation behavior remain part of production hardware and human-factors design. In the current simulator, a developer can attempt to cancel a still-pending synthetic wearable request before its final processing boundary. Only a confirmed cancelled result counts; too late, missing evidence, and unknown do not. Explicit lab expiry is a fallback for a stuck, unfinished fixture, not cancellation success. These are test controls, not a consumer feature, and they produce no alert, message, location share, vibration, or emergency action.",
  },
  {
    question: "Do I need a subscription to use the app?",
    answer:
      "Current prototype experiences do not require a paid subscription. Final launch pricing, included features, and any optional plan will be disclosed before purchase or enrollment.",
  },
  {
    question: "Where do you ship the jewelry?",
    answer:
      "Pre-orders are currently offered for the United States. Final shipping coverage, eligibility, timing, taxes, returns, and support terms will be shown in the approved purchase terms.",
  },
  {
    question: "When can I buy it?",
    answer:
      "You can pre-order it now. Delivery timing, final specifications, and purchase terms remain subject to confirmation; an estimate is not a guaranteed ship date.",
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

function relativeLuminance(hexColor) {
  const channels = hexColor
    .replace(/^#/u, "")
    .match(/.{2}/gu)
    .map((channel) => Number.parseInt(channel, 16) / 255)
    .map((channel) =>
      channel <= 0.04045
        ? channel / 12.92
        : ((channel + 0.055) / 1.055) ** 2.4,
    );
  return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
}

function contrastRatio(colorA, colorB) {
  const lighter = Math.max(relativeLuminance(colorA), relativeLuminance(colorB));
  const darker = Math.min(relativeLuminance(colorA), relativeLuminance(colorB));
  return (lighter + 0.05) / (darker + 0.05);
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
  const expectedStyles = productPages.has(page)
    ? ["styles.css", "product-pages.css"]
    : ["styles.css"];
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
      "terms of use",
      "accessibility statement",
      "© 2025 by veryloving",
      "built at founders inc.",
    ]) {
      if (!footerText.includes(required)) fail(page, `shared footer must contain ${required}`);
    }
    const footerLinks = valuesFor(footer, "a", "href");
    for (const required of [
      "privacy.html",
      "terms.html",
      "accessibility-statement.html",
      EMAIL_URL,
    ]) {
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
  "Share when you choose",
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

for (const legalPage of [
  "privacy.html",
  "terms.html",
  "accessibility-statement.html",
]) {
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
      title: "Products | VeryLoving",
      h1: "Choose your VeryLoving experience",
      breadcrumbLinks: [],
      breadcrumbCurrent: "Products",
      copy: [
        "Product vision + software-only prototype 1.3",
        "Personal safety, with a more human touch",
        "Today’s coordinated prototype is an engineering rehearsal",
        "NorthStar wearable",
        "Home Companion",
        "Company-reported milestones",
        "not evidence of medical validation, product readiness, or a guaranteed safety result.",
        "Explore the VeryLoving family",
        "Coordinated rehearsal",
        "Production path",
      ],
      minimumFeatures: 3,
      needsRules: true,
      needsBoundary: false,
      needsCta: false,
      images: [
        "assets/veryloving-logo.avif",
        "assets/phone-map-preview.avif",
        "assets/charm-preview.avif",
        "assets/wear-peace.avif",
        "assets/guardian-star.avif",
        "assets/ces-badge.avif",
        "assets/guardian-star.avif",
      ],
      prohibitedCopy: [
        "maturity",
        "release-gated",
        "engineering-stage",
        "static research surface",
      ],
    },
  ],
  [
    "wearable.html",
    {
      title: "NorthStar Wearable | VeryLoving",
      h1: "More than jewelry",
      breadcrumbLinks: ["products.html"],
      breadcrumbCurrent: "Personal wearable",
      copy: [
        "NorthStar vision + software-only prototype 1.3",
        "A connected vision, rehearsed in software",
        "Meet Capybear",
        "Wear peace of mind",
        "Share only when you choose",
        "From product vision to verified prototype",
        "Explicit rehearsal cue",
        "Local readiness",
        "Evidence without assumed success",
        "Simulation-only boundary",
        "Full product specifications will be shared before launch.",
        "Prototype and production path",
        "Built for iOS and Android development",
      ],
      minimumFeatures: 3,
      needsRules: true,
      needsBoundary: true,
      needsCta: true,
      images: [
        "assets/veryloving-logo.avif",
        "assets/phone-map-preview.avif",
        "assets/charm-preview.avif",
        "assets/ces-badge.avif",
        "assets/wear-peace.avif",
        "assets/phone-map-preview.avif",
        "assets/guardian-star.avif",
      ],
      prohibitedCopy: [
        "global communication integration",
        "keeps you safe",
        "automatic protection",
        "recognizes your emotions",
        "engineering-stage",
        "account-scoped",
        "authenticated hardware proof",
      ],
    },
  ],
  [
    "home-companion.html",
    {
      title: "Home Companion | VeryLoving",
      h1: "Bringing warmer companionship home",
      breadcrumbLinks: ["products.html"],
      breadcrumbCurrent: "Home Companion",
      copy: [
        "Future vision + software-only prototype 1.3",
        "Home Companion is an early research concept and is not available today.",
        "Mobile-orchestrated continuity",
        "A gentle check-in, requested on purpose",
        "No-capture session",
        "Helpful, always on your terms",
        "Receipts without assumptions",
        "Evidence stays precise",
        "Respect belongs at the heart of the home",
        "No capture.",
        "Production gates remain closed",
        "From idea to home, one verified step at a time",
        "A careful path from prototype to home",
      ],
      minimumFeatures: 4,
      needsRules: false,
      needsBoundary: true,
      needsCta: true,
      images: [
        "assets/veryloving-logo.avif",
        "assets/guardian-star.avif",
        "assets/guardian-star.avif",
        "assets/guardian-star.avif",
        "assets/guardian-star.avif",
        "assets/guardian-star.avif",
        "assets/guardian-star.avif",
      ],
      prohibitedCopy: [
        "lifelong companion",
        "unconditional companionship",
        "recognizes human emotions",
        "resemble loved ones",
        "controls your home",
        "monitors your home",
        "static research surface",
        "no physical integration",
        "no robot transport",
      ],
    },
  ],
]);

const frozenProductSections = [
  {
    page: "products.html",
    label: "approved company-milestones section",
    pattern: /<section class="feature product-feature product-milestone"[\s\S]*?<\/section>/u,
    sha256: "9d1778263c5876d6782ed7e403bbb1798ae6d99490f5594706470860c1fd2831",
  },
  {
    page: "wearable.html",
    label: "approved Quick Share section",
    pattern: /<section class="feature product-feature" aria-labelledby="sharing-title">[\s\S]*?<\/section>/u,
    sha256: "50603757fe16c62f0383b0b6f8e1088093fe5cdac7619dea99214eeca421ce0c",
  },
];

for (const frozen of frozenProductSections) {
  const source = pages.get(frozen.page) ?? "";
  const section = source.match(frozen.pattern)?.[0];
  if (!section) {
    fail(frozen.page, `must retain the ${frozen.label}`);
    continue;
  }
  const actualHash = createHash("sha256").update(section).digest("hex");
  if (actualHash !== frozen.sha256) {
    fail(frozen.page, `must leave the ${frozen.label} unchanged`);
  }
}

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
  for (const prohibited of requirements.prohibitedCopy) {
    if (pageText.toLowerCase().includes(prohibited.toLowerCase())) {
      fail(page, `must not present unsupported capability copy ${JSON.stringify(prohibited)}`);
    }
  }

  const breadcrumbs = elementsWithClass(source, "nav", "product-breadcrumb");
  if (breadcrumbs.length !== 1) {
    fail(page, "must contain exactly one in-hero product breadcrumb");
  } else {
    const breadcrumb = breadcrumbs[0].markup;
    const breadcrumbLinks = valuesFor(breadcrumb, "a", "href");
    if (JSON.stringify(breadcrumbLinks) !== JSON.stringify(requirements.breadcrumbLinks)) {
      fail(page, "product breadcrumb must keep the reviewed parent trail");
    }
    const currentElements = allOpeningTags(breadcrumb)
      .map((tag) => ({ tag, attrs: attributes(tag) }))
      .filter(({ attrs }) => attrs.get("aria-current") === "page");
    if (currentElements.length !== 1) {
      fail(page, "product breadcrumb must mark exactly one current page");
    } else {
      const currentTagName = currentElements[0].tag.match(/^<([a-z\d-]+)/iu)?.[1];
      const currentElement = currentTagName
        ? pairedElements(breadcrumb, currentTagName).find(
            (element) => element.attrs.get("aria-current") === "page",
          )
        : null;
      if (!currentElement || normalizedText(currentElement.body) !== requirements.breadcrumbCurrent) {
        fail(page, `product breadcrumb must identify ${JSON.stringify(requirements.breadcrumbCurrent)}`);
      }
    }
  }

  const productHeroMedia = elementsWithClass(source, "figure", "product-hero-media");
  if (productHeroMedia.length !== 1) {
    fail(page, "must contain one official-style product hero visual");
  }
  const productFeatures = elementsWithClass(source, "section", "product-feature");
  if (productFeatures.length < requirements.minimumFeatures) {
    fail(page, `must contain at least ${requirements.minimumFeatures} full-bleed split feature sections`);
  }
  for (const feature of productFeatures) {
    if (!/\bfeature\b/u.test(feature.attrs.get("class") ?? "")) {
      fail(page, "each product feature must reuse the official Home feature primitive");
    }
    if (!/\bfeature-media\b/u.test(feature.markup) || !/\bfeature-copy\b/u.test(feature.markup)) {
      fail(page, "each product feature must include media and copy panels");
    }
  }
  if (elementsWithClass(source, "section", "product-rules").length !== Number(requirements.needsRules)) {
    fail(page, requirements.needsRules ? "must include one FAQ-style ruled information section" : "must not add an unreviewed ruled section");
  }
  if (elementsWithClass(source, "section", "product-boundary-band").length !== Number(requirements.needsBoundary)) {
    fail(page, requirements.needsBoundary ? "must include one official dark editorial boundary band" : "must not add an unreviewed boundary band");
  }
  if (elementsWithClass(source, "section", "product-cta").length !== Number(requirements.needsCta)) {
    fail(page, requirements.needsCta ? "must include one in-flow official-style CTA section" : "must not add an unreviewed CTA section");
  }

  for (const legacyClass of [
    "product-nav",
    "status-chip",
    "product-button",
    "line-card",
    "family-orbit",
    "concept-companion",
    "research-card-grid",
    "wearable-glow",
    "visual-note",
    "research-window",
    "home-halo",
    "boundary-mark",
    "product-research-mark",
    "concept-caption",
    "concept-hero-words",
  ]) {
    if (new RegExp(`\\b${legacyClass}\\b`, "u").test(source)) {
      fail(page, `must not retain the superseded ${legacyClass} framework`);
    }
  }

  const actualImages = valuesFor(source, "img", "src");
  if (JSON.stringify(actualImages) !== JSON.stringify(requirements.images)) {
    fail(page, "must keep the reviewed product imagery and order");
  }
  const aboveFoldImageTags = new Set([
    ...tags(elementsWithClass(source, "header", "site-header")[0]?.markup ?? "", "img"),
    ...tags(productHeroMedia[0]?.markup ?? "", "img"),
  ]);
  for (const imageTag of tags(source, "img")) {
    if (aboveFoldImageTags.has(imageTag)) continue;
    const imageAttrs = attributes(imageTag);
    if (imageAttrs.get("loading") !== "lazy" || imageAttrs.get("decoding") !== "async") {
      fail(page, `below-fold image ${imageAttrs.get("src") ?? ""} must load lazily and decode asynchronously`);
    }
  }

  for (const anchorTag of tags(source, "a")) {
    const anchorAttrs = attributes(anchorTag);
    if (hasClass(anchorAttrs, "product-pill")) {
      if (!hasClass(anchorAttrs, "pill") || !hasClass(anchorAttrs, "pill-coral")) {
        fail(page, "primary product CTAs must retain the reviewed official pill classes");
      }
    }
    if (hasClass(anchorAttrs, "product-feature-pill") && !hasClass(anchorAttrs, "pill")) {
      fail(page, "split-feature CTAs must retain the official pill primitive");
    }
  }
}

const productOverview = pages.get("products.html") ?? "";
for (const requiredCopy of [
  "Prototype 1.3 is an internal software-contract milestone, not an app release or product version.",
  "It adds size and format checks to selected mobile data paths and clearer replay, cancellation, trace, and stop evidence across the simulators—that is, prior retry results, cancellation results, limited event history, and stop results.",
  "This strengthens engineering review; it does not add delivery, monitoring, AI safety decisions, or production readiness.",
  "A connected-jewelry vision; the current software simulator keeps a limited history of state changes, repeated requests, and cancellation results. It does not represent a physical wearable.",
  "Selected live-voice frames, route responses, and queued Bluetooth observations are checked for size and expected format before the app uses them.",
  "A future product vision with a current no-capture, effect-free localhost contract prototype. Automated format checks cover emitted examples, its limited status history says when older records were omitted, and stop results remain explicit.",
  "The app shows each endpoint separately and says completed only after both reach executed and the developer explicitly ends the matching Home session.",
  "One generated reference value links the two local records.",
  "Unknown, failed, expired, cancelled, too late, missing, or inconsistent results are never shown as success.",
]) {
  if (!normalizedText(productOverview).includes(requiredCopy)) {
    fail("products.html", `must retain the product-status boundary ${JSON.stringify(requiredCopy)}`);
  }
}
if (valuesFor(productOverview, "a", "href").some((href) => href.startsWith("https://buy.stripe.com/"))) {
  fail("products.html", "the product overview must not add an unreviewed checkout");
}

const wearablePage = pages.get("wearable.html") ?? "";
const wearableCheckoutLinks = valuesFor(wearablePage, "a", "href").filter((href) =>
  href.startsWith("https://buy.stripe.com/"),
);
if (
  wearableCheckoutLinks.length !== 1 ||
  wearableCheckoutLinks.some((href) => href !== HOME_STRIPE_URL)
) {
  fail("wearable.html", `the wearable checkout control must use ${HOME_STRIPE_URL}`);
}

const appDownloadButtons = pairedElements(wearablePage, "button").filter((button) =>
  hasClass(button.attrs, "app-download-button"),
);
const expectedDownloadLabels = ["iOS TestFlight Coming soon", "Android Coming soon"];
if (
  appDownloadButtons.length !== expectedDownloadLabels.length ||
  appDownloadButtons.some(
    (button, index) =>
      button.attrs.get("type") !== "button" ||
      !button.attrs.has("disabled") ||
      normalizedText(button.body) !== expectedDownloadLabels[index],
  )
) {
  fail("wearable.html", "must show disabled iOS TestFlight and Android coming-soon controls");
}
if (
  !normalizedText(wearablePage).includes(
    "NorthStar connectivity remains in development and is not part of the mobile beta.",
  )
) {
  fail("wearable.html", "must distinguish the mobile beta from NorthStar connectivity");
}
if (valuesFor(wearablePage, "a", "href").some((href) => href.includes("testflight.apple.com"))) {
  fail("wearable.html", "must not publish a TestFlight link until its exact invitation URL is approved");
}
for (const requiredCopy of [
  "Prototype 1.3 is an internal software-contract milestone, not an app release or product version.",
  "bounded replay summaries (a limited history of repeated requests and results)",
  "Readiness distinguishes a new request from a known retry.",
  "New work is allowed only in the simulator's predefined owner-bound test state.",
  "“Owner-bound” is only a software label; it does not prove who owns a device.",
  "Identical retries reuse a limited history of prior results; conflicting reuse is rejected.",
  "Only a confirmed cancelled result counts as cancellation",
  "Explicit lab expiry is a fallback for a stuck, unfinished fixture—not cancellation success.",
  "Synthetic reboot scenarios also remain unknown or unavailable, never assumed successful.",
  "executed never means a person or device received anything.",
  "After a local reset, the simulator keeps a limited record of previously used request keys until a developer explicitly creates a new simulator binding.",
  "The production-gate review mode remains local simulation and blocks simulated continuity cues and vibration requests.",
  "No physical wearable, vibration, message, location share, contact, emergency action, or external effect occurs.",
]) {
  if (!normalizedText(wearablePage).includes(requiredCopy)) {
    fail("wearable.html", `must retain simulator truth boundary ${JSON.stringify(requiredCopy)}`);
  }
}

const homeCompanionPage = pages.get("home-companion.html") ?? "";
if (valuesFor(homeCompanionPage, "a", "href").some((href) => href.startsWith("https://buy.stripe.com/"))) {
  fail("home-companion.html", "research-only Home Companion must not include a checkout");
}
if (/<(?:form|button|input|video|iframe)\b/iu.test(homeCompanionPage)) {
  fail("home-companion.html", "research-only Home Companion must remain a static information page");
}
const homeBoundaryRows = pairedElements(homeCompanionPage, "p").filter(
  (paragraph) => paragraph.attrs.get("role") === "listitem",
);
if (
  homeBoundaryRows.length !== 4 ||
  homeBoundaryRows.some(
    (row) =>
      pairedElements(row.body, "strong").length !== 1 ||
      pairedElements(row.body, "span").length !== 1,
  )
) {
  fail("home-companion.html", "trust rows must use one consistent label and detail column");
}
for (const requiredCopy of [
  "a wearable has no direct authority over the Home endpoint.",
  "Prototype 1.3 is an internal software-contract milestone, not an app release or product version.",
  "One generated reference value links the local request, no-capture session, status records, and events",
  "The synthetic session requests no capture, exposes no camera, and never accesses a browser microphone.",
  "treats the rehearsal as completed only after both report executed and it explicitly ends the linked Home session.",
  "If the final result record is missing, the app reports unknown—not success.",
  "Machine-readable rules automatically check emitted examples.",
  "A bounded, cursor-based trace—a limited event history with a marker for where to continue—reveals only approved status fields and says when older records have been omitted.",
  "An explicit coordinated stop can cancel pending work, end an active session, or report already stopped, too late, or unknown.",
  "Ready, busy, or blocked describes only the local in-memory test harness—not a person, home, robot, or production system.",
  "The negative-control production-gate mode rejects every semantic request and remains synthetic.",
]) {
  if (!normalizedText(homeCompanionPage).includes(requiredCopy)) {
    fail("home-companion.html", `must retain simulator truth boundary ${JSON.stringify(requiredCopy)}`);
  }
}

const siteText = shippedHtml.join("\n");
const residuePatterns = [
  [/_api\//iu, "captured API path"],
  [/access[-_]?tokens?/iu, "access-token residue"],
  [/(?:wix|parastorage|thunderbolt|webpack|fedops)/iu, "Wix/runtime residue"],
  [/(?:sentry\.io|telemetry(?:\.js|\/collect)|data-telemetry)/iu, "telemetry residue"],
  [/-----BEGIN [A-Z ]*PRIVATE KEY-----/u, "private key"],
  [/\bBearer\s+[A-Za-z0-9._~-]{20,}/u, "bearer credential"],
  [/\b(?:sk_live|AIza)[A-Za-z0-9_-]{12,}/u, "API credential"],
  [/\beyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{10,}\b/u, "JWT"],
  [/\b[0-9a-f]{40}\b/iu, "internal source revision identifier"],
];
for (const [pattern, label] of residuePatterns) {
  if (pattern.test(siteText)) fail("site", `${label} must not be present in shipped pages`);
}

if (/(?:yongxin12\.github\.io|veryloving-privacy|www\.verylovinginc\.com\/privacy)/iu.test(siteText)) {
  fail("site", "legacy Privacy Policy URLs must not be present");
}

const privacy = pages.get("privacy.html") ?? "";
const privacyText = normalizedText(privacy);
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
for (const required of [
  "Operating-system push and local notifications are not enabled",
  "A user-requested phone sign-in or account-verification flow may send a one-time passcode by SMS through Twilio",
  "No current safety, trusted-contact, or marketing flow automatically sends an SMS",
  "does not implement physiological heart-rate or heartbeat sensing",
  "Operating-system share sheet",
  "A material limitation must not be hidden solely in a legal document",
  "GitHub Pages, Google Forms, YouTube, Stripe",
  "developer connects both same-computer simulators and presses its request control",
  "marks a rehearsal completed only when both local intents report executed",
  "Unknown, failed, expired, cancelled, or inconsistent evidence is not treated as success",
  "The Home Companion integration harness accepts a no-capture check-in fixture only",
  "Local integration and continuity-rehearsal data",
  "one endpoint succeeding does not establish the other succeeded",
  "Selected developer paths now bound and validate incoming live-voice frames, mapping responses, queued Bluetooth observations, outbound batches, and relevant provider replies",
  "queue overflow is recorded instead of silently replacing older work",
  "identifier-bearing Bluetooth diagnostics are redacted",
  "bounded synthetic ownership, reboot, replay, and cancellation evidence",
  "Closed machine-readable schemas, a bounded allowlisted trace, and coordinated stop outcomes describe only local software evidence",
  "Wearable evidence can include bounded synthetic ownership, reboot, replay, and cancellation outcomes",
  "Home evidence can include a schema-checked, bounded, allowlisted status trace and coordinated stop outcomes",
  "duplicate-request tombstones can remain in wearable process memory through local reset until explicit rebind",
  "same-computer development processes with no outbound network, persistence, physical device, or external effect",
  "loopback HTTP on the same computer",
  "Selected mobile inputs and responses are size-bounded and shape-checked before use",
  "The Home trace includes only allowlisted status evidence and excludes payloads, credentials, device details, contacts, location, and audio",
  "not yet an effective production privacy policy",
  "Reviewed source scope",
  "software-only prototype 1.3 boundary work",
]) {
  if (!privacyText.includes(required)) {
    fail("privacy.html", `must preserve reviewed release boundary: ${required}`);
  }
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

const terms = pages.get("terms.html") ?? "";
const termsText = normalizedText(terms);
const currentTermsUrl = "https://ch0002ic-cell.github.io/veryloving-website/terms.html";
if (!terms.includes(currentTermsUrl)) {
  fail("terms.html", `must identify the current Terms URL as ${currentTermsUrl}`);
}
for (const required of [
  "Status — release candidate, not yet effective",
  "The current app does not present this exact document for versioned acceptance",
  "VeryLoving is not an emergency service",
  "does not implement physiological heart-rate or heartbeat sensing",
  "does not register for production push notifications",
  "The coordinated rehearsal is available only in a developer-enabled mobile screen",
  "a partial result remains partial",
  "marks the rehearsal completed only after both endpoints report executed",
  "Unknown, failed, expired, cancelled, or inconsistent evidence is not success",
  "manually refresh and reconcile local evidence",
  "The wearable simulator keeps a limited history of prior results",
  "Only confirmed cancelled evidence counts as cancellation; too late, missing evidence, and unknown remain unresolved",
  "synthetic ownership and reboot fixtures are not physical identity, provisioning, secure ownership, durable storage, or hardware behavior",
  "A local reset retains bounded duplicate-request tombstones until explicit rebind",
  "executed receipt means only that its local process-memory state machine advanced",
  "exposes no camera",
  "Closed machine-readable schemas check emitted examples",
  "its bounded trace exposes only allowlisted status evidence with continuation and omitted-record information",
  "An explicit coordinated stop may cancel pending work, end an active session, or report already stopped, too late, or unknown",
  "production-gate review modes remain local simulation and reject semantic work",
  "These candidate Terms do not establish a final product specification",
  "Any sweepstakes, contest, or giveaway must have separately reviewed official rules",
  "No arbitration provision, class-action waiver, governing-law clause",
  "Privacy Notice",
  "george@verylovinginc.com",
  "Reviewed source scope",
  "software-only prototype 1.3 boundary work",
]) {
  if (!termsText.includes(required)) {
    fail("terms.html", `must preserve reviewed candidate boundary: ${required}`);
  }
}
if (/\{\{|\}\}|\[(?:insert|company|organization|date|email|phone|address|name|url)[^\]]*\]|lorem ipsum|\b(?:TODO|TBD)\b/iu.test(terms)) {
  fail("terms.html", "must not contain template placeholders or unfinished drafting residue");
}
for (const [pattern, label] of [
  [/\b(?:these terms|this agreement) (?:are|is) (?:now )?effective\b/iu, "effective-status claim"],
  [/\b(?:automatically|always) (?:contacts?|notifies?|dispatches?) emergency\b/iu, "automatic emergency claim"],
  [/\b(?:guarantees?|ensures?) (?:your |the )?safety\b/iu, "safety guarantee"],
]) {
  if (pattern.test(terms)) fail("terms.html", `must not make an unsafe ${label}`);
}

function checkLegalDocumentStructure(
  file,
  source,
  expectedTitle,
  expectedH1,
  expectedHeadings,
  currentLegalHref,
  requiredDocumentHref,
) {
  const bodyTags = tags(source, "body");
  if (
    bodyTags.length !== 1 ||
    !hasClass(attributes(bodyTags[0]), "doc-page")
  ) {
    fail(file, "must use exactly one body.doc-page");
  }

  if (titles.get(file) !== expectedTitle) {
    fail(file, `title must be exactly ${JSON.stringify(expectedTitle)}`);
  }

  const h1Values = pairedElements(source, "h1").map((element) =>
    normalizedText(element.body),
  );
  if (JSON.stringify(h1Values) !== JSON.stringify([expectedH1])) {
    fail(file, `h1 must be exactly ${JSON.stringify(expectedH1)}`);
  }

  const documentArticles = elementsWithClass(source, "article", "document-shell");
  if (documentArticles.length !== 1) {
    fail(file, "must contain exactly one article.document-shell");
  }
  const documentMarkup = documentArticles[0]?.markup ?? "";

  const headings = pairedElements(documentMarkup, "h2").map((element) =>
    normalizedText(element.body),
  );
  if (JSON.stringify(headings) !== JSON.stringify(expectedHeadings)) {
    fail(file, "legal-document section sequence must remain complete and ordered");
  }

  const reviewDates = tags(documentMarkup, "time").filter(
    (tag) => attributes(tag).get("datetime") === "2026-08-22",
  );
  if (reviewDates.length !== 1) {
    fail(file, "must contain one semantic 2026-08-22 review date");
  }

  if (!valuesFor(documentMarkup, "a", "href").includes(requiredDocumentHref)) {
    fail(file, `must link to ${requiredDocumentHref} from the document body`);
  }

  const footer = elementsWithClass(source, "footer", "site-footer")[0]?.markup ?? "";
  const currentLinks = tags(footer, "a").filter((tag) => {
    const attrs = attributes(tag);
    return (
      attrs.get("href") === currentLegalHref &&
      attrs.get("aria-current") === "page"
    );
  });
  if (currentLinks.length !== 1) {
    fail(file, `shared footer must mark ${currentLegalHref} as the current page`);
  }
}

checkLegalDocumentStructure(
  "privacy.html",
  privacy,
  "Privacy notice | VeryLoving",
  "Privacy notice",
  [
    "Important current boundaries",
    "Who is responsible",
    "Scope of this candidate notice",
    "Website data practices",
    "Mobile app data categories",
    "Notifications, in-app notices, and communications",
    "Service providers",
    "Advertising, analytics, sale, and targeted advertising",
    "Permissions and user choices",
    "Sensitive data and automated inferences",
    "Retention, account deletion, and other requests",
    "Security",
    "Children",
    "Safety boundary",
    "Review required before a United States launch",
    "Changes to this notice",
  ],
  "privacy.html",
  "terms.html",
);

checkLegalDocumentStructure(
  "terms.html",
  terms,
  "Terms of Use | VeryLoving",
  "Terms of Use",
  [
    "1. Emergency and safety warning",
    "2. Scope and future acceptance",
    "3. Eligibility",
    "4. Accounts and account security",
    "5. Limited license",
    "6. Acceptable use",
    "7. User content",
    "8. AI-assisted voice experience",
    "9. Maps, location, sharing, and social connections",
    "10. Wearables, Home Companion, and simulations",
    "11. Notifications and communications",
    "12. Third-party services",
    "13. Pre-orders and future purchases",
    "14. Promotions and giveaways",
    "15. Ownership and feedback",
    "16. Service changes, suspension, and termination",
    "17. Disclaimers",
    "18. Limitation of liability",
    "19. Governing law and disputes",
    "20. Changes to these Terms",
    "21. Contact and approval required",
  ],
  "terms.html",
  "privacy.html",
);

const accessibility = pages.get("accessibility-statement.html") ?? "";
const accessibilityText = normalizedText(accessibility);
for (const requiredScopeCopy of [
  "these eight static webpages",
  "Product Family",
  "NorthStar Wearable",
  "Home Companion Research",
  "22 August 2026",
  "plain-language status labels that distinguish future product vision from current software-only evidence",
  "Some legal and prototype-contract language remains technical",
]) {
  if (!accessibilityText.includes(requiredScopeCopy)) {
    fail(
      "accessibility-statement.html",
      `must keep the eight-page scope current with ${JSON.stringify(requiredScopeCopy)}`,
    );
  }
}
if (/these (?:four|five|seven) static webpages/iu.test(accessibilityText)) {
  fail("accessibility-statement.html", "must not retain a superseded page count");
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
  ".product-breadcrumb",
  ".product-hero",
  ".product-hero-media",
  ".product-status-line",
  ".product-feature",
  ".product-feature-media",
  ".product-rule-list",
  ".product-rule-row",
  ".product-boundary-band",
  ".product-cta",
  ".app-download-actions",
  ".app-download-button",
  ".concept-home-graphic",
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
  [/\.product-hero\s*\{[^}]*min-height\s*:\s*541\.125px/isu, "reuse the official desktop hero proportion"],
  [/\.product-hero\s+h1\s*\{[^}]*font-size\s*:\s*46px/isu, "reuse the official desktop hero type scale"],
  [/\.product-pill\s*\{[^}]*position\s*:\s*static[^}]*min-height\s*:\s*55px/isu, "keep product controls in flow and at least 55px tall on desktop"],
  [/\.product-feature-pill\s*\{[^}]*position\s*:\s*static/isu, "keep split-feature controls in flow at phone widths"],
  [/\.product-text-link\s*\{[^}]*min-height\s*:\s*48px/isu, "keep desktop secondary product controls at least 48px tall"],
  [/\.app-download-button\s*\{[^}]*min-width\s*:\s*210px[^}]*min-height\s*:\s*58px[^}]*background\s*:\s*var\(--yellow\)/isu, "style honest coming-soon app controls with the official pill language"],
  [/\.product-page\s+main\s*\{[^}]*--product-button-ink\s*:\s*#4d2f1d/isu, "define a readable product CTA ink"],
  [/\.product-page\s+main\s+\.pill-coral\s*\{[^}]*color\s*:\s*var\(--product-button-ink\)/isu, "keep coral product CTA text at accessible contrast"],
  [/\.feature-copy:not\(\.feature-copy-dark\)\s+\.product-feature-pill\s*\{[^}]*color\s*:\s*var\(--product-button-ink\)/isu, "keep coral split-feature CTA text at accessible contrast"],
  [/\.home-companion-page\s+\.product-boundary-list\s*>\s*p\s*\{[^}]*display\s*:\s*grid[^}]*grid-template-columns\s*:\s*168px\s+minmax\(0,\s*1fr\)[^}]*align-items\s*:\s*start[^}]*gap\s*:\s*28px/isu, "align the Home Companion trust rows to one label and detail grid"],
  [/\.product-rule-list\s*\{[^}]*width\s*:\s*756\.66px/isu, "reuse the official desktop FAQ measure for ruled information"],
  [/\.product-rule-row\s*\{[^}]*padding\s*:\s*16px\s+0/isu, "reuse the official FAQ row rhythm"],
  [/\.product-feature\s*\{[^}]*min-height\s*:\s*599px/isu, "reuse the official full-bleed feature proportion"],
]) {
  if (!pattern.test(productCss)) fail("product-pages.css", `must ${requirement}`);
}

for (const background of ["#f58556", "#ff9b70", "#f8e5b7"]) {
  const ratio = contrastRatio("#4d2f1d", background);
  if (ratio < 4.5) {
    fail(
      "product-pages.css",
      `product CTA ink contrast against ${background} must be at least 4.5:1 (found ${ratio.toFixed(2)}:1)`,
    );
  }
}

for (const legacySelector of [
  ".product-nav",
  ".status-chip",
  ".product-button",
  ".line-card",
  ".family-orbit",
  ".concept-companion",
  ".research-card-grid",
  ".wearable-glow",
  ".visual-note",
  ".research-window",
  ".home-halo",
  ".boundary-mark",
  ".product-research-mark",
  ".concept-caption",
  ".concept-hero-words",
]) {
  if (productCss.includes(legacySelector)) {
    fail("product-pages.css", `must not retain the superseded ${legacySelector} framework`);
  }
}

for (const sharedShellSelector of [
  ".site-header",
  ".header-inner",
  ".primary-nav",
  ".guardian-signup",
  ".guardian-inner",
  ".subscribe-pill",
  ".site-footer",
  ".footer-column",
  ".brand",
]) {
  if (productCss.includes(sharedShellSelector)) {
    fail("product-pages.css", `must not override the exact shared shell selector ${sharedShellSelector}`);
  }
}
if (/\bbox-shadow\s*:/iu.test(productCss) || /(?:linear|radial)-gradient\s*\(/iu.test(productCss)) {
  fail("product-pages.css", "must keep the official flat, shadow-free editorial framework");
}
if (/\.product-page\s+main\s*\{[^}]*overflow\s*:\s*hidden/isu.test(productCss)) {
  fail("product-pages.css", "must not conceal product-page layout overflow at the main landmark");
}
if (/\.product-page\s+(?!main\b)(?:h[1-6]|p|figure|\*)/iu.test(productCss)) {
  fail("product-pages.css", "must scope product typography and motion rules to main, outside the exact shared shell");
}
if (/\.product-word-stage\s*>\s*span/iu.test(productCss) || /color\s*:\s*#fff\b/iu.test(productCss)) {
  fail("product-pages.css", "must not reintroduce low-contrast small rose copy or white product CTA text");
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
