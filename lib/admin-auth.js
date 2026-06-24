const crypto = require("crypto");

const COOKIE_NAME = "emlak_admin_session";
const MAX_AGE_SECONDS = 60 * 60 * 12;

function getSecret() {
  return process.env.ADMIN_SESSION_SECRET || process.env.GITHUB_TOKEN || "";
}

function isAdminAuthConfigured() {
  return Boolean((process.env.ADMIN_PASSWORD || process.env.ADMIN_PASSWORD_SHA256) && getSecret());
}

function constantTimeEqual(a, b) {
  const left = Buffer.from(String(a || ""));
  const right = Buffer.from(String(b || ""));
  if (left.length !== right.length) return false;
  return crypto.timingSafeEqual(left, right);
}

function sha256(value) {
  return crypto.createHash("sha256").update(String(value || ""), "utf8").digest("hex");
}

function verifyAdminPassword(password) {
  if (!isAdminAuthConfigured()) return false;

  const expectedHash = process.env.ADMIN_PASSWORD_SHA256;
  if (expectedHash) {
    return constantTimeEqual(sha256(password), expectedHash);
  }

  return constantTimeEqual(password, process.env.ADMIN_PASSWORD);
}

function sign(value) {
  return crypto.createHmac("sha256", getSecret()).update(value).digest("hex");
}

function parseCookies(req) {
  const header = req.headers.cookie || "";
  return header.split(";").reduce((cookies, part) => {
    const index = part.indexOf("=");
    if (index === -1) return cookies;
    const key = part.slice(0, index).trim();
    const value = part.slice(index + 1).trim();
    if (key) {
      try {
        cookies[key] = decodeURIComponent(value);
      } catch (error) {
        cookies[key] = value;
      }
    }
    return cookies;
  }, {});
}

function secureCookieFlag(req) {
  const host = req.headers.host || "";
  if (host.startsWith("localhost") || host.startsWith("127.0.0.1")) return "";
  return " Secure;";
}

function createSessionCookie(req) {
  const issuedAt = Math.floor(Date.now() / 1000);
  const nonce = crypto.randomBytes(16).toString("hex");
  const payload = `${issuedAt}.${nonce}`;
  const token = `${payload}.${sign(payload)}`;
  return `${COOKIE_NAME}=${encodeURIComponent(token)}; Path=/; HttpOnly;${secureCookieFlag(
    req
  )} SameSite=Strict; Max-Age=${MAX_AGE_SECONDS}`;
}

function clearSessionCookie(req) {
  return `${COOKIE_NAME}=; Path=/; HttpOnly;${secureCookieFlag(req)} SameSite=Strict; Max-Age=0`;
}

function verifyAdminSession(req) {
  if (!isAdminAuthConfigured()) return false;

  const token = parseCookies(req)[COOKIE_NAME];
  if (!token) return false;

  const parts = token.split(".");
  if (parts.length !== 3) return false;

  const [issuedAtRaw, nonce, signature] = parts;
  const issuedAt = Number(issuedAtRaw);
  if (!Number.isFinite(issuedAt) || !nonce || !signature) return false;

  const now = Math.floor(Date.now() / 1000);
  if (issuedAt > now || now - issuedAt > MAX_AGE_SECONDS) return false;

  return constantTimeEqual(signature, sign(`${issuedAtRaw}.${nonce}`));
}

function requireAdminSession(req, res) {
  if (verifyAdminSession(req)) return true;
  res.status(401).json({ ok: false, error: "Admin session required." });
  return false;
}

module.exports = {
  clearSessionCookie,
  createSessionCookie,
  isAdminAuthConfigured,
  requireAdminSession,
  verifyAdminPassword,
  verifyAdminSession
};
