const {
  clearSessionCookie,
  createSessionCookie,
  isAdminAuthConfigured,
  verifyAdminPassword,
  verifyAdminSession
} = require("../lib/admin-auth");

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
    return res.status(200).json({
      ok: true,
      configured: isAdminAuthConfigured(),
      authenticated: verifyAdminSession(req)
    });
  }

  if (req.method === "POST") {
    if (!isAdminAuthConfigured()) {
      return res.status(503).json({ ok: false, error: "Admin auth is not configured." });
    }

    const body = getBody(req);
    const password = typeof body.password === "string" ? body.password : "";
    if (!verifyAdminPassword(password)) {
      return res.status(401).json({ ok: false, error: "Invalid password." });
    }

    res.setHeader("Set-Cookie", createSessionCookie(req));
    return res.status(200).json({ ok: true });
  }

  if (req.method === "DELETE") {
    res.setHeader("Set-Cookie", clearSessionCookie(req));
    return res.status(200).json({ ok: true });
  }

  res.setHeader("Allow", "GET, POST, DELETE");
  return res.status(405).json({ ok: false, error: "Method not allowed." });
};
