import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
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
]);
const requiredAssets = new Map([
  ["assets/veryloving-logo.avif", 150_000],
  ["assets/pink-poppy-flowers.avif", 500_000],
  ["assets/phone-map-preview.avif", 250_000],
  ["assets/charm-preview.avif", 350_000],
]);
const expectedFiles = new Set([
  ...expectedPages.keys(),
  ...requiredAssets.keys(),
  "package.json",
  "scripts/check-site.mjs",
  "styles.css",
]);
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

function normalizedShell(source, tagName) {
  const match = source.match(new RegExp(`<${tagName}\\b[\\s\\S]*?</${tagName}>`, "i"));
  if (!match) return null;
  return match[0]
    .replace(/\s+aria-current\s*=\s*(["'])page\1/giu, "")
    .replace(/\s+>/gu, ">")
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
  return tags(source, "[a-z][a-z0-9-]*").some(
    (tag) => attributes(tag).get("id") === id,
  );
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

const allFiles = await walk(root);
const relativeFiles = allFiles.map((file) => slash(path.relative(root, file))).sort();
const expectedRelativeFiles = [...expectedFiles].sort();
if (JSON.stringify(relativeFiles) !== JSON.stringify(expectedRelativeFiles)) {
  fail(
    "site",
    `must contain only the reviewed static-site files (unexpected or missing: ${relativeFiles
      .filter((file) => !expectedFiles.has(file))
      .concat(expectedRelativeFiles.filter((file) => !relativeFiles.includes(file)))
      .join(", ") || "inventory mismatch"})`,
  );
}
const htmlFiles = allFiles
  .filter((file) => path.extname(file).toLowerCase() === ".html")
  .map((file) => slash(path.relative(root, file)))
  .sort();
const wantedPages = [...expectedPages.keys()].sort();
if (JSON.stringify(htmlFiles) !== JSON.stringify(wantedPages)) {
  fail(
    "site",
    `must contain exactly these four HTML pages: ${wantedPages.join(", ")} (found: ${htmlFiles.join(", ") || "none"})`,
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
const shippedText = [];

for (const [page, canonical] of expectedPages) {
  const source = pages.get(page);
  if (!source) continue;
  shippedText.push(source);

  if (!/^\s*<!doctype html>/iu.test(source)) fail(page, "must begin with an HTML doctype");
  if (!/<html\b[^>]*\blang\s*=\s*(["'])en\1/iu.test(source)) {
    fail(page, "must declare html lang=\"en\"");
  }
  if (!/<meta\b[^>]*\bcharset\s*=\s*(["'])?utf-8\1?/iu.test(source)) {
    fail(page, "must declare UTF-8 encoding");
  }
  checkSingleMeta(page, source, "name", "viewport");
  const description = checkSingleMeta(page, source, "name", "description");
  checkSingleMeta(page, source, "property", "og:title");
  checkSingleMeta(page, source, "property", "og:description");
  checkSingleMeta(page, source, "property", "og:url", canonical);

  const titleMatches = source.match(/<title\b[^>]*>([\s\S]*?)<\/title>/giu) ?? [];
  if (titleMatches.length !== 1) {
    fail(page, "must contain exactly one title");
  } else {
    const title = titleMatches[0].replace(/<\/?title\b[^>]*>/giu, "").trim();
    if (!title) fail(page, "title must not be empty");
    if (title.length > 70) fail(page, "title should be at most 70 characters");
    titles.set(page, title);
  }
  if (description) descriptions.set(page, description);

  const canonicalLinks = tags(source, "link").filter((tag) => {
    const rel = attributes(tag).get("rel") ?? "";
    return rel.split(/\s+/u).includes("canonical");
  });
  if (canonicalLinks.length !== 1) {
    fail(page, "must contain exactly one canonical link");
  } else if (attributes(canonicalLinks[0]).get("href") !== canonical) {
    fail(page, `canonical URL must be exactly ${canonical}`);
  }

  const styleLinks = tags(source, "link").filter((tag) => {
    const attrs = attributes(tag);
    return attrs.get("rel") === "stylesheet" && attrs.get("href") === "styles.css";
  });
  if (styleLinks.length !== 1) fail(page, "must load the one shared styles.css file");

  const h1Count = (source.match(/<h1\b/giu) ?? []).length;
  if (h1Count !== 1) fail(page, `must contain exactly one h1 (found ${h1Count})`);
  const skipLinks = tags(source, "a").filter((tag) => {
    const attrs = attributes(tag);
    return hasClass(attrs, "skip-link") && attrs.get("href") === "#main-content";
  });
  if (skipLinks.length !== 1) fail(page, "must contain one skip link to #main-content");
  const mains = tags(source, "main").filter(
    (tag) => attributes(tag).get("id") === "main-content",
  );
  if (mains.length !== 1) fail(page, "must contain one main#main-content landmark");

  const header = normalizedShell(source, "header");
  const footer = normalizedShell(source, "footer");
  if (!header || !/class=(["'])site-header\1/iu.test(header)) {
    fail(page, "must use the shared site-header shell");
  } else {
    headers.set(page, header);
  }
  if (!footer || !/class=(["'])site-footer\1/iu.test(footer)) {
    fail(page, "must use the shared site-footer shell");
  } else {
    footers.set(page, footer);
  }
  if (!/<nav\b[^>]*aria-label\s*=\s*(["'])Primary navigation\1/iu.test(source)) {
    fail(page, "must contain the shared primary navigation");
  }
  if (!/<nav\b[^>]*aria-label\s*=\s*(["'])Footer navigation\1/iu.test(source)) {
    fail(page, "must contain the shared footer navigation");
  }

  const headerLinks = header ? valuesFor(header, "a", "href") : [];
  for (const required of [
    "index.html",
    "faq.html",
    "https://buy.stripe.com/8x2dR1duX7UD9MvcVo2kw02",
  ]) {
    if (!headerLinks.includes(required)) fail(page, `shared header must link to ${required}`);
  }
  const footerLinks = footer ? valuesFor(footer, "a", "href") : [];
  for (const required of expectedPages.keys()) {
    if (!footerLinks.includes(required)) fail(page, `shared footer must link to ${required}`);
  }

  if (/<(?:form|iframe|script)\b/iu.test(source)) {
    fail(page, "forms, iframes, and scripts are not permitted on this static site");
  }
  if (/\son[a-z]+\s*=/iu.test(source)) fail(page, "inline event handlers are not permitted");
  if (/(?:href|src|action)\s*=\s*(["'])(?:javascript:|data:|\/\/|\/)/iu.test(source)) {
    fail(page, "root-absolute, protocol-relative, javascript:, and data: references are not permitted");
  }

  for (const tagName of ["a", "link", "img"]) {
    const attrName = tagName === "img" ? "src" : "href";
    for (const tag of tags(source, tagName)) {
      const reference = attributes(tag).get(attrName);
      if (!reference) continue;
      if (/^(?:https?:|mailto:|tel:)/iu.test(reference)) continue;
      if (/^[a-z][a-z0-9+.-]*:/iu.test(reference)) {
        fail(page, `unsupported ${attrName} scheme in ${reference}`);
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
        if (!pageHasId(targetSource, decodeURIComponent(fragment))) {
          fail(page, `missing fragment target in ${reference}`);
        }
      }
    }
  }

  for (const imageTag of tags(source, "img")) {
    const attrs = attributes(imageTag);
    if (!(attrs.get("alt") ?? "").trim()) fail(page, "every content image must have non-empty alt text");
    if (!/^\d+$/u.test(attrs.get("width") ?? "") || !/^\d+$/u.test(attrs.get("height") ?? "")) {
      fail(page, "every image must declare numeric width and height");
    }
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
  ["footer", footers],
]) {
  const baseline = shells.get("index.html");
  if (!baseline) continue;
  for (const [page, shell] of shells) {
    if (shell !== baseline) {
      fail(page, `shared ${label} markup must match index.html (apart from aria-current)`);
    }
  }
}

const siteText = shippedText.join("\n");
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
  if (pattern.test(siteText)) fail("site", "must not add a Terms page or a Terms acceptance requirement");
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
  fail("privacy.html", "must not present the candidate privacy notice as store-release approval");
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

let css = "";
try {
  css = await readFile(path.join(root, "styles.css"), "utf8");
} catch (error) {
  fail("styles.css", `cannot be read (${error.message})`);
}
for (const [pattern, label] of residuePatterns) {
  if (pattern.test(css)) fail("styles.css", `${label} must not be present in shipped CSS`);
}
for (const selector of [
  ":focus-visible",
  ".skip-link",
  ".site-header",
  ".site-nav",
  ".site-footer",
]) {
  if (!css.includes(selector)) fail("styles.css", `must define ${selector}`);
}
if (!/@media\s*\(\s*prefers-reduced-motion\s*:\s*reduce\s*\)/iu.test(css)) {
  fail("styles.css", "must include a reduced-motion media query");
}
if (!/@media\s*\([^)]*(?:max-width|min-width)\s*:/iu.test(css)) {
  fail("styles.css", "must include a responsive width media query");
}
if (!/min-height\s*:\s*48px/iu.test(css)) {
  fail("styles.css", "interactive controls must preserve a 48px minimum target height");
}

let totalAssetBytes = 0;
for (const [asset, maximumBytes] of requiredAssets) {
  const absolute = path.join(root, asset);
  try {
    const details = await stat(absolute);
    if (!details.isFile() || details.size === 0) fail(asset, "must be a non-empty file");
    if (details.size > maximumBytes) {
      fail(asset, `must be no larger than ${maximumBytes.toLocaleString("en-US")} bytes`);
    }
    totalAssetBytes += details.size;
    const header = await readFile(absolute);
    if (header.subarray(4, 8).toString("ascii") !== "ftyp") {
      fail(asset, "must contain an AVIF/ISO media file signature");
    }
  } catch (error) {
    fail(asset, `cannot be verified (${error.message})`);
  }
}
if (totalAssetBytes > 1_000_000) fail("assets", "required assets must total no more than 1 MB");

if (errors.length) {
  console.error(`Site checks failed (${errors.length}):`);
  for (const error of errors) console.error(`- ${error}`);
  process.exitCode = 1;
} else {
  console.log(
    `Site checks passed: ${expectedPages.size} pages, shared UI shell, legal URL, accessibility, security, and ${totalAssetBytes.toLocaleString("en-US")} bytes of required assets.`,
  );
}
