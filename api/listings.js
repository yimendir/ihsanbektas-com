const LISTINGS_FILE = "data/listings.json";

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

module.exports = async (req, res) => {
  res.setHeader("Cache-Control", "no-store");

  if (req.method === "GET") {
    const current = await readCurrentFile();
    if (!current || !current.content) {
      return res.status(200).json({ ok: true, source: "fallback", items: null });
    }

    try {
      const text = Buffer.from(current.content, "base64").toString("utf8");
      return res.status(200).json({ ok: true, source: "github", items: JSON.parse(text) });
    } catch (error) {
      return res.status(500).json({ ok: false, error: "Stored listings JSON is invalid." });
    }
  }

  if (req.method === "PUT" || req.method === "POST") {
    const current = await readCurrentFile();
    if (!current || !current.sha) {
      return res.status(503).json({ ok: false, error: "GitHub storage is not configured." });
    }

    const items = req.body && Array.isArray(req.body.items) ? req.body.items : null;
    if (!items) {
      return res.status(400).json({ ok: false, error: "Request body must include items array." });
    }

    await writeCurrentFile(items, current.sha);
    return res.status(200).json({ ok: true });
  }

  return res.status(405).json({ ok: false, error: "Method not allowed." });
};
