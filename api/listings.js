const { requireAdminSession } = require("../lib/admin-auth");

const LISTINGS_FILE = "data/listings.json";
const MAX_LISTINGS = 100;
const MAX_TEXT_LENGTH = 700;
const MAX_DATA_IMAGE_LENGTH = 1500000;

function readEnv() {
  return {
    owner: process.env.GITHUB_OWNER,
    repo: process.env.GITHUB_REPO,
    token: process.env.GITHUB_TOKEN,
    branch: process.env.GITHUB_BRANCH || "main"
  };
}

async function readCurrentFile() {
  const { owner, repo, token, branch } = readEnv();
  if (!owner || !repo || !token) return null;

  const url = `https://api.github.com/repos/${owner}/${repo}/contents/${LISTINGS_FILE}?ref=${branch}`;
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28"
    }
  });

  if (!response.ok) return null;
  return response.json();
}

async function writeCurrentFile(nextData, sha) {
  const { owner, repo, token, branch } = readEnv();
  const url = `https://api.github.com/repos/${owner}/${repo}/contents/${LISTINGS_FILE}`;

  const response = await fetch(url, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "content-type": "application/json"
    },
    body: JSON.stringify({
      message: "Update listings data",
      content: Buffer.from(JSON.stringify(nextData, null, 2)).toString("base64"),
      sha,
      branch
    })
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`GitHub write failed: ${response.status} ${detail}`);
  }

  return response.json();
}

function sanitizeText(value, maxLength = MAX_TEXT_LENGTH) {
  return String(value || "").trim().slice(0, maxLength);
}

function normalizeDistrict(value) {
  const district = String(value || "")
    .toLocaleLowerCase("tr-TR")
    .trim();
  if (district === "babaeski" || district === "luleburgaz" || district === "kirklareli") {
    return district;
  }
  return "babaeski";
}

function normalizeType(value) {
  const type = String(value || "")
    .toLocaleLowerCase("tr-TR")
    .trim();
  return type.includes("kiralık") || type.includes("kiralik") ? "Kiralık" : "Satılık";
}

function normalizeSize(value) {
  const text = sanitizeText(value, 80);
  if (!text) return "0 m²";
  if (text.toLocaleLowerCase("tr-TR").includes("m²") || text.toLocaleLowerCase("tr-TR").includes("m2")) {
    return text.replace(/\bm2\b/gi, "m²");
  }
  return `${text} m²`;
}

function normalizeCoords(value) {
  if (!Array.isArray(value) || value.length !== 2) return [41.6761, 27.2186];
  const lat = Number(value[0]);
  const lng = Number(value[1]);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return [41.6761, 27.2186];
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return [41.6761, 27.2186];
  return [lat, lng];
}

function sanitizeHttpUrl(value) {
  const text = sanitizeText(value, 1200);
  if (!text) return "";
  try {
    const url = new URL(text);
    return url.protocol === "http:" || url.protocol === "https:" ? url.toString() : "";
  } catch (error) {
    return "";
  }
}

function sanitizeImageUrl(value) {
  const text = String(value || "").trim();
  if (!text) return "";
  if (text.length > MAX_DATA_IMAGE_LENGTH) return "";

  if (/^data:image\/(png|jpe?g|webp|gif);base64,[a-z0-9+/=\s]+$/i.test(text)) {
    return text;
  }

  if (/^assets\/[a-z0-9._/-]+\.(png|jpe?g|webp|gif)$/i.test(text) && !text.includes("..")) {
    return text;
  }

  return sanitizeHttpUrl(text);
}

function sanitizeListing(entry) {
  const clean = {
    id: sanitizeText(entry && entry.id, 90) || `listing-${Date.now()}`,
    district: normalizeDistrict(entry && entry.district),
    type: normalizeType(entry && entry.type),
    title: sanitizeText(entry && entry.title, 180) || "Yeni İlan",
    price: sanitizeText(entry && entry.price, 80) || "Fiyat bilgisi girilmedi",
    size: normalizeSize(entry && entry.size),
    area: sanitizeText(entry && entry.area, 140) || "Bölge bilgisi girilmedi",
    address: sanitizeText(entry && entry.address, 260),
    block: sanitizeText(entry && entry.block, 60),
    parcel: sanitizeText(entry && entry.parcel, 60),
    summary: sanitizeText(entry && entry.summary, 500),
    image: sanitizeImageUrl(entry && entry.image),
    detailUrl: sanitizeHttpUrl(entry && entry.detailUrl),
    coords: normalizeCoords(entry && entry.coords)
  };
  return clean;
}

function sanitizeListingArray(items) {
  if (!Array.isArray(items)) return [];
  return items.slice(0, MAX_LISTINGS).map(sanitizeListing);
}

function getBody(req) {
  if (!req.body) return {};
  if (typeof req.body === "string") {
    try {
      return JSON.parse(req.body);
    } catch (error) {
      return {};
    }
  }
  return req.body;
}

module.exports = async (req, res) => {
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("X-Content-Type-Options", "nosniff");

  if (req.method === "GET") {
    const current = await readCurrentFile();
    if (!current || !current.content) {
      return res.status(200).json({ ok: true, source: "fallback", items: null });
    }

    try {
      const text = Buffer.from(current.content, "base64").toString("utf8");
      return res.status(200).json({ ok: true, source: "github", items: sanitizeListingArray(JSON.parse(text)) });
    } catch (error) {
      return res.status(500).json({ ok: false, error: "Stored listings JSON is invalid." });
    }
  }

  if (req.method === "PUT" || req.method === "POST") {
    if (!requireAdminSession(req, res)) return;

    const current = await readCurrentFile();
    if (!current || !current.sha) {
      return res.status(503).json({ ok: false, error: "GitHub storage is not configured." });
    }

    const body = getBody(req);
    const items = body && Array.isArray(body.items) ? body.items : null;
    if (!items) {
      return res.status(400).json({ ok: false, error: "Request body must include items array." });
    }
    if (!items.length) {
      return res.status(400).json({ ok: false, error: "Listings array cannot be empty." });
    }

    const cleanItems = sanitizeListingArray(items);
    if (!cleanItems.length) {
      return res.status(400).json({ ok: false, error: "Listings array has no valid items." });
    }

    try {
      await writeCurrentFile(cleanItems, current.sha);
      return res.status(200).json({ ok: true, items: cleanItems });
    } catch (error) {
      return res.status(500).json({ ok: false, error: "Unable to write listings." });
    }
  }

  return res.status(405).json({ ok: false, error: "Method not allowed." });
};
